<script setup lang="ts">

import { onMounted, ref, inject } from 'vue';
import Button from 'primevue/button';
import OverlayPanel from 'primevue/overlaypanel';

import { subscribe, post_event } from '@common/mediator';
import { add_log, electron_renderer_send, electron_renderer_invoke } from '@renderer/lib/util';
import DeviceLogs from './DeviceLogs.vue';
import DeviceConnector from './DeviceConnector.vue';
import { compute_tooltip_pt } from '@renderer/lib/util';
import CPsDialog from '@renderer/components/CPsDialog.vue';

const chx_advanced_mode = ref(false);
const device_model = inject('device_model');
const panel_pos = ref('-50vw');
const cmd = ref('');
const rt_chart_settings_op = ref();
const overlay_panel_pt = {
    content: { style: 'padding: 8px;' },
};
const single_chart_y_min = ref(0);
const single_chart_y_max = ref(100);
const multi_chart_y_min = ref(0);
const multi_chart_y_max = ref(100);

function submit_cmd() {
    const _cmd = cmd.value.toUpperCase();
    cmd.value = '';
    if (_cmd === 'HELP') {
        // write help logs to logs panel without tracking it
        electron_renderer_invoke<string[]>(`${device_model}_get_device_cmd_help`).then(cmd_help => {
            if (!cmd_help)
                return;
            post_event('add_sys_log', { level: '', msg: cmd_help.join('\n') });
        });
        return;
    }
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: _cmd });
}

function show_rt_chart_settings_overlay_panel(_event: MouseEvent) {
    rt_chart_settings_op.value.toggle(_event);
}

function set_single_chart_y_min_max() {
    const y_min = single_chart_y_min.value;
    const y_max = single_chart_y_max.value;
    if (isNaN(y_min) || isNaN(y_max))
        return;
    post_event('update_single_chart_y_min_max', { y_min, y_max });
}

function set_multi_chart_y_min_max() {
    const y_min = multi_chart_y_min.value;
    const y_max = multi_chart_y_max.value;
    if (isNaN(y_min) || isNaN(y_max))
        return;
    post_event('update_multi_chart_y_min_max', { y_min, y_max });
}

onMounted(() => {
    subscribe('toggle_control_panel', 'toggle_control_panel_visi', _ => {
        const values_map = {
            '8px': '-50vw',
            '-50vw': '8px',
        };
        panel_pos.value = values_map[panel_pos.value];
    });
    subscribe('hide_control_panel', 'hide_control_panel', _ => panel_pos.value = '-50vw');
    add_log({ level: 'INFO', msg: 'Type HELP to List Available Commands' });

    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
        electron_renderer_invoke<boolean>('get_chx_advanced').then(_chx_advanced_mode => chx_advanced_mode.value = _chx_advanced_mode ?? false);
    });
});

</script>

<template>
    <div id="control_panel_cont">
        <CPsDialog />
        <div id="control_panel_header">
            <h1>DEVICE TERMINAL</h1>
            <div>
                <Button icon="pi pi-chart-bar" @click="show_rt_chart_settings_overlay_panel" rounded text v-tooltip.left="{ value: 'RT CHART SETTINGS', pt: compute_tooltip_pt('left') }" />
                <Button v-if="chx_advanced_mode" icon="pi pi-cog" @click="post_event('show_cps_dialog', {})" rounded text v-tooltip.left="{ value: 'PARAMS SETTINGS', pt: compute_tooltip_pt('left') }" />
                <OverlayPanel ref="rt_chart_settings_op" :pt="overlay_panel_pt" style="font-family: Cairo, sans-serif;">
                    <div style="display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;">
                        <div style="width: 280px;">
                            <span style="font-size: 16px;">RT Charts Settings</span>
                            <div style="width: 100%; display: flex; flex-direction: row; justify-content: flex-start;">
                                <span style="font-size: 14px; margin-right: 8px; width: 125px;">Single Chart Y Range</span>
                                <input class="dt_tf" type="number" v-model="single_chart_y_min" @keyup.enter="set_single_chart_y_min_max()">
                                <span style="flex-grow: 1; text-align: center;"> - </span>
                                <input class="dt_tf" type="number" v-model="single_chart_y_max" @keyup.enter="set_single_chart_y_min_max()">
                            </div>
                            <div style="height: 4px;"></div>
                            <div style="width: 100%; display: flex; flex-direction: row; justify-content: flex-start;">
                                <span style="font-size: 14px; margin-right: 8px; width: 125px;">Multi Chart Y Range</span>
                                <input class="dt_tf" type="number" v-model="multi_chart_y_min" @keyup.enter="set_multi_chart_y_min_max()">
                                <span style="flex-grow: 1; text-align: center;"> - </span>
                                <input class="dt_tf" type="number" v-model="multi_chart_y_max" @keyup.enter="set_multi_chart_y_min_max()">
                            </div>
                        </div>
                    </div>
                </OverlayPanel>
            </div>
        </div>
        <DeviceConnector />
        <DeviceLogs />
        <div id="control_cmd_cont">
            <input type="text" style="width: 120px; margin-right: 4px;" readonly value="CHX (local)> " />
            <input type="text" v-model="cmd" style="flex-grow: 1;" @keyup.enter="submit_cmd()" />
        </div>
    </div>
</template>

<style scoped>
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

#control_cmd_cont {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
}

#control_cmd_cont input {
    font-size: 12px;
    font-family: "Lucida Console", "Courier New", monospace;
    background-color: var(--dark-bg-color);
    color: var(--font-color);
    width: 100%;
    height: fit-content;
    margin-top: 8px;
    border: none;
    padding: 8px;
    font-weight: bold;
}

#control_cmd_cont input:focus {
    outline: none;
}

#control_panel_cont {
    position: absolute;
    width: 96%;
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
}

#control_panel_header {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--empty-gauge-color);
    margin-bottom: 8px;
}

#control_panel_header h1 {
    font-size: 18px;
    margin: 0px;
}

#control_panel_header button {
    color: var(--accent-color);
    width: 32px;
    height: 32px;
}
</style>