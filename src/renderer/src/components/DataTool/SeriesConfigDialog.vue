<script setup lang="ts">

import { ref, onMounted, inject, shallowRef } from 'vue';
import Dialog from 'primevue/dialog';
// @ts-ignore
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';

import { subscribe } from '@common/mediator';
import { electron_renderer_invoke, electron_renderer_send, clone_object } from '@renderer/lib/util';
import { MsgTypeConfig, DropdownOption, CHXSeries } from '@common/models';

const dialog_visible = ref(false);
const device_model = inject('device_model');
const params_opts = shallowRef<DropdownOption<number>[]>();
const chx_series = ref<CHXSeries[]>();
const dialog_pt = {
    header: { style: 'padding: 12px 16px;' },
    content: { style: 'padding: 0px 16px;' },
};
const dropdown_pt: any = {
    root: { style: 'background-color: transparent; border: 1px solid var(--font-color); width: 150px; height: 30px;' },
    input: { style: 'padding: 0px 8px; color: var(--font-color); font-family: Cairo, sans-serif; font-size: 14px; font-weight: bold;' },
    panel: { style: 'background-color: var(--light-bg-color); font-family: Cairo, sans-serif;' },
    emptyMessage: { style: 'color: var(--font-color);' },
    item: { style: 'background-color: var(--light-bg-color); color: var(--font-color);' },
    trigger: { style: 'width: fit-content; padding-right: 8px;' },
    list: { style: 'padding: 0px;' },
};

// @ts-ignore
function new_series_btn_click() {
    chx_series.value?.push({
        series_name: 'NEW SERIES',
        x_param: -1,
        y_param: -1,
    });
}

// @ts-ignore
function delete_series_btn_click(series_idx: number) {
    chx_series.value?.splice(series_idx, 1);
    electron_renderer_send('save_chx_series', { _chx_series: clone_object(chx_series.value) });
    dialog_visible.value = false;
}

// @ts-ignore
function save_series_btn_click() {
    electron_renderer_send('save_chx_series', { _chx_series: clone_object(chx_series.value) });
    dialog_visible.value = false;
}

onMounted(() => {
    subscribe('show_series_config_dialog', 'show_series_config_dialog', _ => {
        dialog_visible.value = true;
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
        electron_renderer_invoke<MsgTypeConfig[]>(`${device_model}_get_device_config`).then(device_config => {
            if (!device_config)
                return;
            const read_config = device_config.filter(x => x.msg_name.startsWith('READ_'));
            params_opts.value = read_config.map(_read_config => {
                return {
                    label: _read_config.msg_name.replace('READ_', ''),
                    value: _read_config.msg_type,
                } as DropdownOption<number>;
            });
        });
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
        electron_renderer_invoke<CHXSeries[]>(`${device_model}_get_chx_series`).then(_chx_series => {
            if (!_chx_series)
                return;
            chx_series.value = _chx_series;
        });
    });
});

</script>

<template>
    <Dialog style="font-family: Cairo, sans-serif;" v-model:visible="dialog_visible" header="Device Series Config" :style="{ width: '50%' }" :pt="dialog_pt">
        <div id="device_series_config_body">
            <div class="device_series_item_cont" v-for="(s, _idx) in chx_series">
                <input class="series_name" type="text" v-model="s.series_name" readonly>
                <Dropdown :pt="dropdown_pt" :options="params_opts" optionLabel="label" optionValue="value" placeholder="X Param" v-model="s.x_param" disabled />
                <Dropdown :pt="dropdown_pt" :options="params_opts" optionLabel="label" optionValue="value" placeholder="Y Param" v-model="s.y_param" disabled />
                <!-- <Button icon="pi pi-trash" severity="danger" text rounded @click="delete_series_btn_click(idx)" /> -->
            </div>
        </div>
        <div id="device_series_config_footer">
            <!-- <Button icon="pi pi-save" severity="primary" outlined rounded @click="save_series_btn_click()" /> -->
            <!-- <div style="width: 8px;"></div> -->
            <!-- <Button icon="pi pi-plus" severity="primary" outlined rounded @click="new_series_btn_click()" /> -->
        </div>
    </Dialog>
</template>

<style scoped>
.series_name {
    font-family: "Lucida Console", "Courier New", monospace;
    background-color: var(--dark-bg-color);
    color: var(--font-color);
    height: fit-content;
    border: none;
    padding: 8px;
    flex-grow: 1;
    font-weight: bold;
    width: 100px;
    max-width: 150px;
}

.series_name:focus {
    outline: none;
}

.device_series_item_cont {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

#device_series_config_footer button {
    width: 36px;
    height: 36px;
}

#device_series_config_footer {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding: 16px 0px;
}

#device_series_config_body {
    width: 90%;
    margin: auto;
}
</style>