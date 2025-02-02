<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import Button from 'primevue/button';
import { DeviceMsg } from '@common/models';
import { post_event } from '@common/mediator';
import { screenshot_handlers } from '@renderer/lib/screenshot';

enum LT_HT004_DeviceOperationMode {
    PLATE = 0,
    HEATER = 1,
    BUNDLE = 2,
};

const device_model = inject('device_model');

// dropdowns
const device_op_mode = ref<LT_HT004_DeviceOperationMode>(LT_HT004_DeviceOperationMode.PLATE);

const t_s_plate = ref('0.0')

const t_h = ref(['0.0', '0.0', '0.0', '0.0', '0.0'])
const t_4 = ref(['0.0', '0.0', '0.0', '0.0', '0.0', '0.0'])

const t_s = ref('0.0')

const msg_values_cache = ref(['0.0', '0.0', '0.0', '0.0'])

const selected_prop = ref(0)
const record = ref(false)

function calc_sum() {
    let sum = 0
    for (let i = 0; i < t_4.value.length; i++) {
        sum += Number(t_4.value[i])
    }
    return (sum / 6).toFixed(1)
}
onMounted(() => {
    post_event('update_device_model_cont_width', { width: '80%' });

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

</script>

<template>
    <div ref="target_component_screenshot" id="lt_ht004_control_main_cont" v-on="screenshot_handlers">
        <div class="lt_ht004_control_row">
            <div class="lt_ht004_control_row">
                <span style="color: var(--font-color); font-size: 16px; font-weight: bold;">Op Amp Characteristics Kit - LT-EC559</span>
            </div>
        </div>

        <div id="lt_ht004_surface_temperature">
            <div id="lt_ht004_heater_bundle">
                <div class="labeled_control">
                    <span>T_1:</span>
                    <div class="input_container">
                        <input :class="{ selected: selected_prop == 0 }" @click="selected_prop = 0" type="text" class="inp" readonly v-model="t_h[0]">
                        <input :class="{ selected: selected_prop == 1 }" @click="selected_prop = 1" type="text" class="inp" readonly v-model="t_h[1]">
                        <input :class="{ selected: selected_prop == 2 }" @click="selected_prop = 2" type="text" class="inp" readonly v-model="t_h[2]">
                        <input :class="{ selected: selected_prop == 3 }" @click="selected_prop = 3" type="text" class="inp" readonly v-model="t_h[3]">
                        <input :class="{ selected: selected_prop == 4 }" @click="selected_prop = 4" type="text" class="inp" readonly v-model="t_h[4]">
                    </div>
                </div>
                <div class="labeled_control">
                    <span>V_2:</span>
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
                        <span>I_X:</span>
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