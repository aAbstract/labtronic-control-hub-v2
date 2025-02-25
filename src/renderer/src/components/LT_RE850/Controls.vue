<script lang="ts" setup>
import ToggleButton from 'primevue/togglebutton';
import Slider from 'primevue/slider';
import { ref, reactive } from 'vue';
import Knob from './Knob.vue';
import Bar from './Bar.vue';


const fan_speed = ref(0)
const heat_power = ref(0)


const fan_speed_slide = ref(0)
const heat_power_slide = ref(0)

const heater_tmp = ref(2)
const thermo_tmp = ref(1)

defineProps(['full_screen'])

const slider_pt: any = {
    root: { style: 'background-color: var(--empty-gauge-color);' },
    handle: { style: 'background-color: var(--accent-color);' },
    range: { style: 'background-color: var(--accent-color);' },
};



function threshold_value(x: any, upper_limit: number): number {
    if (isNaN(x) || x < 0)
        return 0;
    return Math.min(upper_limit, x);
}

function submit_fan_speed_val() {
    let _fan_speed = threshold_value(fan_speed.value, 100);
    fan_speed.value = _fan_speed;
    fan_speed_slide.value = _fan_speed;
}


function submit_heat_power_val() {
    let _heat_power = threshold_value(heat_power.value, 100);
    heat_power.value = _heat_power;
    heat_power_slide.value = _heat_power;
}
const buttons = reactive({
    control: [
        {
            name: 'FAN',
            value: false,
        },
        {
            name: 'PUMP1',
            value: false,
        },
        {
            name: 'PUMP2',
            value: false,
        },
        {
            name: 'CompMode',
            value: false,
        },
        {
            name: 'Comp',
            value: false,
        },
        {
            name: 'RevValve',
            value: false,
        },
        {
            name: 'Heater',
            value: false,
        },
        {
            name: 'TapCirc',
            value: false,
        },
        {
            name: 'TankFill',
            value: false,
        },
        {
            name: 'TankDrain',
            value: false,
        }
    ],

    fault: [
        {
            name: 'F1',
            value: false,
        },
        {
            name: 'F2',
            value: false,
        },
        {
            name: 'F3',
            value: false,
        },
        {
            name: 'F4',
            value: false,
        },
        {
            name: 'F5',
            value: false,
        },
        {
            name: 'F6',
            value: false,
        },
        {
            name: 'F7',
            value: false,
        },
        {
            name: 'F8',
            value: false,
        },
        {
            name: 'F9',
            value: false,
        },
        {
            name: 'F10',
            value: false,
        }
    ]

})




</script>



<template>

    <div class="controls_container" :class="{ full_screen: full_screen }">


        <div class="lt_re850_control_row" title="Heater Power (W)">
            <span class="lt_re850_control_lbl">Fan Speed (%)</span>
            <Slider style="flex-grow: 1; margin-right: 8px;" :pt="slider_pt" :max="100" v-model="fan_speed_slide" @slideend="fan_speed = fan_speed_slide" />
            <input style="width: 50px;" class="lt_re850_inp" type="text" v-model="fan_speed" @keyup.enter="submit_fan_speed_val">
        </div>
        <div class="lt_re850_control_row" title="Heater Power (W)">
            <span class="lt_re850_control_lbl">Heat Power (%)</span>
            <Slider style="flex-grow: 1; margin-right: 8px;" :pt="slider_pt" :max="100" v-model="heat_power_slide" @slideend="heat_power = heat_power_slide" />
            <input style="width: 50px;" class="lt_re850_inp" type="text" v-model="heat_power" @keyup.enter="submit_heat_power_val">
        </div>
        <div class=" lt_re850_temps">
            <div class="lt_re850_temps">
                <span class="lt_re850_control_lbl">Heater TMP (C)</span>
                <input style="width: 50px;" class="lt_re850_inp" type="text" v-model="heater_tmp" @keyup.enter="submit_heat_power_val">
            </div>
            <div>
                <span class="lt_re850_control_lbl">Thermostat (C)</span>
                <input style="width: 50px;" class="lt_re850_inp" type="text" v-model="thermo_tmp" @keyup.enter="submit_heat_power_val">
            </div>
        </div>


        <div class="lt_re850_buttons">
            <div class="control_buttons">
                <div class="button_text" v-for="button in buttons.control">
                    <span>{{ button.name }}</span>
                    <ToggleButton class="button" v-model="button.value" offLabel="OFF" onLabel="ON" :pt="{ box: { style: 'font-size:12px' } }" />
                </div>
            </div>
            <div style="min-height: 100%; width: 4px;border-radius: 8px; background-color: var(--empty-gauge-color);"></div>
            <div class="fault_buttons">
                <div class="button_text" v-for="button in buttons.fault">
                    <span>{{ button.name }}</span>
                    <ToggleButton class="button" v-model="button.value" offLabel="OFF" onLabel="ON" :pt="{ box: { style: 'font-size:12px' } }"  />
                </div>
            </div>
        </div>

    </div>
    <!-- <Knob style="width: 200px;" />
    <Bar style="height: 200px;" /> -->


</template>




<style scoped>
.button {
    padding: 0;
    height: 20px;
    width: 80px;
}

.button_text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    color: var(--font-color);
    font-size: 14px;
    font-weight: bold;
}

.fault_buttons,
.control_buttons {
    display: flex;
    gap: 4px;
    flex-direction: column;
}

.lt_re850_buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 24px;
}

.lt_re850_temps {
    display: flex;
    justify-content: space-around;
}

.lt_re850_control_lbl {
    display: inline-block;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
    margin-right: 16px;
    width: 100px;
}

.lt_re850_inp {
    font-family: "Lucida Console", "Courier New", monospace;
    color: var(--font-color);
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 12px;
    font-weight: bold;
    padding: 4px;
    width: 30px;
}

.lt_re850_inp:focus {
    outline: none;
    border: 1px solid var(--accent-color);
}

.lt_re850_control_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-block: 4px;
    width: 100%;
    gap: 8px;
}

.controls_container {
    padding: 8px 32px;
    height: 34vh;
    overflow-y: auto;
}

.full_screen {
    height: 80vh;
    width: 80%;
    margin-inline: auto;
    margin-top: 48px;
}
</style>