import serial
import struct

from e2e.lt_bus_vspi.lt_bus_utils import (
    compute_crc16,
    READ_FC,
    u16_to_2u8,
    LT_BUS_PACKET_DATA_START,
    WRITE_FC,
)


PHYSICAL_SERIAL_PORT = ('/dev/ttyACM0', 115200)


def test_read_device_id():
    physical_sp = serial.Serial(PHYSICAL_SERIAL_PORT[0], PHYSICAL_SERIAL_PORT[1])

    request_packet = bytes([ord('{'), 0, READ_FC])
    request_packet += (0xA000).to_bytes(2, 'little')
    request_packet += (2).to_bytes(2, 'little')
    request_packet += u16_to_2u8(compute_crc16(request_packet))
    request_packet += b'}'
    physical_sp.write(request_packet)

    response_packet = physical_sp.read_until(b'}')
    data_payload = response_packet[LT_BUS_PACKET_DATA_START:LT_BUS_PACKET_DATA_START + 2]
    assert data_payload == b'\x00\x10'

    device_id = struct.unpack('<h', data_payload)[0]
    assert device_id == 0x1000


def test_write_THP():
    physical_sp = serial.Serial(PHYSICAL_SERIAL_PORT[0], PHYSICAL_SERIAL_PORT[1])

    WRITE_THP_packet = bytes([ord('{'), 0, WRITE_FC])
    WRITE_THP_packet += (0xD07E).to_bytes(2, 'little')
    WRITE_THP_packet += (4).to_bytes(2, 'little')
    WRITE_THP_packet += struct.pack('<f', 25)
    WRITE_THP_packet += u16_to_2u8(compute_crc16(WRITE_THP_packet))
    WRITE_THP_packet += b'}'
    physical_sp.write(WRITE_THP_packet)

    READ_THP_packet = bytes([ord('{'), 0, READ_FC])
    READ_THP_packet += (0xD07E).to_bytes(2, 'little')
    READ_THP_packet += (4).to_bytes(2, 'little')
    READ_THP_packet += u16_to_2u8(compute_crc16(READ_THP_packet))
    READ_THP_packet += b'}'
    physical_sp.write(READ_THP_packet)
    response_packet = physical_sp.read_until(b'}')

    data_payload = response_packet[LT_BUS_PACKET_DATA_START:LT_BUS_PACKET_DATA_START + 4]
    THP_value = struct.unpack('<f', data_payload)[0]
    assert round(THP_value, 2) == 25


def test_write_fan_speed():
    physical_sp = serial.Serial(PHYSICAL_SERIAL_PORT[0], PHYSICAL_SERIAL_PORT[1])

    WRITE_FAN_SPEED_packet = bytes([ord('{'), 0, WRITE_FC])
    WRITE_FAN_SPEED_packet += (0xD072).to_bytes(2, 'little')
    WRITE_FAN_SPEED_packet += (4).to_bytes(2, 'little')
    WRITE_FAN_SPEED_packet += struct.pack('<f', 25)
    WRITE_FAN_SPEED_packet += u16_to_2u8(compute_crc16(WRITE_FAN_SPEED_packet))
    WRITE_FAN_SPEED_packet += b'}'
    physical_sp.write(WRITE_FAN_SPEED_packet)
