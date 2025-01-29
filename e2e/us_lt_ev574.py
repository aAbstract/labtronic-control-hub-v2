from selenium import webdriver
from e2e.e2e_utils import *
from e2e._vspi.test_vspis import lt_ev574_vspi
import random
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains


MODULE_ID = 'e2e.us_lt_ev574'


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
    User can see device primitive parameters in CHX_DEVICE_STATE: B_V, B_C, B_P, W_S, M_P
    User can see computed parameter CHX_DEVICE_STATE: M_T
    User can view real time data flow
    '''
    func_id = MODULE_ID + '.us_check_chx_device_state'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    for i in range(5):
        random_value1 = random.randint(1, 10)
        random_value2 = random.randint(1, 10)
        B_V_state = CheckChxDeviceState('B_V', 0, random_value1, 0)
        B_C_state = CheckChxDeviceState('B_C', 1, random_value1, 0)
        B_P_state = CheckChxDeviceState('B_P', 2, random_value1, 0)
        W_S_state = CheckChxDeviceState('W_S', 3, random_value1, 0)
        M_P_state = CheckChxDeviceState('M_P', 4, random_value2, 0)
        M_T_state = CheckChxDeviceState('M_T', -1, round(random_value2 / random_value1, 1), 0)
        if check_chx_device_state(driver, lt_ev574_vspi, func_id, [B_V_state, B_C_state, B_P_state, W_S_state, M_P_state, M_T_state]) == 1:
            return 1
    return 0


def calculate_buttons_state(states: list[bool]) -> int:
    value = 0
    for i, element in enumerate(states):
        if element == 'true':
            value += 2**i
    return value


def us_check_all_possible_states(driver: webdriver.Chrome) -> int:
    '''
    User can view 6 fault buttons in LT-EV574_CONTROL_PANEL
    '''
    func_id = MODULE_ID + '.us_check_all_possible_states'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    #   grap the elements
    #   grap all check boxes
    checkboxes = try_get_elems(driver, '#lt_ev574_faults_state_container>div')
    #   grap the send button
    send_button = try_get_elems(driver, '#lt_ev574_faults_actions_container>*')[-1]
    #   loop over all possible cases
    for i in range(2**6):
        value = i
        buttons_states = []
        for checkbox in checkboxes:
            e = checkbox.find_element(By.CSS_SELECTOR, 'div')
            #   transform to binary and check if rhe checkbox is checked or not
            remider = value % 2
            value = int(value / 2)
            state = e.get_attribute('data-p-highlight')
            if (remider and not state == 'true') or (not remider and state == 'true'):
                e.click()
            buttons_states.append(e.get_attribute('data-p-highlight'))
        #   send states
        send_button.click()
        #   read the value
        last_log = try_get_elems(driver, '.log_msg')[-1]
        number = int(last_log.get_attribute('textContent').split(':')[-1])
        #   calculate the right value
        right_value = calculate_buttons_state(buttons_states)
        #   check if the value is the right value or not
        if number != right_value:
            return 1
    return 0


def us_quad_diagram(driver: webdriver.Chrome) -> int:
    '''
    Test CHX_CONTROL_PANEL > QUAD_DIAGRAM
    '''
    func_id = MODULE_ID + '.us_quad_diagram'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    selected_quad_color = '--accent-color'
    unselected_quad_color = '--empty-gauge-color'

    test_values = [[1, 1],       # q1
                   [1, -1],      # q2
                   [-1, 1],      # q3
                   [-1, -1]]     # q4
    order_in_panel = [1, 0, 2, 3]
    '''
             y    non    x
            W_S   M_P   M_T
        q1   +     +     +
        q2   +     -     -
        q3   -     +     -
        q4   -     -     +
    
    '''
    quad_diagram_button = driver.find_elements(By.CSS_SELECTOR, '.p-tabview-nav-content>ul>li')
    quad_diagram_button[1].click()
    for i, values in enumerate(test_values):
        lt_ev574_vspi.write_msg(0, values[0], i)
        lt_ev574_vspi.write_msg(1, values[0], i)
        lt_ev574_vspi.write_msg(2, values[0], i)
        lt_ev574_vspi.write_msg(3, values[0], i)
        lt_ev574_vspi.write_msg(4, values[1], i)

        quad_diagrams = driver.find_elements(By.CSS_SELECTOR, '.quad_diagram_img')
        right_quad_order = order_in_panel[i]
        for j, quad_diagram in enumerate(quad_diagrams):
            if right_quad_order == j:
                if not selected_quad_color in quad_diagram.get_attribute('style'):
                    return 1
            if right_quad_order != j:
                if not unselected_quad_color in quad_diagram.get_attribute('style'):
                    return 1
        time.sleep(0.25)

    return 0


def get_chart_settings_controls(driver: webdriver.Chrome) -> dict[str, WebElement] | bool:
    try:
        dialog = driver.find_element(By.CSS_SELECTOR, '.p-overlaypanel-content')
        checkbox = dialog.find_element(By.CSS_SELECTOR, '[data-pc-name="checkbox"]')
        inputs = dialog.find_elements(By.CSS_SELECTOR, '.dt_tf')
        buttons = dialog.find_elements(By.CSS_SELECTOR, "button")
        return {"start_val": inputs[0],
                "end_val": inputs[1],
                "auto_scale": checkbox,
                "record": buttons[0],
                "pause": buttons[1], }
    except:
        return False


def stream_data(values: list[int], seq_start: int):
    length = len(values)
    for seq_num in range(length):
        value = values[seq_num]
        lt_ev574_vspi.write_msg(0, value, seq_num + seq_start)
        lt_ev574_vspi.write_msg(1, value, seq_num + seq_start)
        lt_ev574_vspi.write_msg(2, value, seq_num + seq_start)
        lt_ev574_vspi.write_msg(3, value, seq_num + seq_start)
        lt_ev574_vspi.write_msg(4, value, seq_num + seq_start)
        time.sleep(0.1)


def auto_scale(driver: webdriver.Chrome, order: int):
    chart_setting = driver.find_elements(By.CSS_SELECTOR, '.chx_chart_gap>button')[order]
    chart_setting.click()
    time.sleep(0.1)
    controls = get_chart_settings_controls(driver)
    if controls['auto_scale'].get_attribute('data-p-highlight') == 'false':
        controls['auto_scale'].click()
    chart_setting.click()
    time.sleep(0.1)


def set_interval(driver: webdriver.Chrome, order: int, min: int, max: int):
    chart_setting = driver.find_elements(By.CSS_SELECTOR, '.chx_chart_gap>button')[order]
    chart_setting.click()
    controls = get_chart_settings_controls(driver)
    if controls['auto_scale'].get_attribute('data-p-highlight') == 'true':
        controls['auto_scale'].click()
        time.sleep(0.1)
    controls['start_val'].send_keys(Keys.CONTROL + "a")
    controls['start_val'].send_keys(Keys.DELETE)
    controls['start_val'].send_keys(min)

    controls['end_val'].send_keys(Keys.CONTROL + "a")
    controls['end_val'].send_keys(Keys.DELETE)
    controls['end_val'].send_keys(max)
    controls['end_val'].send_keys(Keys.ENTER)
    time.sleep(0.1)


def pause(driver: webdriver.Chrome, order: int):
    charts_settings = driver.find_elements(By.CSS_SELECTOR, '.chx_chart_gap>button')
    charts_settings[order].click()
    time.sleep(0.1)
    controls = get_chart_settings_controls(driver)
    controls['pause'].click()
    charts_settings[order].click()


def record(driver: webdriver.Chrome, order: int):
    charts_settings = driver.find_elements(By.CSS_SELECTOR, '.chx_chart_gap>button')
    charts_settings[order].click()
    controls = get_chart_settings_controls(driver)
    controls['record'].click()
    charts_settings[order].click()


def us_single_multi_charts_autoscale_recording(driver: webdriver.Chrome) -> int:
    '''
    Test CHX_SINGLE_CHART Auto Scale
    Test CHX_SINGLE_CHART Recording Modes
    Test CHX_MULTI_CHART Auto Scale
    Test CHX_MULTI_CHART Recording Modes
    '''
    '''
    record 5 points
    pause in first diagram for 5 points
    pause in second diagram for 5 points
    record 5 points
    auto scale -> take image
    scale first -> take image
    scale second -> take image
    
    '''
    func_id = MODULE_ID + '.us_single_multi_charts_autoscale_recording'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    stram1 = [1, 2, 3, 4, 5]
    stram2 = [0, 0, 0, 0, 0]
    stram3 = [5, 4, 3, 2, 1]
    stram4 = [0, 0, 0, 0, 0]

    stream_data(stram1, 0)

    pause(driver, 0)
    stream_data(stram2, 5)

    record(driver, 0)
    pause(driver, 1)
    stream_data(stram3, 10)

    record(driver, 1)
    stream_data(stram4, 15)

    device_charts = driver.find_elements(By.CSS_SELECTOR, '.device_state_chart')
    device_charts1 = device_charts[0]
    device_charts2 = device_charts[1]
    # auto scale both and take screen

    auto_scale(driver, 0)
    auto_scale(driver, 1)
    # device_charts1.screenshot("./e2e/data/lt_ev574/autoscale1.png")
    # device_charts2.screenshot("./e2e/data/lt_ev574/autoscale2.png")

    if test_screenshot(device_charts1, './e2e/data/lt_ev574/autoscale1.png'):
        return 1
    if test_screenshot(device_charts2, './e2e/data/lt_ev574/autoscale2.png'):
        return 1

    set_interval(driver, 0, -10, 10)
    set_interval(driver, 1, -20, 20)
    # device_charts1.screenshot("./e2e/data/lt_ev574/notautoscale1.png")
    # device_charts2.screenshot("./e2e/data/lt_ev574/notautoscale2.png")

    if test_screenshot(device_charts1, './e2e/data/lt_ev574/notautoscale1.png'):
        return 1
    if test_screenshot(device_charts2, './e2e/data/lt_ev574/notautoscale2.png'):
        return 1

    return 0


def stream_group(stream: list[list[float]]):
    for sn, group in enumerate(stream):
        for i, v in enumerate(group):
            if i < 5:
                lt_ev574_vspi.write_msg(i, v, sn)
        time.sleep(0.5)


def click_at_horizontal_percentage(driver: webdriver.Chrome, chart: WebElement, percentage: float):
    size = chart.size
    scaled_percentage = (percentage * 0.8 - 0.4)
    offset_x = int(size['width'] * scaled_percentage)  # calculated to exclude the paddings
    action = ActionChains(driver)
    action.move_to_element_with_offset(chart, offset_x, 0).click().perform()


def get_smart_chart_point_values(driver: webdriver.Chrome) -> list[(str, str)]:
    info_button = driver.find_elements(By.CSS_SELECTOR, '#chart_tool_panel>button')[-1]
    info_button.click()
    data_rows = driver.find_elements(By.CSS_SELECTOR, '#cci_cont>.cci_row')
    data = []
    for row in data_rows:
        name = row.find_element(By.CSS_SELECTOR, 'span:first-child').text
        value = row.find_element(By.CSS_SELECTOR, 'span:last-child').text
        data.append((name, value))
    info_button.click()
    return data


def set_chart_settings(driver: webdriver.Chrome, selected_charts: list[int]):
    if len(selected_charts) != 9:
        return
    info_button = driver.find_elements(By.CSS_SELECTOR, '#chart_tool_panel>button')[1]
    info_button.click()
    drop_downs = driver.find_elements(By.CSS_SELECTOR, '.p-overlaypanel-content .p-dropdown')
    for i, selected_chart in enumerate(selected_charts):
        drop_down = drop_downs[i]
        drop_down.click()
        time.sleep(0.1)
        item = driver.find_elements(By.CSS_SELECTOR, '.p-dropdown-items>li')[selected_chart]
        item.click()
        time.sleep(0.1)


def smart_chart_record_pause_reset(driver: webdriver.Chrome, order: int):
    overlay = driver.find_element(By.CSS_SELECTOR, '.p-overlaypanel-content')
    buttons = overlay.find_elements(By.CSS_SELECTOR, 'button')
    buttons[order].click()


def generate_random_stream(number_of_rows, var,sampling_time=0.5):
    stream = []
    for i in range(number_of_rows):
        row = []
        for _ in range(5):
            row.append(random.randint(1, 20))
        if var and var < 6:
            row[var - 1] = i + 1
        row.append(round(row[4] / row[3] + 1e-10, 2))
        row.append(i * sampling_time)

        stream.append(row)
    return stream


def sort(stream: list[list[int]], index: int):
    return sorted(stream, key=lambda x: x[index])


def check_data(data: list[(str, str)], stream: list[list[float]], var: int, order: int):
    var = (var - 1) if var > 0 else -1
    sorted = sort(stream, var)
    row = sorted[order].copy()
    row.insert(0, row[var])
    for i, element in enumerate(row):
        if float(element) != float(data[i][1]):
            return False
    return True


def us_smart_chart(driver: webdriver.Chrome) -> int:
    '''
    Test CHX_CHART_TOOL
    '''
    func_id = 'us_smart_chart'
    '''
    stream each row at a time
    [1, 3, 7, 5, 15]
    B_V -> 1
    B_C -> 3
    B_P -> 7
    W_S -> 5
    M_P -> 15
    '''
    # open smart charts tool
    number_of_time_stamps = 5

    chart_tools = driver.find_elements(By.CSS_SELECTOR, '#nav_bar_cont>*')[2]
    chart_tools.click()
    time.sleep(0.2)  # get chart in scene

    for i in range(7):  # seven posibilities for x axis
        # stream data
        stream = generate_random_stream(number_of_time_stamps, i)
        set_chart_settings(driver, [i, 2, 3, 4, 5, 6, 7, 1, 0])
        smart_chart_record_pause_reset(driver, 2)
        smart_chart_record_pause_reset(driver, 0)
        stream_group(stream)

        canvas = driver.find_element(By.CSS_SELECTOR, '#chart_tool_chart>canvas')
        # draw vertical line and print data
        for j in range(len(stream)):
            click_at_horizontal_percentage(driver, canvas, j / (len(stream) - 1))
            data = get_smart_chart_point_values(driver)
            if not check_data(data, stream, i, j):
                return 1
            time.sleep(0.1)
    return 0


def send_data_with_rate(current_time1: float, rate: float, values: list[int], sn: int):
    # stream data in s
    lt_ev574_vspi.write_msg(0, values[0], sn)
    lt_ev574_vspi.write_msg(1, values[1], sn)
    lt_ev574_vspi.write_msg(2, values[2], sn)
    lt_ev574_vspi.write_msg(3, values[3], sn)
    lt_ev574_vspi.write_msg(4, values[4], sn)
    current_time2 = time.time()
    while ((current_time2 - current_time1) / rate) <= 1:
        current_time2 = time.time()
    print(time.time())
    error = ((current_time2 - current_time1) / rate - 1) * 100



def validate_data(received:list[list[float]],expected:list[list[float]],error_time:float)->int:
    for received_row,expected_row in zip(received,expected):
        for i in range(len(received_row)):
            if i != 0 and received_row[i]!=expected_row[i]:
                return 1
            if i == 0:
                error = (received_row[i]-expected_row[i])
                print(received_row[i],expected_row[i])
                if abs(error)>error_time:
                    return 1
    return 0
                



def us_sampling_validation(driver: webdriver.Chrome) -> int:
    '''
    Test CHX_DATA_TOOL > sampling_dt validation
    '''
    dt = 0.5  # in seconds
    number_of_time_stamps = 20
    
    chart_tools = driver.find_elements(By.CSS_SELECTOR, '#nav_bar_cont>*')[1]
    chart_tools.click()
    time.sleep(0.2)  # get chart in scene
    
    stream = generate_random_stream(number_of_time_stamps, 0)
    buttons = driver.find_elements(By.CSS_SELECTOR,'#data_tool_header>div>button')
    buttons[0].click()
    
    i = 0
    for row in stream:
        current_time1 = time.time()
        send_data_with_rate(current_time1, dt, row, i)
        i = i + 1
    
    buttons[1].click()
    perview = driver.find_element(By.CSS_SELECTOR,'#rec_widget>div:last-child>button')
    perview.click()
    rows = driver.find_elements(By.CSS_SELECTOR,'.data_point_row')
    data = []
    for i,row in enumerate(rows):
        if i ==0 :
            continue
        data_row = []
        spans = row.find_elements(By.CSS_SELECTOR,'span')
        for j,_span in enumerate(spans):
            if j ==0:
                data_row.append(float(_span.text)/1000) 
            else:    
                data_row.append(float(_span.text))
        data.append(data_row)
    reordered_stream = [[arr[-1]] + arr[:-1]  for arr in stream]
    
    if  (validate_data(data,reordered_stream,1)):
        return 1
    
    driver.find_element(By.CSS_SELECTOR,'.p-dialog-header-icons>button').click()
    return 0


def us_consumd_recovered_energy(driver:webdriver.Chrome)->int:
    '''
    Test Energy consumed
    '''
    chart_tools = driver.find_elements(By.CSS_SELECTOR, '#nav_bar_cont>*')[1]
    chart_tools.click()
    time.sleep(0.2)  # get chart in scene
    
    buttons = driver.find_elements(By.CSS_SELECTOR,'#data_tool_header>div>button')
    buttons[0].click()
    
    read_consumed = driver.find_element(By.CSS_SELECTOR,'#energy_stats>div:first-child>span:last-child')
    read_recovered = driver.find_element(By.CSS_SELECTOR,'#energy_stats>div:last-child>span:last-child')
    voltages = [random.randint(-200,100) for i in range(20)]
    currents = [random.randint(-100,100) for i in range(20)]
    consumed = 0
    recovered = 0
    
    for v,c in zip(voltages,currents):
        lt_ev574_vspi.write_msg(0,v)
        lt_ev574_vspi.write_msg(1,c)
        lt_ev574_vspi.write_msg(2,c)
        lt_ev574_vspi.write_msg(3,c)
        lt_ev574_vspi.write_msg(4,c)
        energy =c*v*0.00028+1e-6
        if c>0:
            consumed+=energy
        else:
            recovered+=energy
        time.sleep(0.05)
        if round(consumed,2) != float(read_consumed.text) or round(recovered,2) != float(read_recovered.text) :
           return 1
        time.sleep(1)
    return 0
    
    







def us_stream_data(driver: webdriver.Chrome)->int:
    for seq_num in range(1000):
        value = seq_num
        lt_ev574_vspi.write_msg(0, value, seq_num)
        lt_ev574_vspi.write_msg(1, value, seq_num)
        lt_ev574_vspi.write_msg(2, value, seq_num)
        lt_ev574_vspi.write_msg(3, value, seq_num)
        lt_ev574_vspi.write_msg(4, value, seq_num)
        time.sleep(1)
    return 0
