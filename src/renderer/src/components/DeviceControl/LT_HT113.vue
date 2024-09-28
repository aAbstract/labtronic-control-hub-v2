<script setup lang="ts">

import { ref, onMounted, inject, computed } from 'vue';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Message from 'primevue/message';

import { DropdownOption, DeviceMsg } from '@common/models';
import { post_event } from '@common/mediator';

const device_model = inject('device_model');
// const T_sam_MSG_TYPE = 0;
// const T_amb_MSG_TYPE = 1;
// const T_ref_MSG_TYPE = 2;
const W_flw_MSG_TYPE = 3;
const WLS_MSG_TYPE = 4;

const dropdown_pt: any = {
    root: { style: 'background-color: transparent; border: 1px solid var(--font-color); width: fit-content; height: 30px;' },
    input: { style: 'padding: 0px 8px; color: var(--font-color); font-family: Cairo, sans-serif; font-size: 14px; font-weight: bold;' },
    panel: { style: 'background-color: var(--light-bg-color); font-family: Cairo, sans-serif;' },
    emptyMessage: { style: 'color: var(--font-color);' },
    item: { style: 'background-color: var(--light-bg-color); color: var(--font-color);' },
    trigger: { style: 'width: fit-content; padding-right: 8px;' },
    list: { style: 'padding: 0px;' },
};
const pv_msg_pt: any = {
    root: { style: 'margin: 0px; width: 100%; font-family: Cairo, sans-serif;' },
    wrapper: { style: 'padding: 4px 8px;' },
};

const sample_shape = ref(0);
const sample_shape_opts: DropdownOption<number>[] = [
    { label: 'Brass Slab L=100, W=65, H=15 (mm)', value: 0 },
    { label: 'Stainless Steel Slab L=100, W=65, H=15 (mm)', value: 1 },
    { label: 'Brass Cylinder D=20, L=100 (mm)', value: 2 },
    { label: 'Stainless Steel Cylinder D=20, L=100 (mm)', value: 3 },
    { label: 'Brass Cylinder D=30, L=100 (mm)', value: 4 },
    { label: 'Brass Sphere D = 45 (mm)', value: 5 },
    { label: 'Stainless Steel Sphere D = 45 (mm)', value: 6 },
];
const sample_shape_asset_map: Record<number, string> = {
    0: 'lt_ht113_brass_slab',
    1: 'lt_ht113_stainless_steel_slab',
    2: 'lt_ht113_brass_cylinder_d20',
    3: 'lt_ht113_stainless_steel_cylinder_d20',
    4: 'lt_ht113_brass_cylinder_d30',
    5: 'lt_ht113_brass_sphere',
    6: 'lt_ht113_stainless_steel_sphere',
};
function sample_select() {
    const _sample_shape = sample_shape.value;
    const _asset = sample_shape_asset_map[_sample_shape];
    post_event('change_device_model_asset', { _asset });
}

type LT_HT113_MsgSeverity = 'success' | 'info' | 'warn' | 'error';
const _lt_ht113_msg_content = ref('');
const _lt_ht113_msg_severity = ref<LT_HT113_MsgSeverity>('info');
const _show_lt_ht113_msg = ref(false);
function show_lt_ht113_msg(severity: LT_HT113_MsgSeverity, content: string) {
    _lt_ht113_msg_severity.value = severity;
    _lt_ht113_msg_content.value = content;
    _show_lt_ht113_msg.value = true;
}

const W_flw = ref(0);
const wls_state = ref(false);
const wls_state_lbl = computed(() => wls_state.value ? 'ON' : 'OFF');
const wls_state_color = computed(() => wls_state.value ? '#64DD17' : '#DD2C00');
function handle_water_level_switch_msg(wls: boolean) {
    wls_state.value = wls;
    if (wls)
        show_lt_ht113_msg('success', 'WATER LEVEL - OK');
    else
        show_lt_ht113_msg('warn', 'WATER LEVEL - INSUFFICIENT');
}
const cfg2_set = new Set([0xA0, 0xA1, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6]);
onMounted(() => {
    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type, cfg2 } = device_msg.config;
        if (msg_type === W_flw_MSG_TYPE)
            W_flw.value = device_msg.msg_value;
        else if (msg_type === WLS_MSG_TYPE)
            handle_water_level_switch_msg(device_msg.msg_value !== 0);


        // handle cfg2
        if (cfg2_set.has(cfg2) && (cfg2 - 0xA0) != sample_shape.value) {
            sample_shape.value = cfg2 - 0xA0;
            sample_select();
        } else { show_lt_ht113_msg('error', 'Invalid LT-HT113 Sample Code') }
    });

    post_event('update_device_model_cont_width', { width: '80%' });

    handle_water_level_switch_msg(wls_state.value);
});

</script>

<template>
    <div id="lt_ht113_control_main_cont">
        <div class="lt_ht113_control_row" style="justify-content: space-between;">
            <Dropdown :pt="dropdown_pt" :options="sample_shape_opts" optionLabel="label" optionValue="value" placeholder="Sample Shape" title="Sample Shape" v-model="sample_shape" @change="sample_select()" />
            <Button label="DATA TOOL" icon="pi pi-calculator" outlined @click="post_event('toggle_panel', { panel_name: 'data_tool', panel_pos: 'RIGHT' })" />
        </div>
        <div style="height: 12px;"></div>
        <div id="lt_ht113_control_txt" class="lt_ht113_control_row">
            <div>
                <span style="margin-right: 8px;">WATER_FLOW:</span>
                <span style="color: #2196F3;">{{ W_flw.toFixed(1) }}</span>
                <span style="margin-left: 8px;">[L/s]</span>
            </div>
            <div>
                <span style="margin-right: 8px;">WATER_LEVEL_SWITCH (WLS):</span>
                <span :style="`color: ${wls_state_color};`">{{ wls_state_lbl }}</span>
            </div>
        </div>
        <div v-if="_show_lt_ht113_msg" class="lt_ht113_control_row" style="margin-top: 12px;">
            <Message :severity="_lt_ht113_msg_severity" :pt="pv_msg_pt" closable @close="_show_lt_ht113_msg = false">{{ _lt_ht113_msg_content }}</Message>
        </div>
    </div>
</template>

<style scoped>
#lt_ht113_control_txt {
    justify-content: space-between;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
}

.lt_ht113_control_row button {
    height: 30px;
    width: fit-content;
    font-size: 12px;
}

.lt_ht113_control_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
}

#lt_ht113_control_main_cont {
    width: 96%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--light-bg-color);
    border-radius: 4px;
    padding: 8px;
}
</style>