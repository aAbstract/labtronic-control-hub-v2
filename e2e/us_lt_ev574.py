from selenium import webdriver
from e2e.e2e_utils import *
from e2e._vspi.test_vspis import lt_ev574_vspi


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
    func_id = MODULE_ID + '.us_check_chx_device_state'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    B_V_state = CheckChxDeviceState('B_V', 0, 12, 0)
    B_C_state = CheckChxDeviceState('B_C', 1, 13, 0)
    B_P_state = CheckChxDeviceState('B_P', 2, 4, 0)
    W_S_state = CheckChxDeviceState('W_S', 3, 5, 0)
    M_P_state = CheckChxDeviceState('M_P', 4, 6, 0)

    return check_chx_device_state(driver, lt_ev574_vspi, func_id, [B_V_state, B_C_state, B_P_state, W_S_state, M_P_state])


def calculate_buttons_state(states: list[bool]) -> int:
    value = 0
    for i, element in enumerate(states):
        if element == 'true':
            value += 2**i
    return value


def us_check_all_possible_states(driver: webdriver.Chrome) -> int:
    func_id = MODULE_ID + '.us_check_all_possible_states'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    #   grap the elements
    #   grap all check boxes
    checkboxes = try_get_elems(driver, '#lt_ev574_state>div')
    #   grap the send button
    send_button = try_get_elems(driver, '#lt_ev574_actions_container>*')[-1]
    #   loop over all possible cases
    for i in range(2**6):
        value = i
        buttons_states = []
        for e in checkboxes:
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
