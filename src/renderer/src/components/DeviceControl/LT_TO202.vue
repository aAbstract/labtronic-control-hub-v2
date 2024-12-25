<script setup lang="ts">

import { onMounted, shallowRef, inject, ref } from 'vue';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import { ChartOptions, ChartData } from 'chart.js';
import OverlayPanel from 'primevue/overlaypanel';

import { MsgTypeConfig, DeviceMsg } from '@common/models';
import { post_event, subscribe } from '@common/mediator';
import { ChartParams } from '@renderer/lib/device_ui_config';
import { electron_renderer_invoke, compute_tooltip_pt } from '@renderer/lib/util';
import { screenshot_handlers } from '@renderer/lib/screenshot';
import { DEVICE_UI_CONFIG_MAP } from '@renderer/lib/device_ui_config';

const chart_msg_types = new Set([0, 2, 3]);
const device_model = inject('device_model') as string;
const dataset_map: Record<number, ChartParams> = {};
const chart_data = shallowRef<ChartData>({
    labels: [],
    datasets: [],
});
const overlay_panel_pt = {
    content: { style: 'padding: 8px;' },
};
const lt_to202_chart_y_min = ref(20);
const lt_to202_chart_y_max = ref(100);
const lt_to202_chart_op = ref();
const t_heater = ref(NaN);
const font_color = document.documentElement.style.getPropertyValue('--font-color');
const chart_grid_color = document.documentElement.style.getPropertyValue('--empty-gauge-color');
const chart_opts = shallowRef(create_chart_options(font_color, chart_grid_color, lt_to202_chart_y_min.value, lt_to202_chart_y_max.value));

function create_chart_options(font_color: string, grid_color: string, y_min: number, y_max: number): ChartOptions {
    return {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        color: font_color,
        scales: {
            x: { ticks: { color: font_color }, grid: { color: grid_color }, title: { text: 'Time [s]', display: true, color: font_color } },
            y: { ticks: { color: font_color }, grid: { color: grid_color }, title: { text: 'Temperature [Celsius]', display: true, color: font_color }, min: y_min, max: y_max },
        },
        animation: false,
        plugins: { legend: { display: false } },
    };
}

function set_lt_to202_chart_y_min_max() {
    const y_min = lt_to202_chart_y_min.value;
    const y_max = lt_to202_chart_y_max.value;
    if (isNaN(y_min) || isNaN(y_max))
        return;
    chart_opts.value = create_chart_options(font_color, chart_grid_color, y_min, y_max);
}

function show_lt_to202_chart_settings_overlay_panel(_event: MouseEvent) {
    lt_to202_chart_op.value.toggle(_event);
}

function map_t_heater_color_code(t_heater: number): string {
    if (t_heater > 0 && t_heater <= 30)
        return '#64DD17';
    if (t_heater > 35 && t_heater <= 70)
        return '#FFAB00';
    if (t_heater > 75 && t_heater <= 100)
        return '#DD2C00';
    if (isNaN(t_heater))
        return font_color;
    return '#DD2C00';
}

onMounted(() => {
    post_event('update_device_model_cont_width', { width: '70%', margin_bottom: '0px' });

    subscribe('device_config_ready', `device_config_ready_${device_model}`, () => {
        electron_renderer_invoke<MsgTypeConfig[]>(`${device_model}_get_device_config`).then(device_config => {
            if (!device_config)
                return;
            const read_config = device_config.filter(x => x.msg_name.startsWith('READ_'));
            read_config.filter(x => chart_msg_types.has(x.msg_type)).forEach(x => dataset_map[x.msg_type] = DEVICE_UI_CONFIG_MAP[device_model].get_chart_params(x.msg_type) as ChartParams);
        });
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        const { msg_value } = device_msg;
        if (msg_type === 1)
            t_heater.value = msg_value;
    });

    subscribe('record_data_point', 'record_data_point_lt_to202_chart', args => {
        const _data_point: Record<string, number> = args._data_point;
        chart_data.value.labels?.push(_data_point.time_ms / 1000);
        Object.keys(_data_point).forEach(_dp_key => {
            const _key = Number(_dp_key);
            if (chart_msg_types.has(_key))
                dataset_map[_key].data.push(_data_point[_dp_key]);
        });
        chart_data.value = {
            labels: chart_data.value.labels,
            datasets: Object.values(dataset_map),
        };
    });

    subscribe('clear_recorded_data', 'clear_recorded_data_lt_to202_chart', () => {
        chart_data.value = {
            labels: [],
            datasets: [],
        };
    });
});

</script>

<template>
    <div id="lt_to202_control_main_cont" v-on="screenshot_handlers">
        <div id="lt_to202_control_header">
            <div :style="`color: ${map_t_heater_color_code(t_heater)};`" class="lt_to202_reading">
                <span>T_Heater:</span>
                <span>{{ `${t_heater.toFixed(1)} Celsius` }}</span>
            </div>
            <div style="position: relative;">
                <Button id="data_tool_button" label="DATA TOOL" icon="pi pi-calculator" outlined @click="post_event('toggle_panel', { panel_name: 'data_tool', panel_pos: 'RIGHT' })" />
                <Button class="lt_to202_chart_settings_btn" icon="pi pi-cog" @click="show_lt_to202_chart_settings_overlay_panel" text v-tooltip.left="{ value: 'CHART SETTINGS', pt: compute_tooltip_pt('left') }" />
                <OverlayPanel ref="lt_to202_chart_op" :pt="overlay_panel_pt" style="font-family: Cairo, sans-serif;">
                    <div style="display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;">
                        <div style="width: fit-content;">
                            <span style="font-size: 14px; margin-right: 8px; width: 125px;">LT-TO202 Chart Y Range</span>
                            <input class="dt_tf" type="number" v-model="lt_to202_chart_y_min" @keyup.enter="set_lt_to202_chart_y_min_max()">
                            <span style="flex-grow: 1; text-align: center;"> - </span>
                            <input class="dt_tf" type="number" v-model="lt_to202_chart_y_max" @keyup.enter="set_lt_to202_chart_y_min_max()">
                        </div>
                    </div>
                </OverlayPanel>
            </div>
        </div>
        <Chart id="lt_to202_chart" type="line" :data="chart_data" :options="chart_opts" />
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

.lt_to202_chart_settings_btn {
    position: absolute;
    top: 36px;
    right: 0px;
    z-index: 1;
    width: 32px;
    height: 32px;
    color: var(--accent-color);
}

#lt_to202_chart {
    height: 100%;
    width: 100%;
    border-radius: 4px;
    background-color: var(--dark-bg-color);
    border: 1px solid var(--empty-gauge-color);
}

.lt_to202_reading {
    color: var(--font-color);
    font-size: 14px;
    font-weight: bold;
}

.lt_to202_reading :first-child {
    margin-right: 8px;
}

#data_tool_button {
    height: 30px;
    width: fit-content;
    font-size: 12px;
}

#lt_to202_control_header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 8px;
}

#lt_to202_control_main_cont {
    height: 300px;
    width: 96%;
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