<script setup lang="ts">

import { onMounted, shallowRef, computed, inject, ref } from 'vue';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

import { MsgTypeConfig, DeviceMsg } from '@common/models';
import SingleChart from '@renderer/components/Charts/SingleChart.vue';
import MultiChart from '@renderer/components/Charts/MultiChart.vue';
import { DEVICE_UI_CONFIG_MAP } from '@renderer/lib/device_ui_config';
import { post_event } from '@common/mediator';
import { screenshot_handlers } from '@renderer/lib/screenshot';
import { electron_renderer_invoke, compute_tooltip_pt } from '@renderer/lib/util';

const device_model = inject('device_model') as string;
const device_config = shallowRef<MsgTypeConfig[]>([]);
const msg_type_value_map = ref<Record<number, string>>({});
const msg_type_color_map = ref<Record<number, string>>({});
const msg_type_state_map = ref<Record<number, boolean>>({});
const active_msg_type = ref(-1);
const read_device_config = computed(() => {
    const read_config = device_config.value.filter(x => x.msg_name.startsWith('READ_'));
    return read_config.map(x => {
        msg_type_value_map.value[x.msg_type] = '0.00';
        msg_type_color_map.value[x.msg_type] = DEVICE_UI_CONFIG_MAP[device_model].get_chart_params(x.msg_type)?.borderColor ?? '0xFFFFFF';
        msg_type_state_map.value[x.msg_type] = true;
        active_msg_type.value = read_config[0].msg_type;
        return { ...x, msg_name: x.msg_name.replace('READ_', '') };
    });
});
const checkbox_pt: any = {
    box: { style: 'background-color: var(--dark-bg-color); border-color: var(--empty-gauge-color);' },
    icon: { style: 'color: var(--font-color);' },
};

function switch_single_channel_plot(new_msg_type: number) {
    active_msg_type.value = new_msg_type;
    post_event('change_plot_channel', { new_msg_type });
}

function switch_multi_channels_plot() {
    post_event('change_plot_channels', { new_msg_type_state_map: msg_type_state_map.value });
}

onMounted(() => {
    electron_renderer_invoke<any>(`${device_model}_get_device_config`).then(_device_config => {
        if (!_device_config)
            return;
        device_config.value = _device_config;
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        msg_type_value_map.value[msg_type] = device_msg.msg_value.toFixed(2);
    });
});

</script>

<template>
    <div id="device_state_panel">
        <div style="height: 8px;"></div>
        <div id="readings_grid" v-on="screenshot_handlers">
            <h4 id="rg_title">
                <span>Device Readings</span>
                <Button icon="pi pi-cog" @click="post_event('show_cps_dialog', {})" rounded text v-tooltip.left="{ value: 'PARAMS SETTINGS', pt: compute_tooltip_pt('left') }" />
            </h4>
            <div id="readings_cont">
                <div class="reading_cont" v-for="config in read_device_config" :style="{ color: msg_type_color_map[config.msg_type] }">
                    <Checkbox @change="switch_multi_channels_plot()" binary :value="config.msg_type" v-model="msg_type_state_map[config.msg_type]" :pt="checkbox_pt" />
                    <span @click="switch_single_channel_plot(config.msg_type)" :style="{ borderBottom: active_msg_type === config.msg_type ? `2px solid ${msg_type_color_map[config.msg_type]}` : 'none' }">{{ `${config.msg_name}: ${msg_type_value_map[config.msg_type]}` }}</span>
                </div>
            </div>
        </div>
        <div style="height: 8px;"></div>
        <SingleChart class="device_state_chart" v-on="screenshot_handlers" :device_ui_config="DEVICE_UI_CONFIG_MAP[device_model]" :fps="30" />
        <div style="height: 12px;"></div>
        <MultiChart class="device_state_chart" v-on="screenshot_handlers" :device_ui_config="DEVICE_UI_CONFIG_MAP[device_model]" :fps="30" />
    </div>
</template>

<style scoped>
.device_state_chart {
    height: 38vh;
    width: calc(100% - 8px);
    max-width: 60vw;
    border: 1px solid var(--empty-gauge-color);
    border-radius: 8px;
}

#readings_cont {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
}

.reading_cont {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 200px;
}

.reading_cont span {
    font-size: 16px;
    margin-left: 8px;
    font-weight: bold;
    cursor: pointer;
}

#rg_title {
    color: var(--font-color);
    margin: 0px;
    margin-bottom: 8px;
    border-bottom: 2px solid var(--empty-gauge-color);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

#rg_title button {
    color: var(--accent-color);
    width: 32px;
    height: 32px;
}

#readings_grid {
    background-color: var(--light-bg-color);
    border-radius: 4px;
    padding: 8px;
    width: calc(100% - 8px);
}

#device_state_panel {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
}
</style>