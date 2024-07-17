<script setup lang="ts">

import { onMounted, ref, inject } from 'vue';
import Button from 'primevue/button';

import { subscribe, post_event } from '@common/mediator';
import { add_log, electron_renderer_send, electron_renderer_invoke } from '@renderer/lib/util';
import DeviceLogs from './DeviceLogs.vue';
import DeviceConnector from './DeviceConnector.vue';
import { compute_tooltip_pt } from '@renderer/lib/util';
import CPsDialog from '@renderer/components/CPsDialog.vue';

const device_model = inject('device_model');
const panel_pos = ref('-50vw');
const cmd = ref('');

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
});

</script>

<template>
    <div id="control_panel_cont">
        <CPsDialog />
        <div id="control_panel_header">
            <h1>DEVICE TERMINAL</h1>
            <Button icon="pi pi-cog" @click="post_event('show_cps_dialog', {})" rounded text v-tooltip.left="{ value: 'PARAMS SETTINGS', pt: compute_tooltip_pt('left') }" />
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
    height: calc(100% - 32px);
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