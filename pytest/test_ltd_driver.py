import struct
from e2e._vspi.ltd_driver import (
    LtdDriver,
    MsgTypeConfig,
    DeviceMsg,
    DATA_TYPE_UINT,
    DATA_TYPE_FLOAT,
    DATA_TYPE_COMMAND,
)

TEST_DRIVER_CONFIG: list[MsgTypeConfig] = [
    MsgTypeConfig(msg_type=0, msg_name='PISTON_PUMP', data_type=DATA_TYPE_UINT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=1, msg_name='PERISTALTIC_PUMP', data_type=DATA_TYPE_UINT, size_bytes=1, cfg2=0),
    MsgTypeConfig(msg_type=2, msg_name='READ_WEIGHT', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=3, msg_name='READ_TEMPERATURE', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=4, msg_name='READ_PRESSURE', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=12, msg_name='WRITE_PISTON_PUMP', data_type=DATA_TYPE_UINT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=13, msg_name='WRITE_PERISTALTIC_PUMP', data_type=DATA_TYPE_UINT, size_bytes=1, cfg2=0),
    MsgTypeConfig(msg_type=15, msg_name='WRITE_RESET_SCALE', data_type=DATA_TYPE_COMMAND, size_bytes=1, cfg2=0),
    MsgTypeConfig(msg_type=14, msg_name='DEVICE_ERROR', data_type=DATA_TYPE_UINT, size_bytes=1, cfg2=0),
]


def test_ltd_driver_0x87_get_msg_type_by_name():
    ltd_driver_0x87 = LtdDriver([0x87, 0x87], TEST_DRIVER_CONFIG)

    # invalid case
    msg_type_1 = ltd_driver_0x87.get_msg_type_by_name('DUMMY_MSG')
    assert msg_type_1 == -1

    # valid case
    test_config = TEST_DRIVER_CONFIG[2]
    msg_type_2 = ltd_driver_0x87.get_msg_type_by_name(test_config.msg_name)
    assert msg_type_2 == test_config.msg_type


def test_ltd_driver_0x87_encode_packet():
    ltd_driver_0x87 = LtdDriver([0x87, 0x87], TEST_DRIVER_CONFIG)

    # invalid msg type case
    result_1 = ltd_driver_0x87.encode_packet(0, 10, 2.254)
    assert result_1.err == 'Unknown msg_type'

    # encode data packet case
    target_packet_2 = bytes([0x87, 0x87, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xA4, 0x1A, 0x0D, 0x0A])
    result_2 = ltd_driver_0x87.encode_packet(0, ltd_driver_0x87.get_msg_type_by_name('READ_WEIGHT'), 2.254)
    assert result_2.ok
    assert result_2.ok == target_packet_2

    # encode command packet case
    target_packet_3 = bytes([0x87, 0x87, 0x0C, 0x00, 0x00, 0xCF, 0x00, 0xFF, 0x4B, 0xEB, 0x0D, 0x0A])
    result_3 = ltd_driver_0x87.encode_packet(0, ltd_driver_0x87.get_msg_type_by_name('WRITE_RESET_SCALE'), 0xFF)
    assert result_3.ok
    assert result_3.ok == target_packet_3


def test_ltd_driver_0x87_decode_packet():
    ltd_driver_0x87 = LtdDriver([0x87, 0x87], TEST_DRIVER_CONFIG)

    # too small packet
    packet = bytes([0x00])
    result = ltd_driver_0x87.decode_packet(packet)
    assert result.err == 'Packet Too Small'

    # invalid crc16 case
    packet = bytes([0x87, 0x87, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xA5, 0x1A, 0x0D, 0x0A])
    result = ltd_driver_0x87.decode_packet(packet)
    assert result.err['msg'] == 'Invalid CRC-16'

    # invalid version bytes
    packet = bytes([0x87, 0x88, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0x78, 0xB7, 0x0D, 0x0A])
    result = ltd_driver_0x87.decode_packet(packet)
    assert result.err == 'Invalid Version Bytes'

    # packet length mismatch case
    packet = bytes([0x87, 0x87, 0x0A, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xBC, 0x68, 0x0D, 0x0A])
    result = ltd_driver_0x87.decode_packet(packet)
    assert result.err['msg'] == 'Packet Size Mismatch'

    # data size mismatch case
    packet = bytes([0x87, 0x87, 0x0F, 0x00, 0x00, 0x10, 0x00, 0x89, 0x41, 0x10, 0x40, 0x80, 0xD0, 0x0D, 0x0A])
    result = ltd_driver_0x87.decode_packet(packet)
    assert result.err['msg'] == 'Invalid Data Length Bits'

    # invalid msg type case
    packet = bytes([0x87, 0x87, 0x0F, 0x00, 0x00, 0x2A, 0x00, 0x89, 0x41, 0x10, 0x40, 0x5E, 0x3E, 0x0D, 0x0A])
    result = ltd_driver_0x87.decode_packet(packet)
    assert result.err['msg'] == 'Invalid Msg Type Bits'

    # valid case [READ_WEIGHT]
    packet = bytes([0x87, 0x87, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xA4, 0x1A, 0x0D, 0x0A])
    result = ltd_driver_0x87.decode_packet(packet)
    assert result.ok
    device_msg: DeviceMsg = result.ok
    device_msg.msg_value = round(device_msg.msg_value, 3)
    assert device_msg.msg_value == 2.254
    assert device_msg.b64_msg_value == 'iUEQQA=='
    assert device_msg.seq_number == 0
    assert device_msg.config.data_type == DATA_TYPE_FLOAT
    assert device_msg.config.msg_name == 'READ_WEIGHT'
    assert device_msg.config.msg_type == ltd_driver_0x87.get_msg_type_by_name('READ_WEIGHT')
    assert device_msg.config.size_bytes == 4
    assert device_msg.config.cfg2 == 0

    # valid case [DEVICE_ERROR]
    packet = bytes([0x87, 0x87, 0x0C, 0x00, 0x00, 0x4E, 0x00, 0xF0, 0x8C, 0x45, 0x0D, 0x0A])
    result = ltd_driver_0x87.decode_packet(packet)
    assert result.ok
    device_msg: DeviceMsg = result.ok
    assert device_msg.msg_value == 240
    assert device_msg.b64_msg_value == '8A=='
    assert device_msg.seq_number == 0
    assert device_msg.config.data_type == DATA_TYPE_UINT
    assert device_msg.config.msg_name == 'DEVICE_ERROR'
    assert device_msg.config.msg_type == ltd_driver_0x87.get_msg_type_by_name('DEVICE_ERROR')
    assert device_msg.config.size_bytes == 1
    assert device_msg.config.cfg2 == 0


def test_fltsq_encode():
    ltd_driver_fltsq = LtdDriver([0x99, 0x99], [])
    packet = ltd_driver_fltsq.fltsq_encode([(x / 10) for x in range(30)]).ok
    assert len(packet) == 127

    float_binary_parser = LtdDriver._get_binary_parser(4, DATA_TYPE_FLOAT).ok
    for i in range(30):
        start_idx = 3 + i * 4
        ith_float_buffer = packet[start_idx:start_idx + 4]
        ith_float = struct.unpack(float_binary_parser, ith_float_buffer)[0]
        assert round(ith_float, 2) == i / 10
