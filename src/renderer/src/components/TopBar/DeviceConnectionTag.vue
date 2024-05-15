<script setup lang="ts">

import { ref, computed, onBeforeMount, inject } from 'vue';

import LinkIcon from '@renderer/components/icons/Link.vue';
import LinkSlashAltIcon from '@renderer/components/icons/LinkSlashAlt.vue';

defineProps<{ tag_height: string, icon_size: string }>();

const is_device_connected = ref(false);
const icon_color = computed(() => is_device_connected.value ? '#64DD17' : '#DD2C00');
const tag_txt = computed(() => is_device_connected.value ? 'CONNECTED' : 'DISCONNECTED');
const icon_comp = computed(() => is_device_connected.value ? LinkIcon : LinkSlashAltIcon);
const device_model = inject('device_model');

onBeforeMount(() => {
    window.electron?.ipcRenderer.on(`${device_model}_device_connected`, _ => is_device_connected.value = true);
    window.electron?.ipcRenderer.on(`${device_model}_device_disconnected`, _ => is_device_connected.value = false);
});

</script>

<template>
    <div id="dev_conn_state_cont">
        <component id="dev_conn_icon" :is="icon_comp" :fill_color="icon_color" />
        <span>DEVICE: {{ tag_txt }}</span>
    </div>
</template>

<style scoped>
#dev_conn_icon {
    width: v-bind(icon_size);
    margin-right: 8px;
}

#dev_conn_state_cont {
    background-color: var(--light-bg-color);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 8px 16px;
    color: var(--font-color);
    border-radius: 8px;
    margin: 0px 16px;
    height: v-bind(tag_height);
}

#dev_conn_state_cont span {
    font-weight: bold;
}
</style>