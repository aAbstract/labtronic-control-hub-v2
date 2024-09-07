<script setup lang="ts">

import { onBeforeMount, shallowRef, computed, inject, ref } from 'vue';
import Checkbox from 'primevue/checkbox';

import { MsgTypeConfig } from '@common/models';
import SingleChart from '@renderer/components/Charts/SingleChart.vue';
import MultiChart from '@renderer/components/Charts/MultiChart.vue';
import { DEVICE_UI_CONFIG_MAP } from '@renderer/lib/device_ui_config';
import { post_event } from '@common/mediator';
import { screenshot_handlers } from '@renderer/lib/screenshot';
import { electron_renderer_invoke, clone_object } from '@renderer/lib/util';
// @ts-ignore
import { DeviceMsg } from '@common/models';

const chart_height = ref('35vh');
const device_model = inject('device_model') as string;
const device_config = shallowRef<MsgTypeConfig[]>([]);
let cache_changed = false;
const msg_values_cache: Record<number, string> = {};
const msg_type_value_map = shallowRef<Record<number, string>>({});
const msg_type_color_map = ref<Record<number, string>>({});
const msg_type_state_map = ref<Record<number, boolean>>({});
const active_msg_type = ref(-1);
const read_device_config = computed(() => {
    const read_config = device_config.value.filter(x => x.msg_name.startsWith('READ_'));
    const _chart_height = map_chart_height(Math.ceil(read_config.length / 4));
    chart_height.value = `${_chart_height}vh`;

    return read_config.map(x => {
        msg_values_cache[x.msg_type] = '000.00';
        cache_changed = true;
        msg_type_color_map.value[x.msg_type] = DEVICE_UI_CONFIG_MAP[device_model].get_chart_params(x.msg_type)?.borderColor ?? '#FFFFFF';
        msg_type_state_map.value[x.msg_type] = true;
        active_msg_type.value = read_config[0].msg_type;
        return { ...x, msg_name: x.msg_name.replace('READ_', '') };
    });
});
const checkbox_pt: any = {
    box: { style: 'background-color: var(--dark-bg-color); border-color: var(--empty-gauge-color);' },
    icon: { style: 'color: var(--font-color);' },
};

function map_chart_height(_key: number): number {
    const _map: Record<number, number> = {
        1: 40,
        2: 38,
        3: 37,
    };
    if (_key in _map)
        return _map[_key];
    else
        return 35;
}

function switch_single_channel_plot(new_msg_type: number) {
    active_msg_type.value = new_msg_type;
    post_event('change_plot_channel', { new_msg_type });
}

function switch_multi_channels_plot() {
    post_event('change_plot_channels', { new_msg_type_state_map: msg_type_state_map.value });
}

onBeforeMount(() => {
    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
        electron_renderer_invoke<any>(`${device_model}_get_device_config`).then(_device_config => {
            if (!_device_config)
                return;
            msg_type_state_map.value = {};
            device_config.value = _device_config;
        });
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        msg_values_cache[msg_type] = device_msg.msg_value.toFixed(2);
        cache_changed = true;
    });

    setInterval(() => {
        if (!cache_changed)
            return;
        const _msg_values_cache = clone_object(msg_values_cache);
        msg_type_value_map.value = _msg_values_cache;
        post_event('update_device_model_panel', { _msg_values_cache });
        cache_changed = false;
    }, 1000);
});

</script>

<template>
    <div id="device_state_panel">
        <div style="height: 12px;"></div>
        <div id="readings_grid" v-on="screenshot_handlers">
            <!-- <h4 id="rg_title">
                <span>Device Readings</span>
            </h4> -->
            <div id="readings_cont">
                <div class="reading_cont" v-for="config in [...read_device_config]" :style="{ color: msg_type_color_map[config.msg_type] }">
                    <Checkbox @change="switch_multi_channels_plot()" binary :value="config.msg_type" v-model="msg_type_state_map[config.msg_type]" :pt="checkbox_pt" />
                    <!-- @vue-ignore -->
                    <span :title="config.cp_expr ?? config.msg_name" @click="switch_single_channel_plot(config.msg_type)" :style="{ borderBottom: active_msg_type === config.msg_type ? `2px solid ${msg_type_color_map[config.msg_type]}` : 'none' }">{{ `${config.msg_name}: ${msg_type_value_map[config.msg_type] ?? 'XXX.XX'}` }}</span>
                </div>
            </div>
        </div>
        <div style="height: 8px;"></div>
        <SingleChart class="device_state_chart" v-on="screenshot_handlers" :device_ui_config="DEVICE_UI_CONFIG_MAP[device_model]" :fps="30" />
        <div style="height: 12px;"></div>
        <MultiChart class="device_state_chart" v-on="screenshot_handlers" :device_ui_config="DEVICE_UI_CONFIG_MAP[device_model]" :fps="30" />
        <!-- <div style="height: 12px;"></div> -->
    </div>
</template>

<style scoped>
.device_state_chart {
    height: v-bind(chart_height);
    width: calc(100% - 8px);
    max-width: 60vw;
    border: 1px solid var(--empty-gauge-color);
    border-radius: 4px;
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
    width: 13.2vw;
}

.reading_cont span {
    font-size: 14px;
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