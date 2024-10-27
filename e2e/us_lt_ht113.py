from selenium import webdriver
from e2e.e2e_utils import *
from e2e._vspi.test_vspis import lt_ht113_vspi


MODULE_ID = 'e2e.us_lt_ht113'


def _us_connect_to_device(driver: webdriver.Chrome) -> int:
    rc = connect_to_emulation_port(driver)
    if rc != 0:
        return rc

    rc = disconnect_device(driver)
    if rc != 0:
        return rc

    return 0


def us_check_chx_device_state(driver: webdriver.Chrome) -> int:
    func_id = MODULE_ID + '.us_check_chx_device_state'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    chx_device_state = get_chx_device_state(driver)
    if not chx_device_state:
        return 1
    chx_device_state_keys = set(chx_device_state.keys())
    target_chx_device_state_keys = {'T_sam', 'W_flw', 'T_amb', 'T_ref'}
    if chx_device_state_keys != target_chx_device_state_keys:
        elog(func_id, f"chx_device_state_keys={chx_device_state_keys}, target_chx_device_state_keys={target_chx_device_state_keys}")
        return 1

    lt_ht113_vspi.write_msg(0, 11.1)
    lt_ht113_vspi.write_msg(1, 22.2)
    lt_ht113_vspi.write_msg(2, 33.3)
    lt_ht113_vspi.write_msg(3, 44.4)
    chx_device_state = get_chx_device_state(driver)
    if chx_device_state != {'T_sam': 11.1, 'W_flw': 44.4, 'T_amb': 22.2, 'T_ref': 33.3}:
        return 1

    return 0
