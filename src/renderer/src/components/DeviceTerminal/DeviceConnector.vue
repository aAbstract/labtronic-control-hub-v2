<script setup lang="ts">

import { shallowRef, ref, onBeforeMount, computed, inject } from 'vue';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

import { SerialPortMetaData, DropdownOption } from '@common/models';
import { add_log, electron_renderer_send } from '@renderer/lib/util';

const selected_port = ref();
const port_opts = shallowRef<DropdownOption<string>[]>([]);
const is_device_connected = ref(false);
const btn_color = computed(() => is_device_connected.value ? '#FFAB00' : 'var(--accent-color)');
const btn_txt = computed(() => is_device_connected.value ? 'DISCONNECT' : 'CONNECT');
const device_model = inject('device_model');
const toast_service = useToast();
const dropdown_pt: any = {
    root: { style: 'background-color: transparent; border: 1px solid var(--font-color); min-width: 160px; width: 10vw; height: 30px;' },
    input: { style: 'padding: 0px 8px; color: var(--font-color); font-family: Cairo, sans-serif; font-size: 14px; font-weight: bold;' },
    panel: { style: 'background-color: var(--light-bg-color); font-family: Cairo, sans-serif;' },
    emptyMessage: { style: 'color: var(--font-color);' },
    item: { style: 'background-color: var(--light-bg-color); color: var(--font-color);' },
    trigger: { style: 'width: fit-content; padding-right: 8px;' },
    list: { style: 'padding: 0px;' },
};

// evnet handlers
function device_connect_btn_click() {
    if (!is_device_connected.value) {
        if (!selected_port.value) {
            add_log({ level: 'ERROR', msg: 'No Port Selected' });
            return;
        }
        electron_renderer_send(`${device_model}_serial_port_connect`, { port_name: selected_port.value });
    } else { electron_renderer_send(`${device_model}_serial_port_disconnect`, {}) }
}

function scan_serial_ports_btn_click() {
    electron_renderer_send(`${device_model}_serial_port_scan`, {});
}

onBeforeMount(() => {
    window.electron?.ipcRenderer.on(`${device_model}_device_connected`, _ => {
        is_device_connected.value = true;
        toast_service.add({ severity: 'info', summary: 'Device Connected', detail: 'Connected to Device Port', life: 3000 });
    });
    window.electron?.ipcRenderer.on(`${device_model}_device_disconnected`, _ => {
        is_device_connected.value = false;
        toast_service.add({ severity: 'warn', summary: 'Device Disconnected', detail: 'Disconnected from Device Port', life: 3000 });
    });
    window.electron?.ipcRenderer.on(`${device_model}_detected_ports`, (_, data) => {
        const detected_ports = data.detected_ports as SerialPortMetaData[];
        port_opts.value = detected_ports.map(x => {
            return {
                label: `${x.manufacturer} - ${x.port_name}`,
                value: x.port_name,
            } as DropdownOption<string>;
        });
    });

});

</script>

<template>
    <div id="device_connector_cont">
        <Dropdown :pt="dropdown_pt" v-model="selected_port" :options="port_opts" optionLabel="label" optionValue="value" placeholder="Select a Serial Port" />
        <Button id="device_conn_btn" :label="btn_txt" outlined @click="device_connect_btn_click()" />
        <Button id="scan_ports_btn" icon="pi pi-search" outlined label="SCAN" @click="scan_serial_ports_btn_click()" />
    </div>
</template>

<style scoped>
#scan_ports_btn {
    height: 30px;
    text-align: center;
    color: var(--accent-color);
    border-color: var(--accent-color);
    margin-left: 16px;
    font-size: 14px;
    width: 10vw;
}

#device_conn_btn {
    height: 30px;
    text-align: center;
    color: v-bind(btn_color);
    border-color: v-bind(btn_color);
    margin-left: 16px;
    font-size: 14px;
    width: 10vw;
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
    border-radius: 4px;
    background-color: var(--dark-bg-color);
}
</style>