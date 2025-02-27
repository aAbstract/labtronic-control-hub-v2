<script lang="ts" setup>

import ToggleButton from 'primevue/togglebutton';
import Slider from 'primevue/slider';
import { ref, reactive, inject, onMounted, computed, watch, shallowRef } from 'vue';
import { useToast } from 'primevue/usetoast';

import { electron_renderer_send } from '@renderer/lib/util';
import { LTBusDeviceMsg } from '@common/models';

const device_model = inject('device_model');
const toast_service = useToast();

const fan_speed = ref(0)
const heat_power = ref(0)


const fan_speed_slide = ref(0)
const heat_power_slide = ref(0)

const heater_tmp = ref(2)
const thermo_tmp = ref(1)

const level_reg = ref(0);
const level_bits = computed(() => [...level_reg.value.toString(2).padStart(3, '0')].toReversed().join(''));
const ctrl_reg = ref(0);
const crtl_bits = computed(() => [...ctrl_reg.value.toString(2).padStart(10, '0')].toReversed().join(''));

watch([crtl_bits], () => {
    for (let i = 0; i < crtl_bits.value.length; i++)
        control_buttons[i].value = crtl_bits.value[i] === '1' ? true : false;
});

defineProps(['full_screen'])

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

function submit_fan_speed_val() {
    let _fan_speed = threshold_value(fan_speed.value, 100);
    fan_speed.value = _fan_speed;
    fan_speed_slide.value = _fan_speed;
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR 0xD07A F32 ${_fan_speed}` }); // OFFSET_CALC_LT-RE850
}

function submit_heat_power_val() {
    let _heat_power = threshold_value(heat_power.value, 100);
    heat_power.value = _heat_power;
    heat_power_slide.value = _heat_power;
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR 0xD07E F32 ${_heat_power}` }); // OFFSET_CALC_LT-RE850
}

function submit_heater_tmp_setpoint() {
    const heater_tmp_sp = threshold_value(heater_tmp.value, 100);
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR 0xD082 F32 ${heater_tmp_sp}` }); // OFFSET_CALC_LT-RE850
}

function submit_thermostat_setpoint() {
    if (control_buttons[4].value === true) {
        toast_service.add({ severity: 'warn', summary: 'Safety Warning', detail: 'Can not Set Thermostat Set Point when Compressor is ON' });
        return;
    }

    const thermostat_sp = threshold_value(thermo_tmp.value, 100);
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR 0xD086 F32 ${thermostat_sp}` }); // OFFSET_CALC_LT-RE850
}

function submit_ctrl_reg() {
    let ctrl_reg_bits = control_buttons.map(x => x.value ? '1' : '0').toReversed().join('');
    ctrl_reg_bits.padStart(16, '0');
    const ctrl_reg = parseInt(ctrl_reg_bits, 2);
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR 0xD08A U16 ${ctrl_reg}` }); // OFFSET_CALC_LT-RE850
}

function submit_fault_reg(fault_idx: number) {
    const _fault_buttons_state = new Array(10).fill(false);
    _fault_buttons_state[fault_idx] = true;
    fault_buttons_state.value = _fault_buttons_state;

    // encode faults register bits
    let fault_reg_bits = _fault_buttons_state.map(x => x ? '1' : '0').toReversed().join('');
    const fault_reg = parseInt(fault_reg_bits, 2);
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `WR 0xD08C U16 ${fault_reg}` }); // OFFSET_CALC_LT-RE850
}

const control_buttons = reactive([
    {
        name: 'FAN',
        value: false,
    },
    {
        name: 'PUMP1',
        value: false,
    },
    {
        name: 'PUMP2',
        value: false,
    },
    {
        name: 'CompMode',
        value: false,
    },
    {
        name: 'Comp',
        value: false,
    },
    {
        name: 'RevValve',
        value: false,
    },
    {
        name: 'Heater',
        value: false,
    },
    {
        name: 'TapCirc',
        value: false,
    },
    {
        name: 'TankFill',
        value: false,
    },
    {
        name: 'TankDrain',
        value: false,
    }
]);

const fault_buttons_labels = new Array(10).fill(0).map((_m, idx) => `F${idx + 1}`);
const fault_buttons_state = shallowRef(new Array(10).fill(false));

onMounted(() => {
    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: LTBusDeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        const { msg_value } = device_msg;

        if (msg_type === 30)
            level_reg.value = msg_value;

        if (msg_type == 35)
            ctrl_reg.value = msg_value;
    });
});

</script>



<template>
    <div class="controls_container" :class="{ full_screen: full_screen }">

        <div class="lt_re850_control_row">
            <span class="lt_re850_control_lbl">Water Level (#)</span>
            <div id="water_level_bar">
                <div style="width: 25%; height: 16px; border-radius: 4px;" :class="`${level_bits[0] === '1' ? 'water_level_bar_seg_on' : 'water_level_bar_seg_off'}`"></div>
                <div style="width: 25%; height: 16px; border-radius: 4px;" :class="`${level_bits[1] === '1' ? 'water_level_bar_seg_on' : 'water_level_bar_seg_off'}`"></div>
                <div style="width: 25%; height: 16px; border-radius: 4px;" :class="`${level_bits[2] === '1' ? 'water_level_bar_seg_on' : 'water_level_bar_seg_off'}`"></div>
            </div>
        </div>

        <div class="lt_re850_control_row" title="Heater Power (W)">
            <span class="lt_re850_control_lbl">Fan Speed (%)</span>
            <Slider style="flex-grow: 1; margin-right: 8px;" :pt="slider_pt" :max="100" v-model="fan_speed_slide" @slideend="fan_speed = fan_speed_slide" />
            <input style="width: 50px;" class="lt_re850_inp" type="text" v-model="fan_speed" @keyup.enter="submit_fan_speed_val">
        </div>

        <div class="lt_re850_control_row" title="Heater Power (W)">
            <span class="lt_re850_control_lbl">Heat Power (%)</span>
            <Slider style="flex-grow: 1; margin-right: 8px;" :pt="slider_pt" :max="100" v-model="heat_power_slide" @slideend="heat_power = heat_power_slide" />
            <input style="width: 50px;" class="lt_re850_inp" type="text" v-model="heat_power" @keyup.enter="submit_heat_power_val">
        </div>
        <div class=" lt_re850_temps">
            <div class="lt_re850_temps">
                <span class="lt_re850_control_lbl">Heater TMP (C)</span>
                <input style="width: 50px;" class="lt_re850_inp" type="text" v-model="heater_tmp" @keyup.enter="submit_heater_tmp_setpoint()">
            </div>
            <div>
                <span class="lt_re850_control_lbl">Thermostat (C)</span>
                <input style="width: 50px;" class="lt_re850_inp" type="text" v-model="thermo_tmp" @keyup.enter="submit_thermostat_setpoint()">
            </div>
        </div>

        <div class="lt_re850_buttons">
            <div class="control_buttons">
                <div class="button_text" v-for="button in control_buttons">
                    <span>{{ button.name }}</span>
                    <ToggleButton class="button" v-model="button.value" offLabel="OFF" onLabel="ON" :pt="{ box: { style: 'font-size: 12px; border-radius: 4px;' } }" @change="submit_ctrl_reg()" />
                </div>
            </div>
            <div style="min-height: 100%; width: 4px;border-radius: 8px; background-color: var(--empty-gauge-color);"></div>
            <div class="fault_buttons">
                <div class="button_text" v-for="(fault_name, idx) in fault_buttons_labels">
                    <span>{{ fault_name }}</span>
                    <ToggleButton class="button" v-model:modelValue="fault_buttons_state[idx]" offLabel="OFF" onLabel="ON" :pt="{ box: { style: 'font-size: 12px; border-radius: 4px;' } }" @change="submit_fault_reg(idx)" />
                </div>
            </div>
        </div>

        <div style="height: 16px;"></div>
    </div>
</template>




<style scoped>
.water_level_bar_seg_off {
    border: 2px solid var(--font-color);
    background-color: transparent;
}

.water_level_bar_seg_on {
    background-color: var(--accent-color);
}

#water_level_bar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
}

.button {
    padding: 0;
    height: 20px;
    width: 80px;
}

.button_text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    color: var(--font-color);
    font-size: 14px;
    font-weight: bold;
}

.fault_buttons,
.control_buttons {
    display: flex;
    gap: 4px;
    flex-direction: column;
}

.lt_re850_buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 24px;
}

.lt_re850_temps {
    display: flex;
    justify-content: space-around;
}

.lt_re850_control_lbl {
    display: inline-block;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
    margin-right: 16px;
    width: 100px;
}

.lt_re850_inp {
    font-family: "Lucida Console", "Courier New", monospace;
    color: var(--font-color);
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 12px;
    font-weight: bold;
    padding: 4px;
    width: 30px;
}

.lt_re850_inp:focus {
    outline: none;
    border: 1px solid var(--accent-color);
}

.lt_re850_control_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-block: 4px;
    width: 100%;
    gap: 8px;
}

.controls_container {
    padding: 8px 32px;
    height: 34vh;
    overflow-y: auto;
}

.full_screen {
    height: 80vh;
    width: 80%;
    margin-inline: auto;
    margin-top: 48px;
}
</style>