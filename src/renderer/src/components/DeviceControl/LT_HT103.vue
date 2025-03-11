<script setup lang="ts">

import { onMounted, ref, inject, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import Slider from 'primevue/slider';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import ProgressSpinner from 'primevue/progressspinner';

import { DropdownOption, LT_HT103_DeviceConfig, LT_HT103_DeviceOperationMode, DeviceMsg } from '@common/models';
import { electron_renderer_invoke, electron_renderer_send } from '@renderer/lib/util';
import { subscribe, post_event } from '@common/mediator';

enum DeviceKillState {
    WAITING = 0,
    SUCCESS = 1,
    FAILD = 2,
};

const device_model = inject('device_model');
const toast_service = useToast();
const kill_dialog_visible = ref(false);
const kill_heater_state = ref<DeviceKillState>(DeviceKillState.FAILD);
const kill_peltier_state = ref<DeviceKillState>(DeviceKillState.FAILD);
let kill_listen = false;
let kill_loop_iid: NodeJS.Timeout | null = null;
const dropdown_pt: any = {
    root: { style: 'background-color: transparent; border: 1px solid var(--font-color); width: 140px; height: 30px;' },
    input: { style: 'padding: 0px 8px; color: var(--font-color); font-family: Cairo, sans-serif; font-size: 14px; font-weight: bold;' },
    panel: { style: 'background-color: var(--light-bg-color); font-family: Cairo, sans-serif;' },
    emptyMessage: { style: 'color: var(--font-color);' },
    item: { style: 'background-color: var(--light-bg-color); color: var(--font-color);' },
    trigger: { style: 'width: fit-content; padding-right: 8px;' },
    list: { style: 'padding: 0px;' },
};
const slider_pt: any = {
    root: { style: 'background-color: var(--empty-gauge-color);' },
    handle: { style: 'background-color: var(--accent-color);' },
    range: { style: 'background-color: var(--accent-color);' },
};

// @ts-ignore
function arr_combs(arr: string[]): string[] {
    const combs: string[] = [];
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            combs.push(`TOP:${arr[i]}, BOT: ${arr[j]}`);
        }
    }
    return combs;
}

// device_config
const MAX_P_HEATER = 38;
const MAX_P_PELTIER = 40;
const C_f = ref<string | number>('X.XX');
const Q_L_F1 = ref<string | number>('X.XX');
const Q_L_F2 = ref<string | number>('X.XX');
// device_config

// dropdowns
const device_op_mode = ref<LT_HT103_DeviceOperationMode>(LT_HT103_DeviceOperationMode.CALIBRATION);
const device_op_mode_opts: DropdownOption<LT_HT103_DeviceOperationMode>[] = [
    { label: 'CALIBRATION', value: LT_HT103_DeviceOperationMode.CALIBRATION },
    { label: 'EXPERIMENT', value: LT_HT103_DeviceOperationMode.EXPERIMENT },
];

const sample_shape = ref();
const sample_shape_opts: DropdownOption<number>[] = [
    { label: 'Short - 20mm', value: 0 },
    { label: 'Long - 40mm', value: 1 },
    { label: 'Combination - 50mm', value: 2 },
    { label: 'Groove - 40mm', value: 3 },
];

const sample_material_arr = ['Aluminum', 'Brass', 'Stainless Steel', 'Steel', 'Copper'];
const sample_material = ref();
const sample_material_opts_map: Record<number, DropdownOption<number>[]> = {
    0: sample_material_arr.map((x, idx) => { return { label: x, value: idx } }),
    1: sample_material_arr.map((x, idx) => { return { label: x, value: idx } }),
    // 2: arr_combs(['Aluminum', 'Brass', 'Stainless Steel', 'Steel', 'Copper']).map((x, idx) => { return { label: x, value: idx } }),
    3: ['Aluminum'].map((x, idx) => { return { label: x, value: idx } }),
};
const top_sample_material = ref();
const bot_sample_material = ref();
// dropdowns

// control params
const ph_indc_val = ref<number>(0);
const pp_indc_val = ref<number>(0);
const ph_slider_val = ref<number>(0);
const pp_slider_val = ref<number>(0);
const act_ph_val = ref('0');
const act_pp_val = ref('0');
// control params

watch([sample_shape, sample_material], () => {
    if (sample_shape.value === null)
        return;

    // Combination - 50mm
    if (sample_shape.value === 2) {
        post_event('change_device_model_asset', { _asset: 'lt_ht103_combination' });
        electron_renderer_send(`${device_model}_load_vce_sample_length`, { sample_length: 50 });
        return;
    }

    // Groove - 40mm
    if (sample_shape.value === 3) {
        post_event('change_device_model_asset', { _asset: 'lt_ht103_grooved_aluminum' });
        electron_renderer_send(`${device_model}_load_vce_sample_length`, { sample_length: 40 });
        return;
    }

    // Short - 20mm
    if (sample_shape.value === 0)
        electron_renderer_send(`${device_model}_load_vce_sample_length`, { sample_length: 20 });
    // Long - 40mm
    else if (sample_shape.value === 1)
        electron_renderer_send(`${device_model}_load_vce_sample_length`, { sample_length: 40 });

    let _sample_shape = 'short';
    if (sample_shape.value === 1)
        _sample_shape = 'long';

    let _sample_material = 0;
    if (sample_material.value)
        _sample_material = sample_material.value;

    const _asset = `lt_ht103_${_sample_shape}_${sample_material_arr[_sample_material].toLowerCase().replace(' ', '_')}`;
    post_event('change_device_model_asset', { _asset });
});

function switch_device_mode() {
    const _device_op_mode = device_op_mode.value;
    electron_renderer_send(`${device_model}_switch_device_op_mode`, { _device_op_mode });
    if (_device_op_mode === LT_HT103_DeviceOperationMode.CALIBRATION) {
        sample_shape.value = null;
        post_event('change_device_model_asset', { _asset: 'lt_ht103_calibration' });
    }
    else if (_device_op_mode === LT_HT103_DeviceOperationMode.EXPERIMENT) {
        sample_shape.value = 0;
        sample_material.value = 0;
    }
}

function send_device_config() {
    const ph_config = ph_slider_val.value ?? 0;
    const pp_config = pp_slider_val.value ?? 0;
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET P_HEATER ${ph_config}` });
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET P_PELTIER ${pp_config}` });
}

function threshold_value(x: any, upper_limit: number): number {
    if (isNaN(x) || x < 0)
        return 0;
    return Math.min(upper_limit, x);
}

function submit_ph_val() {
    let _ph_val = threshold_value(ph_indc_val.value, MAX_P_HEATER);
    ph_slider_val.value = _ph_val;
    ph_indc_val.value = _ph_val;
}

function submit_pp_val() {
    let _pp_val = threshold_value(pp_indc_val.value, MAX_P_PELTIER);
    pp_slider_val.value = _pp_val;
    pp_indc_val.value = _pp_val;
}

function shutdown_device_power() {
    kill_heater_state.value = DeviceKillState.WAITING;
    kill_peltier_state.value = DeviceKillState.WAITING;
    kill_dialog_visible.value = true;
    kill_listen = true;

    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: 'SET P_HEATER 0' });
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: 'SET P_PELTIER 0' });
    kill_loop_iid = setInterval(() => {
        electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: 'SET P_HEATER 0' });
        electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: 'SET P_PELTIER 0' });
        toast_service.add({ severity: 'warn', summary: 'Device Kill Switch', detail: 'Kill Signal Timeout, Retrying...', life: 3000 });
    }, 5000);
}

function save_chx_settings() {
    electron_renderer_send('save_chx_device_config', {});
}

onMounted(() => {
    electron_renderer_invoke<LT_HT103_DeviceConfig>('get_chx_device_config').then(chx_device_config => {
        if (!chx_device_config)
            return;
        C_f.value = chx_device_config.C_f;
        Q_L_F1.value = chx_device_config.Q_L_F1;
        Q_L_F2.value = chx_device_config.Q_L_F2;
    });

    post_event('update_device_model_cont_width', { width: '80%' });

    subscribe('device_msg', data => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        if (msg_type === 5)
            act_ph_val.value = device_msg.msg_value.toFixed(0);
        else if (msg_type === 6)
            act_pp_val.value = device_msg.msg_value.toFixed(0);

        if (kill_listen && msg_type === 5 && device_msg.msg_value === 0)
            kill_heater_state.value = DeviceKillState.SUCCESS;

        if (kill_listen && msg_type === 6 && device_msg.msg_value === 0)
            kill_peltier_state.value = DeviceKillState.SUCCESS;

        if (kill_heater_state.value === DeviceKillState.SUCCESS && kill_peltier_state.value === DeviceKillState.SUCCESS && kill_listen) {
            kill_listen = false;
            kill_dialog_visible.value = false;
            if (kill_loop_iid)
                clearInterval(kill_loop_iid);
            toast_service.add({ severity: 'success', summary: 'Device Kill Switch', detail: 'Device Power Shutdown', life: 3000 });
        }
    });

    // handle chx script injected parameters
    subscribe('chx_script_ip_lt_ht103_Q_L_F1', args => {
        const _Q_L_F1 = args.pv;
        Q_L_F1.value = _Q_L_F1;
        electron_renderer_send(`${device_model}_set_device_config`, { config_name: 'Q_L_F1', config_value: _Q_L_F1 });
        toast_service.add({ severity: 'success', summary: 'CHX Script', detail: 'Calculated Q_L Linear Model Intercept', life: 3000 });
    });
    subscribe('chx_script_ip_lt_ht103_Q_L_F2', args => {
        const _Q_L_F2 = args.pv;
        Q_L_F2.value = _Q_L_F2;
        electron_renderer_send(`${device_model}_set_device_config`, { config_name: 'Q_L_F2', config_value: _Q_L_F2 });
        toast_service.add({ severity: 'success', summary: 'CHX Script', detail: 'Calculated Q_L Linear Model Slope', life: 3000 });
    });

    post_event('update_device_model_cont_width', { width: '75%' });
});

</script>

<template>
    <div id="lt_ht103_control_main_cont">
        <Dialog style="font-family: Cairo, sans-serif;" modal v-model:visible="kill_dialog_visible" :style="{ width: '50%' }">
            <template #container>
                <div id="kill_dialog_content">
                    <div class="kill_dialog_msg">
                        <div style="display: flex; align-items: center">
                            <i class="pi pi-bolt"></i>
                            <span>{{ `${device_model} Heater` }}</span>
                        </div>
                        <ProgressSpinner v-if="kill_heater_state === DeviceKillState.WAITING" class="kill_dialog_spinner" />
                        <Button v-if="kill_heater_state === DeviceKillState.SUCCESS" icon="pi pi-check" rounded outlined severity="success" style="width: 36px; height: 36px;" />
                        <Button v-if="kill_heater_state === DeviceKillState.FAILD" icon="pi pi-times" rounded outlined severity="danger" style="width: 36px; height: 36px;" />
                    </div>
                    <div style="height: 12px;"></div>
                    <div class="kill_dialog_msg">
                        <div style="display: flex; align-items: center">
                            <i class="pi pi-bolt"></i>
                            <span>{{ `${device_model} Peltier` }}</span>
                        </div>
                        <ProgressSpinner v-if="kill_peltier_state === DeviceKillState.WAITING" class="kill_dialog_spinner" />
                        <Button v-if="kill_peltier_state === DeviceKillState.SUCCESS" icon="pi pi-check" rounded outlined severity="success" style="width: 36px; height: 36px;" />
                        <Button v-if="kill_peltier_state === DeviceKillState.FAILD" icon="pi pi-times" rounded outlined severity="danger" style="width: 36px; height: 36px;" />
                    </div>
                </div>
            </template>
        </Dialog>
        <div class="lt_ht103_control_row">
            <div class="labeled_control">
                <span>Mode:</span>
                <Dropdown :pt="dropdown_pt" :options="device_op_mode_opts" optionLabel="label" optionValue="value" placeholder="Device Operation Mode" title="Device Operation Mode" v-model="device_op_mode" @change="switch_device_mode()" />
            </div>
            <div class="labeled_control">
                <span>C_f:</span>
                <input class="lt_ht103_inp" title="Correction Factor" type="text" readonly v-model="C_f">
            </div>
            <div class="labeled_control">
                <span>Q_L_F1:</span>
                <input class="lt_ht103_inp" title="Q_L Linear Model F1" type="text" readonly v-model="Q_L_F1">
            </div>
            <div class="labeled_control">
                <span>Q_L_F2:</span>
                <input class="lt_ht103_inp" title="Q_L Linear Model F2" type="text" readonly v-model="Q_L_F2">
            </div>
        </div>
        <div style="height: 12px;"></div>
        <div class="lt_ht103_control_row">
            <div v-if="!sample_shape || sample_shape in sample_material_opts_map" style="width: 100%; display: flex; justify-content: flex-start;">
                <div class="labeled_control">
                    <span style="visibility: hidden;">Mode:</span>
                    <Dropdown :disabled="device_op_mode === LT_HT103_DeviceOperationMode.CALIBRATION" :pt="dropdown_pt" :options="sample_shape_opts" optionLabel="label" optionValue="value" placeholder="Sample Shape" title="Sample Shape" v-model="sample_shape" />
                </div>
                <div class="labeled_control">
                    <span style="visibility: hidden;">C_f:</span>
                    <Dropdown :disabled="device_op_mode === LT_HT103_DeviceOperationMode.CALIBRATION" :pt="dropdown_pt" :options="sample_material_opts_map[sample_shape]" optionLabel="label" optionValue="value" placeholder="Sample Material" title="Sample Material" @update:modelValue="new_value => sample_material = new_value" :modelValue="sample_shape && sample_material_opts_map[sample_shape].length === 1 ? sample_material_opts_map[sample_shape][0].value : sample_material" />
                </div>
            </div>
            <div v-else-if="sample_shape === 2" style="width: 100%; display: flex; justify-content: space-between;">
                <Dropdown :pt="dropdown_pt" :options="sample_shape_opts" optionLabel="label" optionValue="value" placeholder="Sample Shape" title="Sample Shape" v-model="sample_shape" />
                <Dropdown :pt="dropdown_pt" :options="['Aluminum', 'Brass', 'Stainless Steel', 'Steel', 'Copper'].map((x, idx) => { return { label: x, value: idx } })" optionLabel="label" optionValue="value" placeholder="Top Material" title="Top Material" v-model="top_sample_material" />
                <Dropdown :pt="dropdown_pt" :options="['Aluminum', 'Brass', 'Stainless Steel', 'Steel', 'Copper'].map((x, idx) => { return { label: x, value: idx } })" optionLabel="label" optionValue="value" placeholder="Bot Material" title="Bot Material" v-model="bot_sample_material" />
            </div>
        </div>
        <div style="height: 12px;"></div>
        <div style="justify-content: space-around;" class="lt_ht103_control_row">
            <span class="lt_ht103_control_lbl" style="width: fit-content;" title="Actual Heater Power (W)">{{ `P_HEATER - ACT: ${act_ph_val} W` }}</span>
            <span class="lt_ht103_control_lbl" style="width: fit-content;" title="Actual Peltier Power (W)">{{ `P_PALTIER - ACT: ${act_pp_val} W` }}</span>
        </div>
        <div class="lt_ht103_control_row" title="Heater Power (W)">
            <span class="lt_ht103_control_lbl">P_HEATER (W):</span>
            <Slider style="flex-grow: 1; margin-right: 8px;" :pt="slider_pt" :max="MAX_P_HEATER" v-model="ph_slider_val" @slideend="ph_indc_val = ph_slider_val" />
            <input style="width: 50px;" class="lt_ht103_inp" type="text" v-model="ph_indc_val" @keyup.enter="submit_ph_val()">
        </div>
        <div style="height: 12px;"></div>
        <div class="lt_ht103_control_row" title="Peltier Power (W)">
            <span class="lt_ht103_control_lbl">P_PELTIER (W):</span>
            <Slider style="flex-grow: 1; margin-right: 8px;" :pt="slider_pt" :max="MAX_P_PELTIER" v-model="pp_slider_val" @slideend="pp_indc_val = pp_slider_val" />
            <input style="width: 50px;" class="lt_ht103_inp" type="text" v-model="pp_indc_val" @keyup.enter="submit_pp_val()">
        </div>
        <div style="height: 12px;"></div>
        <div class="lt_ht103_control_row" style="justify-content: space-around;">
            <Button class="lt_ht103_control_rbtn" rounded outlined icon="pi pi-power-off" title="Shutdown Electrical Power" severity="danger" @click="shutdown_device_power()" />
            <Button class="lt_ht103_control_rbtn" rounded outlined icon="pi pi-sliders-v" title="Tare Temprature" @click="electron_renderer_send(`${device_model}_tare_t_h`, {})" />
            <Button class="lt_ht103_control_rbtn" rounded outlined icon="pi pi-save" title="Save Calibration Parameters" @click="save_chx_settings()" />
            <Button class="lt_ht103_control_rbtn" rounded outlined icon="pi pi-microchip" title="Send Config to Device" @click="send_device_config()" />
        </div>
    </div>
</template>

<style scoped>
.kill_dialog_spinner {
    width: 40px;
    height: 40px;
    margin: 0px;
}

.kill_dialog_msg {
    width: 100%;
    background-color: var(--dark-bg-color);
    padding: 8px 16px;
    border-radius: 4px;
    color: var(--font-color);
    font-weight: bold;
    font-size: 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.kill_dialog_msg i {
    margin-right: 12px;
    font-size: 18px;
}

#kill_dialog_content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--light-bg-color);
    padding: 16px;
    border-radius: 4px;
}

.lt_ht103_control_rbtn {
    width: 40px;
    height: 40px;
}

.lt_ht103_control_lbl {
    display: inline-block;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
    margin-right: 16px;
    width: 100px;
}

.labeled_control {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: fit-content;
    margin-right: 12px;
}

.labeled_control span {
    display: inline-block;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
    margin-right: 8px;
}

.lt_ht103_inp {
    font-family: "Lucida Console", "Courier New", monospace;
    color: var(--font-color);
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 12px;
    font-weight: bold;
    padding: 4px;
    width: 30px;
}

.lt_ht103_inp:focus {
    outline: none;
    border: 1px solid var(--accent-color);
}

.lt_ht103_control_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
}

#lt_ht103_control_main_cont {
    width: 96%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--light-bg-color);
    border: 1px solid var(--empty-gauge-color);
    border-radius: 4px;
    padding: 8px;
}
</style>