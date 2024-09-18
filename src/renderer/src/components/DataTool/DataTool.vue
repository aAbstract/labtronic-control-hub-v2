<script setup lang="ts">

import { ref, onMounted, inject, computed, shallowRef } from 'vue';
import Button from 'primevue/button';
import Fieldset from 'primevue/fieldset';
import OverlayPanel from 'primevue/overlaypanel';
import { useToast } from 'primevue/usetoast';
import Checkbox from 'primevue/checkbox';

import { post_event, subscribe } from '@common/mediator';
import SmallChart from './SmallChart.vue';
import DeviceEquation from './DeviceEquation.vue';
import SeriesConfigDialog from './SeriesConfigDialog.vue';
import DataPreview from './DataPreview.vue';
import { CHXSeries } from '@common/models';
import { electron_renderer_invoke, electron_renderer_send, clone_object, add_log } from '@renderer/lib/util';
import { DeviceUIConfig } from '@renderer/lib/device_ui_config';
import { DeviceMsg, MsgTypeConfig, CHXEquation, CHXScript, Result, CHXScriptInjectedParam, AlertConfig } from '@common/models';

enum RecordingState {
    RUNNING = 0,
    PAUSED = 1,
    STOPPED = 2,
};
type DataPointType = Record<string, number>;

let data_points_cache: Record<string, DataPointType> = {};
let recorded_data_points: DataPointType[] = [];
let last_sn = -1;
let time_ms = 0;
const time_fmt = ref('00:00:00');
let iid: NodeJS.Timeout | null = null;
const data_points_count = ref(0);

let is_recording = false;
let complete_data_point_keys: string[] = [];
const msg_type_name_map: Record<string, string> = { 'time_ms': 'time_ms' };
const device_model = inject('device_model');
const panel_pos = ref('-60vw');
const sampling_dt = ref(1000);
const chx_series = shallowRef<CHXSeries[]>();
const chx_eqs = shallowRef<CHXEquation[]>();
const chx_scripts = shallowRef<CHXScript[]>();
const ds_op = ref();
const dt_settings_op = ref();
const recording_state = ref<RecordingState>(RecordingState.STOPPED);
const play_btn_color = computed(() => recording_state.value === RecordingState.RUNNING ? '#64DD17' : 'var(--accent-color)');
const pause_btn_color = computed(() => recording_state.value === RecordingState.PAUSED ? '#FFAB00' : 'var(--accent-color)');
const toast_service = useToast();
const chx_advanced_mode = ref(false);
const field_set_pt = {
    root: { style: 'padding: 0px; width: 100%; background-color: transparent; border-radius: 4px; border-color: var(--empty-gauge-color);' },
    legend: { style: 'padding: 0px 0px 0px 8px; font-size: 14px; background-color: transparent; border: none; color: var(--font-color); font-family: Cairo, sans-serif; font-size: 14px; font-weight: bold;' },
    content: { style: 'padding: 0px; color: var(--font-color); font-family: Cairo, sans-serif; font-size: 14px; font-weight: bold;' },
};
const overlay_panel_pt = {
    content: { style: 'padding: 8px;' },
};
const checkbox_pt: any = {
    box: { style: 'background-color: var(--dark-bg-color); border-color: var(--empty-gauge-color);' },
    icon: { style: 'color: var(--font-color);' },
};
const export_variables_state = ref<Record<string, boolean>>({ 'time_ms': true });

function show_series_config_dialog() {
    post_event('show_series_config_dialog', {});
}

function show_data_preview() {
    post_event('show_data_preview', {});
}

function transform_keys(_objects: Record<string, string | number>[]): Record<string, string | number>[] {
    const out_objs = clone_object(_objects) as Record<string, any>[];
    out_objs.forEach(obj => {
        Object.keys(obj).forEach(_key => {
            const msg_value = obj[_key];
            delete obj[_key];
            if (_key in msg_type_name_map && export_variables_state.value[_key]) {
                const new_key = msg_type_name_map[_key];
                obj[new_key] = msg_value;
            }
        });
    });
    return out_objs;
}

function export_device_data() {
    const device_data = transform_keys(recorded_data_points);
    electron_renderer_send('export_device_data', { device_data });
}

function import_device_data() {
    electron_renderer_send('import_device_data', {});
}

function fmt_time(ms: number): string {
    const seconds = Math.floor(ms / 1000);
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
    data_points_cache = {};
    recorded_data_points = [];
    last_sn = -1;
    time_ms = 0;
    time_fmt.value = fmt_time(0);
    iid = null;
    data_points_count.value = 0;
    post_event('clear_recorded_data', {});
}

function set_recording_state(_recording_state: RecordingState) {
    const state_map: Record<RecordingState, boolean> = {
        [RecordingState.RUNNING]: true,
        [RecordingState.PAUSED]: false,
        [RecordingState.STOPPED]: false,
    };
    recording_state.value = _recording_state;
    is_recording = state_map[_recording_state];
    if (iid && !is_recording)
        clearInterval(iid);
}

function stop_data_recording() {
    set_recording_state(RecordingState.STOPPED);
    reset_recording_state();
}

function pause_data_recording() {
    set_recording_state(RecordingState.PAUSED);
}

function start_data_recording() {
    if (is_recording)
        return;

    set_recording_state(RecordingState.RUNNING);
    iid = setInterval(() => {
        // recording timer
        time_ms += sampling_dt.value;
        time_fmt.value = fmt_time(time_ms);

        // sampling selection criteria: lateset valid point
        for (let i = 0; i < 5; i++) {
            const idx = last_sn - i; // * sampling_sn_base.value;
            const _data_point = data_points_cache[idx];
            if (!_data_point)
                continue;
            const _dp_keys: Set<string> = new Set(Object.keys(_data_point));
            if (complete_data_point_keys.every(cdp_key => _dp_keys.has(cdp_key))) {
                _data_point.time_ms = time_ms;
                post_event('record_data_point', { _data_point });
                recorded_data_points.push(_data_point);
                data_points_count.value = recorded_data_points.length;
                // clear sampling cache
                data_points_cache = {};
                last_sn = -1;
                break;
            }
        }

    }, sampling_dt.value);
}

function show_data_script_overlay_panel(_event: MouseEvent) {
    ds_op.value.toggle(_event);
}

function show_data_tool_settings_overlay_panel(_event: MouseEvent) {
    dt_settings_op.value.toggle(_event);
}

function exec_chx_script(_script: CHXScript) {
    if (!window.electron) {
        add_log({ level: 'ERROR', msg: 'Operation Denied Browser Sandbox' });
        return;
    }

    window.electron.ipcRenderer.invoke('exec_chx_script', recorded_data_points, _script).then((res: Result<CHXScriptInjectedParam[]>) => {
        if (res.err)
            toast_service.add({ severity: 'error', summary: 'CHX Script Faild', detail: res.err, life: 0 });
        else
            res.ok?.forEach(chx_script_ip => post_event(`chx_script_ip_${chx_script_ip.param_name}`, { pv: chx_script_ip.param_val }));
    });
}

onMounted(() => {
    subscribe('toggle_data_tool', 'toggle_data_tool_visi', _ => {
        const values_map = {
            '0px': '-60vw',
            '-60vw': '0px',
        };
        panel_pos.value = values_map[panel_pos.value];
    });

    subscribe('hide_data_tool', 'hide_data_tool', _ => panel_pos.value = '-60vw');

    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
        electron_renderer_invoke<CHXSeries[]>(`${device_model}_get_chx_series`).then(_chx_series => {
            if (!_chx_series)
                return;
            chx_series.value = _chx_series;
            stop_data_recording();
        });
    });

    electron_renderer_invoke<CHXEquation[]>('get_chx_eqs').then(_chx_eqs => {
        if (!_chx_eqs)
            return;
        chx_eqs.value = _chx_eqs;
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        if (!is_recording)
            return;
        const device_msg: DeviceMsg = data.device_msg;
        const { seq_number } = device_msg;

        // ignore some points in case of high data frequency
        // if (seq_number % sampling_sn_base.value !== 0)
        //     return;

        const { msg_type } = device_msg.config;
        const { msg_value } = device_msg;
        if (seq_number > last_sn)
            last_sn = seq_number;

        if (!data_points_cache[seq_number])
            data_points_cache[seq_number] = { seq_number };
        data_points_cache[seq_number][msg_type] = msg_value;
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
        electron_renderer_invoke<MsgTypeConfig[]>(`${device_model}_get_device_config`).then(device_config => {
            if (!device_config)
                return;
            const read_config = device_config.filter(x => x.msg_name.startsWith('READ_'));
            complete_data_point_keys = [];
            read_config.forEach(_read_config => {
                complete_data_point_keys.push(String(_read_config.msg_type));
                const { msg_type } = _read_config;
                const msg_name = _read_config.msg_name.replaceAll('READ_', '');
                msg_type_name_map[msg_type] = msg_name;
                msg_type_name_map[msg_name] = String(msg_type);
                export_variables_state.value[msg_type] = true;
            });
        });
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
        electron_renderer_invoke<CHXScript[]>(`${device_model}_get_chx_scripts`).then(_chx_scripts => {
            if (!_chx_scripts)
                return;
            chx_scripts.value = _chx_scripts;
        });
    });

    window.electron?.ipcRenderer.on('export_device_data_res', (_, data) => {
        const fsio_res: Result<string> = data;
        const severity = fsio_res.err ? 'error' : 'success';
        const summary = fsio_res.err ? 'Faild to Save Device Data' : 'Device Data Saved';
        const detail = fsio_res.err ? fsio_res.err : fsio_res.ok;
        toast_service.add({ severity, summary, detail });
    });

    window.electron?.ipcRenderer.on('import_device_data_res', (_, data) => {
        const fsio_res: Result<Record<string, string>[]> = data;
        if (fsio_res.err) {
            toast_service.add({ severity: 'error', summary: 'Faild to Import Device Data', detail: fsio_res.err });
            return;
        }
        const imported_device_data = fsio_res.ok ?? [];
        recorded_data_points = transform_keys(imported_device_data) as DataPointType[];
        show_data_preview();
        recorded_data_points.forEach(_data_point => post_event('record_data_point', { _data_point }));
    });

    subscribe('nav_bar_exit', 'nav_bar_exit_data_panel', () => {
        if (recorded_data_points.length === 0) {
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

    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
        electron_renderer_invoke<boolean>('get_chx_advanced').then(_chx_advanced_mode => chx_advanced_mode.value = _chx_advanced_mode ?? false);
    });
});

</script>

<template>
    <div id="data_tool_cont">
        <SeriesConfigDialog />
        <DataPreview />
        <div id="data_tool_header">
            <h1>DATA TOOL</h1>
            <div style="display: flex; align-items: center;">
                <Button icon="pi pi-play" title="Start Recording" rounded text @click="start_data_recording()" :style="`color: ${play_btn_color};`" />
                <Button icon="pi pi-pause" title="Pause Recording" rounded text @click="pause_data_recording()" :style="`color: ${pause_btn_color};`" />
                <Button icon="pi pi-stop" title="Reset Recording" rounded text @click="stop_data_recording()" style="color: #DD2C00;" />
            </div>
            <div>
                <Button icon="pi pi-file-import" title="Import Data" rounded text @click="import_device_data()" />
                <Button icon="pi pi-file-export" title="Export Data" rounded text @click="export_device_data()" />
                <Button icon="pi pi-cog" title="Data Tool Settings" rounded text @click="show_data_tool_settings_overlay_panel" />
                <OverlayPanel ref="dt_settings_op" :pt="overlay_panel_pt" style="font-family: Cairo, sans-serif;">
                    <div style="display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;">
                        <div style="width: 200px; display: flex; flex-direction: row; justify-content: flex-start;">
                            <span style="font-size: 14px; margin-right: 8px;">Sampling Time [ms]:</span>
                            <input class="dt_tf" type="number" v-model="sampling_dt">
                        </div>
                        <div style="height: 8px;"></div>
                        <div>
                            <span style="font-size: 16px;">Export Variables</span>
                            <div style="margin-bottom: 4px;">
                                <Checkbox style="margin-right: 8px;" binary :pt="checkbox_pt" v-model="export_variables_state['time_ms']" />
                                <span style="font-size: 14px;">{{ msg_type_name_map['time_ms'] }}</span>
                            </div>
                            <div v-for="dp_key in complete_data_point_keys" style="margin-bottom: 4px;">
                                <Checkbox style="margin-right: 8px;" binary :pt="checkbox_pt" v-model="export_variables_state[dp_key]" />
                                <span style="font-size: 14px;">{{ msg_type_name_map[dp_key] }}</span>
                            </div>
                        </div>
                        <div style="height: 8px;"></div>
                        <div>
                            <span style="font-size: 16px;">Charts Settings</span>
                            <div style="width: 200px; display: flex; flex-direction: row; justify-content: flex-start;">
                                <span style="font-size: 14px; margin-right: 8px;">Y Range</span>
                                <input class="dt_tf" type="number">
                                <span style="flex-grow: 1; text-align: center;"> - </span>
                                <input class="dt_tf" type="number">
                            </div>
                        </div>
                    </div>
                </OverlayPanel>
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
                <Button icon="pi pi-eye" class="data_tool_icon_btn" title="Preview Data" rounded text @click="show_data_preview()" />
                <Button icon="pi pi-code" class="data_tool_icon_btn" title="Run Data Script" rounded text @click="show_data_script_overlay_panel" />
                <OverlayPanel ref="ds_op" :pt="overlay_panel_pt">
                    <div id="ds_op_items_cont">
                        <h4 v-if="chx_scripts?.length === 0" style="margin: 0px;">No Data Scripts Found for This Device</h4>
                        <div class="ds_op_item" v-for="_script in chx_scripts" @click="exec_chx_script(_script)">
                            <i class="pi pi-file"></i>
                            <span>{{ _script.script_name }}</span>
                        </div>
                    </div>
                </OverlayPanel>
            </div>
        </div>

        <Fieldset id="series_field_set" :pt="field_set_pt">
            <template #legend>
                <div class="field_set_header">
                    <span>Device Series</span>
                    <Button v-if="chx_advanced_mode" icon="pi pi-cog" class="data_tool_icon_btn" title="Configure Series" rounded text @click="show_series_config_dialog()" />
                </div>
            </template>
            <div v-for="(s, idx) in chx_series">
                <SmallChart :chart_title="s.series_name" :line_color="DeviceUIConfig.get_rot_color(idx)" :x_param="s.x_param" :y_param="s.y_param" :chart_idx="idx" />
                <div style="height: 12px;"></div>
            </div>
        </Fieldset>

        <Fieldset id="deqs_field_set" :pt="field_set_pt">
            <template #legend>
                <div class="field_set_header">
                    <span>Device Equations</span>
                    <Button v-if="chx_advanced_mode" icon="pi pi-cog" class="data_tool_icon_btn" title="Configure Series" rounded text />
                </div>
            </template>
            <DeviceEquation v-if="chx_eqs?.length ?? 0 !== 0" v-for="chx_eq in chx_eqs" :chx_eq="chx_eq" />
            <div v-else style="margin: 0px 0px 8px 16px;">No Device Equations Defined</div>
        </Fieldset>

        <div style="height: 8px;"></div>
    </div>
</template>

<style scoped>
#ds_op_items_cont {
    font-family: "Lucida Console", "Courier New", monospace;
    min-width: 200px;
    height: fit-content;
    width: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    background-color: var(--dark-bg-color);
    padding: 8px;
    border-radius: 4px;
    color: var(--font-color);
    font-size: 14px;
    font-weight: bold;
}

.ds_op_item {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    transition: 0.3s ease;
    border-radius: 4px;
}

.ds_op_item:hover {
    background-color: var(--light-bg-color);
}

.ds_op_item i {
    margin-right: 16px;
}

#series_field_set {
    height: fit-content;
    min-height: 35vh;
    overflow-y: scroll;
}

#deqs_field_set {
    min-height: 67px;
    height: fit-content;
    overflow-y: scroll;
}

.field_set_header {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.field_set_header span {
    margin-right: 8px;
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
    width: calc(100% - 8px);
    left: v-bind(panel_pos);
    height: calc(100% - 24px);
    top: 12px;
    background-color: var(--light-bg-color);
    border-radius: 4px;
    color: var(--font-color);
    padding: 4px 8px;
    transition: 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    z-index: 1;
}
</style>