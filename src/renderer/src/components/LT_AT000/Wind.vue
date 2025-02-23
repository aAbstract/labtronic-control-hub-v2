<script lang="ts" setup>
import WindIcon from '../icons/WindIcon.vue';
import TemperatureLowIcon from '../icons/TemperatureLowIcon.vue';
import PressureIcon from '../icons/PressureIcon.vue';
import { ref, inject, onMounted } from 'vue';
import { electron_renderer_invoke } from '@renderer/lib/util';
import { DeviceMsg } from '@common/models';
import { OBDCONFIG } from '@common/models';


const speed = ref(0)
const tem = ref(0)
const pressure = ref(0)

//const speed_conf = ref<OBDCONFIG | null>(null)
const tem_conf = ref<OBDCONFIG | null>(null)
const pressure_conf = ref<OBDCONFIG | null>(null)

const device_model = inject('device_model');


window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
    const device_msg: DeviceMsg = data.device_msg;
    const { msg_type } = device_msg.config;
    switch (msg_type) {

        case 26:
            tem.value = Math.round(device_msg.msg_value)
            break;
        case 27:
            pressure.value = Math.round(device_msg.msg_value)
            break;
        case 41:
            speed.value = Math.round(device_msg.msg_value)
            break;
        default:
            break;
    }
}
)


defineProps(['mode'])

const wind_src = ref()
electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'etc/lt_at000/Wind.png' }).then(base64_src => {
    if (!base64_src)
        return;
    wind_src.value = base64_src;
});

onMounted(() => {
    electron_renderer_invoke<OBDCONFIG[]>(`${device_model}_get_obd_congis`).then((obd_config) => {
        if (!obd_config)
            return
        pressure_conf.value = obd_config.find((conf: OBDCONFIG) => { return conf.msg_type == 27 }) ?? null
        tem_conf.value = obd_config.find((conf: OBDCONFIG) => { return conf.msg_type == 26 }) ?? null
    })
})
</script>
<template>
    <div class="container">
        <img :src="wind_src" alt="">
        <div class="info_container">
            <div class="info_element">
                <div class="icon_val">
                    <TemperatureLowIcon class="icon" fill_color="var(--font-color)" />
                    <h3 :class="{ mode1_text: mode == 1 }">{{ tem }}</h3>
                </div>
                <p :class="{ mode1_small_text: mode == 1 }"> {{ tem_conf?.unit }} </p>
            </div>
            <div class="info_element">
                <div class="icon_val">
                    <PressureIcon class="icon" fill_color="var(--font-color)" />
                    <h3 :class="{ mode1_text: mode == 1 }">{{ pressure }}</h3>
                </div>
                <p :class="{ mode1_small_text: mode == 1 }"> {{ pressure_conf?.unit }} </p>
            </div>
            <div class="info_element">
                <div class="icon_val">
                    <WindIcon class="icon" fill_color="var(--font-color)" />
                    <h3 :class="{ mode1_text: mode == 1 }">{{ speed }}</h3>
                </div>
                <p :class="{ mode1_small_text: mode == 1 }"> m/s </p>
            </div>

        </div>
    </div>
</template>
<style scoped>
.icon_val {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
}

.icon {
    height: 50%;
}

.container {
    width: 100%;
    display: flex;
    flex-direction: column;

}

.info_container {
    display: flex;
    justify-content: space-around;
}

.info_element {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

h3,
p {
    margin: 0;
    padding: 0;
}

h3 {
    color: var(--accent-color);
    font-size: 32px;
}

p {
    color: var(--font-color);
}

img {
    width: 100%;
}

.mode1_small_text {
    font-size: 12px;
}

.mode1_text {
    font-size: 20px;
}
</style>