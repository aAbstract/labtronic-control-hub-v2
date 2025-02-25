import serial
import struct

from e2e.lt_bus_vspi.lt_bus_utils import (
    compute_crc16,
    READ_FC,
    u16_to_2u8,
    LT_BUS_PACKET_DATA_START,
    WRITE_FC,
)


EMULATION_SERIAL_PORT = ('/dev/ttyS90', 115200)


def test_read_device_id():
    emulation_sp = serial.Serial(EMULATION_SERIAL_PORT[0], EMULATION_SERIAL_PORT[1])

    request_packet = bytes([ord('{'), 0, READ_FC])
    request_packet += (0xA000).to_bytes(2, 'little')
    request_packet += (2).to_bytes(2, 'little')
    request_packet += u16_to_2u8(compute_crc16(request_packet))
    request_packet += b'}'
    emulation_sp.write(request_packet)

    response_packet = emulation_sp.read_until(b'}')
    data_payload = response_packet[LT_BUS_PACKET_DATA_START:LT_BUS_PACKET_DATA_START + 2]
    assert data_payload == b'\x00\x10'

    device_id = struct.unpack('<h', data_payload)[0]
    assert device_id == 0x1000


def test_write_PR1():
    emulation_sp = serial.Serial(EMULATION_SERIAL_PORT[0], EMULATION_SERIAL_PORT[1])

    # write PR1 value
    WRITE_PR1_packet = bytes([ord('{'), 0, WRITE_FC])
    WRITE_PR1_packet += (0xD004).to_bytes(2, 'little')
    WRITE_PR1_packet += (4).to_bytes(2, 'little')
    WRITE_PR1_packet += struct.pack('<f', 12.34)
    WRITE_PR1_packet += u16_to_2u8(compute_crc16(WRITE_PR1_packet))
    WRITE_PR1_packet += b'}'
    emulation_sp.write(WRITE_PR1_packet)

    # read PR1 value
    READ_PR1_packet = bytes([ord('{'), 0, READ_FC])
    READ_PR1_packet += (0xD004).to_bytes(2, 'little')
    READ_PR1_packet += (4).to_bytes(2, 'little')
    READ_PR1_packet += u16_to_2u8(compute_crc16(READ_PR1_packet))
    READ_PR1_packet += b'}'
    emulation_sp.write(READ_PR1_packet)
    response_packet = emulation_sp.read_until(b'}')

    data_payload = response_packet[LT_BUS_PACKET_DATA_START:LT_BUS_PACKET_DATA_START + 4]
    pr1_value = struct.unpack('<f', data_payload)[0]
    assert round(pr1_value, 2) == 12.34
