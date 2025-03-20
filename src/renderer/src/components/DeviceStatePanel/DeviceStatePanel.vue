<script setup lang="ts">

import { onBeforeMount, shallowRef, computed, inject, ref } from 'vue';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import OverlayPanel from 'primevue/overlaypanel';

import { MsgTypeConfig, CHXChartState } from '@common/models';
import SingleChart from '@renderer/components/Charts/SingleChart.vue';
import MultiChart from '@renderer/components/Charts/MultiChart.vue';
import { DEVICE_UI_CONFIG_MAP } from '@renderer/lib/device_ui_config';
import { post_event, subscribe } from '@common/mediator';
import { screenshot_handlers } from '@renderer/lib/screenshot';
import { electron_renderer_invoke, clone_object, compute_tooltip_pt } from '@renderer/lib/util';
// @ts-ignore
import { DeviceMsg } from '@common/models';

const chart_height = ref('35vh');
const device_model = inject('device_model') as string;
const device_config = shallowRef<MsgTypeConfig[]>([]);
// @ts-ignore
let cache_changed = false;
const msg_values_cache: Record<number, string> = {};
const msg_type_value_map = shallowRef<Record<number, string>>({});
const msg_type_color_map = ref<Record<number, string>>({});
const msg_type_state_map = ref<Record<number, boolean>>({});
const active_msg_type = ref(-1);
const filter_MSG = [0,1,2,3,42,43,44,46,47,48,49,51,52,22,23,24,27,29]
const read_device_config = computed(() => {
// && filter_MSG.includes(x.msg_type)
    const read_config = device_config.value.filter(x => x.msg_name.startsWith('READ_'));
    const _chart_height = map_chart_height(Math.ceil(read_config.length / 5));
    chart_height.value = `${_chart_height}vh`;

    return read_config.map(x => {
        msg_values_cache[x.msg_type] = '00.0000';
        update_device_state_panel();
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
const overlay_panel_pt = {
    content: { style: 'padding: 8px;' },
};

const __btn_wh_props = {
    width: '32px',
    height: '32px',
};

const single_chart_settings_op = ref();
const single_chart_y_min = ref('0');
const single_chart_y_max = ref('100');
const single_chart_state = ref(CHXChartState.RECORDING);
const single_chart_auto_scale = ref(false);

const multi_chart_y_min = ref('0');
const multi_chart_y_max = ref('100');
const multi_chart_settings_op = ref();
const multi_chart_state = ref(CHXChartState.RECORDING);
const multi_chart_auto_scale = ref(false);

enum DeviceStatePanelChart {
    SINGLE = 0,
    MULTI = 1,
};
function set_chart_state(_chart: DeviceStatePanelChart, _state: CHXChartState) {
    if (_chart === DeviceStatePanelChart.SINGLE) {
        single_chart_state.value = _state;
        post_event('set_single_chart_state', { chx_chart_state: _state });
    }
    else if (_chart === DeviceStatePanelChart.MULTI) {
        multi_chart_state.value = _state;
        post_event('set_multi_chart_state', { chx_chart_state: _state });
    }
}

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

function update_device_state_panel() {
    const _msg_values_cache = clone_object(msg_values_cache);
    msg_type_value_map.value = _msg_values_cache;
    // post_event('update_device_model_panel', { _msg_values_cache });
}

function show_single_chart_settings_overlay_panel(_event: MouseEvent) {
    single_chart_settings_op.value.toggle(_event);
}

function show_multi_chart_settings_overlay_panel(_event: MouseEvent) {
    multi_chart_settings_op.value.toggle(_event);
}

function set_single_chart_y_min_max() {
    const y_min = Number(single_chart_y_min.value);
    const y_max = Number(single_chart_y_max.value);
    if (isNaN(y_min) || isNaN(y_max))
        return;
    post_event('update_single_chart_y_min_max', { y_min, y_max });
    single_chart_settings_op.value.hide();
}

function set_multi_chart_y_min_max() {
    const y_min = Number(multi_chart_y_min.value);
    const y_max = Number(multi_chart_y_max.value);
    if (isNaN(y_min) || isNaN(y_max))
        return;
    post_event('update_multi_chart_y_min_max', { y_min, y_max });
    multi_chart_settings_op.value.hide();
}

onBeforeMount(() => {
    subscribe('device_config_ready', 'device_config_ready_DeviceStatePanel', () => {
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
        msg_values_cache[msg_type] = device_msg.msg_value.toFixed(1);
        // update_device_state_panel();
        cache_changed = true;
    });

    setInterval(() => {
        if (!cache_changed)
            return;
        update_device_state_panel();
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
        <div style="height: 8px;" class="chx_chart_gap">
            <Button class="chx_charts_settings_btn" icon="pi pi-cog" @click="show_single_chart_settings_overlay_panel" text v-tooltip.left="{ value: 'CHART SETTINGS', pt: compute_tooltip_pt('left') }" />
            <OverlayPanel ref="single_chart_settings_op" :pt="overlay_panel_pt" style="font-family: Cairo, sans-serif;">
                <div style="display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;">
                    <div style="width: 280px;">
                        <span style="font-size: 14px; margin-right: 8px; width: 125px; display: inline-block;">Single Chart Y Range</span>
                        <input ref="sc_y_min_field" class="dt_tf" v-model="single_chart_y_min" @keyup.enter="set_single_chart_y_min_max()" @focus="single_chart_y_min = ''">
                        <span style="text-align: center;"> - </span>
                        <input ref="sc_y_max_field" class="dt_tf" v-model="single_chart_y_max" @keyup.enter="set_single_chart_y_min_max()" @focus="single_chart_y_max = ''">
                    </div>
                    <div style="height: 16px;"></div>
                    <div style="display: flex; width: 280px;">
                        <div style="display: flex; justify-content: flex-start; align-items: center;">
                            <Checkbox v-model="single_chart_auto_scale" :pt="checkbox_pt" binary @change="post_event('set_single_chart_auto_scale', { chx_chart_auto_scale: single_chart_auto_scale })" />
                            <div style="width: 8px;"></div>
                            <span style="font-size: 14px; margin-bottom: 2px;">Auto Scale</span>
                        </div>
                        <div style="flex-grow: 1;"></div>
                        <div>
                            <Button icon="pi pi-play" @click="set_chart_state(DeviceStatePanelChart.SINGLE, CHXChartState.RECORDING)" text :style="{ color: single_chart_state === CHXChartState.RECORDING ? '#64DD17' : '', ...__btn_wh_props }" />
                            <Button icon="pi pi-pause" @click="set_chart_state(DeviceStatePanelChart.SINGLE, CHXChartState.PAUSED)" text :style="{ color: single_chart_state === CHXChartState.PAUSED ? '#FFAB00' : '', ...__btn_wh_props }" />
                        </div>
                    </div>
                </div>
            </OverlayPanel>
        </div>
        <SingleChart class="device_state_chart" v-on="screenshot_handlers" :device_ui_config="DEVICE_UI_CONFIG_MAP[device_model]" :fps="30" />
        <div style="height: 12px;" class="chx_chart_gap">
            <Button class="chx_charts_settings_btn" icon="pi pi-cog" @click="show_multi_chart_settings_overlay_panel" text v-tooltip.left="{ value: 'CHART SETTINGS', pt: compute_tooltip_pt('left') }" />
            <OverlayPanel ref="multi_chart_settings_op" :pt="overlay_panel_pt" style="font-family: Cairo, sans-serif;">
                <div style="display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;">
                    <div style="width: 280px;">
                        <span style="font-size: 14px; margin-right: 8px; width: 125px; display: inline-block;">Multi Chart Y Range</span>
                        <input ref="mc_y_min_field" class="dt_tf" v-model="multi_chart_y_min" @keyup.enter="set_multi_chart_y_min_max()" @focus="multi_chart_y_min = ''">
                        <span style="text-align: center;"> - </span>
                        <input ref="mc_y_max_field" class="dt_tf" v-model="multi_chart_y_max" @keyup.enter="set_multi_chart_y_min_max()" @focus="multi_chart_y_max = ''">
                    </div>
                    <div style="height: 16px;"></div>
                    <div style="display: flex; width: 280px;">
                        <div style="display: flex; justify-content: flex-start; align-items: center;">
                            <Checkbox v-model="multi_chart_auto_scale" :pt="checkbox_pt" binary @change="post_event('set_multi_chart_auto_scale', { chx_chart_auto_scale: multi_chart_auto_scale })" />
                            <div style="width: 8px;"></div>
                            <span style="font-size: 14px; margin-bottom: 2px;">Auto Scale</span>
                        </div>
                        <div style="flex-grow: 1;"></div>
                        <div>
                            <Button icon="pi pi-play" @click="set_chart_state(DeviceStatePanelChart.MULTI, CHXChartState.RECORDING)" text :style="{ color: multi_chart_state === CHXChartState.RECORDING ? '#64DD17' : '', ...__btn_wh_props }" />
                            <Button icon="pi pi-pause" @click="set_chart_state(DeviceStatePanelChart.MULTI, CHXChartState.PAUSED)" text :style="{ color: multi_chart_state === CHXChartState.PAUSED ? '#FFAB00' : '', ...__btn_wh_props }" />
                        </div>
                    </div>
                </div>
            </OverlayPanel>
        </div>
        <MultiChart class="device_state_chart" v-on="screenshot_handlers" :device_ui_config="DEVICE_UI_CONFIG_MAP[device_model]" :fps="30" />
        <!-- <div style="height: 12px;"></div> -->
    </div>
</template>

<style scoped>
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

.chx_chart_gap {
    position: relative;
    width: 100%;
}

.chx_charts_settings_btn {
    position: absolute;
    top: 10px;
    right: 8px;
    z-index: 1;
    width: 32px;
    height: 32px;
    color: var(--accent-color);
}

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
    width: 17.6vw;
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
    border: 1px solid var(--empty-gauge-color);
    border-radius: 4px;
    padding: 8px;
    width: calc(100% - 8px);
    max-height: 15vh;
    overflow-y: scroll;
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