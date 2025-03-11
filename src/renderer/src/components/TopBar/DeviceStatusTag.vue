<script setup lang="ts">

import { ref, onMounted, inject } from 'vue';

import PulseIcon from '@renderer/components/icons/Pulse.vue';
import { subscribe } from '@common/mediator';
import { DeviceStatus } from '@common/models';

defineProps<{ tag_height: string, icon_size: string }>();

const STATUS_COLOR_MAP: Record<DeviceStatus, string> = {
    [DeviceStatus.OK]: '#64DD17',
    [DeviceStatus.ERROR]: '#DD2C00',
    [DeviceStatus.UNKNOWN]: '#FFAB00',
};
const STATUS_MSG_MAP: Record<DeviceStatus, string> = {
    [DeviceStatus.OK]: 'OK',
    [DeviceStatus.ERROR]: 'ERROR',
    [DeviceStatus.UNKNOWN]: '--',
};
const device_status = ref<DeviceStatus>(DeviceStatus.UNKNOWN);
const device_model = inject('device_model');

onMounted(() => {
    subscribe('set_device_status', args => device_status.value = args.device_status);
    window.electron?.ipcRenderer.on(`${device_model}_device_connected`, _ => device_status.value = DeviceStatus.OK);
});

</script>

<template>
    <div id="dev_status_tag">
        <PulseIcon id="pulse_icon" :fill_color="STATUS_COLOR_MAP[device_status]" />
        <span>{{ STATUS_MSG_MAP[device_status] }}</span>
    </div>
</template>

<style scoped>
#pulse_icon {
    width: v-bind(icon_size);
    margin-right: 8px;
}

#dev_status_tag {
    background-color: var(--light-bg-color);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 8px 16px;
    color: var(--font-color);
    border-radius: 4px;
    margin: 0px 16px;
    color: v-bind(STATUS_COLOR_MAP[device_status]);
    height: v-bind(tag_height);
}

#dev_status_tag svg {
    font-size: 20px;
    margin-right: 8px;
}

#dev_status_tag span {
    font-weight: bold;
}
</style>