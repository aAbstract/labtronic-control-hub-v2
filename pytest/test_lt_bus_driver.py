import time
import serial
import struct

from e2e.lt_bus_vspi.lt_bus_vspi import (
    DeviceBuffer,
    DeviceRegisterConfig,
    LTBusVSPI,
    LTBusVSPICommMode,
)
from e2e.lt_bus_vspi.lt_bus_utils import (
    compute_crc16,
    READ_FC,
    u16_to_2u8,
    LT_BUS_PACKET_DATA_START,
    WRITE_FC,
)


EMULATION_SERIAL_PORT = ('/dev/ttyS90', 115200)
PHYSICAL_SERIAL_PORT = ('/dev/ttyACM0', 115200)


def test_lt_bus_device_config_buffer():
    device_config_buffer = DeviceBuffer(0xA000, [
        DeviceRegisterConfig('device_id', 0x000, 'u16'),
        DeviceRegisterConfig('device_status', 0x002, 'u16'),
        DeviceRegisterConfig('device_config', 0x004, 'u16'),
        DeviceRegisterConfig('msg_counter', 0x006, 'u8'),
        DeviceRegisterConfig('msg_buffer', 0x007, 'u8[]', 255),
    ])

    assert device_config_buffer.get_register_address('device_status') == '0xA002'

    device_id = device_config_buffer.write_register('device_id', 0xFF01)  # 0xFF01
    assert device_id == 0xFF01
    device_id = device_config_buffer.read_register('device_id')
    assert device_id == 0xFF01


def test_lt_bus_read_device_id():
    emulation_sp = serial.Serial(EMULATION_SERIAL_PORT[0], EMULATION_SERIAL_PORT[1])

    request_packet = bytes([ord('{'), 0, READ_FC])
    request_packet += (0xA000).to_bytes(2, 'little')
    request_packet += (2).to_bytes(2, 'little')
    request_packet += u16_to_2u8(compute_crc16(request_packet))
    request_packet += b'}'
    emulation_sp.write(request_packet)

    response_packet = emulation_sp.read_until(b'}')
    data_payload = response_packet[LT_BUS_PACKET_DATA_START:LT_BUS_PACKET_DATA_START + 2]
    assert data_payload == b'\x01\xFF'

    device_id = struct.unpack('<H', data_payload)[0]
    assert device_id == 0xFF01


def test_lt_bus_read_physical_device_id():
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


def test_lt_bus_encode_read_packet():
    config_buffer = DeviceBuffer(0xA000, [
        DeviceRegisterConfig('device_id', 0x000, 'u16'),
        DeviceRegisterConfig('device_status', 0x002, 'u16'),
        DeviceRegisterConfig('device_config', 0x004, 'u16'),
        DeviceRegisterConfig('msg_counter', 0x006, 'u8'),
        DeviceRegisterConfig('msg_buffer', 0x007, 'u8[]', 255),
    ])
    data_buffer = DeviceBuffer(0xD000, [
        DeviceRegisterConfig('FLOW', 0x000, 'f32'),
        DeviceRegisterConfig('PR1', 0x004, 'f32'),
        DeviceRegisterConfig('PR2', 0x008, 'f32'),
    ])
    bus_vspi = LTBusVSPI('LT-XX000', [config_buffer, data_buffer], LTBusVSPICommMode.WIRED)

    target_packet = bytes([ord('{'), 0, READ_FC])
    target_packet += (0xD004).to_bytes(2, 'little')
    target_packet += (4).to_bytes(2, 'little')
    target_packet += u16_to_2u8(compute_crc16(target_packet))
    target_packet += b'}'

    READ_packet = bus_vspi.device_read_register('PR1')
    assert READ_packet == target_packet


def test_lt_bus_write_cycle():
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

    t1 = time.time()
    emulation_sp.write(READ_PR1_packet)
    response_packet = emulation_sp.read_until(b'}')
    t2 = time.time()

    dt = t2 - t1

    data_payload = response_packet[LT_BUS_PACKET_DATA_START:LT_BUS_PACKET_DATA_START + 4]
    pr1_value = struct.unpack('<f', data_payload)[0]
    assert round(pr1_value, 2) == 12.34


def test_lt_bus_physical_write_THP():
    physical_sp = serial.Serial(PHYSICAL_SERIAL_PORT[0], PHYSICAL_SERIAL_PORT[1])

    WRITE_THP_packet = bytes([ord('{'), 0, WRITE_FC])
    WRITE_THP_packet += (0xD07E).to_bytes(2, 'little')
    WRITE_THP_packet += (4).to_bytes(2, 'little')
    WRITE_THP_packet += struct.pack('<f', 25)
    WRITE_THP_packet += u16_to_2u8(compute_crc16(WRITE_THP_packet))
    WRITE_THP_packet += b'}'
    physical_sp.write(WRITE_THP_packet)

    # READ_THP_packet = bytes([ord('{'), 0, READ_FC])
    # READ_THP_packet += (0xD07E).to_bytes(2, 'little')
    # READ_THP_packet += (4).to_bytes(2, 'little')
    # READ_THP_packet += u16_to_2u8(compute_crc16(READ_THP_packet))
    # READ_THP_packet += b'}'
    # t1 = time.time()
    # physical_sp.write(READ_THP_packet)
    # response_packet = physical_sp.read_until(b'}')
    # t2 = time.time()
    # dt = t2 - t1

    # data_payload = response_packet[LT_BUS_PACKET_DATA_START:LT_BUS_PACKET_DATA_START + 4]
    # THP_value = struct.unpack('<f', data_payload)[0]
    # assert round(THP_value, 2) == 25


def test_lt_bus_physical_write_fan_speed():
    physical_sp = serial.Serial(PHYSICAL_SERIAL_PORT[0], PHYSICAL_SERIAL_PORT[1])

    WRITE_FAN_SPEED_packet = bytes([ord('{'), 0, WRITE_FC])
    WRITE_FAN_SPEED_packet += (0xD072).to_bytes(2, 'little')
    WRITE_FAN_SPEED_packet += (4).to_bytes(2, 'little')
    WRITE_FAN_SPEED_packet += struct.pack('<f', 25)
    WRITE_FAN_SPEED_packet += u16_to_2u8(compute_crc16(WRITE_FAN_SPEED_packet))
    WRITE_FAN_SPEED_packet += b'}'
    physical_sp.write(WRITE_FAN_SPEED_packet)
