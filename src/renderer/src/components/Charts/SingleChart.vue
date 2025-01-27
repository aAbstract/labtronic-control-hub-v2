<script setup lang="ts">

import { shallowRef, onMounted, inject, ref } from 'vue';
import { ChartOptions, ChartData, Plugin, Chart as _Chart } from 'chart.js';
import Chart from 'primevue/chart';

import { PlotSeries, MsgTypeConfig, CHXChartState } from '@common/models';
import { DeviceUIConfig } from '@renderer/lib/device_ui_config';
import { subscribe } from '@common/mediator';
import { add_log, electron_renderer_invoke } from '@renderer/lib/util';
// @ts-ignore
import { DeviceMsg } from '@common/models';

// @ts-ignore
const CHART_POINTS_LIMIT = 32;
let points_data: Record<number, PlotSeries> = {};
let points_changed: boolean = false;
const device_model = inject('device_model');
let active_msg_type = -1;
const props = defineProps<{ device_ui_config: DeviceUIConfig, fps: number }>();
const dt_ms = Math.round((1 / props.fps) * 1000);
const chart_opts = shallowRef({});
const chart_data = shallowRef<ChartData>();

const chart_state = ref(CHXChartState.RECORDING);
const chart_auto_scale = ref(false);

let _y_min = 0;
let _y_max = 100;

let _sn = 0;
const accent_color = document.documentElement.style.getPropertyValue('--accent-color');
const sn_plugin: Plugin = {
    id: 'sn_plugin',
    afterRender(chart: _Chart, _1, _2) {
        const ctx = chart.ctx;
        if (!ctx)
            return;
        ctx.fillStyle = accent_color;
        ctx.font = 'bold 12px "Lucida Console", "Courier New", monospace';
        ctx.fillText(`SN: ${_sn}`, chart.width - 100, 12);
    },
};

function create_chart_options(font_color: string, grid_color: string, y_min: number, y_max: number): ChartOptions {
    return {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        color: font_color,
        scales: {
            x: { ticks: { color: font_color, display: false }, grid: { color: grid_color } },
            y: y_min === -1 && y_max === -1 ? { ticks: { color: font_color }, grid: { color: grid_color } } : { ticks: { color: font_color }, grid: { color: grid_color }, min: y_min, max: y_max },
        },
        animation: false,
        plugins: { legend: { display: false } },
    };
}

function render_chart() {
    const chart_params = props.device_ui_config.get_chart_params(active_msg_type);
    if (!chart_params) {
        add_log({ level: 'ERROR', msg: `Invalid Plot Channel, active_msg_type=${active_msg_type}` });
        return;
    }
    const new_chart_data: ChartData = {
        labels: [],
        datasets: [chart_params],
    };
    new_chart_data.labels = points_data[active_msg_type].x;
    new_chart_data.datasets[0].data = points_data[active_msg_type].y;
    chart_data.value = new_chart_data;
}

onMounted(() => {
    const chart_font_color = document.documentElement.style.getPropertyValue('--font-color');
    const chart_grid_color = document.documentElement.style.getPropertyValue('--empty-gauge-color');
    chart_opts.value = create_chart_options(chart_font_color, chart_grid_color, _y_min, _y_max);

    // auto construct points data cache struct using device driver config
    subscribe('device_config_ready', 'device_config_ready_SingleChart', () => {
        electron_renderer_invoke<MsgTypeConfig[]>(`${device_model}_get_device_config`).then(device_config => {
            if (!device_config)
                return;
            const read_config = device_config.filter(x => x.msg_name.startsWith('READ_'));
            active_msg_type = read_config[0].msg_type;
            points_data = {};
            read_config.forEach(_read_config => points_data[_read_config.msg_type] = { x: [], y: [] });
            render_chart();
        });
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        if (chart_state.value === CHXChartState.PAUSED)
            return;

        const device_msg: DeviceMsg = data.device_msg;
        _sn = device_msg.seq_number;
        const { msg_type } = device_msg.config;
        if (msg_type in points_data) {
            points_data[msg_type].x.push(device_msg.seq_number);
            points_data[msg_type].y.push(device_msg.msg_value);
            if (points_data[msg_type].x.length >= CHART_POINTS_LIMIT) {
                points_data[msg_type].x.shift();
                points_data[msg_type].y.shift();
            }
            points_changed = true;
        }
    });

    setInterval(() => {
        if (!points_changed)
            return;
        render_chart();
        points_changed = false;
    }, dt_ms);

    subscribe('change_plot_channel', 'change_plot_channel', args => {
        const { new_msg_type } = args;
        active_msg_type = new_msg_type;
        render_chart();
    });

    subscribe('update_single_chart_y_min_max', 'update_single_chart_y_min_max', args => {
        const y_min: number = args.y_min;
        const y_max: number = args.y_max;
        _y_min = y_min;
        _y_max = y_max;
        chart_opts.value = create_chart_options(chart_font_color, chart_grid_color, y_min, y_max);
    });

    subscribe('set_single_chart_state', 'set_single_chart_state', args => {
        const { chx_chart_state } = args;
        chart_state.value = chx_chart_state;
    });

    subscribe('set_single_chart_auto_scale', 'set_single_chart_auto_scale', args => {
        const { chx_chart_auto_scale } = args;
        chart_auto_scale.value = chx_chart_auto_scale;

        if (chx_chart_auto_scale)
            chart_opts.value = create_chart_options(chart_font_color, chart_grid_color, -1, -1);
        else
            chart_opts.value = create_chart_options(chart_font_color, chart_grid_color, _y_min, _y_max);
    });
});

</script>

<template>
    <Chart type="line" :data="chart_data" :options="chart_opts" :plugins="[sn_plugin]" />
</template>