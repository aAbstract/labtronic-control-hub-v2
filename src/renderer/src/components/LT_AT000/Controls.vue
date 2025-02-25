<script lang="ts" setup>
import { ref, inject } from 'vue';
import Slider from 'primevue/slider';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import { electron_renderer_send } from '@renderer/lib/util';
import { DeviceMsg } from '@common/models';

const device_model = inject('device_model');

defineProps(['full_screen'])
const slider_pt: any = {
    root: { style: 'background-color: var(--empty-gauge-color);' },
    handle: { style: 'background-color: var(--accent-color);' },
    range: { style: 'background-color: var(--accent-color);' },
};

const biston_slider_val = ref(0)
const biston_indc_val = ref(0)
const enable_load_point = ref(false)
const enable_piston_max = ref(false)


function threshold_value(x: any, upper_limit: number): number {
    if (isNaN(x) || x < 0)
        return 0;
    return Math.min(upper_limit, x);
}
function submit_val() {
    let _ph_val = threshold_value(biston_indc_val.value, 1000);
    biston_slider_val.value = _ph_val;
    biston_indc_val.value = _ph_val;
    send_analog()
}



const checkbox_pt: any = {
    root: { style: 'background-color: transparent; width:fit-content;height:fit-content;' },
    box: { style: 'height: 24px; width:24px; border-color: var(--accent-color); border-radius: 4px;' },
    icon: { style: 'display: none;' },
};


const outs = ref([false, false, false, false])
const labels = ref(['OUT1', 'OUT2', 'OUT3', 'OUT4'])
function reset() {
    outs.value = [false, false, false, false]
    send_digital()
}

function compute_packet() {
    let value = 0;
    for (let i = 0; i < outs.value.length; i++) {
        value = outs.value[i] ? value + Math.pow(2, i) : value;
    }
    return '0x' + value.toString(16);
}
function calibrate(){
    let value = 16;
    for (let i = 0; i < outs.value.length; i++) {
        value = outs.value[i] ? value + Math.pow(2, i) : value;
    }
    const out = '0x' + value.toString(16);
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET OUTREG ${out}` });
}


function send_digital() {
    const packet_value = compute_packet();
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET OUTREG ${packet_value}` });
}
function send_analog() {
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET ANALOG ${biston_indc_val.value}` });
}



const target_load = ref(0)
const target_piston = ref(0)
const actual_load = ref(40)
window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
    const device_msg: DeviceMsg = data.device_msg;
    const { msg_type } = device_msg.config;
    switch (msg_type) {

        case 50:
            actual_load.value = Math.round(device_msg.msg_value)
            break;

        default:
            break;
    }
}
)
setInterval(() => {
    if (!enable_load_point.value)
        return

    if (actual_load.value > target_load.value) {
        const _ph_val = biston_slider_val.value - 2
        biston_slider_val.value = _ph_val;
        biston_indc_val.value = _ph_val;
        send_analog()
    }
    else if (actual_load.value < target_load.value) {
        const _ph_val = biston_slider_val.value + 2
        biston_slider_val.value = _ph_val;
        biston_indc_val.value = _ph_val;
        send_analog()
    }
}, 1000)


setInterval(() => {
    if (!enable_piston_max.value)
        return

    if (biston_indc_val.value > target_piston.value) {
        const _ph_val = biston_slider_val.value - 2
        biston_slider_val.value = _ph_val;
        biston_indc_val.value = _ph_val;
        send_analog()
    }
    else if (biston_indc_val.value < target_piston.value) {
        const _ph_val = biston_slider_val.value + 2
        biston_slider_val.value = _ph_val;
        biston_indc_val.value = _ph_val;
        send_analog()
    }
}, 1000)
</script>




<template>
    <div class="controls_cont" :class="{ full_screen: full_screen }">
        <div class="lt_at000_analog_output">
            <div class="lt_at000_control_row" title="Heater Power (W)">
                <span class="lt_at000_control_lbl">Piston (%)</span>
                <Slider :disabled="enable_load_point||enable_piston_max" style="flex-grow: 1; margin-right: 8px;" :pt="slider_pt" :max="1000" v-model="biston_slider_val" @slideend="() => { biston_indc_val = biston_slider_val; send_analog() }" />
                <icon class="pi pi-angle-left" @click="biston_indc_val -= 1; submit_val()" title="Reduce 1" style="color: var(--font-color);cursor: pointer;" />
                <input :disabled="enable_load_point||enable_piston_max" style="width: 50px;" class="lt_at000_inp" type="text" v-model="biston_indc_val" @keyup.enter="submit_val()">
                <icon class="pi pi-angle-right" @click="biston_indc_val += 1; submit_val()" title="Increase 1" style="color: var(--font-color);cursor: pointer;" />
            </div>
            <div class="lt_at000_auto_load_row">

                <div class="lt_at000_auto_load_row" style="gap: 16px;width: 180px;">
                    <span>Load Set Point</span>
                    <input :disabled="!enable_load_point" style="width: 50px;" class="lt_at000_inp" type="text" v-model="target_load">
                </div>
                <Button outlined icon="pi pi-power-off" v-if="!enable_load_point" severity="success" label="Enable" @click="enable_load_point = true;enable_piston_max=false" />
                <Button outlined icon="pi pi-power-off" v-if="enable_load_point" severity="warning" label="Disable" @click="enable_load_point = false" />
            </div>
            <div class="lt_at000_auto_load_row">

                <div class="lt_at000_auto_load_row" style="gap: 16px;width: 180px;">
                    <span>Piston Max</span>
                    <input :disabled="!enable_piston_max" style="width: 50px;" class="lt_at000_inp" type="text" v-model="target_piston">
                </div>
                <Button outlined icon="pi pi-power-off" v-if="!enable_piston_max" severity="success" label="Enable" @click="enable_piston_max = true;enable_load_point=false" />
                <Button outlined icon="pi pi-power-off" v-if="enable_piston_max" severity="warning" label="Disable" @click="enable_piston_max = false" />
            </div>
        </div>


        <div class="lt_at000_digital_output">
            <div id="lt_ev574_faults_state_container">
                <div class="lt_ev574_fault_state" v-for="(_, i) in outs">
                    <Checkbox :pt="checkbox_pt" v-model="outs[i]" binary />
                    <p> {{ labels[i] }}</p>
                </div>
            </div>
            <div id="lt_ev574_faults_actions_container">
                <Button outlined icon="pi pi-refresh" label="CALIB" @click="() => { calibrate()}" />
                <Button outlined icon="pi pi-angle-right" label="RESET" @click="reset" />
                <Button outlined icon="pi pi-angle-right" label="SEND" @click="send_digital" />
            </div>
        </div>





    </div>


</template>


<style scoped>
.lt_ev574_fault_state {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: fit-content;
    width: 100%;
}

.lt_ev574_fault_state>p {
    font-size: 14px;
    text-align: center;
    color: var(--accent-color);
    margin: 0px;
}

#lt_ev574_faults_actions_container {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
}

#lt_ev574_faults_actions_container>button {
    width: 120px;
    height: 30px;
    font-size: 14px;
}

#lt_ev574_faults_state_container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    width: 100%;
    gap: 16px;
    margin-bottom: 16px;
}


.lt_at000_auto_load_row>span {
    color: var(--font-color);

}

.lt_at000_auto_load_row>button {
    height: 28px;
    width: 120px;
    font-size: 14px;
}

.lt_at000_auto_load_row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
}

.lt_at000_control_lbl {
    display: inline-block;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
    margin-right: 16px;
    width: 100px;
}

.labeled_control span {
    display: inline-block;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
    margin-right: 8px;
}

.lt_at000_inp {
    font-family: "Lucida Console", "Courier New", monospace;
    color: var(--font-color);
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 12px;
    font-weight: bold;
    padding: 4px;
    width: 60px;
    text-align: center;
}

.lt_at000_inp:focus {
    outline: none;
    border: 1px solid var(--accent-color);
}

.lt_at000_control_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
}

.controls_cont {
    padding-block: 5%;
    width: 80%;
    min-height: 42vh;
    margin-inline: auto;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
}

.full_screen {
    height: 85vh;
    padding-block: 10%;
    width: 60%;
}
</style>