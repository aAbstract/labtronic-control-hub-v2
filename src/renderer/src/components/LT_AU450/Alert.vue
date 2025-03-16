<script setup lang="ts">

import { onMounted, ref } from 'vue';
import Dialog from 'primevue/dialog';
import Message from 'primevue/message';

import { subscribe } from '@common/mediator';

const dialog_visible = ref(false);

const dialog_pt = {
    header: { style: 'padding: 12px 16px;' },
    content: { style: 'padding: 0px 16px;' },
    closeButton: { style: 'display:none;' }
};

onMounted(() => {
    subscribe('show_pedal_alert', 'show_pedal_alert', () => {
        dialog_visible.value = true;
    });
    subscribe('hide_pedal_alert', 'hide_pedal_alert', () => dialog_visible.value = false);
});

</script>

<template>
    <Dialog v-model:visible="dialog_visible" modal header="Press Pedal" :style="{ width: '40%' }" :pt="dialog_pt">
        <Message severity="warn" :closable="false">You Must Press the Pedal to Proceed</Message>
    </Dialog>
</template>

<style scoped>
.footer_btn {
    padding: 8px;
    width: 150px;
}
</style>