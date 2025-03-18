<script setup lang="ts">

import { ref, inject, onMounted } from 'vue';
import Slider from 'primevue/slider';
import InputSwitch from 'primevue/inputswitch';

import { electron_renderer_send } from '@renderer/lib/util'
import { subscribe } from '@common/mediator';
import { LTBusDeviceMsg } from '@common/models';

const device_model = inject('device_model');

const pump1_control = ref(false);
const pump1_speed = ref(0);
const pump1_speed_slider = ref(0);

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
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR 0xD006 F32 ${_pump1_speed}` }); // OFFSET_CALC_LT-MC417
}

function send_ctrl_reg() {
    const ctrl_reg_bits = (pump1_control.value ? '1' : '0').padStart(16, '0');
    const ctrl_reg_value = parseInt(ctrl_reg_bits, 2);
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR 0xD00A U16 ${ctrl_reg_value}` }); // OFFSET_CALC_LT-MC417
}

onMounted(() => {
    subscribe('device_msg', data => {
        const device_msg: LTBusDeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        const { msg_value } = device_msg;

        if (msg_type === 3 && msg_value === 1)
            pump1_control.value = true;
        else if (msg_type === 3 && msg_value === 0)
            pump1_control.value = false;
    });
});

</script>

<template>
    <div id="lt_mc417_control_main_cont">
        <h4 style="margin: 0px; margin-bottom: 8px; text-align: left; color: var(--font-color); width: 100%;">Pressure Control LT-MC417</h4>

        <div class="lt_mc417_control_row">
            <span class="lt_mc417_control_label">Pump1 Speed (%)</span>
            <Slider style="flex-grow: 1; margin-right: 8px;" :pt="slider_pt" :max="100" v-model="pump1_speed_slider" @slideend="pump1_speed = pump1_speed_slider" />
            <input style="width: 50px;" class="dt_tf" type="text" v-model="pump1_speed" @keyup.enter="send_pump_speed()">
        </div>

        <div style="height: 16px;"></div>
        <div class="lt_mc417_control_row">
            <span style="margin-right: 4px;" class="lt_mc417_control_label">Pump 1</span>
            <InputSwitch v-model="pump1_control" @change="send_ctrl_reg()" />
        </div>
    </div>
</template>

<style lang="css" scoped>
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

.lt_mc417_control_label {
    display: inline-block;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
    margin-right: 16px;
    width: 120px;
}

.lt_mc417_control_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-block: 4px;
    width: 100%;
}

#lt_mc417_control_main_cont {
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