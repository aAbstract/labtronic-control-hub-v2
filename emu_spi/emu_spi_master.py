import time
import socket
import code
import math
import random
import readline
import inspect
from rlcompleter import Completer
from test_drivers import *


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


def write_error_packet_0x87(error_code: int):
    ltd_driver: LtdDriver = ltd_driver_0x87
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
    error_packet = ltd_driver.encode_packet(0, DRIVER_CONFIG_0x87[8].msg_type, error_code).ok
    vspi_socket.send(error_packet)


def write_raw_packet(data: list[int]):
    packet = bytes(data)
    vspi_socket.send(packet)


def write_msg(_driver: LtdDriver, msg_type: int, msg_value: int):
    packet = _driver.encode_packet(0, msg_type, msg_value).ok
    vspi_socket.send(packet)


def stream_sine_waves_0x87():
    ltd_driver: LtdDriver = ltd_driver_0x87
    x = 0
    while True:
        _theta = 6 * math.pi * x / 100  # 3 Hz wave @ dt = 0.01
        y_wght = math.sin(_theta) * 100
        y_temp = 25 if y_wght >= 0 else 0
        y_pres = y_wght / 10 if y_wght >= 0 else 0
        packet_wght = ltd_driver.encode_packet(x, DRIVER_CONFIG_0x87[2].msg_type, y_wght).ok
        packet_temp = ltd_driver.encode_packet(x, DRIVER_CONFIG_0x87[3].msg_type, y_temp).ok
        packet_pres = ltd_driver.encode_packet(x, DRIVER_CONFIG_0x87[4].msg_type, y_pres).ok
        vspi_socket.send(packet_wght)
        vspi_socket.send(packet_temp)
        vspi_socket.send(packet_pres)
        x += 1
        time.sleep(0.01)


def stream_rand_waves_0x87():
    ltd_driver: LtdDriver = ltd_driver_0x87
    sn = 0
    while True:
        y_wght = random.uniform(1, 15)
        y_temp = random.uniform(1, 10)
        y_pres = random.uniform(1, 5)
        packet_wght = ltd_driver.encode_packet(sn, DRIVER_CONFIG_0x87[2].msg_type, y_wght).ok
        packet_temp = ltd_driver.encode_packet(sn, DRIVER_CONFIG_0x87[3].msg_type, y_temp).ok
        packet_pres = ltd_driver.encode_packet(sn, DRIVER_CONFIG_0x87[4].msg_type, y_pres).ok
        vspi_socket.send(packet_wght)
        vspi_socket.send(packet_temp)
        vspi_socket.send(packet_pres)
        sn += 1
        time.sleep(0.01)


def stream_detr_waves_0x13():
    ltd_driver: LtdDriver = ltd_driver_0x13
    sn = 0
    while True:
        t1 = 1
        t2 = 2
        t_amb = 25
        t_c = 4
        t_h = t_amb + sn
        packet_t1 = ltd_driver.encode_packet(sn, DRIVER_CONFIG_0x13[0].msg_type, t1).ok
        packet_t2 = ltd_driver.encode_packet(sn, DRIVER_CONFIG_0x13[1].msg_type, t2).ok
        packet_t_amb = ltd_driver.encode_packet(sn, DRIVER_CONFIG_0x13[2].msg_type, t_amb).ok
        packet_t_c = ltd_driver.encode_packet(sn, DRIVER_CONFIG_0x13[3].msg_type, t_c).ok
        packet_t_h = ltd_driver.encode_packet(sn, DRIVER_CONFIG_0x13[4].msg_type, t_h).ok
        vspi_socket.send(packet_t1)
        vspi_socket.send(packet_t2)
        vspi_socket.send(packet_t_amb)
        vspi_socket.send(packet_t_c)
        vspi_socket.send(packet_t_h)
        sn += 1
        time.sleep(0.2)


def stream_detr_waves_lt_ht107():
    ltd_driver: LtdDriver = ltd_driver_lt_ht107
    sn = 0
    while True:
        sensors_reading = [(x - 1, x * 10) for x in range(1, 10)] + [(9, 75)]
        for msg_type, msg_value in sensors_reading:
            _packet = ltd_driver.encode_packet(sn, msg_type, msg_value).ok
            vspi_socket.send(_packet)
        time.sleep(0.2)


def stream_detr_waves_lt_ht113():
    ltd_driver: LtdDriver = ltd_driver_lt_ht113
    sn = 0
    while True:
        t_sam = 50
        t_amb = 25
        t_ref = 40
        w_flw = 325 if math.sin(2 * math.pi * sn / 100) >= 0 else 0
        packet_t_sam = ltd_driver.encode_packet(sn, 0, t_sam).ok
        packet_t_amb = ltd_driver.encode_packet(sn, 1, t_amb).ok
        packet_t_ref = ltd_driver.encode_packet(sn, 2, t_ref).ok
        packet_w_flw = ltd_driver.encode_packet(sn, 3, w_flw).ok
        vspi_socket.send(packet_t_sam)
        vspi_socket.send(packet_t_amb)
        vspi_socket.send(packet_t_ref)
        vspi_socket.send(packet_w_flw)
        sn += 1
        time.sleep(0.2)


def stream_lt_ht107_sample(mid_dt: list[int]):
    ltd_driver: LtdDriver = ltd_driver_lt_ht107
    sample = [100, 100, 100] + [25, 25, 25] + [25, 25, 25]
    dt = [-1, -1, -1] + mid_dt + [1, 1, 1]
    for sn in range(10):
        sample_enum = list(enumerate(sample))
        sample = [s + dt[idx] for idx, s in sample_enum]
        for msg_type, msg_value in sample_enum:
            _packet = ltd_driver.encode_packet(sn, msg_type, msg_value).ok
            vspi_socket.send(_packet)
        time.sleep(0.5)


def read_packet(_driver: LtdDriver, control_state_map: dict[int, int]):
    print(f"Listening for LtdDriver-{_driver.protocol_version} packet...")
    packet = b''
    while True:
        try:
            byte = vspi_socket.recv(1)
        except BlockingIOError:
            continue

        packet += byte
        if packet[-2:] == b'\r\n':
            if packet[0] == _driver.protocol_version[0] and packet[1] == _driver.protocol_version[1]:
                break
            else:
                print(f"Invalid LtdDriver-{_driver.protocol_version} packet")
                packet = b''

    device_msg_res = _driver.decode_packet(packet)
    if device_msg_res.err:
        print('Invalid LtdDriver packet')
        return
    device_msg: DeviceMsg = device_msg_res.ok
    if device_msg.config.msg_type in control_state_map:
        vspi_socket.send(_driver.encode_packet(0, control_state_map[device_msg.config.msg_type], device_msg.msg_value).ok)
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


def start_control_loop_0x87():
    while True:
        read_packet(ltd_driver_0x87, {
            12: 0,
            13: 1,
        })


def start_control_loop_0x13():
    while True:
        read_packet(ltd_driver_0x13, {
            12: 5,
            13: 6,
        })


def start_control_loop_lt_ht107():
    while True:
        read_packet(ltd_driver_lt_ht107, {
            12: 13,
        })


if __name__ == '__main__':
    vspi_connect()
    print_cli_funcs()
    readline.set_completer(Completer().complete)
    readline.parse_and_bind("tab: complete")
    code.interact(local=locals())
