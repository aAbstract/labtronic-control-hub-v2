<script setup lang="ts">

import { computed, onMounted, ref } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';

import { post_event } from '@common/mediator';
import { electron_renderer_invoke } from '@renderer/lib/util';
import { screenshot_handlers } from '@renderer/lib/screenshot';

import { LT_RE600_ScreenMode, LT_RE600_MeterParams } from '@common/models';
import LT_RE600_Meter from '@renderer/components/LT_RE600/Meter.vue';
import LT_RE600_Chart from '@renderer/components/LT_RE600/Chart.vue';

const meters: LT_RE600_MeterParams[] = [
    {
        meter_name: 'M1: Generator',
        top_offsets: {
            [LT_RE600_ScreenMode.W1280]: 210,
            [LT_RE600_ScreenMode.W1920]: 325,
        },
        left_offsets: {
            [LT_RE600_ScreenMode.W1280]: 150,
            [LT_RE600_ScreenMode.W1920]: 230,
        },
        meter_values: [
            { msg_type: 0, msg_name: 'Freq' },
            { msg_type: 1, msg_name: 'V12' },
            { msg_type: 2, msg_name: 'V23' },
            { msg_type: 3, msg_name: 'V31' },
            { msg_type: 5, msg_name: 'I1' },
            { msg_type: 6, msg_name: 'I2' },
            { msg_type: 7, msg_name: 'I3' },
            { msg_type: 9, msg_name: 'Sys_P' },
            { msg_type: 10, msg_name: 'Sys_Q' },
            { msg_type: 12, msg_name: 'Sys_PF' },
        ],
    },
    {
        meter_name: 'M2: AC Load',
        top_offsets: {
            [LT_RE600_ScreenMode.W1280]: 390,
            [LT_RE600_ScreenMode.W1920]: 600,
        },
        left_offsets: {
            [LT_RE600_ScreenMode.W1280]: 755,
            [LT_RE600_ScreenMode.W1920]: 1192,
        },
        meter_values: [
            { msg_type: 13, msg_name: 'Freq' },
            { msg_type: 14, msg_name: 'V1' },
            { msg_type: 15, msg_name: 'I1' },
            { msg_type: 16, msg_name: 'Sys_P' },
            { msg_type: 17, msg_name: 'Sys_Q' },
            { msg_type: 19, msg_name: 'Sys_PF' },
        ],
    },
    {
        meter_name: 'M3: Battery',
        top_offsets: {
            [LT_RE600_ScreenMode.W1280]: 412,
            [LT_RE600_ScreenMode.W1920]: 635,
        },
        left_offsets: {
            [LT_RE600_ScreenMode.W1280]: 150,
            [LT_RE600_ScreenMode.W1920]: 230,
        },
        meter_values: [
            { msg_type: 20, msg_name: 'V' },
            { msg_type: 21, msg_name: 'I' },
            { msg_type: 22, msg_name: 'P' },
        ],
    },
    {
        meter_name: 'M4: DC Load',
        top_offsets: {
            [LT_RE600_ScreenMode.W1280]: 100,
            [LT_RE600_ScreenMode.W1920]: 200,
        },
        left_offsets: {
            [LT_RE600_ScreenMode.W1280]: 755,
            [LT_RE600_ScreenMode.W1920]: 1192,
        },
        meter_values: [
            { msg_type: 23, msg_name: 'V' },
            { msg_type: 24, msg_name: 'I' },
            { msg_type: 25, msg_name: 'P' },
        ],
    },
    {
        meter_name: 'M5: Generator',
        top_offsets: {
            [LT_RE600_ScreenMode.W1280]: 40,
            [LT_RE600_ScreenMode.W1920]: 80,
        },
        left_offsets: {
            [LT_RE600_ScreenMode.W1280]: 330,
            [LT_RE600_ScreenMode.W1920]: 502,
        },
        meter_values: [
            { msg_type: 26, msg_name: 'Freq' },
        ],
    },
];

const tabview_pt = {
    root: { style: 'width: 100%; height: 100%; border-radius: 4px; font-family: "Cairo", sans-serif;' },
    panelContainer: { style: 'background-color: transparent; padding: 0px;' },
};
const tabpanel_pt = {
    headerAction: { style: 'padding: 8px 16px; border-radius: 0px; background-color: transparent; font-size: 14px;' },
    content: { style: 'position: relative;' },
};
const system_diagram_src = ref('');
const lt_re600_control_panel_pos = ref('relative');
const lt_re600_control_panel_width = computed(() => lt_re600_control_panel_pos.value === 'relative' ? '96%' : 'calc(100vw - 60px - 16px)');
const lt_re600_control_panel_left_offset = computed(() => lt_re600_control_panel_pos.value === 'relative' ? '0px' : '8px');
const lt_re600_control_panel_top_offset = computed(() => lt_re600_control_panel_pos.value === 'relative' ? '0px' : '8px');
const lt_re600_control_panel_border = computed(() => lt_re600_control_panel_pos.value === 'relative' ? 'none' : '2px solid var(--empty-gauge-color)');

function toggle_fullscreen() {
    const __map = {
        'absolute': 'relative',
        'relative': 'absolute',
    };
    lt_re600_control_panel_pos.value = __map[lt_re600_control_panel_pos.value];
    if (lt_re600_control_panel_pos.value === 'relative') {
        post_event('change_lt_re600_screen_mode', { _screen_mode: null });
        return;
    }

    const window_width = window.innerWidth;
    if (window_width < 1600)
        post_event('change_lt_re600_screen_mode', { _screen_mode: LT_RE600_ScreenMode.W1280 });
    else
        post_event('change_lt_re600_screen_mode', { _screen_mode: LT_RE600_ScreenMode.W1920 });
}

onMounted(() => {
    post_event('update_device_model_cont_width', { width: '70%', margin_bottom: '0px' });
    post_event('remove_ui_springs', {});
    electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'etc/lt_re600/system_diagram.png' }).then(base64_src => {
        if (!base64_src)
            return;
        system_diagram_src.value = base64_src;
    });
});

</script>

<template>
    <div id="lt_re600_control_main_cont" v-on="screenshot_handlers">
        <Button icon="pi pi-expand" id="expand_btn" title="Toggle Full Screen" rounded text @click="toggle_fullscreen()" />
        <TabView id="lt_re600_tabview" :pt="tabview_pt">
            <TabPanel header="System Diagram" :pt="tabpanel_pt">
                <img style="width: 90%; margin-left: 5%;" :src="system_diagram_src" alt="System Diagram">
                <LT_RE600_Meter v-for="m in meters" :meter_params="m" />
            </TabPanel>
            <TabPanel header="Chart 1" :pt="tabpanel_pt">
                <LT_RE600_Chart :x_msg_type="26" x_title="M5_Freq [Celsius]" :y_msg_type="9" y_title="M1_P [W]" line_color="#FF9800" />
            </TabPanel>
            <TabPanel header="Chart 2" :pt="tabpanel_pt">
                <LT_RE600_Chart :x_msg_type="1" x_title="M1_V12 [V]" :y_msg_type="9" y_title="M1_P [W]" line_color="#DD2C00" />
            </TabPanel>
        </TabView>
    </div>
</template>

<style scoped>
#expand_btn {
    position: absolute;
    right: 0px;
    top: 0px;
    color: var(--accent-color);
    width: 32px;
    height: 32px;
    z-index: 1;
}

#lt_re600_control_main_cont {
    position: v-bind(lt_re600_control_panel_pos);
    width: v-bind(lt_re600_control_panel_width);
    left: v-bind(lt_re600_control_panel_left_offset);
    top: v-bind(lt_re600_control_panel_top_offset);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--light-bg-color);
    border-radius: 4px;
    z-index: 2;
    border: v-bind(lt_re600_control_panel_border);
}
</style>