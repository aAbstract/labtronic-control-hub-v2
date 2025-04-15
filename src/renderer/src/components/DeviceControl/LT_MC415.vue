<script setup lang="ts">

import { ref, inject, onMounted, Ref } from 'vue';
import Slider from 'primevue/slider';
import InputSwitch from 'primevue/inputswitch';
import { useToast } from 'primevue/usetoast';

import { electron_renderer_send } from '@renderer/lib/util'
import { subscribe } from '@common/mediator';
import { LTBusDeviceMsg, LTBusDeviceErrorMsg } from '@common/models';
import DeviceErrorAlert from '@renderer/components/DeviceErrorAlert.vue';

const device_model = inject('device_model');
const toast_service = useToast();

const pump1_control = ref(false);
const pump1_mode = ref(false);
const valve1_control = ref(false);

const pump1_speed = ref(0);
const pump1_speed_slider = ref(0);
const valve1_capacity = ref(0);
const valve1_capacity_slider = ref(0);

const kp = ref(0);
const ki = ref(0);
const kd = ref(0);
const lvl_setpoint = ref(0);
const min_duty = ref(0);
const max_duty = ref(0);

const kp_feedback = ref('00.00');
const ki_feedback = ref('00.00');
const kd_feedback = ref('00.00');
const min_duty_feedback = ref('00.00');
const max_duty_feedback = ref('00.00');
const lvl_setpoint_feedback = ref('00.00');
const feedback_params_map: Record<number, Ref<string>> = {
    3: lvl_setpoint_feedback,
    4: kp_feedback,
    5: ki_feedback,
    6: kd_feedback,
    7: min_duty_feedback,
    8: max_duty_feedback,
};

const slider_pt: any = {
    root: { style: 'background-color: var(--empty-gauge-color);' },
    handle: { style: 'background-color: var(--accent-color);' },
    range: { style: 'background-color: var(--accent-color);' },
};

function threshold_value(x: any, upper_limit: number): number {
    if (isNaN(x) || x < 0)
        return 0;
    return Math.min(upper_limit, x);
}

function send_pump_speed() {
    const _pump1_speed = threshold_value(pump1_speed.value, 100);
    pump1_speed.value = _pump1_speed;
    pump1_speed_slider.value = _pump1_speed;
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR 0xD026 F32 ${_pump1_speed}` }); // OFFSET_CALC_LT-MC415
}

function send_valve_capacity() {
    const _valve1_capacity = threshold_value(valve1_capacity.value, 100);
    valve1_capacity.value = _valve1_capacity;
    valve1_capacity_slider.value = _valve1_capacity;
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR 0xD022 F32 ${_valve1_capacity}` }); // OFFSET_CALC_LT-MC415
}

enum PIDGain {
    KP = 0,
    KI = 1,
    KD = 2,
};
const gains_reg_addr_map: Record<PIDGain, string> = {
    [PIDGain.KP]: '0xD00E',
    [PIDGain.KI]: '0xD012',
    [PIDGain.KD]: '0xD016',
};
function validate_pid_gain(g: any): number {
    if (isNaN(g))
        return 0;
    return g;
}
function send_pid_gain(pid_gain: PIDGain, gain_value: number) {
    let _gain_value = validate_pid_gain(gain_value);
    const reg_addr = gains_reg_addr_map[pid_gain];
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR ${reg_addr} F32 ${_gain_value}` }); // OFFSET_CALC_LT-MC415
}

enum AutomaticControlOption {
    LVL_SETPOINT = 0,
    MIN_DUTY = 1,
    MAX_DUTY = 2,
};
const autoc_opts_addr_map: Record<AutomaticControlOption, string> = {
    [AutomaticControlOption.LVL_SETPOINT]: '0xD00A',
    [AutomaticControlOption.MIN_DUTY]: '0xD01A',
    [AutomaticControlOption.MAX_DUTY]: '0xD01E',
};
function validate_autoc_opt(o: any): number {
    if (isNaN(o) || o < 0)
        return 0;
    return Math.min(100, o);
}
function send_autoc_opt(autoc_opt: AutomaticControlOption, opt_value: number) {
    let _opt_value = validate_autoc_opt(opt_value);
    const reg_addr = autoc_opts_addr_map[autoc_opt];
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR ${reg_addr} F32 ${_opt_value}` }); // OFFSET_CALC_LT-MC415
}

const PUMP1_CONTROL_CTRL_REG_BIT_OFFSET = 13;
const PUMP1_MODE_CTRL_REG_BIT_OFFSET = 14;
const VALVE1_CONTROL_CTRL_REG_BIT_OFFSET = 15;
function send_ctrl_reg() {
    const ctrl_reg_bits = new Array(16).fill('0');
    if (pump1_control.value)
        ctrl_reg_bits[PUMP1_CONTROL_CTRL_REG_BIT_OFFSET] = '1';
    if (pump1_mode.value)
        ctrl_reg_bits[PUMP1_MODE_CTRL_REG_BIT_OFFSET] = '1';
    if (valve1_control.value)
        ctrl_reg_bits[VALVE1_CONTROL_CTRL_REG_BIT_OFFSET] = '1';

    const ctrl_reg_value = parseInt(ctrl_reg_bits.join(''), 2);
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR 0xD02A U16 ${ctrl_reg_value}` }); // OFFSET_CALC_LT-MC415
}

onMounted(() => {
    subscribe('device_msg', data => {
        const device_msg: LTBusDeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        const { msg_value } = device_msg;

        if (msg_type === 11) {
            const ctrl_bits = msg_value.toString(2).padStart(16, '0');
            pump1_control.value = ctrl_bits[PUMP1_CONTROL_CTRL_REG_BIT_OFFSET] === '1';
            pump1_mode.value = ctrl_bits[PUMP1_MODE_CTRL_REG_BIT_OFFSET] === '1';
            valve1_control.value = ctrl_bits[VALVE1_CONTROL_CTRL_REG_BIT_OFFSET] === '1';
        }

        if (msg_type in feedback_params_map)
            feedback_params_map[msg_type].value = msg_value.toFixed(2);
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_error_msg`, (_, data) => {
        const device_error_msg = data.device_error_msg as LTBusDeviceErrorMsg;
        if (!device_error_msg.user_ack)
            toast_service.add({ severity: 'warn', summary: 'Safety Warning', detail: device_error_msg.error_text, life: 5000 });
    });
});

</script>

<template>
    <div id="lt_mc415_control_main_cont">
        <DeviceErrorAlert />
        <h4 style="margin: 0px; margin-bottom: 8px; text-align: left; color: var(--font-color); width: 100%;">Level Control LT-MC415</h4>

        <div style="width: 100%;" class="lt_mc415_control_row">
            <span style="width: 120px;" class="lt_mc415_control_label">Pump1 Speed (%)</span>
            <Slider style="flex-grow: 1; margin-right: 8px;" :pt="slider_pt" :max="100" v-model="pump1_speed_slider" @slideend="pump1_speed = pump1_speed_slider" />
            <!-- @vue-ignore -->
            <input style="width: 50px;" class="dt_tf" type="text" v-model="pump1_speed" @focus="pump1_speed = ''" @keyup.enter="send_pump_speed()">
        </div>
        <div style="width: 100%;" class="lt_mc415_control_row">
            <span style="width: 120px;" class="lt_mc415_control_label">Valve1 Capacity (%)</span>
            <Slider style="flex-grow: 1; margin-right: 8px;" :pt="slider_pt" :max="100" v-model="valve1_capacity_slider" @slideend="valve1_capacity = valve1_capacity_slider" />
            <!-- @vue-ignore -->
            <input style="width: 50px;" class="dt_tf" type="text" v-model="valve1_capacity" @focus="valve1_capacity = ''" @keyup.enter="send_valve_capacity()">
        </div>

        <div style="height: 16px;"></div>

        <div style="display: flex; width: 100%; justify-content: center;">
            <div class="lt_mc415_control_row">
                <span style="margin-right: 24px;" class="lt_mc415_control_label">Enable Pump</span>
                <InputSwitch v-model="pump1_control" @change="send_ctrl_reg()" />
            </div>
            <div style="width: 25%;"></div>
            <div class="lt_mc415_control_row">
                <span style="margin-right: 24px;" class="lt_mc415_control_label">Enable Valve</span>
                <InputSwitch v-model="valve1_control" @change="send_ctrl_reg()" />
            </div>
        </div>

        <div style="height: 16px;"></div>

        <div id="automatic_control_opts">
            <div class="lt_mc415_control_row">
                <span style="margin-right: 24px;" class="lt_mc415_control_label">Automatic Control Mode</span>
                <InputSwitch v-model="pump1_mode" @change="send_ctrl_reg()" />
            </div>
            <div style="display: flex; width: 100%; justify-content: space-between;">
                <div>
                    <div class="lt_mc415_control_row">
                        <span class="autoc_opt_label">Set Point</span>
                        <span class="feedback_param_label">{{ lvl_setpoint_feedback }}</span>
                        <!-- @vue-ignore -->
                        <input style="width: 50px;" class="dt_tf" type="text" v-model="lvl_setpoint" @focus="lvl_setpoint = ''" @keyup.enter="send_autoc_opt(AutomaticControlOption.LVL_SETPOINT, lvl_setpoint)">
                    </div>
                    <div class="lt_mc415_control_row">
                        <span class="autoc_opt_label">Min Duty</span>
                        <span class="feedback_param_label">{{ min_duty_feedback }}</span>
                        <!-- @vue-ignore -->
                        <input style="width: 50px;" class="dt_tf" type="text" v-model="min_duty" @focus="min_duty = ''" @keyup.enter="send_autoc_opt(AutomaticControlOption.MIN_DUTY, min_duty)">
                    </div>
                    <div class="lt_mc415_control_row">
                        <span class="autoc_opt_label">Max Duty</span>
                        <span class="feedback_param_label">{{ max_duty_feedback }}</span>
                        <!-- @vue-ignore -->
                        <input style="width: 50px;" class="dt_tf" type="text" v-model="max_duty" @focus="max_duty = ''" @keyup.enter="send_autoc_opt(AutomaticControlOption.MAX_DUTY, max_duty)">
                    </div>
                </div>
                <div style="min-height: 100%; width: 4px; border-radius: 8px; background-color: var(--empty-gauge-color); margin-bottom: 6px;"></div>
                <div>
                    <div class="lt_mc415_control_row">
                        <span class="pid_gain_label">KP</span>
                        <span class="feedback_param_label">{{ kp_feedback }}</span>
                        <!-- @vue-ignore -->
                        <input style="width: 50px;" class="dt_tf" type="text" v-model="kp" @focus="kp = ''" @keyup.enter="send_pid_gain(PIDGain.KP, kp)">
                    </div>
                    <div class="lt_mc415_control_row">
                        <span class="pid_gain_label">KI</span>
                        <span class="feedback_param_label">{{ ki_feedback }}</span>
                        <!-- @vue-ignore -->
                        <input style="width: 50px;" class="dt_tf" type="text" v-model="ki" @focus="ki = ''" @keyup.enter="send_pid_gain(PIDGain.KI, ki)">
                    </div>
                    <div class="lt_mc415_control_row">
                        <span class="pid_gain_label">KD</span>
                        <span class="feedback_param_label">{{ kd_feedback }}</span>
                        <!-- @vue-ignore -->
                        <input style="width: 50px;" class="dt_tf" type="text" v-model="kd" @focus="kd = ''" @keyup.enter="send_pid_gain(PIDGain.KD, kd)">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
#automatic_control_opts {
    width: 100%;
    height: fit-content;
    border: 2px solid var(--empty-gauge-color);
    border-radius: 4px;
    padding: 4px 8px;
}

.feedback_param_label {
    font-weight: bold;
    color: var(--font-color);
    font-size: 14px;
    width: 50px;
}

.autoc_opt_label {
    color: var(--font-color);
    font-weight: bold;
    width: 80px;
}

.pid_gain_label {
    color: var(--font-color);
    font-weight: bold;
    width: 40px;
}

.dt_tf {
    font-family: "Lucida Console", "Courier New", monospace;
    width: 60px;
    color: var(--font-color);
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 12px;
    font-weight: bold;
    padding: 4px;
}

.dt_tf:focus {
    outline: none;
    border: 1px solid var(--accent-color);
}

.lt_mc415_control_label {
    display: inline-block;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
    margin-right: 16px;
}

.lt_mc415_control_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-block: 4px;
}

#lt_mc415_control_main_cont {
    position: relative;
    width: 96%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--light-bg-color);
    border: 1px solid var(--empty-gauge-color);
    border-radius: 4px;
    padding: 8px 16px;
}
</style>