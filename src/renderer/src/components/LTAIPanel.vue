<script setup lang="ts">

import { onMounted, ref, inject } from 'vue';
import Button from 'primevue/button';

import { subscribe, post_event } from '@common/mediator';

enum AIAgentResponseState {
    SUCCESS = 0,
    LOADING = 1,
    ERROR = 2,
    IDLE = 3,
};

const device_model = inject('device_model') as string;
const panel_pos = ref('-50vw');
const agent_response_state = ref(AIAgentResponseState.IDLE);
const agent_err = ref('');
const agent_reponse = ref('Loading...');
const ltai_response_dispay = ref('none');
const ltai_prompt = ref('');

function submit_ltai_query() {
    agent_response_state.value = AIAgentResponseState.LOADING;
    agent_reponse.value = 'Loading...';
    ltai_response_dispay.value = 'block';

    const opts: RequestInit = {};
    opts.headers = {};
    opts.headers['Content-Type'] = 'application/json';
    opts.method = 'POST';
    opts.body = JSON.stringify({
        device_model: device_model.toLowerCase().replace('-', '_'),
        query: ltai_prompt.value,
    });
    fetch('http://127.0.0.1:8091/api/query', opts).then(http_resp => {
        if (http_resp.status !== 200) {
            agent_response_state.value = AIAgentResponseState.ERROR;
            agent_err.value = 'Agent Response Status Code: ' + http_resp.status;
            ltai_response_dispay.value = 'none';
            return;
        }
        http_resp.json().then(_agent_response => {
            agent_response_state.value = AIAgentResponseState.SUCCESS;
            agent_reponse.value = _agent_response;
            ltai_response_dispay.value = 'block';
        });
    }).catch(e => {
        agent_response_state.value = AIAgentResponseState.ERROR;
        agent_err.value = 'Agent Error: ' + e;
        ltai_response_dispay.value = 'none';
    });
}

onMounted(() => {
    subscribe('toggle_ltai_panel', 'toggle_ltai_panel_visi', _ => {
        const values_map = {
            '8px': '-50vw',
            '-50vw': '8px',
        };
        panel_pos.value = values_map[panel_pos.value];
    });
});

</script>

<template>
    <div id="ltai_panel_cont">
        <div id="ltai_help">
            <p>LabTronic AI is designed to provide guidance to the operator of this device.</p>
            <h4 style="font-size: 14px; font-weight: normal;">Example Queries:</h4>
            <ul style="font-weight: normal;">
                <li>What is the purpose of the LT-TO101 unit?</li>
                <li>How does the LT-TO101 unit demonstrate gas laws?</li>
                <li>Which laws are demonstrated by the LT-TO101 unit?</li>
            </ul>
        </div>
        <h4 v-if="agent_response_state === AIAgentResponseState.ERROR" style="color: #DD2C00; font-size: 16px; margin: 0px;">{{ agent_err }}</h4>
        <p id="query_response">{{ agent_reponse }}</p>
        <div id="ltai_prompt">
            <input type="text" v-model="ltai_prompt">
            <div style="width: 16px;"></div>
            <Button id="ltai_prompt_submit_btn" icon="pi pi-chevron-right" rounded outlined title="Submit" @click="submit_ltai_query()" />
        </div>
        <div id="ltai_quick_actions">
            <div class="ltai_qa_item" title="Explore Device Physics" @click="post_event('update_device_pdf_page', { target_page: 7 })">
                <i class="pi pi-book"></i>
                <span>Theory</span>
            </div>
            <div class="ltai_qa_item" title="Device Safety Precautions" @click="post_event('update_device_pdf_page', { target_page: 4 })">
                <i class="pi pi-shield"></i>
                <span>Safety</span>
            </div>
            <div class="ltai_qa_item" title="Device Operations Procedure" @click="post_event('update_device_pdf_page', { target_page: 8 })">
                <i class="pi pi-cog"></i>
                <span>Operation</span>
            </div>
            <div class="ltai_qa_item" title="Test Your Understanding">
                <i class="pi pi-graduation-cap"></i>
                <span>Examination</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
#query_response {
    display: v-bind(ltai_response_dispay);
    color: var(--font-color);
    width: 100%;
    height: fit-content;
    border-top: 2px solid var(--font-color);
    font-size: 14px;
    padding-top: 8px;
    margin-bottom: 0px;
}

#ltai_prompt_submit_btn {
    width: 40px;
    height: 40px;
}

#ltai_prompt_submit_btn span {
    font-size: 20px !important;
}

#ltai_quick_actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-top: 12px;
}

.ltai_qa_item {
    border: 1px solid var(--font-color);
    color: var(--font-color);
    font-size: 14px;
    font-weight: bold;
    margin-left: 8px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 2px 16px;
    border-radius: 16px;
    cursor: pointer;
    transition: 0.3s ease;
}

.ltai_qa_item:hover {
    border: 1px solid var(--accent-color);
    color: var(--accent-color);
}

.ltai_qa_item i {
    margin-right: 4px;
}

#ltai_help {
    font-size: 14px;
    font-weight: bold;
    color: var(--font-color);
}

#ltai_help * {
    margin: 0px;
}

#ltai_prompt {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    margin-top: 8px;
}

#ltai_prompt input[type="text"] {
    font-family: "Cairo", sans-serif;
    flex-grow: 1;
    color: var(--font-color);
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 14px;
    font-weight: bold;
    padding: 4px;
    border-radius: 4px;
    flex-grow: 1;
}

#ltai_prompt input[type="text"]:focus {
    outline: none;
    border: 1px solid var(--accent-color);
}

#ltai_panel_cont {
    width: calc(100% - 16px);
    height: fit-content;
    background-color: var(--light-bg-color);
    left: v-bind(panel_pos);
    top: 16px;
    border-radius: 4px;
    border: 1px solid var(--empty-gauge-color);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 8px;
    z-index: 3;
    transition: 0.3s ease;
}
</style>