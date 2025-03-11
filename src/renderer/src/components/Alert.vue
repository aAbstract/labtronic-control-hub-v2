<script setup lang="ts">

import { onMounted, ref, shallowRef, inject } from 'vue';
import Dialog from 'primevue/dialog';
import Message from 'primevue/message';
import Button from 'primevue/button';

import { subscribe } from '@common/mediator';
import { AlertConfig } from '@common/models';

const dialog_visible = ref(false);
const device_model = inject('device_model');
const dialog_config = shallowRef<AlertConfig>({
    title: 'Info',
    msg_severity: 'info',
    msg_body: 'Loading...',
    btns_config: [{ btn_text: 'OK', btn_type: 'info', btn_action: () => dialog_visible.value = false }],
});
const dialog_pt = {
    header: { style: 'padding: 12px 16px;' },
    content: { style: 'padding: 0px 16px;' },
};

onMounted(() => {
    subscribe('show_alert', args => {
        dialog_config.value = args.dialog_config;
        dialog_visible.value = true;
    });
    subscribe('hide_alert', () => dialog_visible.value = false);
    window.electron?.ipcRenderer.on(`${device_model}_device_connected`, _ => dialog_visible.value = false);
});

</script>

<template>
    <Dialog v-model:visible="dialog_visible" modal :header="dialog_config.title" :style="{ width: '40%' }" :pt="dialog_pt">
        <Message :severity="dialog_config.msg_severity" :closable="false">{{ dialog_config.msg_body }}</Message>
        <template #footer>
            <Button v-for="btn in dialog_config.btns_config" :label="btn.btn_text" outlined :severity="btn.btn_type" class="footer_btn" @click="btn.btn_action()" />
        </template>
    </Dialog>
</template>

<style scoped>
.footer_btn {
    padding: 8px;
    width: 150px;
}
</style>