<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import { DropdownOption, LT_HT004_DeviceOperationMode, DeviceMsg } from '@common/models';
import { post_event } from '@common/mediator';
import { electron_renderer_send } from '@renderer/lib/util';
import { screenshot_handlers } from '@renderer/lib/screenshot';

const device_model = inject('device_model');
const dropdown_pt: any = {
    root: { style: 'background-color: transparent; border: 1px solid var(--font-color); width: 140px; height: 30px;' },
    input: { style: 'padding: 0px 8px; color: var(--font-color); font-family: Cairo, sans-serif; font-size: 14px; font-weight: bold;' },
    panel: { style: 'background-color: var(--light-bg-color); font-family: Cairo, sans-serif;' },
    emptyMessage: { style: 'color: var(--font-color);' },
    item: { style: 'background-color: var(--light-bg-color); color: var(--font-color);' },
    trigger: { style: 'width: fit-content; padding-right: 8px;' },
    list: { style: 'padding: 0px;' },
};

// dropdowns
const device_op_mode = ref<LT_HT004_DeviceOperationMode>(LT_HT004_DeviceOperationMode.PLATE);
const device_op_mode_opts: DropdownOption<LT_HT004_DeviceOperationMode>[] = [
    { label: 'FLAT PLATE', value: LT_HT004_DeviceOperationMode.PLATE },
    { label: 'FIN HEATER', value: LT_HT004_DeviceOperationMode.HEATER },
    { label: 'PIPE BUNDLE', value: LT_HT004_DeviceOperationMode.BUNDLE },
];

const heater_surface_area_opts = [
    'Area : 108 * 108 = 0.0116 (m^2)',
    'Area : 108*108 + 18*(84*108) = 0.17496 (m^2)',
    'Area : 108 * 108 + 17*(pi*15*84) = 0.0789 (m^2)',
];
const heater_surface_area = ref(heater_surface_area_opts[0]);


const t_s_plate = ref('0.0')

const t_h = ref(['0.0', '0.0', '0.0', '0.0', '0.0'])
const t_4 = ref(['0.0', '0.0', '0.0', '0.0', '0.0', '0.0'])

const t_s = ref('0.0')

const msg_values_cache = ref(['0.0', '0.0', '0.0', '0.0'])

const selected_prop = ref(0)
const record = ref(false)

function switch_device_mode() {
    const _device_op_mode = device_op_mode.value;
    heater_surface_area.value = heater_surface_area_opts[_device_op_mode]
    electron_renderer_send(`${device_model}_switch_device_op_mode`, { _device_op_mode });
    if (_device_op_mode === LT_HT004_DeviceOperationMode.PLATE) {
        post_event('change_device_model_asset', { _asset: 'lt_ht004_plate' });
    }
    else if (_device_op_mode === LT_HT004_DeviceOperationMode.HEATER) {
        post_event('change_device_model_asset', { _asset: 'lt_ht004_heater' });
    }
    else if (_device_op_mode === LT_HT004_DeviceOperationMode.BUNDLE) {
        post_event('change_device_model_asset', { _asset: 'lt_ht004_bundle' });
    }
}

function calc_sum() {
    let sum = 0
    for (let i = 0; i < t_4.value.length; i++) {
        sum += Number(t_4.value[i])
    }
    return (sum / 6).toFixed(1)
}
onMounted(() => {
    post_event('change_device_model_asset', { _asset: 'lt_ht004_plate' });
    post_event('update_device_model_cont_width', { margin_bottom: '0px;' });

    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        switch (msg_type) {
            case 0:
                msg_values_cache.value[2] = device_msg.msg_value.toFixed(1);
                break;
            case 1:
                msg_values_cache.value[3] = device_msg.msg_value.toFixed(1);
                break;
            case 4:
                msg_values_cache.value[0] = device_msg.msg_value.toFixed(1);
                break;
            case 5:
                msg_values_cache.value[1] = device_msg.msg_value.toFixed(1);
                break;

            case 3:
                t_s_plate.value = device_msg.msg_value.toFixed(1)

                if (selected_prop.value < 5 && device_op_mode.value != LT_HT004_DeviceOperationMode.PLATE) {
                    t_h.value[selected_prop.value] = device_msg.msg_value.toFixed(1);
                }
                else if (selected_prop.value < 11 && device_op_mode.value != LT_HT004_DeviceOperationMode.PLATE) {
                    t_4.value[selected_prop.value - 5] = device_msg.msg_value.toFixed(1);
                }

                if (record.value) {
                    if (device_op_mode.value == LT_HT004_DeviceOperationMode.PLATE) {
                        t_s.value = device_msg.msg_value.toFixed(1);
                    }
                    else {
                        t_s.value = calc_sum()
                        selected_prop.value = selected_prop.value + 1
                    }
                    record.value = false
                }
                break;
            default:
                break;
        }
    })
})

const target_component_screenshot = ref()

function reset() {
    t_s_plate.value = '0.0'
    t_h.value = ['0.0', '0.0', '0.0', '0.0', '0.0']
    t_4.value = ['0.0', '0.0', '0.0', '0.0', '0.0', '0.0']
    t_s.value = '0.0'
}

function map_t_heater_color_code(t_heater: number): string {
    if (t_heater > 0 && t_heater <= 30)
        return '#64DD17';
    if (t_heater > 35 && t_heater <= 70)
        return '#FFAB00';
    if (t_heater > 75 && t_heater <= 100)
        return '#DD2C00';
    return '#DD2C00';
}


</script>

<template>
    <div ref="target_component_screenshot" id="lt_ht004_control_main_cont" v-on="screenshot_handlers">
        <div class="labeled_control lt_ht004_control_row">
            <span class="lt_ht004chx_data" style="color: rgb(0, 150, 136);">AirFlow: {{ msg_values_cache[1] }}</span>
            <span class="lt_ht004chx_data" style="color: rgb(156, 39, 176);">PT1000_In: {{ msg_values_cache[2] }}</span>
            <span class="lt_ht004chx_data" style="color: rgb(255, 152, 0);">PT1000_Out: {{ msg_values_cache[3] }}</span>
        </div>
        <div class="lt_ht004_control_row">
            <div class="labeled_control">
                <span>Sample Shape:</span>
                <Dropdown :pt="dropdown_pt" :options="device_op_mode_opts" optionLabel="label" optionValue="value" placeholder="Device Operation Mode" title="Device Operation Mode" v-model="device_op_mode" @change="switch_device_mode" />
            </div>
            <span class="lt_ht004chx_data"  :style="{ 'font-weight': 'bold', 'color': map_t_heater_color_code(Number(msg_values_cache[0])) }">P_Heater: {{ msg_values_cache[0] }}</span>
        </div>


        <div class="lt_ht004_control_row">
            <div class="lt_ht004_control_row">
                <span  id="lt_ht004_area">{{ heater_surface_area }}</span>
            </div>
        </div>

        <div id="lt_ht004_surface_temperature">
            <div class="lt_ht004_control_row" v-if="device_op_mode == LT_HT004_DeviceOperationMode.PLATE">
                <div class="labeled_control">
                    <span>Current T_S</span>
                    <input type="text" class="inp" readonly v-model="t_s_plate">
                </div>
                <div class="labeled_control">
                    <span>Saved T_S</span>
                    <input type="text" class="inp" readonly v-model="t_s">
                </div>
            </div>
            <div id="lt_ht004_heater_bundle" v-else>
                <div class="labeled_control">
                    <span>T_H:</span>
                    <div class="input_container">
                        <input :class="{ selected: selected_prop == 0 }" @click="selected_prop = 0" type="text" class="inp" readonly v-model="t_h[0]">
                        <input :class="{ selected: selected_prop == 1 }" @click="selected_prop = 1" type="text" class="inp" readonly v-model="t_h[1]">
                        <input :class="{ selected: selected_prop == 2 }" @click="selected_prop = 2" type="text" class="inp" readonly v-model="t_h[2]">
                        <input :class="{ selected: selected_prop == 3 }" @click="selected_prop = 3" type="text" class="inp" readonly v-model="t_h[3]">
                        <input :class="{ selected: selected_prop == 4 }" @click="selected_prop = 4" type="text" class="inp" readonly v-model="t_h[4]">
                    </div>
                </div>
                <div class="labeled_control">
                    <span>T_4:</span>
                    <div class="input_container">
                        <input :class="{ selected: selected_prop == 5 }" @click="selected_prop = 5" type="text" class="inp" readonly v-model="t_4[0]">
                        <input :class="{ selected: selected_prop == 6 }" @click="selected_prop = 6" type="text" class="inp" readonly v-model="t_4[1]">
                        <input :class="{ selected: selected_prop == 7 }" @click="selected_prop = 7" type="text" class="inp" readonly v-model="t_4[2]">
                        <input :class="{ selected: selected_prop == 8 }" @click="selected_prop = 8" type="text" class="inp" readonly v-model="t_4[3]">
                        <input :class="{ selected: selected_prop == 9 }" @click="selected_prop = 9" type="text" class="inp" readonly v-model="t_4[4]">
                        <input :class="{ selected: selected_prop == 10 }" @click="selected_prop = 10" type="text" class="inp" readonly v-model="t_4[5]">
                    </div>
                </div>
                <div class="lt_ht004_control_row">
                    <div class="labeled_control">
                        <span>T_S:</span>
                        <div class="input_container">
                            <input type="text" class="inp" readonly v-model="t_s">
                        </div>
                    </div>

                </div>

            </div>

        </div>
        <div id="lt_ht004_btns_cont">
            <Button style="width: 140px;" label="Reset" icon="pi pi-refresh" @click="reset" />
            <Button style="width: 140px;" @click="record = !record" :label="record ? 'Recording...' : 'Record'" icon="pi pi-circle-fill" />

        </div>
    </div>


</template>

<style scoped>
#lt_ht004_area{
    color: var(--font-color); 
    font-size: 16px;
}
.lt_ht004chx_data{
font-size: 16px;
}
input[type='text'] {
    width: 50px;

}

.inp {
    font-family: "Lucida Console", "Courier New", monospace;
    color: var(--font-color);
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 12px;
    font-weight: bold;
    padding: 4px;
}

#lt_ht004_heater_bundle {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

#lt_ht004_btns_cont {
    width: 100%;
    display: flex;
    justify-content: space-around;
    margin-top: 8px;
}


button {
    background-color: transparent;
    color: var(--accent-color);
    height: 32px;
    font-size: 14px;
}

#lt_ht004_surface_temperature {
    width: 100%;
}


.selected {
    outline: none;
    border: 1px solid var(--accent-color);
}

.labeled_control {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: fit-content;

}

.input_container {
    display: flex;
    gap: 4px;
}

.labeled_control span {
    display: inline-block;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
    margin-right: 8px;
}

.lt_ht004_control_row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 4px;
}

input:focus {
    outline: none;
}

#lt_ht004_control_main_cont {
    width: 96%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--light-bg-color);
    border: 1px solid var(--empty-gauge-color);
    border-radius: 4px;
    padding: 8px;
}
</style>