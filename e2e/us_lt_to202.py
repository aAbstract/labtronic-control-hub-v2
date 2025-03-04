import time
from selenium import webdriver
from e2e.e2e_utils import *
from e2e._vspi.test_vspis import lt_to202_vspi
import random

MODULE_ID = 'e2e.us_lt_to202'

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
    
    
    for i in range(5):
        #   inject packets
        lt_to202_vspi.write_msg(0, i, 0)
        lt_to202_vspi.write_msg(1, i, 0)
        lt_to202_vspi.write_msg(2, i, 0)
        lt_to202_vspi.write_msg(3, i, 0)
        
        chx_device_state = get_chx_device_state(driver)
        if not chx_device_state:
            return 1
        
        chx_device_state_keys = set(chx_device_state.keys())
        target_chx_device_state_keys = {'PT1000', 'T_Heater', 'NTC', 'TC_K_Type'}
        
        if chx_device_state_keys != target_chx_device_state_keys:
            elog(func_id, f"chx_device_state_keys={chx_device_state_keys}, target_chx_device_state_keys={target_chx_device_state_keys}")
            return 1
        
        time.sleep(1)
        chx_device_state = get_chx_device_state(driver)
        if chx_device_state != {'PT1000': i, 'T_Heater': i, 'NTC': i, 'TC_K_Type': i}:
            return 1
    return 0



def us_view_data_points(driver: webdriver.Chrome) -> int:
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
    PT1000_arr =[]
    T_Heater_arr =[]
    NTC_arr =[]
    TC_K_Type_arr =[]

    #   inject 10 packets
    for i in range(10):
        PT1000_val=random.randint(1,50)
        T_Heater_val=random.randint(1,50)
        NTC_val=random.randint(1,50)
        TC_K_Type_val=random.randint(1,50)
        
        PT1000_arr.append(PT1000_val)
        T_Heater_arr.append(T_Heater_val)
        NTC_arr.append(NTC_val)
        TC_K_Type_arr.append(TC_K_Type_val)
        
        lt_to202_vspi.write_msg(0,PT1000_val,i)
        lt_to202_vspi.write_msg(1,T_Heater_val,i)
        lt_to202_vspi.write_msg(2,NTC_val,i)
        lt_to202_vspi.write_msg(3,TC_K_Type_val,i)
        time.sleep(1)
        
    perbiew_button = try_get_elem(driver, '#rec_widget>:last-child>:first-child')
    js_click(driver, perbiew_button)
    time.sleep(1)
    data_row = try_get_elems(driver, '.data_point_row')

    #   test the values
    for i in range(len(data_row) - 1):
        data = data_row[i + 1].text.split()
        if not (float(PT1000_arr[i])== float(data[1])
                and float(T_Heater_arr[i])== float(data[2])
                and float(NTC_arr[i])== float(data[3])
                and float(TC_K_Type_arr[i])== float(data[4])):
            return 1
    
        
    time.sleep(1)
    close_dialog_button = try_get_elem(driver,'.p-dialog-header-close')
    js_click(driver,close_dialog_button)
    js_click(driver, data_tool_com)
    js_click(driver, control_buttons[2])

    return 0
    
    
def us_view_t_heater_chart(driver: webdriver.Chrome) -> int:
    '''
    user can see T_heater chart on control panel
    '''
    func_id = MODULE_ID + '.us_view_t_heater_chart'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1


    
    # DATA TOOL icon is second element with class  nav_bar_icon_cont
    data_tool_com =  try_get_elems( driver, '.nav_bar_icon_cont')[1]
    
    # grap the control buttons => all elements in the first div elemnt in the data tool header
    constrol_buttons = try_get_elems(driver , '#data_tool_header>div:first-of-type>*')
    

    # grap the canvases
    canvases = try_get_elem(driver , '#lt_to202_control_main_cont')
    
    # open data tool
    js_click(driver,data_tool_com)
    time.sleep(0.25)
    
    # start recording
    
    
    js_click(driver,constrol_buttons[0])
    #siulate packet streem over time
    for i in range(10):
        lt_to202_vspi.write_msg(0,i+20,i)
        lt_to202_vspi.write_msg(1,i+30,i)
        lt_to202_vspi.write_msg(2,i+40,i)
        lt_to202_vspi.write_msg(3,i+50,i)
        time.sleep(0.5)
        
    #uncomment the line below if you want to get new screen shot
    #canvases.screenshot(f'./e2e/data/control_panel.png')
    time.sleep(0.1)
    if test_screenshot(canvases,f'./e2e/data/control_panel.png'):
        return 1
        
    # return to the initial state
    # click reset button 
    js_click(driver,constrol_buttons[2])
    
    # hide the data tool
    js_click(driver,data_tool_com)
        

    return 0