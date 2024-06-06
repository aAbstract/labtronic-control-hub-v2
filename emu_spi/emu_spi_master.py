import time
import socket
import code
import math
import readline
import inspect
from rlcompleter import Completer
from test_driver import *


vspi_socket: socket.socket


def vspi_connect():
    global vspi_socket
    VSPI_IP = '127.0.0.1'
    VSPI_PORT = 6543
    VSPI_ADDR = (VSPI_IP, VSPI_PORT)
    CONNECTION_TIMEOUT = 10
    vspi_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    vspi_socket.setblocking(False)
    print('Connecting to VSPI address:', VSPI_ADDR, '...')
    for _ in range(CONNECTION_TIMEOUT):
        try:
            vspi_socket.connect(VSPI_ADDR)
            print('Connecting to VSPI address:', VSPI_ADDR, '...OK')
            return
        except (BlockingIOError, OSError):
            pass
        time.sleep(1)
    print('Connecting to VSPI address:', VSPI_ADDR, '...ERROR')


def write_test_msg():
    vspi_socket.send(b'EMU_SPI_TEST_MSG\r\n')


def write_test_data_packet():
    packet = bytes([0x87, 0x87, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xA4, 0x1A, 0x0D, 0x0A])
    vspi_socket.send(packet)


def write_test_error_packet():
    packet = bytes([0x87, 0x87, 0x0C, 0x00, 0x00, 0x4E, 0x00, 0xF0, 0x8C, 0x45, 0x0D, 0x0A])
    vspi_socket.send(packet)


def write_error_packet(error_code: int):
    error_codes = {
        0xF0: 'Low Liquid in the tank',
        0xF1: 'Stepper Motor Failed',
        0xF2: 'Pressure Sensor Failed',
        0xF3: 'Weight Meter Failed',
        0xF4: 'Invalid Packet',
        0xF5: 'Peristaltic Pump Failed',
    }
    if error_code in error_codes:
        print(f'Writing error msg "{error_codes[error_code]}"')
    error_packet = ltd_driver_0x87.encode_packet(0, TEST_DRIVER_CONFIG[8].msg_type, error_code).ok
    vspi_socket.send(error_packet)


def stream_sine_waves():
    x = 0
    while True:
        _theta = 2 * math.pi * x / 100
        y_wght = math.sin(_theta) * 1000 - 1
        y_temp = 25 if y_wght >= 0 else 0
        y_pres = (y_wght / 10 - 1) if y_wght >= 0 else 0
        packet_wght = ltd_driver_0x87.encode_packet(x, TEST_DRIVER_CONFIG[2].msg_type, y_wght).ok
        packet_temp = ltd_driver_0x87.encode_packet(x, TEST_DRIVER_CONFIG[3].msg_type, y_temp).ok
        packet_pres = ltd_driver_0x87.encode_packet(x, TEST_DRIVER_CONFIG[4].msg_type, y_pres).ok
        vspi_socket.send(packet_wght)
        vspi_socket.send(packet_temp)
        vspi_socket.send(packet_pres)
        x += 1
        time.sleep(0.01)


def read_packet():
    print('Listening for LtdDriver_0x87 packet...')
    packet = b''
    while True:
        try:
            byte = vspi_socket.recv(1)
        except BlockingIOError:
            continue

        packet += byte
        if packet[-2:] == b'\r\n':
            break

    device_msg_res = ltd_driver_0x87.decode_packet(packet)
    if device_msg_res.err:
        print('Invalid LtdDriver_0x87 packet')
        return
    device_msg: DeviceMsg = device_msg_res.ok
    if device_msg.config.msg_type in [12, 13]:
        control_state_map = {12: 0, 13: 1}
        vspi_socket.send(ltd_driver_0x87.encode_packet(0, control_state_map[device_msg.config.msg_type], device_msg.msg_value).ok)
    print(device_msg)


def print_cli_funcs():
    gsyms = globals().copy().items()
    print('=' * 100)
    for sym_name, sym_obj in gsyms:
        if callable(sym_obj):
            print(sym_name, inspect.signature(sym_obj))
    print('=' * 100)


def print_func_src(func):
    if not callable(func):
        print('Error this symbol is not callable')
        return
    print(inspect.getsource(func))


def start_control_loop():
    while True:
        read_packet()


if __name__ == '__main__':
    vspi_connect()
    print_cli_funcs()
    readline.set_completer(Completer().complete)
    readline.parse_and_bind("tab: complete")
    code.interact(local=locals())
