<script setup lang="ts">

import { ref, onMounted, inject, computed } from 'vue';
import Button from 'primevue/button';
import Fieldset from 'primevue/fieldset';

import { post_event, subscribe } from '@common/mediator';
import SmallChart from './SmallChart.vue';
import SeriesConfigDialog from './SeriesConfigDialog.vue';
import { CHXSeries } from '@common/models';
import { electron_renderer_invoke } from '@renderer/lib/util';
import { DeviceUIConfig } from '@renderer/lib/device_ui_config';
import { DeviceMsg, MsgTypeConfig } from '@common/models';

enum RecordingState {
    RUNNING = 0,
    PAUSED = 1,
    STOPPED = 2,
};

let last_data_point: Record<string, number> = {};
let iid: NodeJS.Timeout | null = null;
let data_points_cache: Record<string, number>[] = [];
let time_ms = 0;
const complete_data_point_keys: string[] = [];
const device_model = inject('device_model');
const panel_pos = ref('-50vw');
const sampling_dt = ref(1000);
const chx_series = ref<CHXSeries[]>();
const data_points_count = ref(0);
const time_fmt = ref('00:00:00');
const recording_state = ref<RecordingState>(RecordingState.STOPPED);
const play_btn_color = computed(() => recording_state.value === RecordingState.RUNNING ? '#64DD17' : 'var(--accent-color)');
const pause_btn_color = computed(() => recording_state.value === RecordingState.PAUSED ? '#FFAB00' : 'var(--accent-color)');
const field_set_pt = {
    root: { style: 'padding: 0px; width: 100%; background-color: transparent; border-radius: 4px; border-color: var(--empty-gauge-color);' },
    legend: { style: 'padding: 0px 0px 0px 8px; font-size: 14px; background-color: transparent; border: none; color: var(--font-color); font-family: Cairo, sans-serif; font-size: 14px; font-weight: bold;' },
    content: { style: 'padding: 0px; color: var(--font-color); font-family: Cairo, sans-serif; font-size: 14px; font-weight: bold;' },
};

function show_series_config_dialog() {
    post_event('show_series_config_dialog', {});
}

function fmt_time(ms: number): string {
    const seconds = ms / 1000;
    const hours = Math.floor(seconds / 3600);
    const seconds_h_rem = seconds % 3600;
    const minutes = Math.floor(seconds_h_rem / 60);
    const seconds_m_rem = seconds % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds_m_rem).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

function reset_recording_state() {
    last_data_point = {};
    iid = null;
    data_points_cache = [];
    data_points_count.value = 0;
    time_ms = 0;
    time_fmt.value = fmt_time(0);
}

function stop_data_recording() {
    recording_state.value = RecordingState.STOPPED;
    if (!iid)
        return;
    clearInterval(iid);
    reset_recording_state();
}

function pause_data_recording() {
    recording_state.value = RecordingState.PAUSED;
    if (!iid)
        return;
    clearInterval(iid);
}

function start_data_recording() {
    recording_state.value = RecordingState.RUNNING;
    iid = setInterval(() => {
        time_ms += sampling_dt.value;
        time_fmt.value = fmt_time(time_ms);
        const ldp_keys: Set<string> = new Set(Object.keys(last_data_point));
        if (ldp_keys.size === 0)
            return;

        if (!complete_data_point_keys.every(dp_key => ldp_keys.has(dp_key)))
            return;

        last_data_point.time_ms = time_ms;
        post_event('small_chart_update', { last_data_point });
        data_points_cache.push(last_data_point);
        data_points_count.value = data_points_cache.length;
        last_data_point = {};
    }, sampling_dt.value);
}

onMounted(() => {
    subscribe('toggle_data_tool', 'toggle_data_tool_visi', _ => {
        const values_map = {
            '8px': '-50vw',
            '-50vw': '8px',
        };
        panel_pos.value = values_map[panel_pos.value];
    });

    subscribe('hide_data_tool', 'hide_data_tool', _ => panel_pos.value = '-50vw');

    electron_renderer_invoke<CHXSeries[]>('get_chx_series').then(_chx_series => {
        if (!_chx_series)
            return;
        chx_series.value = _chx_series;
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        const { seq_number, msg_value } = device_msg;
        const last_sn = last_data_point.seq_number ?? -1;
        if (seq_number === last_sn) {
            last_data_point[msg_type] = msg_value;
        } else if (seq_number > last_sn) {
            last_data_point = { seq_number };
            last_data_point[msg_type] = msg_value;
        }
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
        electron_renderer_invoke<MsgTypeConfig[]>(`${device_model}_get_device_config`).then(device_config => {
            if (!device_config)
                return;
            const read_config = device_config.filter(x => x.msg_name.startsWith('READ_'));
            read_config.forEach(_read_config => complete_data_point_keys.push(String(_read_config.msg_type)));
        });
    });
});

</script>

<template>
    <div id="data_tool_cont">
        <SeriesConfigDialog />
        <div id="data_tool_header">
            <h1>DATA TOOL</h1>
            <div style="display: flex; align-items: center;">
                <input id="sampling_dt" title="Sampling dt [ms]" type="text" v-model="sampling_dt">
                <Button icon="pi pi-play" title="Start Recording" rounded text @click="start_data_recording()" :style="`color: ${play_btn_color};`" />
                <Button icon="pi pi-pause" title="Pause Recording" rounded text @click="pause_data_recording()" :style="`color: ${pause_btn_color};`" />
                <Button icon="pi pi-stop" title="Stop Recording" rounded text @click="stop_data_recording()" style="color: #DD2C00;" />
            </div>
            <div>
                <Button icon="pi pi-file-import" title="Import Data" rounded text />
                <Button icon="pi pi-file-export" title="Export Data" rounded text />
            </div>
        </div>

        <div id="rec_widget">
            <div class="rec_widget_txt">
                <span>Data Points:</span>
                <span>{{ data_points_count }}</span>
            </div>
            <div class="rec_widget_txt">
                <span>Duration:</span>
                <span>{{ time_fmt }}</span>
            </div>
            <div>
                <Button icon="pi pi-eye" class="data_tool_icon_btn" title="Preview Data" rounded text />
                <Button icon="pi pi-code" class="data_tool_icon_btn" title="Run Data Script" rounded text />
            </div>
        </div>

        <Fieldset id="series_field_set" :pt="field_set_pt">
            <template #legend>
                <div class="field_set_header">
                    <span>Device Series</span>
                    <Button icon="pi pi-cog" class="data_tool_icon_btn" title="Configure Series" rounded text @click="show_series_config_dialog()" />
                </div>
            </template>
            <div v-for="(s, idx) in chx_series">
                <SmallChart :chart_title="s.series_name" :line_color="DeviceUIConfig.get_rot_color(idx)" :x_param="s.x_param" :y_param="s.y_param" :sampling_dt="sampling_dt" :chart_idx="idx" />
                <div style="height: 12px;"></div>
            </div>
        </Fieldset>

        <Fieldset :pt="field_set_pt" style="flex-grow: 1;">
            <template #legend>
                <div class="field_set_header">
                    <span>Device Equations</span>
                    <Button icon="pi pi-cog" class="data_tool_icon_btn" title="Configure Series" rounded text />
                </div>
            </template>
            <div>item 1</div>
            <div>item 1</div>
            <div>item 1</div>
        </Fieldset>

        <div style="height: 8px;"></div>
    </div>
</template>

<style scoped>
#series_field_set {
    height: 60%;
    max-height: 60%;
    overflow-y: scroll;
}

.field_set_header {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

#sampling_dt {
    font-family: "Lucida Console", "Courier New", monospace;
    width: 100px;
    color: var(--font-color);
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 12px;
    font-weight: bold;
    padding: 4px;
}

#sampling_dt:focus {
    outline: none;
    border: 1px solid var(--accent-color);
}

.rec_widget_txt> :first-child {
    margin-right: 8px;
}

.rec_widget_txt> :last-child {
    font-weight: bold;
}

#rec_widget {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
}

.data_tool_icon_btn {
    color: var(--accent-color);
    width: 32px;
    height: 32px;
}

#data_tool_header button {
    width: 32px;
    height: 32px;
}

#data_tool_header {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--empty-gauge-color);
    margin-bottom: 8px;
}

#data_tool_header h1 {
    font-size: 18px;
    margin: 0px;
}

#data_tool_cont {
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