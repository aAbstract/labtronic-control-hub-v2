<script setup lang="ts">

import { ref, computed, shallowRef, onMounted, inject } from 'vue';
import Dropdown from 'primevue/dropdown';
import { ChartOptions, Plugin, Chart as _Chart, ChartData } from 'chart.js';
import Chart from 'primevue/chart';

import { DropdownOption, DeviceMsg, MsgTypeConfig } from '@common/models';
import { ChartParams } from '@renderer/lib/device_ui_config';
import { post_event } from '@common/mediator';
import { electron_renderer_invoke } from '@renderer/lib/util';

const device_model = inject('device_model');
const heater_power = ref(0);
const dropdown_pt: any = {
    root: { style: 'background-color: transparent; border: 1px solid var(--font-color); width: 140px; height: 30px;' },
    input: { style: 'padding: 0px 8px; color: var(--font-color); font-family: Cairo, sans-serif; font-size: 14px; font-weight: bold;' },
    panel: { style: 'background-color: var(--light-bg-color); font-family: Cairo, sans-serif;' },
    emptyMessage: { style: 'color: var(--font-color);' },
    item: { style: 'background-color: var(--light-bg-color); color: var(--font-color);' },
    trigger: { style: 'width: fit-content; padding-right: 8px;' },
    list: { style: 'padding: 0px;' },
};
// @ts-ignore
let cache_changed = false;

// dropdowns
const sample_shape = ref(4);
const sample_shape_desc = computed(() => sample_shape_desc_map[sample_shape.value]);
const sample_shape_opts: DropdownOption<number>[] = [
    { label: 'Disconnected Sample', value: 0 },
    { label: 'Linear Sample 1', value: 1 },
    { label: 'Linear Sample 2', value: 2 },
    { label: 'Linear Sample 3', value: 3 },
    { label: 'Radial Sample', value: 4 },

];
const sample_shape_desc_map: Record<number, string> = {
    0: 'Disconnected Sample',
    1: 'Brass: D=25mm, L=30mm',
    2: 'Stainless Steel: D=25mm, L=30mm',
    3: 'Brass: D=15mm, L=30mm',
    4: 'Brass: D=110mm, Thick=8mm',
};
const sample_shape_asset_map: Record<number, string> = {
    0: 'lt_ht107_disconnected_sample',
    1: 'lt_ht107_linear_brass_d25',
    2: 'lt_ht107_linear_stainless_steel_d25',
    3: 'lt_ht107_linear_brass_d15',
    4: 'lt_ht107_radial_brass_d110',
};
// const sample_shape_device_mode_map: Record<number, LT_HT107_DeviceMode> = {
//     0: LT_HT107_DeviceMode.SAMPLE_DISCONNECTED,
//     1: LT_HT107_DeviceMode.LINEAR_1,
//     2: LT_HT107_DeviceMode.LINEAR_2,
//     3: LT_HT107_DeviceMode.LINEAR_3,
//     4: LT_HT107_DeviceMode.RADIAL,
// };

function sample_select() {
    const _sample_shape = sample_shape.value;
    const _asset = sample_shape_asset_map[_sample_shape];
    if (_sample_shape === 0)
        post_event('show_device_model_panel_msg', { severity: 'warn', content: 'No Sample is Connected' });
    else
        post_event('change_device_model_asset', { _asset });
}
// dropdowns

// pos_chart
const readings = ref<[number, number][]>([]);
let readings_msg_types = new Set();
const chart_data = shallowRef<ChartData>({
    labels: [],
    datasets: [],
});
const accent_color = document.documentElement.style.getPropertyValue('--accent-color');
const font_color = document.documentElement.style.getPropertyValue('--font-color');
const chart_grid_color = document.documentElement.style.getPropertyValue('--empty-gauge-color');
const chart_title = 'Position Chart';
let _epoch = 0;
const epoch_plugin: Plugin = {
    id: 'epoch_plugin',
    afterRender(chart: _Chart, _1, _2) {
        const ctx = chart.ctx;
        if (!ctx)
            return;
        ctx.fillStyle = accent_color;
        ctx.font = 'bold 12px "Lucida Console", "Courier New", monospace';
        ctx.fillText(`EPOCH: ${_epoch}`, chart.width - 100, 12);
    },
};
const chart_opts = shallowRef<ChartOptions>({
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    animation: false,
    plugins: {
        legend: { display: false },
        epoch_plugin: { display: true },
    } as any,
    scales: {
        x: { ticks: { color: font_color }, grid: { color: chart_grid_color }, title: { text: 'Position [mm]', display: true, color: font_color } },
        y: { ticks: { color: font_color }, grid: { color: chart_grid_color }, title: { text: 'Temprature [Celsius]', display: true, color: font_color }, min: 25, max: 100 },
    },
});
// post_chart

function map_heater_power_color_code(heater_power: number): string {
    if (heater_power > 0 && heater_power <= 40)
        return '#64DD17';
    if (heater_power > 45 && heater_power <= 80)
        return '#FFAB00';
    if (heater_power > 85 && heater_power <= 120)
        return '#DD2C00';
    if (isNaN(heater_power))
        return font_color;
    return '#DD2C00';
}

function update_position_chart() {
    const chart_params = new ChartParams(chart_title, map_heater_power_color_code(heater_power.value));
    chart_params.tension = 0;
    chart_params.pointRadius = 4;
    chart_params.data = readings.value.map(x => x[1]);
    chart_data.value = {
        labels: readings.value.map(x => x[0]),
        datasets: [chart_params],
    };
}

const P_HEATER_MASG_TYPE = 13;
const cfg2_set = new Set([0xA0, 0xA1, 0xA2, 0xA3, 0xA4]);
onMounted(() => {
    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type, cfg2 } = device_msg.config;
        const { seq_number, msg_value } = device_msg;
        if (msg_type === P_HEATER_MASG_TYPE)
            heater_power.value = msg_value;

        if (readings_msg_types.has(msg_type)) {
            readings.value[msg_type][1] = msg_value;
            cache_changed = true;
        }

        _epoch = seq_number;

        // handle cfg2
        if (cfg2_set.has(cfg2) && (cfg2 - 0xA0) != sample_shape.value) {
            sample_shape.value = cfg2 - 0xA0;
            sample_select();
        }
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
        electron_renderer_invoke<MsgTypeConfig[]>(`${device_model}_get_device_config`).then(_device_config => {
            if (!_device_config)
                return;
            const read_config = _device_config.filter(x => x.msg_name.startsWith('READ_'));
            readings.value = read_config.map(x => [x.msg_type * 10, 0]);
            readings_msg_types = new Set(read_config.map(x => x.msg_type));
            // auto device mode switch
            if (read_config.length === 6) // radial mode
                sample_shape.value = 4;
            sample_select();
            update_position_chart();
        });
    });

    setInterval(() => {
        if (!cache_changed)
            return;
        update_position_chart();
        cache_changed = false;
    }, 1000);
});

</script>

<template>
    <div id="lt_ht107_control_main_cont">
        <div class="lt_ht107_control_row">
            <div class="labeled_control">
                <Dropdown :pt="dropdown_pt" :options="sample_shape_opts" optionLabel="label" optionValue="value" placeholder="Sample Shape" title="Sample Shape" v-model="sample_shape" @change="sample_select()" />
                <div style="width: 8px;"></div>
                <span class="lc_span">{{ sample_shape_desc }}</span>
                <div class="lc_span" style="flex-grow: 1; text-align: center;">|</div>
                <span class="lc_span" :style="`color: ${map_heater_power_color_code(heater_power)};`">{{ `P_HEATER: ${heater_power.toFixed(1)} W` }}</span>
            </div>
        </div>
        <Chart id="pos_chart" type="line" :title="chart_title" :data="chart_data" :options="chart_opts" :plugins="[epoch_plugin]" />
    </div>
</template>

<style scoped>
#pos_chart {
    border-radius: 4px;
    border: 1px solid var(--empty-gauge-color);
    background-color: var(--dark-bg-color);
    width: 100%;
    margin-top: 12px;
    height: 35vh;
}

.lc_span {
    color: var(--font-color);
    font-weight: bold;
    font-size: 12px;
}

.labeled_control {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    margin-right: 12px;
}

.lt_ht107_control_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
}

#lt_ht107_control_main_cont {
    width: 96%;
    height: fit-content;
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