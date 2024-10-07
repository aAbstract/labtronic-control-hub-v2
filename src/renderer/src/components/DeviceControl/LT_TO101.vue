<script setup lang="ts">

import { onMounted, inject, ref, computed } from 'vue';
import Button from 'primevue/button';

import { post_event } from '@common/mediator';
import { MsgTypeConfig, LT_TO101_DeviceMode, DeviceMsg } from '@common/models';
import { electron_renderer_invoke } from '@renderer/lib/util';

const device_model = inject('device_model');
const device_mode = ref<LT_TO101_DeviceMode>(LT_TO101_DeviceMode.BOYLE);
const cfg2_device_mode_map: Record<number, LT_TO101_DeviceMode> = {
    0xA1: LT_TO101_DeviceMode.BOYLE,
    0xA2: LT_TO101_DeviceMode.GLUSS,
};
const device_mode_exp_name_map: Record<LT_TO101_DeviceMode, string> = {
    [LT_TO101_DeviceMode.BOYLE]: "Boyle's Law Experiment",
    [LT_TO101_DeviceMode.GLUSS]: "Gay-Lussac's Law Experiment",
};
const compressor_state = ref(false);
const compressor_lbl_color = computed(() => compressor_state.value ? '#64DD17' : 'var(--font-color)');
const heater_state = ref(false);
const heater_lbl_color = computed(() => heater_state.value ? '#64DD17' : 'var(--font-color)');

onMounted(() => {
    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
        electron_renderer_invoke<MsgTypeConfig[]>(`${device_model}_get_device_config`).then(_device_config => {
            if (!_device_config)
                return;
            device_mode.value = cfg2_device_mode_map[_device_config[0].cfg2];
        });
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: DeviceMsg = data.device_msg;
        const { cfg2, msg_type } = device_msg.config;
        if (cfg2 === 0xA1 && device_mode.value !== LT_TO101_DeviceMode.BOYLE) {
            device_mode.value = LT_TO101_DeviceMode.BOYLE;
            post_event('change_device_model_asset', { _asset: 'lt_to101_boyle' });
        } else if (cfg2 == 0xA2 && device_mode.value !== LT_TO101_DeviceMode.GLUSS) {
            device_mode.value = LT_TO101_DeviceMode.GLUSS;
            post_event('change_device_model_asset', { _asset: 'lt_to101_gluss' });
        }

        if (msg_type === 7)
            compressor_state.value = device_msg.msg_value ? true : false;
        else if (msg_type === 8)
            heater_state.value = device_msg.msg_value ? true : false;
    });
});

</script>

<template>
    <div id="lt_to101_control_main_cont">
        <div class="lt_to101_control_row">
            <div class="labeled_control">
                <span class="lc_span">DeviceMode:</span>
                <span class="lc_span" style="width: 8px;"></span>
                <span class="lc_span">{{ device_mode_exp_name_map[device_mode] }}</span>
            </div>
            <Button id="data_tool_button" label="DATA TOOL" icon="pi pi-calculator" outlined @click="post_event('toggle_panel', { panel_name: 'data_tool', panel_pos: 'RIGHT' })" />
        </div>
        <div v-if="device_mode === LT_TO101_DeviceMode.BOYLE" class="lt_to101_control_row">
            <span :style="`color: ${compressor_lbl_color};`" class="lc_span">Compressor:</span>
            <span class="lc_span" style="width: 8px;"></span>
            <span :style="`color: ${compressor_lbl_color};`" class="lc_span">{{ compressor_state ? 'ON' : 'OFF' }}</span>
        </div>
        <div v-if="device_mode === LT_TO101_DeviceMode.GLUSS" class="lt_to101_control_row">
            <span :style="`color: ${heater_lbl_color};`" class="lc_span">Heater:</span>
            <span class="lc_span" style="width: 8px;"></span>
            <span :style="`color: ${heater_lbl_color};`" class="lc_span">{{ heater_state ? 'ON' : 'OFF' }}</span>
        </div>
    </div>
</template>

<style scoped>
#data_tool_button {
    height: 30px;
    width: fit-content;
    font-size: 12px;
}

.lt_to101_led {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #00c853;
}

.lc_span {
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
}

.labeled_control {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-right: 12px;
    flex-grow: 1;
}


.lt_to101_control_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
}

#lt_to101_control_main_cont {
    width: 96%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--light-bg-color);
    border-radius: 4px;
    padding: 8px;
}
</style>