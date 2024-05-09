import sys
import serial
import code
import readline
from rlcompleter import Completer
from test_driver import *


PORT_NAME = '/dev/ttyS90'
BAUD_RATE = 115200


print('Connecting to port:', (PORT_NAME, BAUD_RATE), '...')
sp = serial.Serial(port=PORT_NAME, baudrate=BAUD_RATE, timeout=1)
if not sp.is_open:
    print('Connecting to port:', (PORT_NAME, BAUD_RATE), '...ERROR')
    sys.exit(1)
print('Connecting to port:', (PORT_NAME, BAUD_RATE), '...OK')


def text_listen():
    print('Listening for text msg...')
    packet = b''
    while True:
        byte = sp.read()
        packet += byte
        if packet[-2:] == b'\r\n':
            break
    print('MSG:', packet.decode())


def ltd_0x87_packet_listen():
    print('Listening for LtdDriver_0x87 packet...')
    packet = b''
    while True:
        byte = sp.read()
        packet += byte
        if packet[-2:] == b'\r\n':
            break

    device_msg_res = ltd_driver_0x87.decode_packet(packet)
    if device_msg_res.err:
        print('Invalid LtdDriver_0x87 packet')
        return
    device_msg: DeviceMsg = device_msg_res.ok
    print(device_msg)


def ltd_0x87_stream_listen():
    print('Listening for LtdDriver_0x87 stream...')
    packet = b''
    while True:
        byte = sp.read()
        packet += byte
        if packet[-2:] == b'\r\n':
            device_msg_res = ltd_driver_0x87.decode_packet(packet)
            if device_msg_res.err:
                print('Invalid LtdDriver_0x87 packet')
                return
            device_msg: DeviceMsg = device_msg_res.ok
            print(device_msg)
            packet = b''


if __name__ == '__main__':
    ltd_0x87_stream_listen()
    readline.set_completer(Completer().complete)
    readline.parse_and_bind("tab: complete")
    code.interact(local=locals())
