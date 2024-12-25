<script setup lang="ts">

import { ref, onMounted } from 'vue';

import { electron_renderer_invoke } from '@renderer/lib/util';

const quad_1_src = ref('');
const quad_2_src = ref('');
const quad_3_src = ref('');
const quad_4_src = ref('');

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
});

</script>

<template>
    <div id="lt_ev574_quad_cont">
        <div>
            <img :src="quad_1_src" alt="LT-EV574 Quad 1">
            <img :src="quad_2_src" alt="LT-EV574 Quad 2">
        </div>
        <div>
            <img :src="quad_3_src" alt="LT-EV574 Quad 3">
            <img :src="quad_4_src" alt="LT-EV574 Quad 4">
        </div>
    </div>
</template>

<style lang="css" scoped>
#lt_ev574_quad_cont {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}
</style>