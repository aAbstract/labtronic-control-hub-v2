<script lang="ts" setup>
import { ref, inject, onMounted } from 'vue';
import { electron_renderer_invoke } from '@renderer/lib/util';
import { DeviceMsg,OBDCONFIG } from '@common/models';


const device_model = inject('device_model');
const left_pedal_val = ref(100)
const right_pedal_val = ref(0)
const left_pedal_conf = ref<OBDCONFIG|null>(null)
const right_pedal_conf= ref<OBDCONFIG|null >(null)


window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
    const device_msg: DeviceMsg = data.device_msg;
    const { msg_type } = device_msg.config;
    switch (msg_type) {
        case 20:
        left_pedal_val.value = Math.round(device_msg.msg_value)
            break;
        case 21:
        right_pedal_val.value = Math.round(device_msg.msg_value)
            break;
        default:
            break;
    }
}
)
const pedal_src = ref()

defineProps(['mode'])

electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'etc/lt_at000/Pedal.png' }).then(base64_src => {
    if (!base64_src)
        return;
    pedal_src.value = base64_src;
});

onMounted(()=>{
    electron_renderer_invoke<OBDCONFIG[]>(`${device_model}_get_obd_congis`).then((obd_config)=>{
        if(!obd_config)
            return
        left_pedal_conf.value = obd_config.find((conf:OBDCONFIG)=>{return conf.msg_type == 20}) ?? null
        right_pedal_conf.value = obd_config.find((conf:OBDCONFIG)=>{return conf.msg_type == 21}) ?? null
    })
})


</script>

<template>
    <div class="container">
        <div class="pedal_container">

            <div class="progress-container" :class="{ mode1_progress: mode == 1 }">
                <div class="progress-fill" :style="{ height: left_pedal_val + '%' }"></div>
            </div>
            <div class="pedal_val">
                <img :src="pedal_src" alt="">
                <h3 :class="{ mode1_text: mode == 1 }">{{ left_pedal_val }} {{ left_pedal_conf?.unit }}</h3>
            </div>
        </div>
        <div class="pedal_container">
            <div class="progress-container" :class="{ mode1_progress: mode == 1 }">
                <div class="progress-fill" :style="{ height: right_pedal_val + '%' }"></div>
            </div>
            <div class="pedal_val">
                <img :src="pedal_src" alt="">
                <h3 :class="{ mode1_text: mode == 1 }">{{ right_pedal_val }}  {{ right_pedal_conf?.unit }}</h3>
            </div>
        </div>
    </div>
</template>




<style scoped>
.container {
    width: 100%;
    height: 100%;
    display: flex;
}

.pedal_container {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
    align-items: center;
    justify-content: center;
}

.pedal_val {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;

}

.progress-container {
    width: 40px;
    height: 100%;
    border: 2px solid var(--accent-color);
    background-color: transparent;
    position: relative;
    overflow: hidden;
}

.progress-fill {
    width: 100%;
    position: absolute;
    bottom: 0;
    background: linear-gradient(to bottom, var(--danger-color), var(--font-color));
    transition: height 0.3s ease-in-out;
}

h3 {
    font-size: 32px;
    margin: 0;
    color: var(--accent-color);
}

img {
    width: 10%;
}

.mode1_text {
    font-size: 20px;
}

.mode1_progress {
    height: 50%;
}
</style>