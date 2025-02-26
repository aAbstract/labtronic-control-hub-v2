<script setup lang="ts">
import { ref, computed, watch, } from 'vue';
import { electron_renderer_invoke } from '@renderer/lib/util';



const speed = ref(80)
setInterval(()=>{
    speed.value = Math.random()*100
},1000)

const line_width = 5
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
                <path d="M 2.55,50 A 40,40 0 0,1 97.5,50" stroke="var(--font-color)" fill="none" :stroke-width="line_thick" />

                <line id="rpm_gauge_line" x1="50" y1="50" :x2="10" :y2="50" stroke="var(--accent-color)" :stroke-width="line_thick * 4" />


            </svg>
        </transition>

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