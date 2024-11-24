from selenium import webdriver
from e2e.e2e_utils import *
from e2e._vspi.test_vspis import lt_ht107_vspi
import random
import re



'''
Critical: when importing a file in the data tool, the first row only is read and the others are not. When importing a file multiple times, the first row repeats, data not cleared.

'''
MODULE_ID = 'e2e.us_lt_ht113'


def _us_connect_to_device(driver: webdriver.Chrome) -> int:
    rc = connect_to_emulation_port(driver)
    if rc != 0:
        return rc

    rc = disconnect_device(driver)
    if rc != 0:
        return rc

    return 0


#   the device is set into 5 modes, 3 linear modes, 1 radial and 1 disconnect
#   we will define tests accordinfly for linear1 mode and radial


def us_check_chx_device_state(driver: webdriver.Chrome) -> int:
    '''
    user can see the right primitives according to the device mode (Linear1)
    user can see real time data flow
    the heat at each position is displayed in the control panel graph
    the epoch count is displayed in the control panel
    '''
    func_id = MODULE_ID + '.us_check_chx_device_state'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    lt_ht107_vspi.write_msg(13,0)
    #   get canvas to check
    canvas = driver.find_element(By.CSS_SELECTOR, '#pos_chart>canvas')

    for i in range(5):

        t1_state = CheckChxDeviceState('T1', 0, i * 10 + 25, i)
        t2_state = CheckChxDeviceState('T2', 1, i * 10 + 30, i)
        t3_state = CheckChxDeviceState('T3', 2, i * 10 + 35, i)
        t4_state = CheckChxDeviceState('T4', 3, i * 10 + 40, i)
        t5_state = CheckChxDeviceState('T5', 4, i * 10 + 45, i)
        t6_state = CheckChxDeviceState('T6', 5, i * 10 + 50, i)
        t7_state = CheckChxDeviceState('T7', 6, i * 10 + 40, i)
        t8_state = CheckChxDeviceState('T8', 7, i * 10 + 30, i)
        t9_state = CheckChxDeviceState('T9', 8, i * 10 + 35, i)

        if check_chx_device_state(driver, lt_ht107_vspi, 'us_check_chx_device_state', [t1_state, t2_state, t3_state, t4_state, t5_state, t6_state, t7_state, t8_state, t9_state]):
            return 1
        time.sleep(1)
        # canvas.screenshot(f'./e2e/data/lt_ht107/img{i}.png') #used if images need to be updated
        if test_screenshot(canvas, f'./e2e/data/lt_ht107/img{i}.png'):
            return 1

    return 0


def us_change_smaple_shape(driver: webdriver.Chrome) -> int:
    #   user can change the mode and see material change accordingly
    func_id = MODULE_ID + '.us_change_smaple_shape'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    material_span = driver.find_element(By.CSS_SELECTOR, '.lc_span:first-of-type')
    modes_drop_down = driver.find_element(By.CSS_SELECTOR, '#pv_id_9')
    drop_down_icon = modes_drop_down.find_element(By.CSS_SELECTOR, ':last-child')

    materials = ['Disconnected Sample', 'Brass: D=25mm, L=30mm', 'Stainless Steel: D=25mm, L=30mm', 'Brass: D=15mm, L=30mm', 'Brass: D=110mm, Thick=8mm']

    for i, mat in enumerate(materials):
        drop_down_icon.click()
        driver.find_elements(By.CSS_SELECTOR, '#pv_id_9_list>*')[i].click()

        if not (material_span.text == mat):
            return 1

    return 0


def us_view_Pheater(driver: webdriver.Chrome) -> int:
    #    user can view P_HEATER value
    func_id = MODULE_ID + '.us_view_Pheater'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    material_span = driver.find_element(By.CSS_SELECTOR, '.lc_span:last-child')

    for i in range(10):
        p_value = int(random.random() * 200 - 100) / 10
        lt_ht107_vspi.write_msg(13, p_value)
        number = re.findall(r'-?\d+\.\d+|-?\d+', material_span.text)[0]
        if str(number) != str(p_value):
            return 1
    return 0


def us_view_data_points(driver: webdriver.Chrome) -> int:
    '''
    user can see data sent with timestamp using data tool
    '''
    func_id = MODULE_ID + '.us_view_data_points'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    # DATA TOOL icon is second element with class  nav_bar_icon_cont
    data_tool_com = try_get_elems(driver, '.nav_bar_icon_cont')[1]

    # grap the control buttons => all elements in the first div elemnt in the data tool header
    control_buttons = try_get_elems(driver, '#data_tool_header>div:first-of-type>*')

    js_click(driver, data_tool_com)
    time.sleep(0.1)
    js_click(driver, control_buttons[0])

    data_arr =[]

    for i in range(5):
        arr =[]
        for j in range(9):
            val = random.randint(1, 100)
            lt_ht107_vspi.write_msg(j,val)
            arr.append(val)
        data_arr.append(arr)

        time.sleep(1)

    perbiew_button = try_get_elem(driver, '#rec_widget>:last-child>:first-child')
    js_click(driver, perbiew_button)
    time.sleep(0.01)
    data_row = try_get_elems(driver, '.data_point_row')

    for i in range(len(data_row) - 1):
        data = data_row[i + 1].text.split()
        for j in range(9):
            if not float(data[j+1]) == data_arr[i][j]:
                return 1
        
    time.sleep(1)
    close_dialog_button = try_get_elem(driver,'.p-dialog-header-close')
    js_click(driver,close_dialog_button)
    js_click(driver, data_tool_com)

    return 0
