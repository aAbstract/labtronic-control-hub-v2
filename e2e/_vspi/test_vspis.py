import code
import readline
from vspi import (
    VSPI,
)
from test_drivers import (
    ltd_driver_lt_ht113,
    ltd_driver_lt_ht004,

    ltd_driver_lt_to202,
)
from rlcompleter import Completer


lt_ht113_vspi = VSPI(device_driver=ltd_driver_lt_ht113)
lt_ht004_vspi = VSPI(device_driver=ltd_driver_lt_ht004)

lt_to202_vspi = VSPI(device_driver=ltd_driver_lt_to202)


if __name__ == '__main__':
    readline.set_completer(Completer().complete)
    readline.parse_and_bind("tab: complete")
    code.interact(local=locals())
