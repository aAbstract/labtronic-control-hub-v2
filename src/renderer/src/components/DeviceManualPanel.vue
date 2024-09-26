<script setup lang="ts">

import { ref, onMounted, inject } from 'vue';
import ProgressSpinner from 'primevue/progressspinner';

import { subscribe } from '@common/mediator';
import { get_manual } from '@renderer/lib/lt_cdn_api';
import ManualSection from '@renderer/components/DeviceManual/ManualSection.vue';

const panel_pos = ref('-60vw');
const manual_sections = ref<any[]>([]);
const device_model = inject('device_model');
const err_msg = ref('');

onMounted(() => {
    subscribe('toggle_device_manual_panel', 'toggle_device_manual_panel_visi', _ => {
        const values_map = {
            '0px': '-60vw',
            '-60vw': '0px',
        };
        panel_pos.value = values_map[panel_pos.value];
    });

    subscribe('hide_device_manual_panel', 'hide_device_manual_panel', _ => panel_pos.value = '-60vw');

    subscribe('chx_settings_loaded', 'chx_settings_loaded_device_manual_panel', _ => {
        get_manual(device_model as string).then(res => {
            if (res.err) {
                err_msg.value = res.err;
                return;
            }
            const manual_content: any[] = res.ok.content;
            manual_sections.value = manual_content;
        });
    });
});

</script>

<template>
    <div id="device_manual_panel_cont">
        <h4 id="err_msg" v-if="err_msg">{{ `Can not Reach LabTronic CDN Server: ${err_msg}` }}</h4>
        <ProgressSpinner v-if="manual_sections.length === 0 && !err_msg" />
        <ManualSection v-else v-for="(section, sidx) in manual_sections" :sidx="sidx" :section="section" />
    </div>
</template>

<style scoped>
#err_msg {
    margin: 0px;
    color: #FFAB00;
    text-align: center;
}

#device_manual_panel_cont {
    position: absolute;
    width: calc(100% - 8px);
    left: v-bind(panel_pos);
    height: calc(100% - 24px);
    top: 12px;
    background-color: var(--light-bg-color);
    border-radius: 4px;
    color: var(--font-color);
    padding: 4px 8px;
    transition: 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    overflow-y: scroll;
    z-index: 1;
}
</style>