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
    ltd_driver_lt_ch000,

    ltd_driver_lt_ht004,
    ltd_driver_lt_ht103,
    ltd_driver_lt_ht113,

    ltd_driver_lt_to101,
    ltd_driver_lt_to202,

    ltd_driver_lt_re600,

    ltd_driver_lt_ev574,

    ltd_driver_lt_ee759,
)
# autopep8: on


lt_ch000_vspi = VSPI(device_model='LT-CH000', device_driver=ltd_driver_lt_ch000)
lt_ht004_vspi = VSPI(device_model='LT-HT004', device_driver=ltd_driver_lt_ht004)
lt_ht103_vspi = VSPI(device_model='LT-HT103', device_driver=ltd_driver_lt_ht103, control_feedback_map={12: 5, 13: 6})
lt_ht113_vspi = VSPI(device_model='LT-HT113', device_driver=ltd_driver_lt_ht113)

lt_to101_vspi = VSPI(device_model='LT-TO101', device_driver=ltd_driver_lt_to101)
lt_to202_vspi = VSPI(device_model='LT-TO202', device_driver=ltd_driver_lt_to202)

lt_re600_vspi = VSPI(device_model='LT-RE600', device_driver=ltd_driver_lt_re600)

lt_ev574_vspi = VSPI(device_model='LT-EV574', device_driver=ltd_driver_lt_ev574, control_feedback_map={12: 5})

lt_ee759_vspi = VSPI(device_model='LT-EE759', device_driver=ltd_driver_lt_ee759,auto_connect=True)


if __name__ == '__main__':
    readline.set_completer(Completer().complete)
    readline.parse_and_bind("tab: complete")
    code.interact(local=locals())
