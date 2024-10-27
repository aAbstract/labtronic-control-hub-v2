<script setup lang="ts">

import { onMounted, ref } from 'vue';
import Button from 'primevue/button';

import { subscribe } from '@common/mediator';

const panel_pos = ref('-50vw');

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
        <div id="ltai_prompt">
            <input type="text">
            <div style="width: 16px;"></div>
            <Button id="ltai_prompt_submit_btn" icon="pi pi-chevron-right" rounded outlined title="Submit" />
        </div>
        <div id="ltai_quick_actions">
            <div class="ltai_qa_item" title="Explore Device Physics">
                <i class="pi pi-book"></i>
                <span>Theory</span>
            </div>
            <div class="ltai_qa_item" title="Device Safety Precautions">
                <i class="pi pi-shield"></i>
                <span>Safety</span>
            </div>
            <div class="ltai_qa_item" title="Device Operations Procedure">
                <i class="pi pi-cog"></i>
                <span>Operation</span>
            </div>
            <div class="ltai_qa_item" title="Test Your Understanding">
                <i class="pi pi-graduation-cap"></i>
                <span>Examination</span>
            </div>
        </div>
        <div id="ltai_output">

        </div>
    </div>
</template>

<style scoped>
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