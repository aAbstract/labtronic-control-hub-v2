# autopep8: off
import os
import sys
import code
import readline
from rlcompleter import Completer
sys.path.append(os.getcwd())
from e2e.lt_bus_vspi.lt_bus_vspi import (
    DeviceBuffer,
    DeviceRegisterConfig,
    LTBusVSPI,
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
lt_re850_config_buffer.write_register('device_id', 0xFF01)
lt_re850_data_buffer = DeviceBuffer(0xD000, [
    DeviceRegisterConfig('FLOW', 0x000, 'f32'),
    DeviceRegisterConfig('PR1', 0x004, 'f32'),
    DeviceRegisterConfig('PR2', 0x008, 'f32'),
])
lt_re850_bus_vspi = LTBusVSPI('LT-RE850', [lt_re850_config_buffer, lt_re850_data_buffer], auto_connect=True)


if __name__ == '__main__':
    readline.set_completer(Completer().complete)
    readline.parse_and_bind("tab: complete")
    code.interact(local=locals())
