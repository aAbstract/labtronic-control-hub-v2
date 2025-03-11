<script lang="ts" setup>

import { ref, onMounted, inject } from 'vue';

import { post_event } from '@common/mediator';
import { electron_renderer_invoke } from '@renderer/lib/util';
import { LTBusDeviceMsg } from '@common/models';
import { subscribe } from '@common/mediator';

defineProps<{ full_screen: boolean }>();
const temps = ref<number[]>(new Array(20).fill(0));
const temps_styles = [
    'top: 20%; left: 42.5%;',
    'top: 12.5%; left: 37.5%;',
    'top: 20%; left: 29%;',
    'top: 12.5%; left: 24%;',
    'top: 20%; left: 15%;',
    'top: 12.5%; left: 10%;',
    'top: 58%; left: 37.5%;',
    'top: 38%; left: 62%;',
    'top: 80%; left: 67.5%;',
    'top: 58%; right: 29%;',
    'top: 5%; right: 2.5%;',
    'top: 30%; right: 2.5%;',
    'top: 15%; left: 62%;',
    'top: 16%; left: 53%;',
    'top: 40%; left: 53%;',
    'top: 70%; left: 75.5%;',
    'top: 59.5%; left: 75%;',
    'top: 17.5%; right: 10%;',
    'top: 17.5%; left: 95.5%;',
    'top: 80%; left: 86.75%; width: 40px; text-align: center;',
];

const device_model_img = ref()
onMounted(() => {
    post_event('update_device_model_cont_width', { width: '70%', margin_bottom: '0px' });
    post_event('remove_ui_springs', {});

    const device_model = inject('device_model') as string
    electron_renderer_invoke<string>('load_devie_asset', { asset_path: `etc/${device_model.toLowerCase().replace('-', '_')}/dashboard.png` }).then(base64_src => {
        if (!base64_src)
            return;
        device_model_img.value = base64_src;
    });

    subscribe('device_msg', data => {
        const device_msg: LTBusDeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        if (msg_type >= 8 && msg_type <= 27)
            temps.value[msg_type - 8] = device_msg.msg_value;
    });
});

</script>

<template>
    <div class="dashboard_container">
        <img :src="device_model_img" />
        <div v-if="full_screen">
            <p v-for="(temp, idx) in temps" :style="`font-weight: bold; color: #FFAB00; ${temps_styles[idx]}`">{{ temp.toFixed(1) }}</p>
        </div>
    </div>
</template>

<style scoped>
.dashboard_container {

    margin-inline: auto;
    position: relative;
}

img {
    width: 100%;
}

p {
    position: absolute;
    margin: 0;
    padding: 0;
    font-size: 16px;
    color: var(--font-color);
}
</style>