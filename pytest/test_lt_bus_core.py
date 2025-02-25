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


def test_device_config_buffer():
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


def test_encode_read_packet():
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
