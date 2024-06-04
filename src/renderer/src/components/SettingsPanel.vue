<script setup lang="ts">

import { ref, onMounted, inject } from 'vue';
import Button from 'primevue/button';

import { subscribe } from '@common/mediator';
import { get_base_url } from '@renderer/lib/lt_cdn_api';
import { CHXSettings } from '@common/models';
import { electron_renderer_send } from '@renderer/lib/util';

const panel_pos = ref('-50vw');
const cdn_server = ref('Loading...');
const device_model = inject('device_model') as string;
const device_model_img = new URL(`../device_assets/device_models/${device_model.toLowerCase().replace('-', '_')}.png`, import.meta.url).href;

function save_chx_settings() {
    const _chx_settings: CHXSettings = { labtronic_cdn_base_url: cdn_server.value };
    electron_renderer_send('save_chx_settings', { _chx_settings });
}

onMounted(() => {
    subscribe('toggle_settings_panel', 'toggle_settings_panel_visi', _ => {
        const values_map = {
            '8px': '-50vw',
            '-50vw': '8px',
        };
        panel_pos.value = values_map[panel_pos.value];
    });

    subscribe('hide_settings_panel', 'hide_settings_panel', _ => panel_pos.value = '-50vw');

    subscribe('chx_settings_loaded', 'chx_settings_loaded_settings_panel', _ => cdn_server.value = get_base_url());
});

</script>

<template>
    <div id="settings_panel_cont">
        <div class="sp_section">
            <h1>
                <span>CLOUD SETTINGS</span>
                <Button icon="pi pi-save" @click="save_chx_settings()" rounded text />
            </h1>
            <div class="controls_row">
                <span>LabTronic CDN Server</span>
                <input type="text" v-model="cdn_server">
            </div>
        </div>
        <div class="sp_section">
            <h1>REMOTE CONTROL SETTINGS</h1>
            <div class="controls_row">
                <span>LabTronic IoT Server</span>
                <input type="text" value="XXXX.XXXX.XXXX.XXXX" readonly>
            </div>
            <div class="controls_row">
                <span>Device IoT ID</span>
                <input type="text" value="device_KB3c8b2i" readonly>
            </div>
            <div class="controls_row">
                <span>Password</span>
                <input type="text" value="********************************" readonly>
            </div>
        </div>
        <div class="sp_section">
            <h1>DEVICE INFO</h1>
            <div id="device_info_cont">
                <img id="device_img" :src="device_model_img" alt="Device Solid Model">
                <div id="device_info_text">
                    <p>
                        Thermal tunnel is a device for measuring thermal conduction and convention,
                        It is designed to demonstrate the phenomena of natural (free) and forced convection.
                    </p>
                    <div id="device_info_tags">
                        <div>
                            <span>Weight:</span>
                            <span>35kg</span>
                        </div>
                        <div>
                            <span>Dimensions:</span>
                            <span>0.8m x 0.5m x 0.65m</span>
                        </div>
                        <div>
                            <span>Level:</span>
                            <span>ADVANCED</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="sp_section">
            <h1>ABOUT SOFTWARE</h1>
            <div id="about_software_cont">
                <div>
                    <span>Product ID</span>
                    <span>labtronic-control-hub-x</span>
                </div>
                <div>
                    <span>Version</span>
                    <span>2.0.0</span>
                </div>
                <div>
                    <span>Link</span>
                    <span>https://github.com/aAbstract/labtronic-control-hub-v2</span>
                </div>
                <div>
                    <span>Maintainer</span>
                    <span>LabTronic</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#about_software_cont {
    font-size: 14px;
}

#about_software_cont div> :first-child {
    display: inline-block;
    font-weight: bold;
    width: 100px;
}

#about_software_cont {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
}

#device_info_tags div> :first-child {
    display: inline-block;
    width: 100px;
    font-weight: bold;
}

#device_info_tags {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
}

#device_info_text {
    font-size: 14px;
    flex-grow: 1;
    margin-left: 8px;
}

#device_info_text p {
    margin: 0px;
}

#device_info_cont img {
    height: 150px;
    border: 1px solid var(--accent-color);
    border-radius: 4px;
}

#device_info_cont {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
}

.sp_section {
    width: 100%;
}

.sp_section .controls_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 8px;
}

.sp_section .controls_row span {
    width: 200px;
}

.sp_section .controls_row input[type="text"] {
    font-family: "Lucida Console", "Courier New", monospace;
    background-color: var(--dark-bg-color);
    color: var(--font-color);
    height: fit-content;
    border: none;
    padding: 8px;
    flex-grow: 1;
    font-weight: bold;
}

.sp_section .controls_row input[type="text"]:focus {
    outline: none;
}

.sp_section h1 {
    margin: 0px;
    width: 100%;
    font-size: 18px;
    border-bottom: 2px solid var(--empty-gauge-color);
    margin-bottom: 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.sp_section h1 button {
    color: var(--accent-color);
    width: 32px;
    height: 32px;
}

#settings_panel_cont {
    position: absolute;
    width: 96%;
    left: v-bind(panel_pos);
    height: calc(100% - 32px);
    top: 12px;
    background-color: var(--light-bg-color);
    border-radius: 8px;
    color: var(--font-color);
    padding: 4px 8px;
    transition: 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}
</style>