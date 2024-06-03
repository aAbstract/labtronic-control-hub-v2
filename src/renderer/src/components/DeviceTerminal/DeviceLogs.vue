<script setup lang="ts">

import { onBeforeMount, ref, inject } from 'vue';
import moment from 'moment';

import { LogMsg, DeviceMsg } from '@common/models';
import { add_log } from '@renderer/lib/util';
import { subscribe } from '@common/mediator';
import { screenshot_handlers } from '@renderer/lib/screenshot';

let logs_cache: LogMsg[] = [];
const logs_to_render = ref<LogMsg[]>([]);
const device_model = inject('device_model');

const tag_color_map = {
    'INFO': '#64DD17',
    'DEBUG': '#FFD600',
    'WARN': '#FFAB00',
    'ERROR': '#DD2C00',
};

onBeforeMount(() => {
    subscribe('add_sys_log', 'add_sys_log', args => {
        const log_msg: LogMsg = args;
        log_msg.datetime = moment().format().split('+')[0];
        logs_cache.push(log_msg);
        logs_to_render.value.push(log_msg);
        const logs_cont = document.querySelector('#device_logs_cont') as HTMLElement;
        logs_cont.scrollTop = logs_cont.scrollHeight;
    });

    if (!window.electron) {
        logs_to_render.value.push({
            datetime: moment().format().split('+')[0],
            level: 'ERROR',
            msg: 'Browser Sandbox Environment Detected',
        });
        return;
    }
    window.electron?.ipcRenderer.on('add_sys_log', (_, data) => add_log(data));
    window.electron?.ipcRenderer.on(`${device_model}_device_error`, (_, data) => {
        const device_msg = data.device_msg as DeviceMsg;
        const error_msg = (device_msg as any).error_msg;
        add_log({ level: 'ERROR', msg: error_msg });
        // post_event('show_msg_modal', {
        //     severity: 'error',
        //     title: 'DEVICE ERROR',
        //     content: DEVICE_ERRORS[err_code],
        // });
        // post_event('set_device_status', { device_ok: false });
    });
});

</script>

<template>
    <div id="device_logs_cont" v-on="screenshot_handlers">
        <div v-for="log in logs_to_render" class="log_msg">
            <span v-if="log.level">[{{ log.datetime?.split('T')[1] ?? 'NONE' }}]</span>
            <span v-if="log.level" :style="`color: ${tag_color_map[log.level]}; margin: 0px 4px;`">[{{ log.level }}]</span>
            <span>{{ log.msg }}</span>
        </div>
    </div>
</template>

<style scoped>
.log_msg {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    white-space: pre;
}

#device_logs_cont {
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

::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    background-color: var(--empty-gauge-color);
}

::-webkit-scrollbar-thumb {
    background: var(--font-color);
    border-radius: 8px;
}

::-webkit-scrollbar-corner {
    background-color: var(--empty-gauge-color);
}
</style>