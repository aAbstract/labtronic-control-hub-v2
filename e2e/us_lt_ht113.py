from e2e_utils import *
from selenium import webdriver
from selenium.webdriver.common.by import By


MODULE_ID = 'e2e.us_lt_ht113'


def us_connect_to_device(driver: webdriver.Chrome) -> int:
    rc = connect_to_emulation_port(driver)
    if rc != 0:
        return rc

    return 0
