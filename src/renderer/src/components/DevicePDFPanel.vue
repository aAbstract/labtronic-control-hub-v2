<script setup lang="ts">

import { ref, onMounted, inject } from 'vue';

import { subscribe } from '@common/mediator';
import { electron_renderer_invoke } from '@renderer/lib/util';

let pdf_object: Blob | null = null;
const panel_pos = ref('-60vw');
const device_model = inject('device_model');
const err_msg = ref('');
const device_pdf_src = ref<string | undefined>(undefined);
const pdf_iframe = ref<HTMLIFrameElement>();

onMounted(() => {
    subscribe('toggle_device_pdf_panel', _ => {
        const values_map = {
            '0px': '-60vw',
            '-60vw': '0px',
        };
        panel_pos.value = values_map[panel_pos.value];
    });

    subscribe('hide_device_pdf_panel', _ => panel_pos.value = '-60vw');

    subscribe('update_device_pdf_page', args => {
        const target_page: number = args.target_page;
        device_pdf_src.value = URL.createObjectURL(pdf_object ?? new Blob()) + '#page=' + target_page;
    });

    electron_renderer_invoke<string>('load_devie_pdf', { device_model }).then(base64_src => {
        if (!base64_src) {
            err_msg.value = 'No Manual Found for this Device';
            return;
        }
        const b64_buffer = base64_src.split(',')[1];
        const pdf_bin = atob(b64_buffer);
        const pdf_bytes = new Uint8Array(pdf_bin.length);
        for (let i = 0; i < pdf_bin.length; i++)
            pdf_bytes[i] = pdf_bin.charCodeAt(i);
        pdf_object = new Blob([pdf_bytes], { type: 'application/pdf' });
        device_pdf_src.value = URL.createObjectURL(pdf_object) + '#page=0';
    });
});

</script>

<template>
    <div id="device_pdf_panel_cont">
        <h4 id="err_msg" v-if="err_msg">{{ `Error Loading Device [${device_model}] Manual: ${err_msg}` }}</h4>
        <iframe v-if="device_pdf_src" :src="device_pdf_src" ref="pdf_iframe" frameborder="0" style="width: 100%; height: 100%;"></iframe>
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