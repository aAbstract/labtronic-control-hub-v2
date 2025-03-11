<script setup lang="ts">

import { ref, onMounted, computed } from 'vue';

import { electron_renderer_invoke } from '@renderer/lib/util';
import { DeviceMsg } from '@common/models';
import { subscribe } from '@common/mediator';

const active_quad_idx = ref(1);

const quad_1_src = ref('');
const quad_2_src = ref('');
const quad_3_src = ref('');
const quad_4_src = ref('');

const quad_1_border_style = computed(() => active_quad_idx.value === 1 ? '1px solid var(--accent-color)' : '1px solid var(--empty-gauge-color)');
const quad_2_border_style = computed(() => active_quad_idx.value === 2 ? '1px solid var(--accent-color)' : '1px solid var(--empty-gauge-color)');
const quad_3_border_style = computed(() => active_quad_idx.value === 3 ? '1px solid var(--accent-color)' : '1px solid var(--empty-gauge-color)');
const quad_4_border_style = computed(() => active_quad_idx.value === 4 ? '1px solid var(--accent-color)' : '1px solid var(--empty-gauge-color)');

let m_t_sn = 0;
let m_t_value = 0;
let w_s_sn = 0;
let w_s_value = 0;

function __st_quad_map(w_s: number, m_t: number): number {
    if (w_s >= 0 && m_t >= 0)
        return 1;
    else if (w_s >= 0 && m_t < 0)
        return 2;
    else if (w_s < 0 && m_t < 0)
        return 3;
    else if (w_s < 0 && m_t >= 0)
        return 4;
    return 1;
}

onMounted(() => {
    electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'etc/lt_ev574/lt_ev574_quad_1.png' }).then(base64_src => {
        if (!base64_src)
            return;
        quad_1_src.value = base64_src;
    });

    electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'etc/lt_ev574/lt_ev574_quad_2.png' }).then(base64_src => {
        if (!base64_src)
            return;
        quad_2_src.value = base64_src;
    });

    electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'etc/lt_ev574/lt_ev574_quad_3.png' }).then(base64_src => {
        if (!base64_src)
            return;
        quad_3_src.value = base64_src;
    });

    electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'etc/lt_ev574/lt_ev574_quad_4.png' }).then(base64_src => {
        if (!base64_src)
            return;
        quad_4_src.value = base64_src;
    });

    subscribe('device_msg', data => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        const { seq_number, msg_value } = device_msg;

        if (msg_type === 3) {
            w_s_sn = seq_number;
            w_s_value = msg_value;
        }

        if (msg_type === 16) {
            m_t_sn = seq_number;
            m_t_value = msg_value;
        }

        if (w_s_sn === m_t_sn)
            active_quad_idx.value = __st_quad_map(w_s_value, m_t_value);
    });
});

</script>

<template>
    <div id="lt_ev574_quad_cont">
        <div style="margin-top: 16px;">
            <img style="margin-right: 8px;" class="quad_diagram_img" :style="{ border: quad_2_border_style }" :src="quad_2_src" alt="LT-EV574 Quad 2">
            <img class="quad_diagram_img" :style="{ border: quad_1_border_style }" :src="quad_1_src" alt="LT-EV574 Quad 1">
            <br>
            <img style="margin-right: 8px;" class="quad_diagram_img" :style="{ border: quad_3_border_style }" :src="quad_3_src" alt="LT-EV574 Quad 3">
            <img class="quad_diagram_img" :style="{ border: quad_4_border_style }" :src="quad_4_src" alt="LT-EV574 Quad 4">
        </div>
    </div>
</template>

<style lang="css" scoped>
.quad_diagram_img {
    border-radius: 4px;
}

#lt_ev574_quad_cont {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}
</style>