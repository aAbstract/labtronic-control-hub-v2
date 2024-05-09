<script setup lang="ts">

import { shallowRef, ref, onBeforeMount, computed, inject } from 'vue';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

import { SerialPortMetaData, DropdownOption, LogMsg } from '@common/models';
import { post_event } from '@common/mediator';

const selected_port = ref();
const port_opts_ref = shallowRef<DropdownOption[]>([]);
const is_device_connected_ref = ref(false);
const btn_color = computed(() => is_device_connected_ref.value ? '#FFAB00' : 'var(--accent-color)');
const btn_txt = computed(() => is_device_connected_ref.value ? 'DISCONNECT' : 'CONNECT');
const device_model = inject('device_model');
const dropdown_pt: any = {
    root: { style: 'background-color: transparent; border: 1px solid var(--font-color);' },
    input: { style: 'padding: 0px 8px; color: var(--font-color); font-family: Cairo, sans-serif;' },
    panel: { style: 'background-color: var(--light-bg-color); font-family: Cairo, sans-serif;' },
    emptyMessage: { style: 'color: var(--font-color);' },
    item: { style: 'background-color: var(--light-bg-color); color: var(--font-color);' },
};

// evnet handlers
function device_connect_btn_click() {
    if (!is_device_connected_ref.value) {
        if (!selected_port.value) {
            post_event('add_sys_log', {
                source: '',
                level: 'ERROR',
                msg: 'No Port Selected',
            } as LogMsg);
            return;
        }

        if (!window.electron) {
            post_event('add_sys_log', {
                source: '',
                level: 'ERROR',
                msg: 'Operation Denied Browser Sandbox',
            } as LogMsg);
            return;
        }

        window.electron?.ipcRenderer.send(`${device_model}_serial_port_connect`, { port_name: selected_port.value });
    } else {
        window.electron?.ipcRenderer.send(`${device_model}_serial_port_disconnect`, {});
    }
}

function scan_serial_ports_btn_click() {
    if (!window.electron) {
        post_event('add_sys_log', {
            source: '',
            level: 'ERROR',
            msg: 'Operation Denied Browser Sandbox',
        } as LogMsg);
        return;
    }
    window.electron?.ipcRenderer.send('serial_port_scan', {});
}

onBeforeMount(() => {
    window.electron?.ipcRenderer.on(`${device_model}_device_connected`, _ => is_device_connected_ref.value = true);
    window.electron?.ipcRenderer.on(`${device_model}_device_disconnected`, _ => is_device_connected_ref.value = false);
    window.electron?.ipcRenderer.on('detected_ports', (_, data) => {
        const detected_ports = data.detected_ports as SerialPortMetaData[];
        port_opts_ref.value = detected_ports.map(x => {
            return {
                label: `${x.manufacturer} - ${x.port_name}`,
                value: x.port_name,
            } as DropdownOption;
        });
    });

});

</script>

<template>
    <div id="device_connector_cont">
        <Dropdown :pt="dropdown_pt" v-model="selected_port" :options="port_opts_ref" optionLabel="label" optionValue="value" placeholder="Select a Serial Port" />
        <Button id="device_conn_btn" :label="btn_txt" outlined @click="device_connect_btn_click()" />
        <Button id="scan_ports_btn" icon="pi pi-search" outlined @click="scan_serial_ports_btn_click()" />
    </div>
</template>

<style scoped>
#scan_ports_btn {
    height: 30px;
    text-align: center;
    color: var(--accent-color);
    border-color: var(--accent-color);
    margin-left: 16px;
}

#device_conn_btn {
    height: 30px;
    text-align: center;
    color: v-bind(btn_color);
    border-color: v-bind(btn_color);
    margin-left: 16px;
}

#device_connector_cont {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 8px;
    padding: 8px;
    border-radius: 8px;
    background-color: var(--dark-bg-color);
}
</style>