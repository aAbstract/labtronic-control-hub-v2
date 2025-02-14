<script setup lang="ts">
import { ref, inject, computed,onMounted } from 'vue';
import { electron_renderer_invoke } from '@renderer/lib/util';
import { DeviceMsg } from '@common/models';
import { OBDCONFIG } from '@common/models';

const device_model = inject('device_model');

//const fuel_rate = ref(0)
const pressure = ref(650565)
const flow = ref(0)
const pressure_conf = ref<OBDCONFIG|null>(null)

const pressure_angle = computed(() => {
    if (!pressure_conf.value)
        return 0
    return -(pressure.value / (pressure_conf.value?.max - pressure_conf.value?.min) * Math.PI * 2 / 3 - Math.PI / 3)
})

window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
    const device_msg: DeviceMsg = data.device_msg;
    const { msg_type } = device_msg.config;
    switch (msg_type) {

        case 22:
            pressure.value = Math.round(device_msg.msg_value)
            break;

        default:
            break;
    }
}
)



const line_width = 10
const line_thick = 0.25


const line_angle = 60
const trasform = Math.PI / 180
const lines = computed(() => {
    return [{
        x1: 100 - line_width,
        x2: 100,
        y1: 50,
        y2: 50
    },
    {
        x1: 50 + 50 * Math.cos(line_angle * trasform),
        x2: 50 + (50 - line_width) * Math.cos(line_angle * trasform),
        y1: 50 - 50 * Math.sin(line_angle * trasform),
        y2: 50 - (50 - line_width) * Math.sin(line_angle * trasform),
    },
    {
        x1: 50 + 50 * Math.cos(line_angle * trasform),
        x2: 50 + (50 - line_width) * Math.cos(line_angle * trasform),
        y1: 50 + 50 * Math.sin(line_angle * trasform),
        y2: 50 + (50 - line_width) * Math.sin(line_angle * trasform),
    },
    ]
})

defineProps(['mode'])

const fuel_src = ref()
electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'etc/lt_at000/Fuel.png' }).then(base64_src => {
    if (!base64_src)
        return;
    fuel_src.value = base64_src;
});


onMounted(()=>{
    electron_renderer_invoke<OBDCONFIG[]>(`${device_model}_get_obd_congis`).then((obd_config)=>{
        if(!obd_config)
            return
        pressure_conf.value = obd_config.find((conf:OBDCONFIG)=>{return conf.msg_type == 22}) ?? null
    })
})


</script>


<template>

    <div class="fuel_container" v-if="mode == 2">
        <svg viewBox="0 0 100 100">
            <line v-for="line in lines" :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" stroke="var(--font-color)" :stroke-width="line_thick" />
            <line :x1="50" :y1="50" :x2="50 + 30 * Math.cos(pressure_angle)" :y2="50 + 30 * Math.sin(pressure_angle)" stroke="var(--accent-color)" :stroke-width="line_thick * 2" />
            <circle :r="line_thick * 10" cx="50" cy="50" fill="var(--accent-color)" />
        </svg>
        <div class="pressure">
            <img :src="fuel_src" style="height: 40%;margin-top: 50%;" alt="">
            <h3>{{ Math.round(pressure / 1000) }} <span style="font-size: 18px;">{{ pressure_conf?.unit }}</span></h3>
            <p style="font-size: 14;">x1000</p>
        </div>
        <div>
            <h3 style="position: absolute;bottom: -10%;left: 40%;">{{ flow }} <span style="font-size: 18px;">L/s</span></h3>
            <p style="position: absolute; top: 16px; right:35%">F</p>
            <p style="position: absolute; bottom: 24px; right:35%">E</p>
        </div>
    </div>


    <div class="fuel_container" v-if="mode == 1">
        <div class="fuel_element" style="margin-top: 10%;justify-content: start; gap: 8px;font-weight: bold;">
            <img :src="fuel_src" style="width:20px;" alt="">
            <p class="mode1_small_text" style="font-size: 16px;">Fuel System</p>
        </div>
        <div class="fuel_element">
            <p class="mode1_small_text">Pressure</p>
            <h3 class="mode1_text">{{ Math.round(pressure / 1000) }}<span  class="mode1_small_text">x1000 {{ pressure_conf?.unit }}</span></h3>
        </div>

        <div class="fuel_element">
            <p class="mode1_small_text">Intake Rate</p>
            <h3 class="mode1_text">{{ flow }} <span class="mode1_small_text">L/S</span></h3>
        </div>
    </div>



</template>



<style scoped>
.fuel_element {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    align-items: center;
}

p {
    color: var(--font-color);
    padding: 0;
    margin: 0;
}

h3 {
    margin: 0;
    padding: 0;
    color: var(--accent-color);
    font-size: 32px;
}

.pressure {
    position: absolute;
    top: 0%;
    left: 5%;
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;

}

.small_text {
    font-size: 18px;
}

.fuel_container {
    width: 100%;
    position: relative;
}

.mode1_small_text {
    font-size: 12px;
}

.mode1_text {
    font-size: 20px;
}
</style>