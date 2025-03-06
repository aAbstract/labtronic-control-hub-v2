# autopep8: off
import os
import sys
import code
import readline
from rlcompleter import Completer
sys.path.append(os.getcwd())
from e2e.lt_bus_vspi.lt_bus_vspi import LTBusVSPI
from e2e.lt_bus_vspi.device_buffers import (
    lt_re850_config_buffer,
    lt_re850_data_buffer,      
)
# autopep8: on


lt_re850_bus_vspi = LTBusVSPI('LT-RE850', [lt_re850_config_buffer, lt_re850_data_buffer], lt_bus_slave_id=0x01, auto_connect=True)


if __name__ == '__main__':
    readline.set_completer(Completer().complete)
    readline.parse_and_bind("tab: complete")
    code.interact(local=locals())
