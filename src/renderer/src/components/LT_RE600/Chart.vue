<script setup lang="ts">

import { shallowRef, onMounted, inject } from 'vue';
import Chart from 'primevue/chart';
import { ChartOptions, ChartData } from 'chart.js';
import { DeviceMsg } from '@common/models';
import { ChartParams } from '@renderer/lib/device_ui_config';

const props = defineProps<{
    x_msg_type: number;
    x_title: string;
    y_msg_type: number;
    y_title: string;
    line_color: string;
}>();

const device_model = inject('device_model');
const font_color = document.documentElement.style.getPropertyValue('--font-color');
const chart_grid_color = document.documentElement.style.getPropertyValue('--empty-gauge-color');
const chart_opts = shallowRef(create_chart_options(font_color, chart_grid_color, 0, 100));
const data_points_cache: Record<number, [number, number]> = {};
const chart_params = new ChartParams('', props.line_color);
const chart_data = shallowRef<ChartData>({
    labels: [],
    datasets: [],
});

function create_chart_options(font_color: string, grid_color: string, _y_min: number, _y_max: number): ChartOptions {
    return {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        color: font_color,
        scales: {
            x: { ticks: { color: font_color }, grid: { color: grid_color }, title: { text: props.x_title, display: true, color: font_color } },
            y: { ticks: { color: font_color }, grid: { color: grid_color }, title: { text: props.y_title, display: true, color: font_color } },
        },
        animation: false,
        plugins: { legend: { display: false } },
    };
}

onMounted(() => {
    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        const { msg_value, seq_number } = device_msg;
        if (!data_points_cache[seq_number])
            data_points_cache[seq_number] = [NaN, NaN];

        if (msg_type === props.x_msg_type)
            data_points_cache[seq_number][0] = msg_value;
        else if (msg_type === props.y_msg_type)
            data_points_cache[seq_number][1] = msg_value;

        const _data_points = Object.values(data_points_cache).filter(dp => !isNaN(dp[0]) && !isNaN(dp[1])).sort((a, b) => a[0] - b[0]);
        const x_series = _data_points.map(x => x[0]);
        const y_series = _data_points.map(x => x[1]);
        chart_params.data = y_series;
        chart_data.value = {
            labels: x_series,
            datasets: [chart_params],
        };
    });
});

</script>

<template>
    <Chart class="lt_re600_chart" type="line" :data="chart_data" :options="chart_opts" />
</template>

<style scoped>
.lt_re600_chart {
    height: 34vh;
    width: calc(100% - 16px);
    margin: 8px;
    border-radius: 4px;
    background-color: var(--dark-bg-color);
    border: 1px solid var(--empty-gauge-color);
}
</style>