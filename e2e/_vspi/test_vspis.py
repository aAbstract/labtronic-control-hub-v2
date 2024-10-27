# autopep8: off
import os
import sys
import code
import readline
from rlcompleter import Completer
sys.path.append(os.getcwd())
from e2e._vspi.vspi import (
    VSPI,
)
from e2e._vspi.test_drivers import (
    ltd_driver_lt_ht113,
    ltd_driver_lt_ht004,

    ltd_driver_lt_to202,

    ltd_driver_lt_re600,
)
# autopep8: on


lt_ht113_vspi = VSPI(device_driver=ltd_driver_lt_ht113)
lt_ht004_vspi = VSPI(device_driver=ltd_driver_lt_ht004)

lt_to202_vspi = VSPI(device_driver=ltd_driver_lt_to202)

lt_re600_vspi = VSPI(device_driver=ltd_driver_lt_re600)


if __name__ == '__main__':
    readline.set_completer(Completer().complete)
    readline.parse_and_bind("tab: complete")
    code.interact(local=locals())
