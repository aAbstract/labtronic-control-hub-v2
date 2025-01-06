<script setup lang="ts">

import { shallowRef, onMounted, onBeforeMount, inject, ref, watch } from 'vue';
import Chart from 'primevue/chart';
import { ChartOptions, ChartData } from 'chart.js';
import Button from 'primevue/button';
import OverlayPanel from 'primevue/overlaypanel';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';

import { DeviceMsg, DropdownOption, CHXChartState, MsgTypeConfig } from '@common/models';
import { ChartParams, DEVICE_UI_CONFIG_MAP } from '@renderer/lib/device_ui_config';
import { compute_tooltip_pt, electron_renderer_invoke } from '@renderer/lib/util';
import { subscribe } from '@common/mediator';

const device_model = inject('device_model') as string;
const accent_color = document.documentElement.style.getPropertyValue('--accent-color');
const font_color = document.documentElement.style.getPropertyValue('--font-color');
const chart_grid_color = document.documentElement.style.getPropertyValue('--empty-gauge-color');

let start_epoch = new Date().getTime();
let data_points_cache: Record<number, [number, number]> = {};
let chart_params = new ChartParams('', accent_color);
let msg_type_msg_name_map = {};

const msg_types_opts = shallowRef<DropdownOption<number>[]>([]);
const msg_type_chart_name_map = shallowRef<Record<number, string>>({});

const panel_pos = ref('-50vw');

const overlay_panel_pt = {
    content: { style: 'padding: 8px;' },
};
const dropdown_pt: any = {
    root: { style: 'background-color: transparent; border: 1px solid var(--font-color); width: 125px; height: 30px;' },
    input: { style: 'padding: 0px 8px; color: var(--font-color); font-family: Cairo, sans-serif; font-size: 14px; font-weight: bold;' },
    panel: { style: 'background-color: var(--light-bg-color); font-family: Cairo, sans-serif;' },
    emptyMessage: { style: 'color: var(--font-color);' },
    item: { style: 'background-color: var(--light-bg-color); color: var(--font-color);' },
    trigger: { style: 'width: fit-content; padding-right: 8px;' },
    list: { style: 'padding: 0px;' },
};
const checkbox_pt: any = {
    box: { style: 'background-color: var(--dark-bg-color); border-color: var(--empty-gauge-color);' },
    icon: { style: 'color: var(--font-color);' },
};
const chart_data = shallowRef<ChartData>({
    labels: [],
    datasets: [],
});

const chart_y_min = ref('0');
const chart_y_max = ref('100');
const chart_state = ref(CHXChartState.PAUSED);
const chart_x_msg_type = ref(-2);
const chart_y_msg_type = ref(-2);
const chart_auto_scale = ref(true);
const chart_opts = shallowRef(create_chart_options(font_color, chart_grid_color, Number(chart_y_min.value), Number(chart_y_max.value)));
watch([chart_y_msg_type], () => {
    const _chart_active_color = DEVICE_UI_CONFIG_MAP[device_model].get_chart_params(chart_y_msg_type.value)?.borderColor ?? accent_color;
    chart_params.borderColor = _chart_active_color;
});

const chart_tool_op = ref();

function create_chart_options(font_color: string, grid_color: string, _y_min: number, _y_max: number, _x_title?: string, _y_title?: string): ChartOptions {
    return {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        color: font_color,
        scales: {
            x: { ticks: { color: font_color }, grid: { color: grid_color }, title: { text: _x_title ?? 'Chart Tool X', display: true, color: font_color } },
            y: _y_min === -1 && _y_max === -1 ?
                {
                    ticks: { color: font_color },
                    grid: { color: grid_color },
                    title: { text: _y_title ?? 'Chart Tool Y', display: true, color: font_color },
                } :
                {
                    ticks: { color: font_color },
                    grid: { color: grid_color },
                    title: { text: _y_title ?? 'Chart Tool Y', display: true, color: font_color },
                    min: _y_min,
                    max: _y_max,
                },
        },
        animation: false,
        plugins: { legend: { display: false } },
    };
}

function show_chart_tool_settings_overlay_panel(_event: MouseEvent) {
    chart_tool_op.value.toggle(_event);
}

function set_chart_y_min_max() {
    const y_min = Number(chart_y_min.value);
    const y_max = Number(chart_y_max.value);
    if (isNaN(y_min) || isNaN(y_max))
        return;

    const x_title = msg_type_chart_name_map.value[chart_x_msg_type.value] ?? msg_type_msg_name_map[chart_x_msg_type.value];
    const y_title = msg_type_chart_name_map.value[chart_y_msg_type.value] ?? msg_type_msg_name_map[chart_y_msg_type.value];
    chart_opts.value = create_chart_options(font_color, chart_grid_color, y_min, y_max, x_title, y_title);
    chart_tool_op.value.hide();
}

function set_chart_auto_scale() {
    const x_title = msg_type_chart_name_map.value[chart_x_msg_type.value] ?? msg_type_msg_name_map[chart_x_msg_type.value];
    const y_title = msg_type_chart_name_map.value[chart_y_msg_type.value] ?? msg_type_msg_name_map[chart_y_msg_type.value];
    if (chart_auto_scale.value)
        chart_opts.value = create_chart_options(font_color, chart_grid_color, -1, -1, x_title, y_title);
    else
        chart_opts.value = create_chart_options(font_color, chart_grid_color, Number(chart_y_min.value), Number(chart_y_max.value), x_title, y_title);
}

function set_chart_x_y_msg_type() {
    const x_title = msg_type_chart_name_map.value[chart_x_msg_type.value] ?? msg_type_msg_name_map[chart_x_msg_type.value];
    const y_title = msg_type_chart_name_map.value[chart_y_msg_type.value] ?? msg_type_msg_name_map[chart_y_msg_type.value];

    if (chart_auto_scale.value)
        chart_opts.value = create_chart_options(font_color, chart_grid_color, -1, -1, x_title, y_title);
    else
        chart_opts.value = create_chart_options(font_color, chart_grid_color, Number(chart_y_min.value), Number(chart_y_max.value), x_title, y_title);

    if (chart_state.value === CHXChartState.RECORDING)
        set_chart_tool_state(CHXChartState.RECORDING);
}

function set_chart_tool_state(_state: CHXChartState) {
    chart_state.value = _state;
    if (_state === CHXChartState.RECORDING) {
        start_epoch = new Date().getTime();
        data_points_cache = {};
    }
}

onBeforeMount(() => {
    subscribe('set_chart_msg_type_name_map', 'set_chart_msg_type_name_map', args => {
        const { _msg_type_chart_name_map } = args;
        msg_type_chart_name_map.value = _msg_type_chart_name_map;
    });
});

function __time_s(): number {
    const time_ms = new Date().getTime() - start_epoch;
    const time_s = time_ms / 1000;
    return Number(time_s.toFixed(1));
}

onMounted(() => {
    subscribe('toggle_chart_tool_panel', 'toggle_chart_tool_panel_visi', _ => {
        const values_map = {
            '8px': '-50vw',
            '-50vw': '8px',
        };
        panel_pos.value = values_map[panel_pos.value];
    });
    subscribe('hide_chart_tool_panel', 'hide_chart_tool_panel', _ => panel_pos.value = '-50vw');

    subscribe('device_config_ready', 'device_config_ready_ChartToolPanel', () => {
        electron_renderer_invoke<MsgTypeConfig[]>(`${device_model}_get_device_config`).then(device_config => {
            if (!device_config)
                return;
            const read_config = device_config.filter(x => x.msg_name.startsWith('READ_'));
            msg_types_opts.value = [
                { label: 'time', value: -1 },
                ...read_config.map(_config => {
                    const label = _config.msg_name.replace('READ_', '');
                    msg_type_msg_name_map[_config.msg_type] = label;

                    return {
                        label,
                        value: _config.msg_type,
                    } as DropdownOption<number>;
                }),
            ];
        });
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        if (chart_state.value === CHXChartState.PAUSED)
            return;

        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        const { msg_value, seq_number } = device_msg;
        if (!data_points_cache[seq_number])
            data_points_cache[seq_number] = [NaN, NaN];

        const _msg_value = Number(msg_value.toFixed(2));
        if (msg_type === chart_x_msg_type.value)
            data_points_cache[seq_number][0] = _msg_value;
        if (msg_type === chart_y_msg_type.value)
            data_points_cache[seq_number][1] = _msg_value;

        if (chart_x_msg_type.value === -1)
            data_points_cache[seq_number][0] = __time_s();
        if (chart_y_msg_type.value === -1)
            data_points_cache[seq_number][1] = __time_s();

        const _data_points = Object.values(data_points_cache).filter(dp => !isNaN(dp[0]) && !isNaN(dp[1])).sort((a, b) => a[0] - b[0]);
        const x_series = _data_points.map(x => x[0]);
        const y_series = _data_points.map(x => x[1]);
        chart_params.data = y_series;
        chart_data.value = {
            labels: x_series,
            datasets: [chart_params],
        };
    });

    set_chart_auto_scale();
});

</script>

<template>
    <div id="chart_tool_panel">
        <Button id="chart_tool_settings_btn" icon="pi pi-cog" @click="show_chart_tool_settings_overlay_panel" text v-tooltip.left="{ value: 'CHART SETTINGS', pt: compute_tooltip_pt('left') }" />
        <OverlayPanel ref="chart_tool_op" :pt="overlay_panel_pt" style="font-family: Cairo, sans-serif;">
            <div style="display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;">
                <div style="width: 280px;">
                    <span style="font-size: 14px; margin-right: 8px; width: 125px; display: inline-block;">Chart Tool Y Range</span>
                    <input class="dt_tf" type="number" v-model="chart_y_min" @keyup.enter="set_chart_y_min_max()" @focus="chart_y_min = ''">
                    <span style="text-align: center;"> - </span>
                    <input class="dt_tf" type="number" v-model="chart_y_max" @keyup.enter="set_chart_y_min_max()" @focus="chart_y_max = ''">
                </div>
                <div style="height: 8px;"></div>
                <div style="display: flex; width: 280px;">
                    <Dropdown :pt="dropdown_pt" :options="msg_types_opts" optionLabel="label" optionValue="value" placeholder="Chart X" title="Chart X" v-model="chart_x_msg_type" @change="set_chart_x_y_msg_type()" />
                    <div style="flex-grow: 1;"></div>
                    <Dropdown :pt="dropdown_pt" :options="msg_types_opts" optionLabel="label" optionValue="value" placeholder="Chart Y" title="Chart Y" v-model="chart_y_msg_type" @change="set_chart_x_y_msg_type()" />
                </div>
                <div style="height: 16px;"></div>
                <div style="display: flex; width: 280px;">
                    <div style="display: flex; justify-content: flex-start; align-items: center;">
                        <Checkbox :pt="checkbox_pt" binary v-model="chart_auto_scale" @change="set_chart_auto_scale()" />
                        <div style="width: 8px;"></div>
                        <span style="font-size: 14px; margin-bottom: 2px;">Auto Scale</span>
                    </div>
                    <div style="flex-grow: 1;"></div>
                    <div>
                        <Button icon="pi pi-play" @click="set_chart_tool_state(CHXChartState.RECORDING)" text :style="{ color: chart_state === CHXChartState.RECORDING ? '#64DD17' : '', width: '32px', height: '32px' }" />
                        <Button icon="pi pi-pause" @click="set_chart_tool_state(CHXChartState.PAUSED)" text :style="{ color: chart_state === CHXChartState.PAUSED ? '#FFAB00' : '', width: '32px', height: '32px' }" />
                    </div>
                </div>
            </div>
        </OverlayPanel>
        <!-- @vue-ignore -->
        <Chart id="chart_tool_chart" type="line" :data="chart_data" :options="chart_opts" />
    </div>
</template>

<style scoped>
#chart_tool_panel {
    width: calc(100% - 16px);
    height: 320px;
    background-color: var(--light-bg-color);
    left: v-bind(panel_pos);
    top: 16px;
    border-radius: 4px;
    border: 1px solid var(--empty-gauge-color);
    z-index: 3;
    transition: 0.3s ease;
}

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

#chart_tool_settings_btn {
    position: absolute;
    top: 8px;
    right: 16px;
    z-index: 1;
    width: 32px;
    height: 32px;
    color: var(--accent-color);
}

#chart_tool_chart {
    height: calc(100% - 16px);
    width: calc(100% - 16px);
    margin: 8px;
    border-radius: 4px;
    background-color: var(--dark-bg-color);
    border: 1px solid var(--empty-gauge-color);
}
</style>