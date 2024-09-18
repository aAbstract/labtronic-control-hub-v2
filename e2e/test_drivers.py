from ltd_driver import (
    LtdDriver,
    MsgTypeConfig,
    DeviceMsg,
    DATA_TYPE_UINT,
    DATA_TYPE_FLOAT,
    DATA_TYPE_COMMAND,
)


DRIVER_CONFIG_0x87: list[MsgTypeConfig] = [
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
ltd_driver_0x87 = LtdDriver([0x87, 0x87], DRIVER_CONFIG_0x87)


DRIVER_CONFIG_0x13: list[MsgTypeConfig] = [
    MsgTypeConfig(msg_type=0, msg_name='READ_T1', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=1, msg_name='READ_T2', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=2, msg_name='READ_T_amb', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=3, msg_name='READ_T_c', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=4, msg_name='READ_T_h', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=5, msg_name='P_HEATER', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=6, msg_name='P_PELTIER', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=12, msg_name='WRITE_P_HEATER', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=13, msg_name='WRITE_P_PELTIER', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=14, msg_name='DEVICE_ERROR', data_type=DATA_TYPE_UINT, size_bytes=1, cfg2=0),
]
ltd_driver_0x13 = LtdDriver([0x13, 0x13], DRIVER_CONFIG_0x13)


DRIVER_CONFIG_LT_HT107: list[MsgTypeConfig] = [
    MsgTypeConfig(msg_type=0, msg_name='READ_T1', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=1, msg_name='READ_T2', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=2, msg_name='READ_T3', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=3, msg_name='READ_T4', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=4, msg_name='READ_T5', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=5, msg_name='READ_T6', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=6, msg_name='READ_T7', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=7, msg_name='READ_T8', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=8, msg_name='READ_T9', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=9, msg_name='READ_T_H', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=13, msg_name='P_HEATER', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=12, msg_name='WRITE_P_HEATER', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=14, msg_name='DEVICE_ERROR', data_type=DATA_TYPE_UINT, size_bytes=1, cfg2=0),
]
ltd_driver_lt_ht107 = LtdDriver([0x13, 0x14], DRIVER_CONFIG_LT_HT107)


DRIVER_CONFIG_LT_HT113: list[MsgTypeConfig] = [
    MsgTypeConfig(msg_type=0, msg_name='READ_T_sam', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0xA0),
    MsgTypeConfig(msg_type=1, msg_name='READ_T_amb', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0xA0),
    MsgTypeConfig(msg_type=2, msg_name='READ_ref', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0xA0),
    MsgTypeConfig(msg_type=3, msg_name='READ_W_flw', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0xA0),
    MsgTypeConfig(msg_type=4, msg_name='WLS', data_type=DATA_TYPE_UINT, size_bytes=1, cfg2=0xA0),
    MsgTypeConfig(msg_type=14, msg_name='DEVICE_ERROR', data_type=DATA_TYPE_UINT, size_bytes=1, cfg2=0xA0),
]
ltd_driver_lt_ht113 = LtdDriver([0x14, 0x14], DRIVER_CONFIG_LT_HT113)


DRIVER_CONFIG_LT_TO101: list[MsgTypeConfig] = [
    MsgTypeConfig(msg_type=0, msg_name='READ_TC1', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=1, msg_name='READ_TC2', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=2, msg_name='READ_TC3', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=3, msg_name='READ_LVL', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=4, msg_name='READ_PR1', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=5, msg_name='READ_PR2', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=6, msg_name='READ_PR3', data_type=DATA_TYPE_FLOAT, size_bytes=4, cfg2=0),
    MsgTypeConfig(msg_type=7, msg_name='CLS', data_type=DATA_TYPE_UINT, size_bytes=1, cfg2=0),
    MsgTypeConfig(msg_type=8, msg_name='HLS', data_type=DATA_TYPE_UINT, size_bytes=1, cfg2=0),
    MsgTypeConfig(msg_type=14, msg_name='DEVICE_ERROR', data_type=DATA_TYPE_UINT, size_bytes=1, cfg2=0),
]
ltd_driver_lt_to101 = LtdDriver([0x24, 0x24], DRIVER_CONFIG_LT_TO101)
