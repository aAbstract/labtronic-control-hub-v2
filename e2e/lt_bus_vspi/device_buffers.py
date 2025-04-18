# autopep8: off
import os
import sys
sys.path.append(os.getcwd())
from e2e.lt_bus_vspi.lt_bus_vspi import (
    DeviceBuffer,
    DeviceRegisterConfig,
)
# autopep8: on


# LT-RE850
lt_re850_config_buffer = DeviceBuffer(0xA000, [
    DeviceRegisterConfig('device_id', 0x000, 'u16'),
    DeviceRegisterConfig('device_status', 0x002, 'u16'),
    DeviceRegisterConfig('device_config', 0x004, 'u16'),
    DeviceRegisterConfig('msg_counter', 0x006, 'u8'),
    DeviceRegisterConfig('msg_buffer', 0x007, 'u8[]', 255),
])
lt_re850_config_buffer.write_register('device_id', 0x1000)
lt_re850_config_buffer.write_register('msg_counter', 5)
lt_re850_config_buffer.write_register('msg_buffer', b'\x01\x02\x03\x04\x05')

lt_re850_device_data_registers_config = [
    DeviceRegisterConfig('FLOW', 0x000, 'f32'),
    DeviceRegisterConfig('PR1', 0x004, 'f32'),
    DeviceRegisterConfig('PR2', 0x008, 'f32'),
    DeviceRegisterConfig('HUMD1', 0x00C, 'f32'),
    DeviceRegisterConfig('HUMD2', 0x010, 'f32'),
    DeviceRegisterConfig('PUMP1_CURR', 0x014, 'f32'),
    DeviceRegisterConfig('PUMP2_CURR', 0x018, 'f32'),
    DeviceRegisterConfig('COMP_CURR', 0x01C, 'f32'),
] + [DeviceRegisterConfig(f"TMP{x + 1}", 0x020 + x * 4, 'f32') for x in range(20)] + [
    DeviceRegisterConfig('PR3', 0x070, 'f32'),
    DeviceRegisterConfig('PR4', 0x074, 'f32'),
    DeviceRegisterConfig('INPUT_REG', 0x078, 'u16'),
    DeviceRegisterConfig('FAN_SPEED', 0x07A, 'f32'),
    DeviceRegisterConfig('HEATER_POWER', 0x07E, 'f32'),
    DeviceRegisterConfig('HEATER_TMP_SETPOINT', 0x082, 'f32'),
    DeviceRegisterConfig('THERMOSTAT_SETPOINT', 0x086, 'f32'),
    DeviceRegisterConfig('CTRL_REG', 0x08A, 'u16'),
    DeviceRegisterConfig('FAULT_REG', 0x08C, 'u16'),
]
lt_re850_data_buffer = DeviceBuffer(0xD000, lt_re850_device_data_registers_config)
for lt_re850_register_config in lt_re850_device_data_registers_config:
    __conf = lt_re850_register_config
    if __conf.data_type == 'f32':
        lt_re850_data_buffer.write_register(__conf.register_name, __conf.offset / 10)

    if __conf.register_name == 'INPUT_REG':
        lt_re850_data_buffer.write_register(__conf.register_name, 6)

    if __conf.register_name == 'CTRL_REG':
        lt_re850_data_buffer.write_register(__conf.register_name, 1)

    if __conf.register_name == 'FAULT_REG':
        lt_re850_data_buffer.write_register(__conf.register_name, 1)

    if __conf.register_name == 'FLOW':
        lt_re850_data_buffer.write_register(__conf.register_name, 12.34)


# LT-MC417
lt_mc417_config_buffer = DeviceBuffer(0xA000, [
    DeviceRegisterConfig('device_id', 0x000, 'u16'),
    DeviceRegisterConfig('device_status', 0x002, 'u16'),
    DeviceRegisterConfig('device_config', 0x004, 'u16'),
    DeviceRegisterConfig('msg_counter', 0x006, 'u8'),
    DeviceRegisterConfig('msg_buffer', 0x007, 'u8[]', 255),
])
lt_mc417_config_buffer.write_register('device_id', 0x1001)
lt_mc417_config_buffer.write_register('msg_counter', 3)
lt_mc417_config_buffer.write_register('msg_buffer', b'\x01\x02\x03')

lt_mc417_device_data_registers_config = [
    DeviceRegisterConfig('PR1', 0x000, 'f32'),
    DeviceRegisterConfig('INPUT_REG', 0x004, 'u16'),
    DeviceRegisterConfig('PR1_SETPOINT', 0x006, 'f32'),
    DeviceRegisterConfig('KP', 0x00A, 'f32'),
    DeviceRegisterConfig('KI', 0x00E, 'f32'),
    DeviceRegisterConfig('KD', 0x012, 'f32'),
    DeviceRegisterConfig('MIN_DUTY', 0x016, 'f32'),
    DeviceRegisterConfig('MAX_DUTY', 0x01A, 'f32'),
    DeviceRegisterConfig('PUMP1_SPEED', 0x01E, 'f32'),
    DeviceRegisterConfig('CTRL_REG', 0x022, 'u16'),
    DeviceRegisterConfig('FAULT_REG', 0x024, 'u16'),
]
lt_mc417_data_buffer = DeviceBuffer(0xD000, lt_mc417_device_data_registers_config)
for lt_mc417_register_config in lt_mc417_device_data_registers_config:
    __conf = lt_mc417_register_config
    if __conf.register_name == 'INPUT_REG':
        lt_mc417_data_buffer.write_register(__conf.register_name, 0)

    if __conf.register_name == 'CTRL_REG':
        lt_mc417_data_buffer.write_register(__conf.register_name, 3)

    if __conf.register_name == 'FAULT_REG':
        lt_mc417_data_buffer.write_register(__conf.register_name, 0)

    if __conf.register_name == 'PR1':
        lt_mc417_data_buffer.write_register(__conf.register_name, 12.34)

    if __conf.register_name == 'PUMP1_SPEED':
        lt_mc417_data_buffer.write_register(__conf.register_name, 50)


# LT-MC415
lt_mc415_config_buffer = DeviceBuffer(0xA000, [
    DeviceRegisterConfig('device_id', 0x000, 'u16'),
    DeviceRegisterConfig('device_status', 0x002, 'u16'),
    DeviceRegisterConfig('device_config', 0x004, 'u16'),
    DeviceRegisterConfig('msg_counter', 0x006, 'u8'),
    DeviceRegisterConfig('msg_buffer', 0x007, 'u8[]', 255),
])
lt_mc415_config_buffer.write_register('device_id', 0x1003)
lt_mc415_config_buffer.write_register('msg_counter', 0)

lt_mc415_device_data_registers_config = [
    DeviceRegisterConfig('LVL', 0x000, 'f32'),
    DeviceRegisterConfig('PR1', 0x004, 'f32'),
    DeviceRegisterConfig('INPUT_REG', 0x008, 'u16'),
    DeviceRegisterConfig('LVL_SETPOINT', 0x00A, 'f32'),
    DeviceRegisterConfig('KP', 0x00E, 'f32'),
    DeviceRegisterConfig('KI', 0x012, 'f32'),
    DeviceRegisterConfig('KD', 0x016, 'f32'),
    DeviceRegisterConfig('MIN_DUTY', 0x01A, 'f32'),
    DeviceRegisterConfig('MAX_DUTY', 0x01E, 'f32'),
    DeviceRegisterConfig('VALVE1_CAPACITY', 0x022, 'f32'),
    DeviceRegisterConfig('PUMP1_SPEED', 0x026, 'f32'),
    DeviceRegisterConfig('CTRL_REG', 0x02A, 'u16'),
    DeviceRegisterConfig('FAULT_REG', 0x02C, 'u16'),
]
lt_mc415_data_buffer = DeviceBuffer(0xD000, lt_mc415_device_data_registers_config)
