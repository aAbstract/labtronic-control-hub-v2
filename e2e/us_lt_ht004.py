from selenium import webdriver
from e2e.e2e_utils import *
from e2e._vspi.test_vspis import lt_ht004_vspi
import time

MODULE_ID = 'e2e.us_lt_ht113'


def _us_connect_to_device(driver: webdriver.Chrome) -> int:
    rc = connect_to_emulation_port(driver)
    if rc != 0:
        return rc

    rc = disconnect_device(driver)
    if rc != 0:
        return rc

    return 0


def us_stream_data(driver: webdriver.Chrome) -> int:
    func_id = MODULE_ID + '.us_stream_data'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    i=0
    while True:
        lt_ht004_vspi.write_msg(0,i,i)
        lt_ht004_vspi.write_msg(1,i,i)
        lt_ht004_vspi.write_msg(2,i,i)
        lt_ht004_vspi.write_msg(3,i,i)
        lt_ht004_vspi.write_msg(4,i,i)
        lt_ht004_vspi.write_msg(5,i,i)
        time.sleep(1)
        i+=1
    

    return 0
