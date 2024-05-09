<!-- <script setup lang="ts">

import { ref, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { subscribe, post_event } from '../../../common/mediator';

const SEV_COLORS = {
    'success': '#64DD17',
    'info': 'var(--accent-color)',
    'warn': '#FFAB00',
    'error': '#DD2C00',
};

const show_modal_ref = ref(false);
const sev_ref = ref('info');
const content_ref = ref('');
const title_ref = ref('');

function show_modal() {
    show_modal_ref.value = true;
}

function close_modal() {
    post_event('set_device_status', { device_ok: true });
    show_modal_ref.value = false;
}

onMounted(() => {
    subscribe('show_msg_modal', 'show_msg_modal_func', args => {
        const { severity, content, title } = args;
        sev_ref.value = severity;
        content_ref.value = content;
        title_ref.value = title;
        show_modal();
    });
});

</script>

<template>
    <Dialog :pt="{
        header: { style: 'padding: 8px; background-color: var(--light-bg-color); color: var(--font-color); font-size: 18px;' },
        content: { style: 'padding: 8px 20px; background-color: var(--light-bg-color);' },
        footer: { style: 'padding: 0px; background-color: var(--light-bg-color);' },
    }" style="width: 35%;" v-model:visible="show_modal_ref" :header="title_ref" position="bottomleft" :modal="true"
        :draggable="false">
        <h1 id="msg_txt_cont" :style="`color: ${SEV_COLORS[sev_ref]}; border-color: ${SEV_COLORS[sev_ref]};`">{{
            content_ref }}</h1>
        <template #footer>
            <Button id="msg_modal_close_btn" label="CLOSE" icon="pi pi-times" @click="close_modal()" outlined />
        </template>
    </Dialog>
</template>

<style scoped>
#msg_txt_cont {
    font-family: Cairo, sans-serif;
    text-align: left;
    border: 1px solid;
    padding: 8px 16px;
    border-radius: 4px;
    margin: 0px;
    font-size: 16px;
}

#msg_modal_close_btn {
    height: 40px;
    width: fit-content;
    margin: 8px 16px;
    color: var(--accent-color);
    border-color: var(--accent-color);
}
</style> -->