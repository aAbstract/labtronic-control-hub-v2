from selenium import webdriver
from e2e.e2e_utils import *
from e2e._vspi.test_vspis import lt_ht113_vspi
import base64
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

def us_view_water_level_switch_state(driver: webdriver.Chrome) -> int:
    # this function checks the water switch value and the notification change
    
    func_id = MODULE_ID + '.us_view_water_level_switch_state'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    
    # grap the components
        # a- switch value component => last span in last div of element with id=lt_ht113_control_txt  
    switch_value_elemtn = try_get_elem(driver,'#lt_ht113_control_txt div:last-child span:last-child')
        # b- notivication component => last element with class lt_ht113_control_row
    notification_element = try_get_elems(driver,'.lt_ht113_control_row')[-1]
        
    # check when the value is OFF which is represented by WLS (which is msg_type 4) with value of 0
    # write the value
    lt_ht113_vspi.write_msg(4, 0)
    # check the value of the component
    if switch_value_elemtn.text != 'OFF':
        return 1
    # check the value of the component
    if notification_element.text != 'WATER LEVEL - INSUFFICIENT':
        return 1
    
    
    # check when the value is ON which is represented by WLS (which is msg_type 4) with value of 1
    # write the value
    lt_ht113_vspi.write_msg(4, 1)
    # check the value of the component
    if switch_value_elemtn.text != 'ON':
        return 1
    # check the value of the component
    if notification_element.text != 'WATER LEVEL - OK':
        return 1
    
    return 0

def us_view_water_flow_control_panel(driver: webdriver.Chrome) -> int:
    # this function checks the water flow level and returns true if user can see the same vlalue
    
    func_id = MODULE_ID + '.us_view_water_flow_control_panel'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    
    # grap the component
    # water level component =>second span of first child of third elemnt with class lt_ht113_control_row  
    water_value_component  = try_get_elem(driver,'.lt_ht113_control_row:nth-of-type(3) > :first-child > span:nth-of-type(2)')
    
    #set value and test it
    for i in range(10):
        value = pow((i-5),3)
        # write the value
        lt_ht113_vspi.write_msg(3,value)
        # test the value
        if water_value_component.text != f"{float(value):.1f}":
            return 1
        
    return 0


def us_sample_change_sync(driver: webdriver.Chrome) -> int:
    # this function checks sync between sample change and device hardware
    
    func_id = MODULE_ID + '.us_sample_change_sync'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    data_object = [
    { 'label': 'Brass Slab L=100, W=65, H=15 (mm)', 'value': 0xA0 },
    { 'label': 'Stainless Steel Slab L=100, W=65, H=15 (mm)', 'value': 0xA1 },
    { 'label': 'Brass Cylinder D=20, L=100 (mm)', 'value': 0xA2 },
    { 'label': 'Stainless Steel Cylinder D=20, L=100 (mm)', 'value': 0xA3 },
    { 'label': 'Brass Cylinder D=30, L=100 (mm)', 'value': 0xA4 },
    { 'label': 'Brass Sphere D = 45 (mm)', 'value': 0xA5 },
    { 'label': 'Stainless Steel Sphere D = 45 (mm)', 'value': 0xA6 }]

    # get the componet showing the label => the div that is ancestor to the first element with class lt_ht113_control_row
    label_com = try_get_elem(driver,'.lt_ht113_control_row:nth-of-type(1)>div')
    
    for state in data_object:
        # set the state
        lt_ht113_vspi.switch_device_mode(state['value'])
        if label_com.text != state['label']:
            return 1

    return 0

def us_view_graph(driver: webdriver.Chrome) -> int:
    # this function checks if the graph displayed is correct 

    func_id = MODULE_ID + '.us_view_graph'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    
    # DATA TOOL icon is second element with class  nav_bar_icon_cont
    data_tool_com =  try_get_elems( driver, '.nav_bar_icon_cont')[1]
    
    # grap the control buttons => all elements in the first div elemnt in the data tool header
    constrol_buttons = try_get_elems(driver , '#data_tool_header>div:first-of-type>*')
    
    # grap the settings buttons => all elements in the last div elemnt in the data tool header
    settings_button = try_get_elems(driver , '#data_tool_header>div:nth-of-type(2)>button')[-1]
    
    # grap the canvases
    canvases = try_get_elems(driver , '#series_field_set_content>div>div')
    
    # open data tool
    js_click(driver,data_tool_com)
    time.sleep(0.25)
    
    # start recording
    js_click(driver,constrol_buttons[0])
    
    # click on settingins 
    #js_click(driver,settings_button)
    
    
    #siulate packet streem over time
    for i in range(10):
        lt_ht113_vspi.write_msg(0,i,i)
        lt_ht113_vspi.write_msg(1,10-i,i)
        lt_ht113_vspi.write_msg(2,i/2,i)
        lt_ht113_vspi.write_msg(3,i**5/10000,i)
        time.sleep(1)
        
    #testing the screenshots
    graphs = ['lt_ht113_t_sam','lt_ht113_t_amp','lt_ht113_t_ref','lt_ht113_w_flw']
    for i,element in enumerate(canvases):
        # to take screen shoot of the element after making sure it is in view
        driver.execute_script("arguments[0].scrollIntoView();", element)
        # to make copies of the image first then return the comment
        #element.screenshot(f'./e2e/data/{graphs[i]}.png')
        #time.sleep(0.1)
        if test_screenshot(element,f'./e2e/data/{graphs[i]}.png'):
            return 1
        
    # return to the initial state
    # click reset button 
    js_click(driver,constrol_buttons[2])
    
    # hide the data tool
    js_click(driver,data_tool_com)
    
    return 0


def simulate_reduce_time(driver: webdriver.Chrome) -> int:
    # this function checks if the graph displayed is correct 

    func_id = MODULE_ID + '.us_view_graph'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    
     # grap the settings buttons => all elements in the last div elemnt in the data tool header
    settings_button = try_get_elems(driver , '#data_tool_header>div:nth-of-type(2)>button')[-1]
    js_click(driver,settings_button)













 
    
     
    