<script setup lang="ts">

import { ref, inject, onMounted, shallowRef } from 'vue';
import Dialog from 'primevue/dialog';
import Message from 'primevue/message';

import { LTBusDeviceErrorMsg, DeviceStatus } from '@common/models';
import { electron_renderer_send } from '@renderer/lib/util';
import { post_event } from '@common/mediator';

let nack_set = new Set();
let ack_set = new Set();

const dialog_visible = ref(false);
const ack_device_erros_to_show = shallowRef<LTBusDeviceErrorMsg[]>([]);
const device_model = inject('device_model');

const dialog_pt = {
    header: { style: 'padding: 12px 16px;' },
    content: { style: 'padding: 0px 16px;' },
};
const message_pt = {
    wrapper: { style: 'padding: 8px 16px;' },
};

function ack_device_error_msg(error_code: number) {
    ack_set.add(error_code);
    if ([...nack_set].every(x => ack_set.has(x))) {
        electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: 'WR 0xA006 U8 0x00' }); // OFFSET_CALC
        dialog_visible.value = false;
        post_event('set_device_status', { device_status: DeviceStatus.OK });
        nack_set = new Set();
        ack_set = new Set();
        ack_device_erros_to_show.value = [];
    }
}

onMounted(() => {
    window.electron?.ipcRenderer.on(`${device_model}_device_error_msg`, (_, data) => {
        const device_error_msg = data.device_error_msg as LTBusDeviceErrorMsg;
        if (!device_error_msg.user_ack)
            return;

        dialog_visible.value = true;
        post_event('set_device_status', { device_status: DeviceStatus.ERROR });

        if (nack_set.has(device_error_msg.error_code))
            return;

        nack_set.add(device_error_msg.error_code);
        ack_device_erros_to_show.value = [...ack_device_erros_to_show.value, device_error_msg];
    });
});

</script>

<template>
    <Dialog v-model:visible="dialog_visible" modal header="Actions Required" :style="{ width: '60%' }" :pt="dialog_pt" :closable="false">
        <Message v-for="ack_derm in ack_device_erros_to_show" severity="warn" :pt="message_pt" @close="ack_device_error_msg(ack_derm.error_code)" closable>{{ ack_derm.error_text }}</Message>
    </Dialog>
</template>

<style scoped>
.footer_btn {
    padding: 8px;
    width: 150px;
}
</style>