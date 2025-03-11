<script setup lang="ts">

import { ref, shallowRef, inject, onMounted } from 'vue';
import Knob from 'primevue/knob';
import Slider from 'primevue/slider';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

import { electron_renderer_send } from '@renderer/lib/util';
import { DeviceMsg } from '@common/models';
import { screenshot_handlers } from '@renderer/lib/screenshot';
import { subscribe } from '@common/mediator';

const MAX_PISP_VAL = 200;
const device_model = inject('device_model');
const perp_knob_val = ref(0);
const pisp_knob_val = ref(0);
const pisp_slider_val = ref(0);
const pisp_indc_val = ref(0);
const active_perp_btns = shallowRef([true, false, false, false]);
const toast_service = useToast();
const slider_pt: any = {
    root: { style: 'background-color: var(--empty-gauge-color);' },
    handle: { style: 'background-color: var(--accent-color);' },
    range: { style: 'background-color: var(--accent-color);' },
};

function pips_slider_change() {
    pisp_indc_val.value = pisp_slider_val.value;
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET PISTON_PUMP ${pisp_slider_val.value}` });
}

function submit_pisp_val() {
    const new_pisp_val = Math.min(MAX_PISP_VAL, Number(pisp_indc_val.value));
    pisp_slider_val.value = new_pisp_val;
    pisp_indc_val.value = new_pisp_val;
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET PISTON_PUMP ${new_pisp_val}` });
}

function reset_scale_btn_click() {
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: 'CALIBRATE' });
}

function perp_btn_click(val: number) {
    let new_active_perp_btns = [false, false, false, false];
    new_active_perp_btns[val] = true;
    active_perp_btns.value = new_active_perp_btns;
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET PERISTALTIC_PUMP ${val}` });
}

onMounted(() => {
    subscribe('device_msg', data => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        if (msg_type === 0)
            pisp_knob_val.value = device_msg.msg_value;
        else if (msg_type === 1)
            perp_knob_val.value = device_msg.msg_value;
    });

    // handle chx script injected parameters
    subscribe('chx_script_ip_lt_ch000_test_control_value', args => {
        const pv = Math.round(args.pv);
        pisp_indc_val.value = pv;
        electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET PISTON_PUMP ${pv}` });
        toast_service.add({ severity: 'success', summary: 'CHX Script', detail: 'chx_script_ip_lt_ch000_test_control_value', life: 3000 });
    });
});

</script>

<template>
    <div id="lt_ch000_control_main_cont" v-on="screenshot_handlers">
        <div id="lt_ch000_knobs_cont">
            <Knob :strokeWidth="2" range-color="var(--empty-gauge-color)" value-color="var(--accent-color)" text-color="var(--accent-color)" :size="160" :model-value="pisp_knob_val" :min="0" :max="MAX_PISP_VAL" readonly />
            <Knob :strokeWidth="2" range-color="var(--empty-gauge-color)" value-color="var(--accent-color)" text-color="var(--accent-color)" :size="160" :model-value="perp_knob_val" :min="0" :max="3" readonly />
        </div>
        <div id="lt_ch000_control_form">
            <div class="lt_ch000_control_form_row">
                <span>PISTON PUMP</span>
                <Slider style="flex-grow: 1;" :pt="slider_pt" v-model="pisp_slider_val" @slideend="pips_slider_change()" :max="MAX_PISP_VAL" />
                <input id="pisp_indc" v-model="pisp_indc_val" type="text" @keyup.enter="submit_pisp_val()">
            </div>
            <div class="lt_ch000_control_form_row">
                <span>PERISTALTIC PUMP</span>
                <div id="perp_btns_cont">
                    <Button v-for="i in [0, 1, 2, 3]" :class="`lt_ch000_control_button ${active_perp_btns[i] ? 'lt_ch000_active_control_btn' : ''}`" :label="String(i)" outlined @click="perp_btn_click(i)" />
                </div>
            </div>
            <div class="lt_ch000_control_form_row">
                <div style="flex-grow: 1;"></div>
                <Button :pt="{ label: { style: 'font-weight: normal;' } }" class="lt_ch000_control_icon_btn" label="CALIBRATE SCALE" icon="pi pi-sliders-v" outlined @click="reset_scale_btn_click()" />
                <div style="width: 8px;"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.lt_ch000_control_icon_btn {
    height: 30px;
    width: fit-content;
    color: var(--accent-color);
    border-color: var(--accent-color);
    margin-top: 4px;
}

.lt_ch000_control_button {
    height: 30px;
    width: 20%;
    text-align: center;
    color: var(--accent-color);
    border-color: var(--accent-color);
    margin-right: 8px;
}

.lt_ch000_active_control_btn {
    background-color: var(--accent-color);
    color: white !important;
}

#perp_btns_cont {
    display: flex;
    flex-grow: 1;
    justify-content: space-between;
}

#pisp_indc {
    font-family: "Lucida Console", "Courier New", monospace;
    width: 50px;
    color: var(--font-color);
    margin: 0px 8px;
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 14px;
    font-weight: bold;
    padding: 4px;
    border-radius: 4px;
}

#pisp_indc:focus {
    outline: none;
    border: 1px solid var(--accent-color);
}

#lt_ch000_control_form {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

.lt_ch000_control_form_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    margin-bottom: 8px;
}

.lt_ch000_control_form_row span {
    font-size: 16px;
    font-weight: bold;
    margin: 0px 16px;
    color: var(--accent-color);
    width: 150px;
}

#lt_ch000_knobs_cont {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    width: 100%;
}

#lt_ch000_control_main_cont {
    width: 96%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--light-bg-color);
    border: 1px solid var(--empty-gauge-color);
    border-radius: 4px;
    padding-bottom: 8px;
}
</style>