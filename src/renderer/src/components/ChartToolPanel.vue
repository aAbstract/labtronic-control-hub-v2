<script setup lang="ts">

import { shallowRef, onMounted, onBeforeMount, inject, ref, computed } from 'vue';
import Chart from 'primevue/chart';
import { ChartOptions, ChartData, ChartEvent, Chart as _Chart } from 'chart.js';
import Button from 'primevue/button';
import OverlayPanel from 'primevue/overlaypanel';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';

import { DeviceMsg, DropdownOption, CHXChartState, MsgTypeConfig } from '@common/models';
import { ChartParams, DEVICE_UI_CONFIG_MAP } from '@renderer/lib/device_ui_config';
import { compute_tooltip_pt, electron_renderer_invoke } from '@renderer/lib/util';
import { subscribe } from '@common/mediator';
import { screenshot_handlers } from '@renderer/lib/screenshot';

type DataPointType = Record<string, number>;

const CHART_FPS = 30;
const dt_ms = Math.round((1 / CHART_FPS) * 1000);
const device_model = inject('device_model') as string;
const accent_color = document.documentElement.style.getPropertyValue('--accent-color');
const font_color = document.documentElement.style.getPropertyValue('--font-color');
const chart_grid_color = document.documentElement.style.getPropertyValue('--empty-gauge-color');

let start_epoch = new Date().getTime();
let data_points_cache: Record<number, DataPointType> = {};
let msg_type_msg_name_map = {};
let points_changed: boolean = false;

const msg_types_opts = shallowRef<DropdownOption<number>[]>([]);
const msg_type_chart_name_map = shallowRef<Record<number, string>>({});

const panel_pos = ref('-50vw');
const panel_expand = ref(false);
const panel_width = computed(() => panel_expand.value ? 'calc(100vw - 76px)' : 'calc(100% - 16px)');

const overlay_panel_pt = {
    root: { style: 'max-height: 280px; overflow-y: scroll;' },
    content: { style: 'padding: 8px;' },
};
const dropdown_pt: any = {
    root: { style: 'background-color: transparent; border: 1px solid var(--font-color); height: 30px;' },
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
const chart_state = ref(CHXChartState.STOPPED);
const chart_x_msg_type = ref(-1);
const chart_y_msg_type_arr = ref<number[]>([]);
const chart_auto_scale = ref(true);
const chart_opts = shallowRef(create_chart_options(font_color, chart_grid_color, Number(chart_y_min.value), Number(chart_y_max.value)));

const chart_params = computed(() => {
    const _chart_params_map: Record<number, ChartParams> = {};
    msg_types_opts.value.forEach(opt => {
        if (opt.value === -2)
            return;
        _chart_params_map[opt.value] = new ChartParams(opt.label, DEVICE_UI_CONFIG_MAP[device_model].get_chart_params(opt.value)?.borderColor ?? accent_color);
    });
    return _chart_params_map;
});

const chart_tool_op = ref();
const chart_cursor_info_op = ref();
const chart_cursor_info_values = shallowRef<Record<number, number>>({});

function on_chart_click(chart_event: ChartEvent) {
    if (!chart_data.value.labels)
        return;
    const _chart: _Chart = (chart_event as any).chart;
    const x_idx = _chart.scales.x.getValueForPixel(chart_event.x as number) as number;
    const x_offset = _chart.scales.x.getPixelForValue(x_idx) as number;

    const x_msg_type = chart_x_msg_type.value;
    const _x_val = chart_data.value.labels[x_idx] as number;
    if (isNaN(_x_val))
        return;
    const data_point = Object.values(data_points_cache).find(dp => dp[x_msg_type] === _x_val) ?? {};
    const _cursor_info: Record<number, number> = {};
    Object.keys(data_point).forEach(msg_type => _cursor_info[msg_type] = data_point[msg_type]);
    chart_cursor_info_values.value = _cursor_info;

    _chart.draw();
    const _ch = _chart.ctx.canvas.height;
    _chart.ctx.beginPath();
    _chart.ctx.moveTo(x_offset, _ch - 40);
    _chart.ctx.lineTo(x_offset, 12);
    _chart.ctx.lineWidth = 1;
    _chart.ctx.strokeStyle = accent_color;
    _chart.ctx.stroke();
}

function create_chart_options(font_color: string, grid_color: string, _y_min: number, _y_max: number, _x_title?: string): ChartOptions {
    return {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        color: font_color,
        scales: {
            x: { ticks: { color: font_color }, grid: { color: grid_color }, title: { text: _x_title ?? 'Time [s]', display: true, color: font_color } },
            y: _y_min === -1 && _y_max === -1 ?
                {
                    ticks: { color: font_color },
                    grid: { color: grid_color },
                } :
                {
                    ticks: { color: font_color },
                    grid: { color: grid_color },
                    min: _y_min,
                    max: _y_max,
                },
        },
        animation: false,
        plugins: { legend: { display: false } },
        onClick: on_chart_click,
    };
}

function show_chart_tool_settings_overlay_panel(_event: MouseEvent) {
    chart_tool_op.value.toggle(_event);
}

function show_chart_cursor_info_op_overlay_panel(_event: MouseEvent) {
    chart_cursor_info_op.value.toggle(_event);
}

function set_chart_y_min_max() {
    const y_min = Number(chart_y_min.value);
    const y_max = Number(chart_y_max.value);
    if (isNaN(y_min) || isNaN(y_max))
        return;

    const x_title = msg_type_chart_name_map.value[chart_x_msg_type.value] ?? msg_type_msg_name_map[chart_x_msg_type.value];
    chart_opts.value = create_chart_options(font_color, chart_grid_color, y_min, y_max, x_title);
    chart_tool_op.value.hide();
}

function set_chart_auto_scale() {
    const x_title = msg_type_chart_name_map.value[chart_x_msg_type.value] ?? msg_type_msg_name_map[chart_x_msg_type.value];
    if (chart_auto_scale.value)
        chart_opts.value = create_chart_options(font_color, chart_grid_color, -1, -1, x_title);
    else
        chart_opts.value = create_chart_options(font_color, chart_grid_color, Number(chart_y_min.value), Number(chart_y_max.value), x_title);
}

function set_chart_x_y_msg_type() {
    const x_title = msg_type_chart_name_map.value[chart_x_msg_type.value] ?? msg_type_msg_name_map[chart_x_msg_type.value];

    if (chart_auto_scale.value)
        chart_opts.value = create_chart_options(font_color, chart_grid_color, -1, -1, x_title);
    else
        chart_opts.value = create_chart_options(font_color, chart_grid_color, Number(chart_y_min.value), Number(chart_y_max.value), x_title);

    if (chart_state.value === CHXChartState.RECORDING)
        set_chart_tool_state(CHXChartState.RECORDING);
}

function set_chart_tool_state(_state: CHXChartState) {
    chart_state.value = _state;
    if (_state === CHXChartState.STOPPED) {
        data_points_cache = {};
        points_changed = true;
    }

    else if (_state === CHXChartState.RECORDING)
        start_epoch = new Date().getTime();
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

function __msg_type_color(msg_type: number): string {
    return chart_params.value[msg_type]?.borderColor ?? accent_color;
}

function render_chart() {
    const __x = chart_x_msg_type.value;
    const _data_points = Object.values(data_points_cache).filter(dp => !isNaN(dp[__x])).sort((a, b) => a[__x] - b[__x]);
    const x_series = _data_points.map(x => x[__x]);
    const _datasets: ChartParams[] = [];
    chart_y_msg_type_arr.value.forEach(__y => {
        if (__y === -2)
            return;
        const _chart_params = chart_params.value[__y];
        _chart_params.data = _data_points.map(x => x[__y]);
        _datasets.push(_chart_params);
    });
    chart_data.value = {
        labels: x_series,
        datasets: _datasets,
    };
}

onMounted(() => {
    subscribe('toggle_chart_tool_panel', 'toggle_chart_tool_panel_visi', _ => {
        const values_map = {
            '8px': '-50vw',
            '-50vw': '8px',
        };
        panel_pos.value = values_map[panel_pos.value];

        if (panel_pos.value === '-50vw')
            panel_expand.value = false;
    });
    subscribe('hide_chart_tool_panel', 'hide_chart_tool_panel', _ => { panel_pos.value = '-50vw'; panel_expand.value = false });

    subscribe('device_config_ready', 'device_config_ready_ChartToolPanel', () => {
        electron_renderer_invoke<MsgTypeConfig[]>(`${device_model}_get_device_config`).then(device_config => {
            if (!device_config)
                return;
            const read_config = device_config.filter(x => x.msg_name.startsWith('READ_'));
            msg_types_opts.value = [
                { label: 'NONE', value: -2 },
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
        if (chart_state.value !== CHXChartState.RECORDING)
            return;

        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        const { msg_value, seq_number } = device_msg;
        const _msg_value = Number(msg_value.toFixed(2));

        if (!data_points_cache[seq_number])
            data_points_cache[seq_number] = { [-1]: __time_s() };
        data_points_cache[seq_number][msg_type] = _msg_value;

        points_changed = true;
    });

    setInterval(() => {
        if (!points_changed)
            return;
        render_chart();
        points_changed = false;
    }, dt_ms);

    set_chart_auto_scale();
});

</script>

<template>
    <div id="chart_tool_panel" v-on="screenshot_handlers">
        <Button style="top: 8px; right: 8px;" class="chart_tool_btn" icon="pi pi-expand" @click="panel_expand = !panel_expand" text />
        <Button style="top: 8px; right: 40px;" class="chart_tool_btn" icon="pi pi-cog" @click="show_chart_tool_settings_overlay_panel" text v-tooltip.left="{ value: 'CHART SETTINGS', pt: compute_tooltip_pt('left') }" />
        <Button style="top: 8px; right: 72px;" id="chart_cursor_info_btn" class="chart_tool_btn" icon="pi pi-info-circle" @click="show_chart_cursor_info_op_overlay_panel" text />
        <OverlayPanel ref="chart_cursor_info_op" :pt="overlay_panel_pt" style="font-family: Cairo, sans-serif;" :dismissable="false">
            <div id="cci_cont">
                <span style="color: var(--font-color);" v-if="chart_y_msg_type_arr.length === 0">No Variables Selected</span>
                <div v-if="chart_x_msg_type !== -2" class="cci_row" :style="{ color: __msg_type_color(chart_x_msg_type) }">
                    <span>{{ msg_type_chart_name_map[chart_x_msg_type] }}: </span>
                    <span>{{ chart_cursor_info_values[chart_x_msg_type] ?? '00.0' }}</span>
                </div>
                <div v-if="chart_y_msg_type_arr.length !== 0" v-for="cci_label_msg_type in chart_y_msg_type_arr" class="cci_row" :style="{ color: __msg_type_color(cci_label_msg_type) }">
                    <span>{{ msg_type_chart_name_map[cci_label_msg_type] }}: </span>
                    <span>{{ chart_cursor_info_values[cci_label_msg_type] ?? '00.0' }}</span>
                </div>
                <div style="display: flex; justify-content: flex-end; align-items: center; width: 100%; margin-top: 8px;">
                    <Button style="width: 24px; height: 24px;" icon="pi pi-times" @click="chart_cursor_info_op.hide()" text />
                </div>
            </div>
        </OverlayPanel>
        <OverlayPanel ref="chart_tool_op" :pt="overlay_panel_pt" style="font-family: Cairo, sans-serif;">
            <div style="display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;">
                <div style="width: 280px;">
                    <span style="font-size: 14px; margin-right: 8px; width: 125px; display: inline-block;">Chart Tool Y Range</span>
                    <input class="dt_tf" type="number" v-model="chart_y_min" @keyup.enter="set_chart_y_min_max()" @focus="chart_y_min = ''">
                    <span style="text-align: center;"> - </span>
                    <input class="dt_tf" type="number" v-model="chart_y_max" @keyup.enter="set_chart_y_min_max()" @focus="chart_y_max = ''">
                </div>
                <div style="height: 8px;"></div>
                <div style="width: 280px; display: flex; flex-direction: column; justify-content: flex-start; align-items: center;">
                    <Dropdown style="width: 100%;" :pt="dropdown_pt" :options="msg_types_opts.slice(1)" optionLabel="label" optionValue="value" placeholder="Chart X" title="Chart X" v-model="chart_x_msg_type" @change="set_chart_x_y_msg_type()" />
                    <div style="height: 8px;"></div>
                    <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%; flex-wrap: wrap; gap: 8px;">
                        <Dropdown v-for="(_, y_msg_type_idx) in msg_types_opts" style="width: calc(50% - 4px);" :pt="dropdown_pt" :options="msg_types_opts" optionLabel="label" optionValue="value" :placeholder="`Chart Y ${y_msg_type_idx + 1}`" :title="`Chart Y ${y_msg_type_idx + 1}`" v-model="chart_y_msg_type_arr[y_msg_type_idx]" @change="set_chart_x_y_msg_type()" />
                    </div>
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
                        <Button icon="pi pi-stop" @click="set_chart_tool_state(CHXChartState.STOPPED)" text style="color: #DD2C00; width: 32px; height: 32px;" />
                    </div>
                </div>
            </div>
        </OverlayPanel>
        <!-- @vue-ignore -->
        <Chart id="chart_tool_chart" type="line" :data="chart_data" :options="chart_opts" />
    </div>
</template>

<style scoped>
.cci_row {
    width: 200px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

#cci_cont span {
    font-size: 14px;
    font-weight: bold;
}

#cci_cont {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
}

#chart_tool_panel {
    width: v-bind(panel_width);
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

.chart_tool_btn {
    position: absolute;
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