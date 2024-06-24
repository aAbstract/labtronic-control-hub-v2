<script setup lang="ts">

import { ref, onMounted, shallowRef, inject } from 'vue';
import moment from 'moment';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import { ChartOptions, ChartData } from 'chart.js';
import { useToast } from 'primevue/usetoast';

import { subscribe, post_event } from '@common/mediator';
import { DmtbRow, Result, DropdownOption, MsgTypeConfig, AlertConfig } from '@common/models';
import { DeviceUIConfig, ChartParams } from '@renderer/lib/device_ui_config';
import { electron_renderer_send, electron_renderer_invoke } from '@renderer/lib/util';
import { screenshot_handlers } from '@renderer/lib/screenshot';
// @ts-ignore
import { DeviceMsg } from '@common/models';

const DMTB_ROWS_MAX = 100;
const _DP_CONTROLS_WIDTH = 12;
const DP_CONTROLS_WIDTH = `${_DP_CONTROLS_WIDTH}vw`;
const SMALL_DP_CONTROLS_WIDTH = `${_DP_CONTROLS_WIDTH * 0.75}vw`;
const CPT_FONT_SIZE = { style: 'font-size: 12px;' };
const device_model = inject('device_model');
let data_cache: DmtbRow[] = [];
const data_to_show = shallowRef<DmtbRow[]>([]);
// @ts-ignore
let data_changed: boolean = false;
const panel_pos = ref('-50vw');
const chart_opts = shallowRef({});
const chart_data = shallowRef<ChartData>();
const props = defineProps<{ device_ui_config: DeviceUIConfig }>();
const toast_service = useToast();
const target_vars_opts = shallowRef<DropdownOption<number>[]>([]);
const selected_target_var = ref();
const datetime_from = ref();
const datetime_to = ref();
let chart_params_list: ChartParams[] = [];
const calender_pt: any = {
    input: { style: `font-size: 12px; width: ${DP_CONTROLS_WIDTH}; height: 30px; font-family: Cairo, sans-serif;` },
    table: CPT_FONT_SIZE,
    day: { style: 'padding: 0px;' },
    header: { style: 'padding: 0px; font-size: 12px;' },
    timePicker: { style: 'padding: 0px;' },
    monthTitle: CPT_FONT_SIZE,
    yearTitle: CPT_FONT_SIZE,
    hour: CPT_FONT_SIZE,
    minute: CPT_FONT_SIZE,
    second: CPT_FONT_SIZE,
    ampm: CPT_FONT_SIZE,
};
const dropdown_pt: any = {
    root: { style: `width: ${DP_CONTROLS_WIDTH};` },
    input: { style: 'font-size: 12px; height: 30px; font-family: Cairo, sans-serif; padding-top: 4px;' },
    trigger: { style: 'width: fit-content; padding-right: 8px;' },
};

// @ts-ignore
function dmtb_scroll_down() {
    const dmtb_elem = document.querySelector('#device_msgs_cont') as HTMLElement;
    dmtb_elem.scrollTop = dmtb_elem.scrollHeight;
}

function export_device_data() {
    electron_renderer_send('export_device_data', { device_data: data_cache });
}

function import_device_data() {
    electron_renderer_send('import_device_data', {});
}

function filter_device_data(): DmtbRow[] {
    let data_filtered = data_cache;
    if (selected_target_var.value && selected_target_var.value !== -1)
        data_filtered = data_filtered.filter(x => x.msg_type === selected_target_var.value);

    if (datetime_from.value && datetime_to.value) {
        // compare with seconds precession
        const _datetime_from = moment(moment(datetime_from.value).format().split('+')[0]);
        const _datetime_to = moment(moment(datetime_to.value).format().split('+')[0]);
        data_filtered = data_filtered.filter(x => moment(x.datetime).isSameOrAfter(_datetime_from) && moment(x.datetime).isSameOrBefore(_datetime_to));
    }

    return data_filtered;
}

function show_filtered_data() {
    const data_filtered = filter_device_data();
    data_to_show.value = data_filtered.slice(-DMTB_ROWS_MAX);
}

function plot_filtered_data() {
    if (!selected_target_var.value || selected_target_var.value === -1) {
        toast_service.add({ severity: 'info', summary: 'Plotter Guide', detail: 'Select a Specific Variable to Plot a Time Series' });
        return;
    }
    const data_filtered = filter_device_data();
    if (data_filtered.length === 0)
        return;

    const { msg_name } = data_filtered[0];
    const rot_chart_params = props.device_ui_config.get_rot_chart_params(`${msg_name}_${chart_params_list.length + 1}`);
    rot_chart_params.data = data_filtered.map(x => x.msg_value);
    chart_params_list.push(rot_chart_params);
    const max_series_length = Math.max(...chart_params_list.map(x => x.data.length));
    const labels = new Array(max_series_length);
    for (let i = 0; i < max_series_length; i++)
        labels[i] = i;

    chart_data.value = { labels, datasets: chart_params_list };
}

function create_chart_options(font_color: string, lines_color: string): ChartOptions {
    return {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        color: font_color,
        scales: {
            x: { ticks: { color: font_color }, grid: { color: lines_color } },
            y: { ticks: { color: font_color }, grid: { color: lines_color } },
        },
        animation: false,
    };
}

function clear_filtered_data_plot() {
    chart_params_list = [];
    chart_data.value = { labels: [], datasets: [] };
}

onMounted(() => {
    const chart_font_color = document.documentElement.style.getPropertyValue('--font-color');
    const chart_grid_color = document.documentElement.style.getPropertyValue('--empty-gauge-color');
    chart_opts.value = create_chart_options(chart_font_color, chart_grid_color);

    subscribe('toggle_data_panel', 'toggle_data_panel_visi', _ => {
        const values_map = {
            '8px': '-50vw',
            '-50vw': '8px',
        };
        panel_pos.value = values_map[panel_pos.value];
    });

    subscribe('hide_data_panel', 'hide_data_panel', _ => panel_pos.value = '-50vw');

    subscribe('nav_bar_exit', 'nav_bar_exit_data_panel', () => {
        if (data_cache.length === 0) {
            electron_renderer_send('exit', {});
            return;
        }
        const dialog_config: AlertConfig = {
            title: 'Warning',
            msg_severity: 'warn',
            msg_body: 'Device Data Might be Lost, if not Saved',
            btns_config: [
                { btn_text: 'Cancel', btn_type: 'secondary', btn_action: () => post_event('hide_alert', {}) },
                { btn_text: 'Exit', btn_type: 'info', btn_action: () => electron_renderer_send('exit', {}) },
            ],
        };
        post_event('show_alert', { dialog_config });
    });

    // window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
    //     const device_msg: DeviceMsg = data.device_msg;
    //     data_cache.push({
    //         sn: device_msg.seq_number,
    //         datetime: moment().format().split('+')[0],
    //         msg_type: device_msg.config.msg_type,
    //         msg_name: device_msg.config.msg_name.replace('READ_', ''),
    //         msg_value: device_msg.msg_value,
    //         b64_msg_value: device_msg.b64_msg_value,
    //     });
    //     data_changed = true;
    // });

    window.electron?.ipcRenderer.on('export_device_data_res', (_, data) => {
        const fsio_res: Result<string> = data;
        const severity = fsio_res.err ? 'error' : 'success';
        const summary = fsio_res.err ? 'Faild to Save Device Data' : 'Device Data Saved';
        const detail = fsio_res.err ? fsio_res.err : fsio_res.ok;
        toast_service.add({ severity, summary, detail });
    });

    window.electron?.ipcRenderer.on('import_device_data_res', (_, data) => {
        const fsio_res: Result<DmtbRow[]> = data;
        if (fsio_res.err) {
            toast_service.add({ severity: 'error', summary: 'Faild to Import Device Data', detail: fsio_res.err });
            return;
        }
        const imported_device_data = fsio_res.ok ?? [];
        data_cache = imported_device_data;
        data_changed = true;
        datetime_from.value = new Date(imported_device_data[0].datetime);
        datetime_to.value = new Date(imported_device_data[imported_device_data.length - 1].datetime);
    });

    // get target variables using device driver config
    electron_renderer_invoke<MsgTypeConfig[]>(`${device_model}_get_device_config`).then(device_config => {
        if (!device_config)
            return;
        const read_config = device_config.filter(x => x.msg_name.startsWith('READ_'));
        target_vars_opts.value = [
            { label: 'ALL', value: -1 },
            ...read_config.map(_read_config => {
                return {
                    label: _read_config.msg_name.replace('READ_', ''),
                    value: _read_config.msg_type,
                } as DropdownOption<number>;
            })
        ];
    });

    // setInterval(() => {
    //     if (!data_changed)
    //         return;
    //     data_to_show.value = data_cache.slice(-DMTB_ROWS_MAX); // saves memory when dealing with huge array
    //     data_changed = false;
    //     dmtb_scroll_down();
    // }, 100);
});

</script>

<template>
    <div id="data_panel_cont">
        <div id="data_panel_header">
            <h1>DATA PANEL</h1>
        </div>
        <div id="device_msgs_cont" v-on="screenshot_handlers">
            <div class="dmtb_row">
                <span style="flex-grow: 1;">#SN</span>
                <span style="width: 10vw;">DATETIME</span>
                <span style="width: 10vw;">MSG_TYPE</span>
                <span style="width: 10vw;">MSG_VALUE</span>
            </div>
            <hr style="border-color: var(--font-color);">
            <div v-for="row in data_to_show" class="dmtb_row">
                <span style="flex-grow: 1;">{{ row.sn }}</span>
                <span style="width: 10vw;">{{ row.datetime.split('T')[1] }}</span>
                <span style="width: 10vw;">{{ row.msg_name }}</span>
                <span style="width: 10vw;">{{ row.msg_value.toFixed(2) }}</span>
            </div>
        </div>
        <div id="data_panel_controls_cont">
            <Calendar :pt="calender_pt" showTime hourFormat="12" v-model="datetime_from" placeholder="DATETIME_FROM" show-seconds @update:model-value="show_filtered_data()" />
            <Calendar :pt="calender_pt" showTime hourFormat="12" v-model="datetime_to" placeholder="DATETIME_TO" show-seconds @update:model-value="show_filtered_data()" />
            <Dropdown v-model="selected_target_var" @change="show_filtered_data()" :pt="dropdown_pt" :options="target_vars_opts" optionLabel="label" optionValue="value" placeholder="Target Variable" />
            <Button class="data_panel_btn" outlined label="IMPORT" icon="pi pi-file-import" @click="import_device_data()" />
            <Button class="data_panel_btn" outlined label="EXPORT" icon="pi pi-file-export" @click="export_device_data()" />
            <Button class="data_panel_btn_warn" outlined label="CLEAR" icon="pi pi-trash" @click="clear_filtered_data_plot()" />
            <Button class="data_panel_btn" outlined label="PLOT" icon="pi pi-chart-bar" @click="plot_filtered_data()" />
        </div>
        <Chart id="data_panel_chart" type="line" v-on="screenshot_handlers" :data="chart_data" :options="chart_opts" />
    </div>
</template>

<style scoped>
#data_panel_chart {
    width: 100%;
    min-height: 50%;
    height: 50%;
    border-radius: 8px;
}

.data_panel_btn {
    height: 30px;
    width: v-bind(SMALL_DP_CONTROLS_WIDTH) !important;
    color: var(--accent-color);
    border-color: var(--accent-color);
    font-size: 12px;
    margin-top: 8px;
}

.data_panel_btn_warn {
    height: 30px;
    width: v-bind(SMALL_DP_CONTROLS_WIDTH) !important;
    color: #FFAB00;
    border-color: #FFAB00;
    font-size: 12px;
    margin-top: 8px;
}

#data_panel_controls_cont {
    width: 100%;
    margin-top: 8px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}

.dmtb_row span {
    display: inline-block;
}

.dmtb_row {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

#device_msgs_cont {
    flex-grow: 1;
    width: 100%;
    background-color: var(--dark-bg-color);
    color: var(--font-color);
    padding: 8px;
    border-radius: 8px;
    font-size: 12px;
    font-family: "Lucida Console", "Courier New", monospace;
    font-weight: bold;
    overflow-x: scroll;
    overflow-y: scroll;
}

#data_panel_table {
    width: 100%;
}

#data_panel_header {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--empty-gauge-color);
    margin-bottom: 8px;
}

#data_panel_header h1 {
    font-size: 18px;
    margin: 0px;
}

#data_panel_cont {
    position: absolute;
    width: 96%;
    left: v-bind(panel_pos);
    height: calc(100% - 32px);
    top: 12px;
    background-color: var(--light-bg-color);
    border-radius: 8px;
    color: var(--font-color);
    padding: 4px 8px;
    transition: 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}
</style>