<script setup lang="ts">

import { ref, onMounted, inject } from 'vue';
import Button from 'primevue/button';

import { subscribe } from '@common/mediator';
import { get_base_url } from '@renderer/lib/lt_cdn_api';
import { CHXCloudSettings } from '@common/models';
import { electron_renderer_send, compute_tooltip_pt, electron_renderer_invoke } from '@renderer/lib/util';

enum AIAgentState {
    STOPPED = 0,
    RUNNING = 1,
};

const panel_pos = ref('-50vw');
const cdn_server = ref('Loading...');
const device_model = inject('device_model') as string;
const device_model_img = ref('');
const device_about = ref('Device Description...');
const device_weight = ref('00.0kg');
const device_dimensions = ref('0.00m x 0.00m x 0.00m');
const device_level = ref('BASIC');
const ai_agent_state = ref<AIAgentState>(AIAgentState.STOPPED);
const latest_kdb_update = ref('XXXX-XX-XX XX:XX:XX');
const __aigscm: Record<AIAgentState, string> = {
    [AIAgentState.STOPPED]: '#FFAB00',
    [AIAgentState.RUNNING]: '#64DD17',
};
const __aigstm: Record<AIAgentState, string> = {
    [AIAgentState.STOPPED]: 'STOPPED',
    [AIAgentState.RUNNING]: 'RUNNING',
};

function save_chx_settings() {
    const _chx_settings: CHXCloudSettings = { labtronic_cdn_base_url: cdn_server.value };
    electron_renderer_send('save_chx_settings', { _chx_settings });
}

function start_ltai_service() {
    electron_renderer_send('start_ltai_service', {});
}

function stop_ltai_service() {
    electron_renderer_send('stop_ltai_service', {});
}

function check_ltai_agent() {
    fetch('http://127.0.0.1:8091/api/test').then(http_resp => {
        if (http_resp.status !== 200) {
            ai_agent_state.value = AIAgentState.STOPPED;
            return;
        }
        http_resp.json().then(server_msg => {
            if (server_msg !== 'LTAI_SERVER_ONLINE') {
                ai_agent_state.value = AIAgentState.STOPPED;
                return;
            }
            ai_agent_state.value = AIAgentState.RUNNING;
        });
    }).catch(_ => ai_agent_state.value = AIAgentState.STOPPED);
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

    electron_renderer_invoke<string>('load_devie_asset', { asset_path: `device_models/${device_model.toLowerCase().replace('-', '_')}.png` }).then(base64_src => {
        if (!base64_src)
            return;
        device_model_img.value = base64_src;
    });

    electron_renderer_invoke<Record<string, string>>('load_device_metadata', { device_model }).then(metadata => {
        if (!metadata)
            return;
        device_about.value = metadata.about_device;
        device_weight.value = metadata.weight;
        device_dimensions.value = metadata.dimensions;
        device_level.value = metadata.level;
    });

    window.electron?.ipcRenderer.on('ltai_agent_started', () => ai_agent_state.value = AIAgentState.RUNNING);
    window.electron?.ipcRenderer.on('ltai_agent_stopped', () => ai_agent_state.value = AIAgentState.STOPPED);
});

</script>

<template>
    <div id="settings_panel_cont">
        <div class="sp_section">
            <h1>
                <span>CLOUD SETTINGS</span>
                <Button icon="pi pi-save" @click="save_chx_settings()" rounded text v-tooltip.top="{ value: 'SAVE SETTINGS', pt: compute_tooltip_pt('top') }" />
            </h1>
            <div class="controls_row">
                <span>LabTronic CDN Server</span>
                <input type="text" v-model="cdn_server">
            </div>
        </div>
        <div class="sp_section">
            <h1>AI SETTINGS</h1>
            <div class="controls_row">
                <span>Agent Status</span>
                <div class="sp_tag" :style="`color: ${__aigscm[ai_agent_state]}; border: 2px solid ${__aigscm[ai_agent_state]};`">
                    <span style="font-size: 14px;">{{ __aigstm[ai_agent_state] }}</span>
                </div>
            </div>
            <div class="controls_row">
                <span>KnowledgeDB Version</span>
                <input type="text" :value="latest_kdb_update" readonly>
            </div>
            <div class="controls_row">
                <span>Agent Actions</span>
                <div style="display: flex; flex-direction: row; justify-content: flex-start;">
                    <Button class="ai_action_agent_btn" icon="pi pi-sort-up" severity="info" v-tooltip.top="{ value: 'START AGENT', pt: compute_tooltip_pt('top') }" @click="start_ltai_service()" rounded outlined />
                    <Button class="ai_action_agent_btn" icon="pi pi-stop" severity="info" v-tooltip.top="{ value: 'STOP AGENT', pt: compute_tooltip_pt('top') }" @click="stop_ltai_service()" rounded outlined />
                    <Button class="ai_action_agent_btn" icon="pi pi-check-circle" severity="info" v-tooltip.top="{ value: 'CHECK AGENT', pt: compute_tooltip_pt('top') }" @click="check_ltai_agent()" rounded outlined />
                    <Button class="ai_action_agent_btn" icon="pi pi-database" severity="info" v-tooltip.top="{ value: 'UPDATE KnowledgeDB', pt: compute_tooltip_pt('top') }" @click="" rounded outlined />
                </div>
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
                    <p>{{ device_about }}</p>
                    <div id="device_info_tags">
                        <div><span>Weight:</span><span>{{ device_weight }}</span></div>
                        <div><span>Dimensions:</span><span>{{ device_dimensions }}</span></div>
                        <div><span>Level:</span><span>{{ device_level }}</span></div>
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
            <div style="height: 12px;"></div>
        </div>
    </div>
</template>

<style scoped>
.ai_action_agent_btn {
    width: 36px;
    height: 36px;
    margin-right: 16px;
}

.sp_tag {
    font-family: "Lucida Console", "Courier New", monospace;
    padding: 4px 16px;
    border-radius: 4px;
    font-weight: bold;
    width: 120px;
    text-align: center;
}

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
    font-size: 16px;
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
    font-size: 16px;
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
    z-index: 2;
}
</style>