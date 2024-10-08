<script setup lang="ts">

import { inject, onMounted, shallowRef, ref } from 'vue';
import { ChartOptions, ChartData } from 'chart.js';
import Chart from 'primevue/chart';

import { ChartParams, DeviceUIConfig } from '@renderer/lib/device_ui_config';
import { PlotSeries, MsgTypeConfig } from '@common/models';
import { subscribe } from '@common/mediator';
import { electron_renderer_invoke } from '@renderer/lib/util';
// @ts-ignore
import { DeviceMsg } from '@common/models';

// @ts-ignore
const CHART_POINTS_LIMIT = 100;
let points_data: Record<number, PlotSeries> = {};
let points_changed: boolean = false;
const device_model = inject('device_model');
const props = defineProps<{ device_ui_config: DeviceUIConfig, fps: number }>();
const dt_ms = Math.round((1 / props.fps) * 1000);
const chart_opts = shallowRef({});
const chart_data = shallowRef<ChartData>();
const msg_type_state_map = ref<Record<number, boolean>>({});

function create_chart_options(font_color: string, grid_color: string, y_min: number, y_max: number): ChartOptions {
    return {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        color: font_color,
        scales: {
            x: { ticks: { color: font_color, display: false }, grid: { color: grid_color } },
            y: { ticks: { color: font_color }, grid: { color: grid_color }, min: y_min, max: y_max },
        },
        animation: false,
        plugins: { legend: { display: false } },
    };
}

function render_chart() {
    let labels: number[] = [];
    let datasets: ChartParams[] = [];

    for (const msg_type in msg_type_state_map.value) {
        if (!msg_type_state_map.value[msg_type])
            continue;
        const msg_type_plot_series = points_data[msg_type];
        // choose longest x series
        if (msg_type_plot_series.x.length > labels.length)
            labels = msg_type_plot_series.x;
        const msg_type_chart_params = props.device_ui_config.get_chart_params(Number(msg_type));
        if (!msg_type_chart_params)
            continue;
        msg_type_chart_params.data = points_data[msg_type].y;
        datasets.push(msg_type_chart_params);
    }

    const new_chart_data: ChartData = { labels, datasets };
    chart_data.value = new_chart_data;
}

onMounted(() => {
    const chart_font_color = document.documentElement.style.getPropertyValue('--font-color');
    const chart_grid_color = document.documentElement.style.getPropertyValue('--empty-gauge-color');
    chart_opts.value = create_chart_options(chart_font_color, chart_grid_color, 0, 100);

    // auto construct points data cache struct using device driver config
    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
        electron_renderer_invoke<MsgTypeConfig[]>(`${device_model}_get_device_config`).then(device_config => {
            if (!device_config)
                return;
            const read_config = device_config.filter(x => x.msg_name.startsWith('READ_'));
            points_data = {};
            msg_type_state_map.value = {};
            read_config.forEach(_read_config => {
                msg_type_state_map.value[_read_config.msg_type] = true;
                points_data[_read_config.msg_type] = { x: [], y: [] };
            });
            const chart_params = read_config.map(x => props.device_ui_config.get_chart_params(x.msg_type)) as ChartParams[];
            const new_chart_data: ChartData = {
                labels: [],
                datasets: chart_params,
            };
            chart_data.value = new_chart_data;
        });
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: DeviceMsg = data.device_msg;
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

    subscribe('change_plot_channels', 'change_plot_channels', args => {
        const { new_msg_type_state_map } = args;
        msg_type_state_map.value = new_msg_type_state_map;
        render_chart();
    });

    subscribe('update_multi_chart_y_min_max', 'update_multi_chart_y_min_max', args => {
        const y_min: number = args.y_min;
        const y_max: number = args.y_max;
        chart_opts.value = create_chart_options(chart_font_color, chart_grid_color, y_min, y_max);
    });
});

</script>

<template>
    <Chart type="line" :data="chart_data" :options="chart_opts" />
</template>