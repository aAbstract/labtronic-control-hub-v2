<script setup lang="ts">

import { ref, computed, onMounted } from 'vue';

import PulseIcon from '@renderer/components/icons/Pulse.vue';
import { subscribe } from '@common/mediator';

defineProps<{ tag_height: string, icon_size: string }>();

const is_device_ok = ref(true);
const tag_txt = computed(() => is_device_ok.value ? 'OK' : 'ERROR');
const tag_color = computed(() => is_device_ok.value ? '#64DD17' : '#DD2C00');

onMounted(() => {
    subscribe('set_device_status', 'set_device_status', args => is_device_ok.value = args.device_ok);
});

</script>

<template>
    <div id="dev_status_tag">
        <PulseIcon id="pulse_icon" :fill_color="tag_color" />
        <span>{{ tag_txt }}</span>
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
    border-radius: 8px;
    margin: 0px 16px;
    color: v-bind(tag_color);
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