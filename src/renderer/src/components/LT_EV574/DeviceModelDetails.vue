<script setup lang="ts">

import { ref, onMounted, inject } from 'vue';
import Dialog from 'primevue/dialog';

import { electron_renderer_invoke } from '@renderer/lib/util';
import { subscribe } from '@common/mediator';

const device_model = inject('device_model') as string;
const dialog_visible = ref(false);
const img_src = ref('');
const dialog_pt = {
    header: { style: 'padding: 8px 16px;' },
    content: { style: 'padding: 0px 16px;' },
    footer: { style: 'padding: 8px 16px; direction: ltr; display: flex; justify-content: flex-start;' },
};

onMounted(() => {
    electron_renderer_invoke<string>('load_devie_asset', { asset_path: `device_models_labeled/${device_model.toLowerCase().replace('-', '_')}.png` }).then(base64_src => {
        if (!base64_src)
            return;
        img_src.value = base64_src;
    });

    subscribe('show_device_model_details', 'show_device_model_details_lt_ev574', () => dialog_visible.value = true);
});

</script>

<template>
    <Dialog style="font-family: Cairo, sans-serif;" :header="`${device_model} Device Model`" v-model:visible="dialog_visible" :pt="dialog_pt">
        <div id="device_model_zoom">
            <img :src="img_src" alt="Device Solid Model Zoom">
        </div>
    </Dialog>
</template>

<style lang="css" scoped>
#device_model_zoom img {
    border-radius: 4px;
    border: 1px solid var(--empty-gauge-color);
}

#device_model_zoom {
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
    height: fit-content;
    margin-bottom: 16px;
}
</style>