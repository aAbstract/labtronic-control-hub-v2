<script setup lang="ts">

import { onMounted, shallowRef, watch } from 'vue';
import { ChartData, ChartEvent, ChartOptions, Chart as _Chart } from 'chart.js';
import Chart from 'primevue/chart';

import { ChartParams } from '@renderer/lib/device_ui_config';
import { subscribe } from '@common/mediator';

interface ChartMarker {
    x_val: string;
    y_val: string;
    marker_line_x_offset: number;
};

const font_color = document.documentElement.style.getPropertyValue('--font-color');
const chart_grid_color = document.documentElement.style.getPropertyValue('--empty-gauge-color');
const accent_color = document.documentElement.style.getPropertyValue('--accent-color');
const props = defineProps<{
    chart_title: string,
    line_color: string,
    x_param: number,
    y_param: number,
    chart_idx: number,
}>();

let chart_marker: ChartMarker | null = null;
const chart_data = shallowRef<ChartData>({
    labels: [],
    datasets: [],
});

function on_chart_click(chart_event: ChartEvent) {
    if (!chart_data.value.labels)
        return;
    const _chart: _Chart = (chart_event as any).chart;
    const x_idx = _chart.scales.x.getValueForPixel(chart_event.x as number) as number;
    const x_offset = _chart.scales.x.getPixelForValue(x_idx) as number;
    const _x_val = chart_data.value.labels[x_idx] as number;
    const _y_val = chart_data.value.datasets[0].data[x_idx] as number;
    if (isNaN(_x_val) || isNaN(_y_val))
        return;
    chart_marker = {
        x_val: _x_val.toFixed(2),
        y_val: _y_val.toFixed(2),
        marker_line_x_offset: x_offset,
    };
    _chart.draw();
    draw_chart_markers(_chart.ctx, chart_marker);
}

function create_chart_options(font_color: string, grid_color: string, y_min: number, y_max: number): ChartOptions {
    const chart_params = new ChartParams(props.chart_title, props.line_color);
    chart_params.tension = 0;
    if (chart_data.value.datasets.length > 0)
        chart_params.data = chart_data.value.datasets[0].data as number[];
    chart_data.value = {
        labels: chart_data.value.labels,
        datasets: [chart_params],
    };

    return {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        animation: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { ticks: { color: font_color }, grid: { color: grid_color }, title: { text: props.chart_title.split(' - ')[0], display: true, color: font_color } },
            y: { ticks: { color: font_color }, grid: { color: grid_color }, title: { text: props.chart_title.split(' - ')[1], display: true, color: font_color }, min: y_min, max: y_max },
        },
        onClick: on_chart_click,
    }
}

const chart_opts = shallowRef<ChartOptions>(create_chart_options(font_color, chart_grid_color, 0, 10));
watch(props, () => chart_opts.value = create_chart_options(font_color, chart_grid_color, 0, 10));

function draw_chart_markers(_ctx: CanvasRenderingContext2D, _chart_marker: ChartMarker | null) {
    if (!_ctx || !_chart_marker)
        return;
    const _ch = _ctx.canvas.height;

    // draw marker line
    _ctx.beginPath();
    _ctx.moveTo(_chart_marker.marker_line_x_offset, _ch - 40);
    _ctx.lineTo(_chart_marker.marker_line_x_offset, 12);
    _ctx.lineWidth = 1;
    _ctx.strokeStyle = accent_color;
    _ctx.stroke();

    // draw marker text
    _ctx.fillStyle = accent_color;
    _ctx.font = 'bold 12px "Lucida Console", "Courier New", monospace';
    _ctx.fillText(`x: ${_chart_marker.x_val}, y: ${_chart_marker.y_val}`, 24, _ch - 12);
}

function render_chart() {
    // trigger shallowRef UI change
    const new_chart_data: ChartData = { ...chart_data.value };
    chart_data.value = new_chart_data;
}

function __time_s(time_ms: number): number {
    const time_s = time_ms / 1000;
    return Number(time_s.toFixed(1));
}

onMounted(() => {
    subscribe('record_data_point', `record_data_point_${props.chart_idx}`, args => {
        const _data_point: Record<string, number> = args._data_point;
        const _x = Number(props.x_param === -1 ? __time_s(_data_point['time_ms']) : _data_point[props.x_param].toFixed(2));
        const _y = Number(_data_point[props.y_param].toFixed(2));
        chart_data.value.labels?.push(_x);
        chart_data.value.datasets[0].data.push(_y);
        render_chart();
    });

    subscribe('clear_recorded_data', `clear_recorded_data_${props.chart_idx}`, () => {
        chart_data.value.labels = [];
        chart_data.value.datasets[0].data = [];
        render_chart();
    });

    subscribe('update_chx_series_chart_y_min_max', `update_chx_series_chart_y_min_max_${props.chart_title}`, args => {
        const chx_series_name: string = args.chx_series_name;
        if (!chx_series_name)
            return;
        if (chx_series_name !== props.chart_title)
            return;

        const y_min: number = args.y_min;
        const y_max: number = args.y_max;
        chart_opts.value = create_chart_options(font_color, chart_grid_color, y_min, y_max);
    });
});

</script>

<template>
    <Chart class="small_chart" type="line" :title="chart_title" :data="chart_data" :options="chart_opts" />
</template>

<style scoped>
.small_chart {
    width: calc(100% - 16px);
    margin: auto;
    height: 25vh;
    background-color: var(--dark-bg-color);
    border: 1px solid var(--empty-gauge-color);
    border-radius: 4px;
}
</style>