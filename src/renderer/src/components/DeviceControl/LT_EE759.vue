<script setup lang="ts">

import { ref, onMounted, inject } from 'vue';
import Button from 'primevue/button';

import { DeviceMsg } from '@common/models';
import { post_event } from '@common/mediator';
import { electron_renderer_send } from '@renderer/lib/util';

const device_model = inject('device_model');

const energy_wh = ref('0.00000');

onMounted(() => {
    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;

        if (msg_type === 17) // E_wh msg_type
            energy_wh.value = device_msg.msg_value.toFixed(5);
    });
});
function reset_energy(){
    electron_renderer_send(`${device_model}_reset_energy`, {})
    energy_wh.value='0.00000'
}

</script>

<template>
    <div id="lt_ee759_control_cont">
        <div class="lt_ee759_control_row">
            <span style="font-weight: bold; color: var(--font-color); font-size: 16px;">Battery Characteristics Trainer</span>
            <div style="flex-grow: 1;"></div>
            <Button style="height: 30px; width: 150px; font-size: 12px;" label="CHART TOOL" icon="pi pi-calculator" outlined @click="post_event('toggle_panel', { panel_name: 'chart_tool_panel', panel_pos: 'LEFT' })" />
        </div>
        <div style="height: 16px;"></div>
        <div class="lt_ee759_control_row">
            <div id="energy_field">
                <span style="display: inline-block; margin-right: 8px;">Energy [Wh]:</span>
                <span>{{ energy_wh }}</span>
            </div>
            <div style="flex-grow: 1;"></div>
            <Button style="height: 30px; width: 150px; font-size: 12px;" label="Reset Energy" icon="pi pi-refresh" outlined @click="reset_energy" />
        </div>
    </div>
</template>

<style lang="css" scoped>
#energy_field {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    color: #CDDC39;
    font-weight: bold;
}

.lt_ee759_control_row {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

#lt_ee759_control_cont {
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
    padding: 8px;
}
</style>