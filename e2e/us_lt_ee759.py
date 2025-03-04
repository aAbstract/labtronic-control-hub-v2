from selenium import webdriver
from e2e.e2e_utils import *
from e2e._vspi.test_vspis import lt_ee759_vspi
import random
import time

MODULE_ID = 'e2e.us_lt_ee759'


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

    const_term = 2.78E-4
    delta_t = 0.75
    E_value = 0
    last_p = 0
    V_value = 0
    I_value = 0
    
    # last group with class lt_ee759_control_row ->get the button elemet
    reset_button = driver.find_elements(By.CSS_SELECTOR, '.lt_ee759_control_row>button')[-1]
    energy_text = driver.find_elements(By.CSS_SELECTOR, '#energy_field>span')[-1]
    
    device_readings = driver.find_elements(By.CSS_SELECTOR, '.reading_cont')
   
    # reset energy first
    reset_button.click()
    last_time = time.time()
    
    for i in range(10):
        lt_ee759_vspi.write_msg(0, V_value, i)
        lt_ee759_vspi.write_msg(1, I_value, i)
        P_value = V_value * I_value
        time.sleep(delta_t)
        current_time = time.time()
        dt = (current_time - last_time)
        last_time = current_time

        avg_p = (P_value + last_p) * 0.5
        last_p = P_value
        E_value += avg_p * dt * const_term

        chx_device_state = {x.text.split(': ')[0]: float(x.text.split(': ')[1]) for x in device_readings}

        # check the I,V,P and energy (energy may deviate due to time difference so, we set upper limit to this deviation 10%)
        if (float(chx_device_state['V']) != V_value or
            float(chx_device_state['I']) != I_value or
            float(chx_device_state['P']) != P_value or
                abs(float(energy_text.text) - E_value) > 0.01 * E_value):
            return 1

        V_value = random.randint(0, 20)
        I_value = random.randint(0, 20)

    return 0