import socket
import base64
import colorama
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
import time
import json
from e2e._vspi.vspi import VSPI
from dataclasses import dataclass
@dataclass
class CheckChxDeviceState:
    key:str
    key_msg_type:int
    value:float
    seq_num:int
    


WDIWV = 0.1  # web driver implicit wait time in seconds


def elog(func_id: str, msg: str):
    err_tag = f"{colorama.Fore.RED}[ERROR]{colorama.Style.RESET_ALL}"
    print(f"{err_tag} {func_id} | {msg}")


def ilog(func_id: str, msg: str):
    info_tag = f"{colorama.Fore.GREEN}[INFO]{colorama.Style.RESET_ALL}"
    print(f"{info_tag} {func_id} | {msg}")


def is_port_open(host: str, port: int) -> bool:
    try:
        _socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        _socket.settimeout(2)
        _socket.connect((host, port))
        return True
    except:
        return False
    finally:
        _socket.close()


def js_click(driver: webdriver.Chrome, btn):
    driver.execute_script('arguments[0].click();', btn)


def get_elem_txt(elem: WebElement, css_selector: str) -> str | None:
    try:
        txt_elem = elem.find_element(By.CSS_SELECTOR, css_selector)
        return txt_elem.text
    except:
        return None


def try_get_elem_txt(driver: webdriver.Chrome, css_selector: str) -> str | None:
    TIME_OUT = 100
    for _ in range(TIME_OUT):
        try:
            elem = driver.find_element(By.CSS_SELECTOR, css_selector)
            if elem.text != '':
                return elem.text
        except:
            pass

    return None


def try_get_elem_txts(driver: webdriver.Chrome, css_selector: str) -> list[str] | None:
    TIME_OUT = 100
    elems_txt = []

    def _try_get_elem_txt(elem: WebElement) -> str | None:
        for _ in range(TIME_OUT):
            try:
                if elem.text != '':
                    return elem.text
            except:
                pass

        return None

    for _ in range(TIME_OUT):
        try:
            elems = driver.find_elements(By.CSS_SELECTOR, css_selector)
            elems_txt = [_try_get_elem_txt(elem) for elem in elems]
            if None not in elems_txt:
                return elems_txt
        except:
            pass

    return None


def try_get_elem(driver: webdriver.Chrome, css_selector: str) -> WebElement | None:
    TIME_OUT = 100
    for _ in range(TIME_OUT):
        try:
            elem = driver.find_element(By.CSS_SELECTOR, css_selector)
            return elem
        except:
            pass

    return None


def try_get_elems(driver: webdriver.Chrome, css_selector: str) -> list[WebElement] | None:
    TIME_OUT = 100
    for _ in range(TIME_OUT):
        try:
            elem = driver.find_elements(By.CSS_SELECTOR, css_selector)
            return elem
        except:
            pass

    return None


def is_device_connected(driver: webdriver.Chrome) -> bool:
    device_conn_state = try_get_elem_txt(driver, '#dev_conn_state_cont')
    if not device_conn_state:
        return False
    if device_conn_state != 'DEVICE: CONNECTED':
        return False
    return True


def connect_to_emulation_port(driver: webdriver.Chrome) -> int:
    func_id = 'e2e.e2e_utils.connect_to_emulation_port'
    side_bar_btns = try_get_elems(driver, '.nav_bar_icon_cont')
    if not side_bar_btns:
        elog(func_id, 'Sidebar Buttons not Found')
        return 1
    device_terminal_btn = side_bar_btns[0]
    js_click(driver, device_terminal_btn)

    device_connector_widgets = try_get_elems(driver, '#device_connector_cont *')
    if not device_connector_widgets:
        elog(func_id, 'Device Connector Widgets not Found')
        return 1
    serial_ports_dropdown = device_connector_widgets[0]
    js_click(driver, serial_ports_dropdown)
    device_serial_port = try_get_elem(driver, 'li[aria-label="Emulation - /dev/ttyS90"]')
    js_click(driver, device_serial_port)

    device_connect_btn = try_get_elem(driver, 'button[aria-label="CONNECT"]')
    if not device_connect_btn:
        elog(func_id, 'Device Connect Button not Found')
        return 1
    js_click(driver, device_connect_btn)
    js_click(driver, device_terminal_btn)

    device_conn_state = try_get_elem_txt(driver, '#dev_conn_state_cont')
    if not device_conn_state:
        elog(func_id, 'Device Connection State Tag not Found')
        return 1
    if device_conn_state != 'DEVICE: CONNECTED':
        elog(func_id, 'Connection to Emulation Port Faild')
        return 1

    return 0


def disconnect_device(driver: webdriver.Chrome) -> int:
    func_id = 'e2e.e2e_utils.disconnect_device'
    side_bar_btns = try_get_elems(driver, '.nav_bar_icon_cont')
    if not side_bar_btns:
        elog(func_id, 'Sidebar Buttons not Found')
        return 1
    device_terminal_btn = side_bar_btns[0]
    js_click(driver, device_terminal_btn)
    device_connect_btn = try_get_elem(driver, 'button[aria-label="DISCONNECT"]')
    if not device_connect_btn:
        elog(func_id, 'Device Disconnect Button not Found')
        return 1
    js_click(driver, device_connect_btn)
    js_click(driver, device_terminal_btn)
    return 0


def get_chx_device_state(driver: webdriver.Chrome) -> dict | None:
    func_id = 'e2e.e2e_utils.get_chx_device_state'
    device_readings = try_get_elems(driver, '.reading_cont')
    if not device_readings:
        elog(func_id, 'CHX Device State not Found')
        return None
    return {x.text.split(': ')[0]: float(x.text.split(': ')[1]) for x in device_readings}


def test_screenshot(element: WebElement, image_path: str) -> int:
    # this function takes element from web and compare it to image saved on the file
    comp_as_base64 = element.screenshot_as_base64
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        if encoded_string != comp_as_base64:
            return 1
    return 0




def check_chx_device_state(driver: webdriver.Chrome,device_vspi:VSPI,func_id:str, states_check_arr:list[CheckChxDeviceState]) -> int:
    '''
    this function checks the state of any device by:
        1- checking if states taken are subset of the device state
        2- take each state and inject a value
        3- read the value and check if it is consistent with value sent
    '''
    chx_device_state = get_chx_device_state(driver)
    if not chx_device_state:
        return 1
    chx_device_state_keys = set(chx_device_state.keys())
    
    target_chx_device_state_keys = set()
    for state in states_check_arr:
        target_chx_device_state_keys.add(state.key)
        
    if  not target_chx_device_state_keys.issubset(chx_device_state_keys):
        elog(func_id, f"chx_device_state_keys={chx_device_state_keys}, target_chx_device_state_keys={target_chx_device_state_keys}")
        return 1
    
    for state in  states_check_arr:
        if state.key_msg_type >=0:
            device_vspi.write_msg(state.key_msg_type,state.value,state.seq_num)
    
    #   some times the values delay until being updated so ,sleep 5 seconds

    chx_device_state = get_chx_device_state(driver)
    
    for state in states_check_arr:
        if chx_device_state[state.key] != state.value:
            print(state.key,chx_device_state[state.key] , state.value)
            return 1

    return 0




def regression(x:list[float],y:list[float]) -> int:
    '''
    this function takes two arrays x and y and and performs linear regression to get the slope and intersect
    '''
    if not(len(x) == len(y)):
        raise 'Arrays must be of equal length'
    # Calculate means of x and y
    n = len(x)
    x_mean = sum(x) / n
    y_mean = sum(y) / n

    # Calculate the slope (gradient)
    numerator = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
    denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
    slope = numerator / denominator

    # Calculate the intercept
    intercept = y_mean - slope * x_mean
    return slope,intercept



# def edit_json_file(filename:str, new_values:dict)->int:
#     with open(filename, 'r') as f:
#         data = json.load(f)

#     # Navigate to the desired key and update its value
#     for key , value in new_values.items():
#         data['device_config'][key] = value

#     with open(filename, 'w') as f:
#         json.dump(data, f, indent=4)

