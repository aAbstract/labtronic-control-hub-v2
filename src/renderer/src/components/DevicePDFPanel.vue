<script setup lang="ts">

import { ref, onMounted, inject } from 'vue';

import { subscribe } from '@common/mediator';
import { electron_renderer_invoke } from '@renderer/lib/util';

const panel_pos = ref('-60vw');
const device_model = inject('device_model');
const err_msg = ref('');
const device_pdf_src = ref<string | undefined>(undefined);

onMounted(() => {
    subscribe('toggle_device_pdf_panel', 'toggle_device_pdf_panel_visi', _ => {
        const values_map = {
            '0px': '-60vw',
            '-60vw': '0px',
        };
        panel_pos.value = values_map[panel_pos.value];
    });

    subscribe('hide_device_pdf_panel', 'hide_device_pdf_panel', _ => panel_pos.value = '-60vw');

    electron_renderer_invoke<string>('load_devie_pdf', { device_model }).then(base64_src => {
        if (!base64_src)
            return;
        device_pdf_src.value = base64_src;
    });
});

</script>

<template>
    <div id="device_pdf_panel_cont">
        <h4 id="err_msg" v-if="err_msg">{{ `Error Loading Device [${device_model}] Manual: ${err_msg}` }}</h4>
        <iframe v-if="device_pdf_src" :src="device_pdf_src" frameborder="0" style="width: 100%; height: 100%;"></iframe>
    </div>
</template>

<style scoped>
#err_msg {
    margin: 0px;
    color: #FFAB00;
    text-align: center;
}

#device_pdf_panel_cont {
    position: absolute;
    width: calc(100% - 8px);
    left: v-bind(panel_pos);
    height: calc(100% - 24px);
    top: 12px;
    background-color: var(--light-bg-color);
    border-radius: 4px;
    color: var(--font-color);
    transition: 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    z-index: 2;
}
</style>