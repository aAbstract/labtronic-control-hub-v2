from selenium import webdriver
from e2e.e2e_utils import *
from e2e._vspi.test_vspis import lt_ht103_vspi
import json
import time
import random
import math
MODULE_ID = 'e2e.us_lt_ht103'


#   the parameters equations
    #   Q_L = C_f * (t_h - t_amb) :calibration mode ||  Q_L_F1 + Q_L_F2 *th :experimental mode
    #   Q_Cond = P_H - ( C_f * (t_h - t_amb) )
    #   Lambda = e^-7 *pi * l * Q_Cond
    #   Delta_T = t1 - t2
    
    
def _us_connect_to_device(driver: webdriver.Chrome) -> int:
    rc = connect_to_emulation_port(driver)
    if rc != 0:
        return rc
    rc = disconnect_device(driver)
    if rc != 0:
        return rc
    return 0


def round_to_nearest_tenth(number):
    return round(number * 10) / 10


def us_check_chx_device_state(driver: webdriver.Chrome) -> int:
    '''
    tasks: 12 - 13 - 14 - 15 - 25 - 26
    User can see device:
    primitive parameters in CHX_DEVICE_STATE: T_amb, T_c, T_h
    control parameters in CHX_DEVICE_STATE: P_Heater, P_peltier
    computed parameters in CHX_DEVICE_STATE: Q_L, Q_Cond, Lambda
    with real time data flow
    '''
    func_id = MODULE_ID + '.us_check_chx_device_state'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    #   intialize the parameters
    C_f = 0
    Q_L_F1 = 0
    Q_L_F2 = 0
    #   load parameters as in
    with open("chx_settings.json", "r") as file:
        json_data = json.load(file)
        C_f = json_data["device_config"]["C_f"]
        Q_L_F1 = json_data["device_config"]["Q_L_F1"]
        Q_L_F2 = json_data["device_config"]["Q_L_F2"]

    #   grap components
    #   the dropdown button arrow of the mode dropdown is the last child of the dropdown which has the id pv_id_10
    mode_drop_down = try_get_elem(driver, "#pv_id_10 > :last-child")

    #   because we have two modes of operation, we will test each one alone
    #   first: calibration mode

    #   select calibration mode
    js_click(driver, mode_drop_down)
    calibration_option = try_get_elem(driver, "#pv_id_10_0")
    js_click(driver, calibration_option)

    #   inject packets and test them
    #   this loop should run for 100 time not once
    for i in range(10):
        #   set random values for the parameters
        t1_val = random.randint(1, 10)
        t2_val = random.randint(1, 10)
        t_amb_val = random.randint(1, 10)
        t_c_val = random.randint(1, 10)
        p_heater_val = random.randint(1, 10)
        p_peltier_val = random.randint(1, 10)
        t_h_val = random.randint(1, 10)

        #   these are derived parameters
        q_l_val = round_to_nearest_tenth(C_f * (t_h_val - t_amb_val))
        q_cond_val = round_to_nearest_tenth(p_heater_val - q_l_val)
        delta_t_val = round_to_nearest_tenth(t1_val - t2_val)

        #   assign the values and check them
        t1 = CheckChxDeviceState('T1', 0, t1_val, i)
        t2 = CheckChxDeviceState('T2', 1, t2_val, i)
        t_amb = CheckChxDeviceState('T_amb', 2, t_amb_val, i)
        t_c = CheckChxDeviceState('T_c', 3, t_c_val, i)
        t_h = CheckChxDeviceState('T_h', 4, t_h_val, i)
        p_heater = CheckChxDeviceState('P_HEATER', 5, p_heater_val, i)
        p_peltier = CheckChxDeviceState('P_PELTIER', 6, p_peltier_val, i)

        #   -1 for key_message_type indicates that it can't be written it is only read
        read_q_l = CheckChxDeviceState('Q_L', -1, q_l_val, i)
        read_q_cond = CheckChxDeviceState('Q_Cond', -1, q_cond_val, i)
        read_delta_t = CheckChxDeviceState('Delta_T', -1, delta_t_val, i)

        #   check if parmeters have the correct values
        if check_chx_device_state(driver, lt_ht103_vspi, func_id, [
            p_heater, p_peltier,
            t_h, t1, t2, t_amb, t_c,
            read_q_l, read_q_cond, read_delta_t
        ]):
            return 1
        
    #   second: experimental mode

    #   select experimental mode

    #   length options
    options_values = [20, 40, 50, 40]
    # this loop should run for 100 time not once
    for i in range(1):
        #   loop over the length
        for option_order in range(len(options_values)):
            js_click(driver, mode_drop_down)
            time.sleep(0.1)
            experiment_option = try_get_elem(driver, "#pv_id_10_1")
            js_click(driver, experiment_option)
            time.sleep(0.1)

            #   the dropdown button arrow of the sample shape is the first child of the third of type of the lt_ht103_control_row class
            sample_shape_drop_down = try_get_elem(driver, ".lt_ht103_control_row:nth-of-type(3) >:first-child >:first-child >:last-child")

            js_click(driver, sample_shape_drop_down)
            sample_shape_options = try_get_elems(driver, ".p-dropdown-items-wrapper>ul>*")

            js_click(driver, sample_shape_options[3 - option_order])

            l_value = options_values[3 - option_order]
            t1_val = random.randint(1, 10)
            t2_val = random.randint(1, 10)
            t_amb_val = random.randint(1, 10)
            t_c_val = random.randint(1, 10)
            p_heater_val = random.randint(1, 10)
            p_peltier_val = random.randint(1, 10)
            t_h_val = random.randint(1, 10)
            q_l_val = round_to_nearest_tenth(Q_L_F1 + Q_L_F2 * t_h_val)
            q_cond_val = round_to_nearest_tenth(p_heater_val - q_l_val)
            delta_t_val = round_to_nearest_tenth(t1_val - t2_val)
            Lambda_value = round_to_nearest_tenth(10**-7 * math.pi * l_value * q_cond_val)

            t1 = CheckChxDeviceState('T1', 0, t1_val, i)
            t2 = CheckChxDeviceState('T2', 1, t2_val, i)
            t_amb = CheckChxDeviceState('T_amb', 2, t_amb_val, i)
            t_c = CheckChxDeviceState('T_c', 3, t_c_val, i)
            t_h = CheckChxDeviceState('T_h', 4, t_h_val, i)
            p_heater = CheckChxDeviceState('P_HEATER', 5, p_heater_val, i)
            p_peltier = CheckChxDeviceState('P_PELTIER', 6, p_peltier_val, i)
            read_q_l = CheckChxDeviceState('Q_L', -1, q_l_val, i)
            read_q_cond = CheckChxDeviceState('Q_Cond', -1, q_cond_val, i)
            read_delta_t = CheckChxDeviceState('Delta_T', -1, delta_t_val, i)
            read_lambda = CheckChxDeviceState('Lambda', -1, Lambda_value, i)

            if check_chx_device_state(driver, lt_ht103_vspi, func_id, [
                p_heater, p_peltier,
                t_h, t1, t2, t_amb, t_c,
                read_q_l, read_q_cond, read_delta_t, read_lambda
            ]):
                return 1

    return 0


def us_disabled_sample_shape(driver: webdriver.Chrome) -> int:
    '''
    taskd: 17 - 25
    User can not select sample shapes when device is in calibration mode
    '''
    func_id = MODULE_ID + '.us_check_chx_device_state'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    #   grap components
    #   the dropdown button arrow of the mode dropdown is the last child of the dropdown which has the id pv_id_10
    mode_drop_down = try_get_elem(driver, "#pv_id_10 > :last-child")

    #   select calibration mode
    js_click(driver, mode_drop_down)
    calibration_option = try_get_elem(driver, "#pv_id_10_0")
    js_click(driver, calibration_option)

    #   the dropdown button arrow of the sample shape is the first child of the third of type of the lt_ht103_control_row class
    sample_shape_drop_down = try_get_elem(driver, ".lt_ht103_control_row:nth-of-type(3) >:first-child >:first-child >:last-child")

    #   check if the dropdown contains class disabled
    if "p-disabled" not in sample_shape_drop_down.get_attribute("class"):
        return 1

    js_click(driver, mode_drop_down)
    expremental_option = try_get_elem(driver, "#pv_id_10_1")
    js_click(driver, expremental_option)

    #   the dropdown button arrow of the sample shape is the first child of the third of type of the lt_ht103_control_row class
    sample_shape_drop_down = try_get_elem(driver, ".lt_ht103_control_row:nth-of-type(3) >:first-child >:first-child >:last-child")

    #   check if the dropdown contains class enabled
    if "p-disabled" in sample_shape_drop_down.get_attribute("class"):
        return 1

    return 0


def us_aloaded_CF_QLF1_QLF2(driver: webdriver.Chrome) -> int:
    '''
    taks: 16 - 24
    User can see loaded C_f value in calibration mode in LT-HT103_CONTROL_PANEL > C_f
    User can see loaded Q_L_F1, Q_L_F2 value in experiment mode in (LT-HT103_CONTROL_PANEL > Q_L_F1, Q_L_F2)
    '''
    func_id = MODULE_ID + '.us_check_chx_device_state'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    #   intialize the parameters
    C_F = 0
    Q_L_F1 = 0
    Q_L_F2 = 0
    #   load parameters as in
    with open("chx_settings.json", "r") as file:
        json_data = json.load(file)
        C_F = json_data["device_config"]["C_f"]
        Q_L_F1 = json_data["device_config"]["Q_L_F1"]
        Q_L_F2 = json_data["device_config"]["Q_L_F2"]
        

    C_F_value = try_get_elem(driver, ".lt_ht103_control_row:nth-of-type(1)>:nth-of-type(2)>:last-child").get_attribute("value")
    Q_L_F1_value = try_get_elem(driver, ".lt_ht103_control_row:nth-of-type(1)>:nth-of-type(3)>:last-child").get_attribute("value")
    Q_L_F2_value = try_get_elem(driver, ".lt_ht103_control_row:nth-of-type(1)>:nth-of-type(4)>:last-child").get_attribute("value")
    if not (str(C_F) == C_F_value and str(Q_L_F1) == Q_L_F1_value and str(Q_L_F2) == Q_L_F2_value):
        return 1
    return 0


def us_calibration_routine(driver: webdriver.Chrome) -> int:
    '''
    task: 22 - 23
    User can run calibration routine:
        User send data
        Q_L_F1 and Q_L_F_2 are calculated and checked
    User can save device calibration parameters
    '''
    func_id = MODULE_ID + '.us_check_chx_device_state'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1
    
    
    #   set the device in calibration mode
    #   the dropdown button arrow of the mode dropdown is the last child of the dropdown which has the id pv_id_10
    mode_drop_down = try_get_elem(driver, "#pv_id_10 > :last-child")

    #   select calibration mode
    js_click(driver, mode_drop_down)
    calibration_option = try_get_elem(driver, "#pv_id_10_0")
    js_click(driver,calibration_option)
    
    
    #   set parameters
    C_F =float(try_get_elem(driver, ".lt_ht103_control_row:nth-of-type(1)>:nth-of-type(2)>:last-child").get_attribute("value"))
    number_of_points = 3
    
    #   if the values of the slope and intercept are less than 1000, the values may be caculated wrong due to rounding
    slope = -20000
    intercept = -10000
    #   due to rounding, when calculating the values of the slope and intercept, the values have some error so, we check if the error is acceptable ( < 1%)
    acceptable_error_margin = 0.01
    
    # DATA TOOL icon is second element with class  nav_bar_icon_cont
    data_tool_com =  try_get_elems( driver, '.nav_bar_icon_cont')[1]
    
    # grap the control buttons => all elements in the first div elemnt in the data tool header
    control_buttons = try_get_elems(driver , '#data_tool_header>div:first-of-type>*')
    
    js_click(driver,data_tool_com)
    time.sleep(0.1)
    js_click(driver,control_buttons[0])
    
    t1_arr =[]
    t2_arr =[]
    tamb_arr =[]
    tc_arr =[]
    th_arr =[]
    pheater_arr =[]
    ppeltier_arr =[]
    ql_arr = []
    qcond_arr = []
    deltat_arr = []
    
    for i in range(number_of_points):
        th = i
        ql = i*slope + intercept
        tamp =int(100*(th - ql/C_F))/100
        
        t1_val = random.randint(1, 10)
        t1_arr.append(t1_val)
        
        t2_val = random.randint(1, 10)
        t2_arr.append(t2_val)
        
        t_amb_val = tamp
        tamb_arr.append(t_amb_val)
        
        t_c_val = random.randint(1, 10)
        tc_arr.append(t_c_val)
        
        p_heater_val = random.randint(1, 10)
        pheater_arr.append(p_heater_val)
        
        p_peltier_val = random.randint(1, 10)
        ppeltier_arr.append(p_peltier_val)
        
        t_h_val = th
        th_arr.append(th)
        
        ql_arr.append(C_F * (th - tamp))
        
        qcond_arr.append(p_heater_val - C_F * (th - tamp))

        deltat_arr.append(t1_val-t2_val)
        
        
        lt_ht103_vspi.write_msg(5,p_heater_val)
        lt_ht103_vspi.write_msg(6,p_peltier_val)
        lt_ht103_vspi.write_msg(0,t1_val)
        lt_ht103_vspi.write_msg(1,t2_val)
        lt_ht103_vspi.write_msg(2,t_amb_val)
        lt_ht103_vspi.write_msg(3,t_c_val)
        lt_ht103_vspi.write_msg(4,t_h_val)
    
        time.sleep(5)
        
    perbiew_button = try_get_elem(driver,'#rec_widget>:last-child>:first-child')
    js_click(driver,perbiew_button)
    time.sleep(0.01)
    data_row = try_get_elems(driver,'.data_point_row')

    for i in range(len(data_row)-1):
        data = data_row[i+1].text.split()
        if not(float(data[1])==t1_arr[i] 
               and float(data[2])==t2_arr[i] 
               and float(data[3])==tamb_arr[i] 
               and float(data[4])==tc_arr[i] 
               and float(data[5])==th_arr[i] 
               and float(data[6])== pheater_arr[i] 
               and float(data[7])==ppeltier_arr[i] 
               and float(data[8])==ql_arr[i] 
               and float(data[9])==qcond_arr[i] 
               and float(data[11])==t1_arr[i]-t2_arr[i]):
            print(data[1]==t1_arr[i] , data[2]==t2_arr[i] , data[3]==tamb_arr[i] , data[4]==tc_arr[i] , data[5]==th_arr[i] , data[6]== pheater_arr[i] , data[7]==ppeltier_arr[i] , data[8]==ql_arr[i] , data[9]==qcond_arr[i] , data[11]==t1_arr[i]-t2_arr[i])
            print(data[1],[1],t1_arr[i] , data[2],t2_arr[i],  data[3],tamb_arr[i] , data[4],tc_arr[i] , data[5],th_arr[i] ,data[6], pheater_arr[i] , data[7],ppeltier_arr[i] , data[8],ql_arr[i] , data[9],qcond_arr[i] , data[11],t1_arr[i]-t2_arr[i])
            return 1
    
    script_button = try_get_elem(driver,'#rec_widget>:last-child>:last-child')
    js_click(driver,script_button)
    script = try_get_elem(driver,'#ds_op_items_cont >:first-child')
    js_click(driver,script)
    
    #   check the points in the datapreview
    
    js_click(driver,control_buttons[2])
    js_click(driver,data_tool_com)
    
    Q_L_F1_value = float(try_get_elem(driver, ".lt_ht103_control_row:nth-of-type(1)>:nth-of-type(3)>:last-child").get_attribute("value"))
    Q_L_F2_value = float(try_get_elem(driver, ".lt_ht103_control_row:nth-of-type(1)>:nth-of-type(4)>:last-child").get_attribute("value"))
    if abs((slope- -Q_L_F2_value)/slope) + abs((intercept- -Q_L_F1_value)/intercept) > acceptable_error_margin:
        return 1
    
    close_dialog_button = try_get_elem(driver,'.p-dialog-header-close')
    js_click(driver,close_dialog_button)
    
    #  Check if user can save device calibration parameters
    
    #   save new parameters
    #   grap the save button => third child of last div with class lt_ht103_control_row
    save_button = try_get_elem(driver,'.lt_ht103_control_row:last-of-type>:nth-child(3)')
    js_click(driver,save_button)
    
    #   load parameters from json file
    #   intialize the parameters

    Q_L_F1 = 0
    Q_L_F2 = 0
    #   load parameters as in
    with open("chx_settings.json", "r") as file:
        json_data = json.load(file)
        Q_L_F1 = json_data["device_config"]["Q_L_F1"]
        Q_L_F2 = json_data["device_config"]["Q_L_F2"]

    
    #   check if they equal the saved parameters
    if not(Q_L_F1_value == Q_L_F1 and Q_L_F2==Q_L_F2_value):
        return 1
    
    return 0


    
    

def us_tare_th(driver: webdriver.Chrome) -> int:
    func_id = MODULE_ID + '.us_tare_th'
    _is_device_connected = is_device_connected(driver)
    if not _is_device_connected:
        elog(func_id, 'Device is not Connected')
        return 1

    for j in range(10):
        i=j+5
        lt_ht103_vspi.write_msg(0,i)
        lt_ht103_vspi.write_msg(1,i)
        lt_ht103_vspi.write_msg(2,i)
        lt_ht103_vspi.write_msg(3,i)
        lt_ht103_vspi.write_msg(4,i)
        
        lt_ht103_vspi.write_msg(5,i)
        lt_ht103_vspi.write_msg(6,i)

        time.sleep(1)
        

    return 0
