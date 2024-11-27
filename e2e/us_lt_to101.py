import time
from selenium import webdriver
from e2e.e2e_utils import *
from e2e._vspi.test_vspis import lt_to101_vspi
import random

MODULE_ID = 'e2e.us_lt_to101'


def _us_connect_to_device(driver: webdriver.Chrome) -> int:
    rc = connect_to_emulation_port(driver)
    if rc != 0:
        return rc
    rc = disconnect_device(driver)
    if rc != 0:
        return rc
    return 0

#########################################################################################################
#   the device has two modes that user can't directly switch between so we will test each one alone     #
#########################################################################################################

#   First: Boyle's law

def us_check_chx_device_state_boyle(driver: webdriver.Chrome) -> int:
    '''
    user can see the right premitives according to the device mode
    user can see real time data flow
    '''
    func_id = MODULE_ID + '.us_check_chx_device_state_boyle'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    
    
    for i in range(5):
        #   inject packets
        lt_to101_vspi.write_msg(0, i, 0)
        lt_to101_vspi.write_msg(1, i, 0)
        lt_to101_vspi.write_msg(2, i, 0)
        lt_to101_vspi.write_msg(3, i, 0)
        lt_to101_vspi.write_msg(4, i, 0)
        lt_to101_vspi.write_msg(5, i, 0)
        lt_to101_vspi.write_msg(6, i, 0)
        
        chx_device_state = get_chx_device_state(driver)
        if not chx_device_state:
            return 1
        
        chx_device_state_keys = set(chx_device_state.keys())
        target_chx_device_state_keys = {'TC1', 'LVL', 'PR1', 'P_times_V'}
        
        if chx_device_state_keys != target_chx_device_state_keys:
            elog(func_id, f"chx_device_state_keys={chx_device_state_keys}, target_chx_device_state_keys={target_chx_device_state_keys}")
            return 1
        
        time.sleep(1)
        chx_device_state = get_chx_device_state(driver)
        if chx_device_state != {'TC1': i, 'LVL': i, 'PR1': i, 'P_times_V': i*i}:
            return 1
    return 0



def us_view_mode_boyle(driver: webdriver.Chrome) -> int:
    '''
    user can see the mode on control panel
    '''
    func_id = MODULE_ID + '.us_view_mode_boyle'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    
    mode = driver.find_element(By.CSS_SELECTOR,'.labeled_control>:last-child')
    if not("Boyle's Law Experiment" == mode.text):
        return 1 
    return 0

def us_view_compressor_state_boyle(driver: webdriver.Chrome) -> int:
    '''
    user can see comprosor state 
    '''
    func_id = MODULE_ID + '.us_view_compressor_state_boyle'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    state = driver.find_element(By.CSS_SELECTOR,'.lt_to101_control_row:last-of-type>:last-child')
    component_state = driver.find_element(By.CSS_SELECTOR,'.lt_to101_control_row:last-of-type>:first-child')

    #   turn on the comprosor
    lt_to101_vspi.write_msg(7,1)
    if not(state.text == 'ON' and component_state.text== 'Compressor:'):
        return 1
    
    #   turn off the comprosor
    lt_to101_vspi.write_msg(7,0)
    if not(state.text == 'OFF' and component_state.text== 'Compressor:'):
        return 1
    return 0



def us_view_data_points_boyle(driver: webdriver.Chrome) -> int:
    '''
    user can see real time data flow
    user can view data using preview data
    '''
    func_id = MODULE_ID + '.us_view_data_points_boyle'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    # DATA TOOL icon is second element with class  nav_bar_icon_cont
    data_tool_com = try_get_elems(driver, '.nav_bar_icon_cont')[1]

    # grap the control buttons => all elements in the first div elemnt in the data tool header
    control_buttons = try_get_elems(driver, '#data_tool_header>div:first-of-type>*')

    js_click(driver, data_tool_com)
    time.sleep(1)
    js_click(driver, control_buttons[0])

    #   intialize array to save data in
    TC1_arr =[]
    LVL_arr =[]
    PR1_arr =[]
    P_times_V_arr =[]

    #   inject 10 packets
    for i in range(10):
        tc1_val=random.randint(1,50)
        lvl_val=random.randint(1,50)
        pr1_val=random.randint(1,50)
        p_times_v_val=lvl_val*pr1_val
        
        TC1_arr.append(tc1_val)
        LVL_arr.append(lvl_val)
        PR1_arr.append(pr1_val)
        P_times_V_arr.append(p_times_v_val)
        
        lt_to101_vspi.write_msg(0,tc1_val,i)
        lt_to101_vspi.write_msg(1,0,i)
        lt_to101_vspi.write_msg(2,0,i)
        lt_to101_vspi.write_msg(3,lvl_val,i)
        lt_to101_vspi.write_msg(4,pr1_val,i)
        lt_to101_vspi.write_msg(5,0,i)
        lt_to101_vspi.write_msg(6,0,i)
        time.sleep(1)
        
    perbiew_button = try_get_elem(driver, '#rec_widget>:last-child>:first-child')
    js_click(driver, perbiew_button)
    time.sleep(1)
    data_row = try_get_elems(driver, '.data_point_row')

    #   test the values
    for i in range(len(data_row) - 1):
        data = data_row[i + 1].text.split()
        if not (float(TC1_arr[i])== float(data[1])
                and float(LVL_arr[i])== float(data[2])
                and float(PR1_arr[i])== float(data[3])
                and float(P_times_V_arr[i])== float(data[4])):
            return 1
    
        
    time.sleep(1)
    close_dialog_button = try_get_elem(driver,'.p-dialog-header-close')
    js_click(driver,close_dialog_button)
    js_click(driver, data_tool_com)
    js_click(driver, control_buttons[2])

    return 0
    
    
    #implement
###############################################################################################################
###############################################################################################################
    
#   First: Gay-Lussac's Law

def us_check_chx_device_state_gluss(driver: webdriver.Chrome) -> int:
    '''
    user can see the right premitives according to the device mode
    user can see real time data flow
    '''
    func_id = MODULE_ID + '.us_check_chx_device_state_gluss'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    for i in range(5):
        lt_to101_vspi.write_msg(0, i, 0)
        lt_to101_vspi.write_msg(1, i, 0)
        lt_to101_vspi.write_msg(2, i, 0)
        lt_to101_vspi.write_msg(3, i, 0)
        lt_to101_vspi.write_msg(4, i, 0)
        lt_to101_vspi.write_msg(5, i, 0)
        lt_to101_vspi.write_msg(6, i, 0)
        
        chx_device_state = get_chx_device_state(driver)
        if not chx_device_state:
            return 1
        
        chx_device_state_keys = set(chx_device_state.keys())
        target_chx_device_state_keys = {'TC2', 'TC3', 'PR2','T_avg','P_over_T'}
        
        if chx_device_state_keys != target_chx_device_state_keys:
            elog(func_id, f"chx_device_state_keys={chx_device_state_keys}, target_chx_device_state_keys={target_chx_device_state_keys}")
            return 1
        
        time.sleep(1)
        chx_device_state = get_chx_device_state(driver)
        if chx_device_state != {'TC2': i, 'TC3': i, 'PR2': i, 'T_avg': i,'P_over_T':round(10*i*100/(i+273.15))/10}:
            return 1
    return 0



def us_view_mode_gluss(driver: webdriver.Chrome) -> int:
    '''
    user can see the mode on control panel
    '''
    func_id = MODULE_ID + '.us_view_mode_gluss'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    mode = driver.find_element(By.CSS_SELECTOR,'.labeled_control>:last-child')
    if not("Gay-Lussac's Law Experiment" == mode.text):
        return 1 
    return 0

def us_view_heater_state_gluss(driver: webdriver.Chrome) -> int:
    '''
    user can see heater state 
    '''
    func_id = MODULE_ID + '.us_view_heater_state_gluss'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    state = driver.find_element(By.CSS_SELECTOR,'.lt_to101_control_row:last-of-type>:last-child')
    component_state = driver.find_element(By.CSS_SELECTOR,'.lt_to101_control_row:last-of-type>:first-child')

    lt_to101_vspi.write_msg(8,1)
    if not(state.text == 'ON' and component_state.text== 'Heater:'):
        return 1
    
    lt_to101_vspi.write_msg(8,0)
    if not(state.text == 'OFF' and component_state.text== 'Heater:'):
        return 1
    return 0



def us_view_data_points_gluss(driver: webdriver.Chrome) -> int:
    '''
    user can see real time data flow
    user can view data using preview data
    '''
    func_id = MODULE_ID + '.us_view_data_points_gluss'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    # DATA TOOL icon is second element with class  nav_bar_icon_cont
    data_tool_com = try_get_elems(driver, '.nav_bar_icon_cont')[1]

    # grap the control buttons => all elements in the first div elemnt in the data tool header
    control_buttons = try_get_elems(driver, '#data_tool_header>div:first-of-type>*')

    js_click(driver, data_tool_com)
    time.sleep(1)
    js_click(driver, control_buttons[0])

    TC2_arr =[]
    TC3_arr =[]
    PR2_arr =[]
    T_avg_arr =[]
    P_over_T_arr =[]

    
    for i in range(10):
        tc2_val=random.randint(1,50)
        tc3_val=random.randint(1,50)
        pr2_val=random.randint(1,50)
        t_avg_val=(tc2_val+tc3_val)/2
        p_times_v_val=round(100*pr2_val*100/(t_avg_val+273.15))/100
        
        TC2_arr.append(tc2_val)
        TC3_arr.append(tc3_val)
        PR2_arr.append(pr2_val)
        T_avg_arr.append(t_avg_val)
        P_over_T_arr.append(p_times_v_val)
        
        lt_to101_vspi.write_msg(0,0,i)
        lt_to101_vspi.write_msg(1,tc2_val,i)
        lt_to101_vspi.write_msg(2,tc3_val,i)
        lt_to101_vspi.write_msg(3,0,i)
        lt_to101_vspi.write_msg(4,0,i)
        lt_to101_vspi.write_msg(5,pr2_val,i)
        lt_to101_vspi.write_msg(6,0,i)
        time.sleep(1)
        
    perbiew_button = try_get_elem(driver, '#rec_widget>:last-child>:first-child')
    js_click(driver, perbiew_button)
    time.sleep(1)
    data_row = try_get_elems(driver, '.data_point_row')

    for i in range(len(data_row) - 1):
        data = data_row[i + 1].text.split()
        if not (float(TC2_arr[i])== float(data[1])
                and float(TC3_arr[i])== float(data[2])
                and float(PR2_arr[i])== float(data[3])
                and float(T_avg_arr[i])== float(data[4])
                and float(P_over_T_arr[i])== float(data[5])):
            return 1
    
        
    time.sleep(1)
    close_dialog_button = try_get_elem(driver,'.p-dialog-header-close')
    js_click(driver,close_dialog_button)
    js_click(driver, data_tool_com)
    js_click(driver, control_buttons[2])

    return 0
    
