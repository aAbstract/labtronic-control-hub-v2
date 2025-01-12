from selenium import webdriver
from e2e.e2e_utils import *
from e2e._vspi.test_vspis import lt_ht004_vspi
import time
import re
import random
MODULE_ID = 'e2e.us_lt_ht004'


def _us_connect_to_device(driver: webdriver.Chrome) -> int:
    rc = connect_to_emulation_port(driver)
    if rc != 0:
        return rc

    rc = disconnect_device(driver)
    if rc != 0:
        return rc
    return 0


def us_check_chx_device_state(driver: webdriver.Chrome) -> int:
    '''
    user can see the right premitives
    user can see real time data flow
    '''
    func_id = MODULE_ID + '.us_check_chx_device_state'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    labeled_control_data = driver.find_elements(By.CSS_SELECTOR, '.lt_ht004chx_data')

    for i in range(5):
        #   inject packets
        lt_ht004_vspi.write_msg(0, i, i)
        lt_ht004_vspi.write_msg(1, i, i)
        lt_ht004_vspi.write_msg(2, i, i)
        lt_ht004_vspi.write_msg(3, i, i)
        lt_ht004_vspi.write_msg(4, i, i)
        lt_ht004_vspi.write_msg(5, i, i)

        for data in labeled_control_data:
            if (i - float(re.findall(r"\d+\.\d+", data.text)[0])) > 0.1:
                return 1

        chx_device_state = get_chx_device_state(driver)
        if not chx_device_state:
            return 1

        chx_device_state_keys = set(chx_device_state.keys())
        target_chx_device_state_keys = {'PT1000_In', 'PT1000_Out', 'PT1000_Heater', 'TC_Surface', 'P_Heater', 'AirFlow'}

        if chx_device_state_keys != target_chx_device_state_keys:
            elog(func_id, f"chx_device_state_keys={chx_device_state_keys}, target_chx_device_state_keys={target_chx_device_state_keys}")
            return 1

        time.sleep(1)
        chx_device_state = get_chx_device_state(driver)
        if chx_device_state != {'PT1000_In': i, 'PT1000_Out': i, 'PT1000_Heater': i, 'TC_Surface': i, 'P_Heater': i, 'AirFlow': i}:
            return 1
    return 0


def us_change_sample_shape(driver: webdriver.Chrome) -> int:
    '''
    user can change mode  and view correct area 
    '''
    func_id = MODULE_ID + '.us_change_sample_shape'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    drop_down_button = driver.find_element(By.CSS_SELECTOR, '#pv_id_9>:last-child')
    options_id = ['#pv_id_9_0', '#pv_id_9_1', '#pv_id_9_2']
    areas = ['Area : 108 * 108 = 0.0116 (m^2)', 'Area : 108*108 + 18*(84*108) = 0.17496 (m^2)', 'Area : 108 * 108 + 17*(pi*15*84) = 0.0789 (m^2)']
    area = driver.find_element(By.CSS_SELECTOR, '#lt_ht004_area')

    for i in range(3):
        drop_down_button.click()
        element = driver.find_element(By.CSS_SELECTOR, options_id[i])
        element.click()
        if areas[i] != area.text:
            return 1
    return 0


def us_record_reset_plate_mode(driver: webdriver.Chrome) -> int:
    '''
    user can record T_S in plate mode
    '''
    func_id = MODULE_ID + '.us_record_reset_plate_mode'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    

    # grap components
    drop_down_button = driver.find_element(By.CSS_SELECTOR, '#pv_id_9>:last-child')
    drop_down_button.click()
    plate_mode =driver.find_element(By.CSS_SELECTOR, '#pv_id_9_0')
    plate_mode.click()

    element = driver.find_elements(By.CSS_SELECTOR, '.inp')
    current_t_s = element[0]
    saved_t_s = element[1]
    buttons = driver.find_elements(By.CSS_SELECTOR, '#lt_ht004_control_main_cont button')
    reset_btn = buttons[0]
    record_btn = buttons[1]

    current_t_s_value = 0
    saved_t_s_value = 0
    for i in range(40):
        if (i % 4 == 0):
            record_btn.click()
            saved_t_s_value = i
            
        lt_ht004_vspi.write_msg(3, i, 0)
        current_t_s_value = i
          
        if (i % 7 == 0 ):
            reset_btn.click()
            saved_t_s_value=0
            current_t_s_value=0

        if float(current_t_s.get_attribute('value')) != current_t_s_value or float(saved_t_s.get_attribute('value')) != saved_t_s_value:
            return 1
    return 0


def us_compute_ts(driver: webdriver.Chrome) -> int:
    '''
    user can record T_surface in one of the 11 T and compute t_s according to t4
    '''
    # senario: 3 random points are entered to each cell
    # the  last one is the only recorded
    # t_s is calculated after each epoch to ensure it is calculated right
    # after finishg, data is reset and mode changed
    
    func_id = MODULE_ID + '.us_compute_ts'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    
    buttons = driver.find_elements(By.CSS_SELECTOR, '#lt_ht004_control_main_cont button')
    reset_button = buttons[0]
    record_button = buttons[1]
    
    inputs = driver.find_elements(By.CSS_SELECTOR, '.inp')
    
    drop_down_button = driver.find_element(By.CSS_SELECTOR, '#pv_id_9>:last-child')
    options_id = ['#pv_id_9_1','#pv_id_9_2']
    reset_button.click()
    # for the two modes
    values =[0,0,0,0,0,0,0,0,0,0,0]
    for option in options_id:
        drop_down_button.click()
        element = driver.find_element(By.CSS_SELECTOR,option)
        element.click()
        reset_button.click()
        values =[0,0,0,0,0,0,0,0,0,0,0]
        inputs[0].click()
        for i in range(11): # number of input fields
            for j in range(3): #  4 inputs data values
                random_value = random.randint(1,10)
                if j == 2:
                    record_button.click()
                    values[i] = random_value
                lt_ht004_vspi.write_msg(3,random_value, 0)
                t_s = float(inputs[-1].get_attribute('value'))
                expected = round((sum(values[5:11])*10)/6)/10
                if expected != t_s:
                    return 1
               
    return 0