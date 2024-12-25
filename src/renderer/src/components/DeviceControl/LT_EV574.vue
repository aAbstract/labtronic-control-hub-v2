<script setup lang="ts">

import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import FaultsPanel from '@renderer/components/LT_EV574/FaultsPanel.vue';
import QuadDiagram from '@renderer/components/LT_EV574/QuadDiagram.vue';

const tabview_pt = {
    root: { style: 'width: 100%; height: 100%; border-radius: 4px; font-family: "Cairo", sans-serif;' },
    panelContainer: { style: 'background-color: transparent; padding: 0px;' },
};
const tabpanel_pt = {
    headerAction: { style: 'padding: 8px 16px; border-radius: 0px; background-color: transparent; font-size: 14px;' },
    content: { style: 'position: relative;' },
};

</script>

<template>
    <div id="lt_ev574_control_main">
        <TabView :pt="tabview_pt">
            <TabPanel header="Faults Panel" :pt="tabpanel_pt">
                <FaultsPanel />
            </TabPanel>
            <TabPanel header="Quad Diagram" :pt="tabpanel_pt">
                <QuadDiagram />
            </TabPanel>
        </TabView>
    </div>
</template>

<style lang="css" scoped>
#expand_btn {
    position: absolute;
    right: 0px;
    top: 0px;
    color: var(--accent-color);
    width: 32px;
    height: 32px;
    z-index: 1;
}

#lt_ev574_control_main {
    position: relative;
    width: 96%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--light-bg-color);
    border: 1px solid var(--empty-gauge-color);
    border-radius: 4px;
    padding-bottom: 16px;
}
</style>