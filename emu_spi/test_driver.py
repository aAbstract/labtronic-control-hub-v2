from ltd_driver import (
    LtdDriver,
    MsgTypeConfig,
    DeviceMsg,
    DATA_TYPE_INT,
    DATA_TYPE_UINT,
    DATA_TYPE_FLOAT,
    DATA_TYPE_COMMAND,
)

DRIVER_CONFIG_0x87: list[MsgTypeConfig] = [
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
ltd_driver_0x87 = LtdDriver([0x87, 0x87], DRIVER_CONFIG_0x87)


DRIVER_CONFIG_0x13: list[MsgTypeConfig] = [
    MsgTypeConfig(msg_type=0, msg_name='READ_T1', data_type=DATA_TYPE_FLOAT, size_bytes=4),
    MsgTypeConfig(msg_type=1, msg_name='READ_T2', data_type=DATA_TYPE_FLOAT, size_bytes=4),
    MsgTypeConfig(msg_type=2, msg_name='READ_T_amb', data_type=DATA_TYPE_FLOAT, size_bytes=4),
    MsgTypeConfig(msg_type=3, msg_name='READ_T_c', data_type=DATA_TYPE_FLOAT, size_bytes=4),
    MsgTypeConfig(msg_type=4, msg_name='READ_T_h', data_type=DATA_TYPE_FLOAT, size_bytes=4),
    MsgTypeConfig(msg_type=5, msg_name='P_HEATER', data_type=DATA_TYPE_FLOAT, size_bytes=4),
    MsgTypeConfig(msg_type=6, msg_name='P_PELTIER', data_type=DATA_TYPE_FLOAT, size_bytes=4),
    MsgTypeConfig(msg_type=12, msg_name='WRITE_P_HEATER', data_type=DATA_TYPE_FLOAT, size_bytes=4),
    MsgTypeConfig(msg_type=13, msg_name='WRITE_P_PELTIER', data_type=DATA_TYPE_FLOAT, size_bytes=1),
    MsgTypeConfig(msg_type=14, msg_name='DEVICE_ERROR', data_type=DATA_TYPE_UINT, size_bytes=1),
]
ltd_driver_0x13 = LtdDriver([0x13, 0x13], DRIVER_CONFIG_0x13)
