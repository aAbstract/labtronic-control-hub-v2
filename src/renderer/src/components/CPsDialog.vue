<script setup lang="ts">

import { ref, onMounted, inject, shallowRef, computed } from 'vue';
import Dialog from 'primevue/dialog';
// @ts-ignore
import Button from 'primevue/button';

import { subscribe } from '@common/mediator';
import { MsgTypeConfig, DataType, VceParamConfig, CHXComputedParam } from '@common/models';
import { electron_renderer_invoke, electron_renderer_send, clone_object } from '@renderer/lib/util';

const dialog_visible = ref(false);
const vce_param_config = shallowRef<VceParamConfig[]>();
const vce_chx_cps = ref<CHXComputedParam[]>();
const default_expr = computed(() => vce_param_config.value?.map(x => x.param_symbol).join(' + ') ?? '');
const device_model = inject('device_model');
const dialog_pt = {
    header: { style: 'padding: 12px 16px;' },
    content: { style: 'padding: 0px 16px;' },
};

function get_data_type_symbol(config: MsgTypeConfig): string {
    const dt_map = {
        [DataType.INT]: 'i',
        [DataType.UINT]: 'u',
        [DataType.FLOAT]: 'f',
        [DataType.COMMAND]: 'c',
    };
    const size_map = {
        1: 8,
        2: 16,
        4: 32,
        8: 64,
    };
    return `${dt_map[config.data_type]}${size_map[config.size_bytes]}`;
}

// @ts-ignore
function new_cp_btn_click() {
    vce_chx_cps.value?.push({
        param_name: 'NEW_PARAM',
        expr: default_expr.value,
    });
}

// @ts-ignore
function delete_cp_btn_click(cp_idx: number) {
    vce_chx_cps.value?.splice(cp_idx, 1);
    electron_renderer_send('save_chx_cps', { _chx_cps: clone_object(vce_chx_cps.value) });
    dialog_visible.value = false;
}

// @ts-ignore
function save_cps_btn_click() {
    electron_renderer_send('save_chx_cps', { _chx_cps: clone_object(vce_chx_cps.value) });
    dialog_visible.value = false;
}

onMounted(() => {
    subscribe('show_cps_dialog', _ => {
        dialog_visible.value = true;
    });

    electron_renderer_invoke<VceParamConfig[]>(`${device_model}_get_vce_config`).then(_vce_param_config => {
        if (!_vce_param_config)
            return;
        vce_param_config.value = _vce_param_config;
    });

    subscribe('device_config_ready', () => {
        electron_renderer_invoke<CHXComputedParam[]>(`${device_model}_get_chx_cps`).then(chx_cps => {
            if (!chx_cps)
                return;
            vce_chx_cps.value = chx_cps;
        });
    });
});

</script>

<template>
    <Dialog style="font-family: Cairo, sans-serif;" v-model:visible="dialog_visible" modal header="Device Computed Parameters" :style="{ width: '60%' }" :pt="dialog_pt">
        <div id="vce_help">
            <div class="vce_help_row">
                <span style="width: 5vw;">VAR</span>
                <span style="width: 10vw;">MSG_TYPE</span>
                <span style="width: 10vw;">DATA_TYPE</span>
                <span style="flex-grow: 1;">DESCRIPTION</span>
            </div>
            <hr style="border-color: var(--font-color);">
            <div style="margin-bottom: 12px;" v-for="row in vce_param_config" class="vce_help_row">
                <span style="width: 5vw; min-width: 5vw;">{{ row.param_symbol }}</span>
                <span style="width: 10vw; min-width: 10vw;">{{ row.msg_type_config.msg_name }}</span>
                <span style="width: 10vw; min-width: 10vw;">{{ get_data_type_symbol(row.msg_type_config) }}</span>
                <span style="flex-grow: 1;">{{ row.desc }}</span>
            </div>
        </div>
        <div style="height: 8px;"></div>
        <div id="vce_cps">
            <div class="cp_row" v-for="(cp, _idx) in vce_chx_cps">
                <input class="cp_param_name" type="text" v-model="cp.param_name" readonly>
                <input class="cp_expr" type="text" v-model="cp.expr" readonly>
                <!-- <Button icon="pi pi-trash" severity="danger" text rounded @click="delete_cp_btn_click(idx)" /> -->
            </div>
        </div>
        <div id="vce_footer_controls">
            <!-- <Button icon="pi pi-save" severity="primary" outlined rounded @click="save_cps_btn_click()" /> -->
            <!-- <div style="width: 8px;"></div> -->
            <!-- <Button icon="pi pi-plus" severity="primary" outlined rounded @click="new_cp_btn_click()" /> -->
        </div>
    </Dialog>
</template>

<style scoped>
#vce_footer_controls button {
    width: 36px;
    height: 36px;
}

#vce_footer_controls {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding: 16px 0px;
}

.cp_row button {
    width: 40px;
    height: 40px;
    margin-left: 8px;
}

.cp_expr {
    flex-grow: 1;
}

.cp_param_name {
    max-width: 200px;
    margin-right: 8px;
}

.cp_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 8px;
}

.cp_row input[type="text"] {
    font-family: "Lucida Console", "Courier New", monospace;
    background-color: var(--dark-bg-color);
    color: var(--font-color);
    height: fit-content;
    border: none;
    padding: 8px;
    flex-grow: 1;
    font-weight: bold;
}

.cp_row input[type="text"]:focus {
    outline: none;
}

#vce_help {
    height: fit-content;
    width: 100%;
    background-color: var(--dark-bg-color);
    color: var(--font-color);
    padding: 8px;
    font-size: 12px;
    font-family: "Lucida Console", "Courier New", monospace;
    font-weight: bold;
    overflow-x: scroll;
}

.vce_help_row span {
    display: inline-block;
}

.vce_help_row {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
</style>