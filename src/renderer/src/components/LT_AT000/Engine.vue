<script setup lang="ts">
import { ref, computed, watch, inject, onMounted } from 'vue';
import { OBDCONFIG } from '@common/models';
import { electron_renderer_invoke } from '@renderer/lib/util';
import { DeviceMsg } from '@common/models';
import TemperatureLowIcon from '../icons/TemperatureLowIcon.vue';

const device_model = inject('device_model');

const load = ref(0)
const speed = ref(0)
const heat = ref(0)
const load_conf = ref<OBDCONFIG | null>(null)
const rpm_conf = ref<OBDCONFIG | null>(null)
const tem_conf = ref<OBDCONFIG | null>(null)



const load_angle = computed(() => {
    if (!load_conf.value)
        return 0
    return -(load.value / (load_conf.value?.max - load_conf.value?.min) * Math.PI / 3 - Math.PI * 2 / 3)
})


window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
    const device_msg: DeviceMsg = data.device_msg;
    const { msg_type } = device_msg.config;
    switch (msg_type) {

        case 23:
            load.value = Math.round(device_msg.msg_value)
            break;
        case 24:
            speed.value = Math.round(device_msg.msg_value)
            break;
        case 25:
            heat.value = Math.round(device_msg.msg_value)
            break;

        default:
            break;
    }
}
)


const line_width = 10
const line_thick = 0.25


const line1_angle = 60
const line2_angle = 30
const trasform = Math.PI / 180
const lines = computed(() => {
    return [{
        x1: 50,
        x2: 50,
        y1: 0,
        y2: line_width
    },
    {
        x1: 0,
        x2: line_width,
        y1: 50,
        y2: 50
    },
    {
        x1: 100,
        x2: 100 - line_width,
        y1: 50,
        y2: 50
    },
    {
        x1: 50 + 50 * Math.cos(line1_angle * trasform),
        x2: 50 + (50 - line_width) * Math.cos(line1_angle * trasform),
        y1: 50 - 50 * Math.sin(line1_angle * trasform),
        y2: 50 - (50 - line_width) * Math.sin(line1_angle * trasform),
    },
    {
        x1: 50 - 50 * Math.cos(line1_angle * trasform),
        x2: 50 - (50 - line_width) * Math.cos(line1_angle * trasform),
        y1: 50 - 50 * Math.sin(line1_angle * trasform),
        y2: 50 - (50 - line_width) * Math.sin(line1_angle * trasform),
    },

    {
        x1: 50 + 50 * Math.cos(line2_angle * trasform),
        x2: 50 + (50 - line_width) * Math.cos(line2_angle * trasform),
        y1: 50 - 50 * Math.sin(line2_angle * trasform),
        y2: 50 - (50 - line_width) * Math.sin(line2_angle * trasform),
    },
    {
        x1: 50 - 50 * Math.cos(line2_angle * trasform),
        x2: 50 - (50 - line_width) * Math.cos(line2_angle * trasform),
        y1: 50 - 50 * Math.sin(line2_angle * trasform),
        y2: 50 - (50 - line_width) * Math.sin(line2_angle * trasform),
    },
    ]
})

defineProps(['mode'])

function animate_rpm_gauge() {
    const animation_duration = 300;
    const start_time = performance.now();
    const _line = document.querySelector('#rpm_gauge_line');
    if (!_line)
        return;
    const _line_x2 = Number(_line.getAttribute('x2'));
    const _line_y2 = Number(_line.getAttribute('y2'));
    let _line_angel = Math.atan((_line_y2 - 50) / (50 - _line_x2));
    if (_line_angel > 0)
        _line_angel = _line_angel - Math.PI;
    let target_angle = 0
    if (rpm_conf.value)
        target_angle = -(speed.value / (rpm_conf.value?.max - rpm_conf.value?.min) * Math.PI);
    console.log(target_angle)
    function animation_loop(t: number) {
        if (!_line)
            return;

        const elapsed_time = t - start_time;
        const progress = Math.min(elapsed_time / animation_duration, 1);
        const _angel = _line_angel + progress * (target_angle - _line_angel);
        const _x2 = 50 - 40 * Math.cos(_angel);
        const _y2 = 50 + 40 * Math.sin(_angel);

        _line.setAttribute('x2', String(_x2));
        _line.setAttribute('y2', String(_y2));

        if (progress < 1)
            requestAnimationFrame(animation_loop);
    }

    requestAnimationFrame(animation_loop);
}

const engine_src = ref()
electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'etc/lt_at000/Engine.png' }).then(base64_src => {
    if (!base64_src)
        return;
    engine_src.value = base64_src;
});


watch(speed, () => {
    animate_rpm_gauge();
});


onMounted(() => {
    electron_renderer_invoke<OBDCONFIG[]>(`${device_model}_get_obd_congis`).then((obd_config) => {
        if (!obd_config)
            return
        load_conf.value = obd_config.find((conf: OBDCONFIG) => { return conf.msg_type == 23 }) ?? null
        rpm_conf.value = obd_config.find((conf: OBDCONFIG) => { return conf.msg_type == 24 }) ?? null
        tem_conf.value = obd_config.find((conf: OBDCONFIG) => { return conf.msg_type == 25 }) ?? null
    })
})
</script>


<template>

    <div class="speed_container">
        <transition name="move">
            <svg viewBox="0 0 100 100">

                <defs>
                    <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="var(--font-color)" />
                        <stop offset="100%" stop-color="var(--danger-color)" />
                    </linearGradient>
                </defs>

                <line v-for="line in lines" :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" stroke="var(--font-color)" :stroke-width="line_thick" />
                <circle :r="line_thick * 10" cx="50" cy="50" fill="var(--accent-color)" />
                <path d="M 5,50 A 40,40 0 0,1 95,50" stroke="var(--font-color)" fill="none" :stroke-width="line_thick" />
                <line :x1="50 + 35 * Math.cos(load_angle)" :y1="50 + 35 * Math.sin(load_angle)" :x2="50 + 45 * Math.cos(load_angle)" :y2="50 + 45 * Math.sin(load_angle)" stroke="var(--accent-color)" :stroke-width="line_thick * 5" />

                <line id="rpm_gauge_line" x1="50" y1="50" :x2="10" :y2="50" stroke="var(--accent-color)" :stroke-width="line_thick * 4" />

                <path d="M 25,92.5 A 50,50 0 0,0 75,92.5" stroke="url(#arcGradient)" fill="none" :stroke-width="line_thick * 5" />


            </svg>
        </transition>
        <div class="rpm">
            <h3 class="rpm_text" :class="{ mode1_rpm_text: mode == 1 }">{{ Math.round(speed / 100) }} <span style="font-size: 16px;"> {{ rpm_conf?.unit }} </span></h3>
            <p :class="{ mode1_text: mode == 1 }" v-if="mode == 2">x100</p>
        </div>
        <div class="engine_load">
            <img style="width: 12.5%;" :src="engine_src" alt="">
            <h3 :class="{ mode1_text: mode == 1 }">{{ load }} {{ load_conf?.unit }}</h3>
        </div>
        <div class="icon_val">
            <TemperatureLowIcon style="height: 32px;" fill_color="var(--font-color)" />
            <h3 :class="{ mode1_text: mode == 1 }">{{ heat }} <span>{{ tem_conf?.unit }}</span></h3>

        </div>
    </div>
</template>



<style scoped>
.icon_val {
    display: flex;
    justify-content: center;
    align-items: center;

    text-align: center;
    width: 100%;
    gap: 8px;
}

.engine_load {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 45%;
    width: 100%;
    gap: 5%;

}

.rpm {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 7.5%;
    right: 50%;
    transform: translate(50%, 20px);
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
    left: 15%;
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;

}

p {
    margin: 0;
    color: var(--font-color);
}

.speed_container {
    width: 90%;
    aspect-ratio: 1/1;
    position: relative;
}

.rpm_text {
    font-size: 48px;
}

.mode1_text {
    font-size: 20px;
}

.mode1_rpm_text {
    font-size: 24px;
    line-height: 24px;
}
</style>