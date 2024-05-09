from ltd_driver_0x87 import (
    LtdDriver_0x87,
    MsgTypeConfig,
    DeviceMsg,
    DATA_TYPE_INT,
    DATA_TYPE_UINT,
    DATA_TYPE_FLOAT,
    DATA_TYPE_COMMAND,
)

TEST_DRIVER_CONFIG: list[MsgTypeConfig] = [
    MsgTypeConfig(msg_type=0, msg_name='PISTON_PUMP', data_type=DATA_TYPE_UINT, size_bytes=4),
    MsgTypeConfig(msg_type=1, msg_name='PERISTALTIC_PUMP', data_type=DATA_TYPE_UINT, size_bytes=1),
    MsgTypeConfig(msg_type=2, msg_name='READ_WEIGHT', data_type=DATA_TYPE_FLOAT, size_bytes=4),
    MsgTypeConfig(msg_type=3, msg_name='READ_TEMPERATURE', data_type=DATA_TYPE_FLOAT, size_bytes=4),
    MsgTypeConfig(msg_type=4, msg_name='READ_PRESSURE', data_type=DATA_TYPE_FLOAT, size_bytes=4),
    MsgTypeConfig(msg_type=12, msg_name='WRITE_PISTON_PUMP', data_type=DATA_TYPE_UINT, size_bytes=4),
    MsgTypeConfig(msg_type=13, msg_name='WRITE_PERISTALTIC_PUMP', data_type=DATA_TYPE_UINT, size_bytes=1),
    MsgTypeConfig(msg_type=15, msg_name='WRITE_RESET_SCALE', data_type=DATA_TYPE_COMMAND, size_bytes=1),
    MsgTypeConfig(msg_type=14, msg_name='DEVICE_ERROR', data_type=DATA_TYPE_UINT, size_bytes=1),
]

ltd_driver_0x87 = LtdDriver_0x87(TEST_DRIVER_CONFIG)
