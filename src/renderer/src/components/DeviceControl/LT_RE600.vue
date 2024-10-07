<script setup lang="ts">

import { computed, onMounted, ref } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';

import { post_event } from '@common/mediator';
import { electron_renderer_invoke } from '@renderer/lib/util';

enum LTRE600ScreenMode {
    W1280 = 1,
    W1920 = 2,
};

interface DiagramTextFieldParams {
    dtf_name: string;
    top_offsets: Record<LTRE600ScreenMode, number>;
    left_offsets: Record<LTRE600ScreenMode, number>;
};

const dtfs: DiagramTextFieldParams[] = [
    // m1    
    {
        dtf_name: 'm1_output',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 65,
            [LTRE600ScreenMode.W1920]: 100,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 465,
            [LTRE600ScreenMode.W1920]: 715,
        },
    },

    // m2
    {
        dtf_name: 'm2_v',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 431,
            [LTRE600ScreenMode.W1920]: 662,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 800,
            [LTRE600ScreenMode.W1920]: 1225,
        },
    },
    {
        dtf_name: 'm2_i',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 431,
            [LTRE600ScreenMode.W1920]: 662,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 885,
            [LTRE600ScreenMode.W1920]: 1355,
        },
    },
    {
        dtf_name: 'm2_p',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 431,
            [LTRE600ScreenMode.W1920]: 662,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 980,
            [LTRE600ScreenMode.W1920]: 1500,
        },
    },

    // m3
    {
        dtf_name: 'm3_v',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 455,
            [LTRE600ScreenMode.W1920]: 698,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 206,
            [LTRE600ScreenMode.W1920]: 315,
        },
    },
    {
        dtf_name: 'm3_i',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 455,
            [LTRE600ScreenMode.W1920]: 698,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 291,
            [LTRE600ScreenMode.W1920]: 445,
        },
    },
    {
        dtf_name: 'm3_p',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 455,
            [LTRE600ScreenMode.W1920]: 698,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 386,
            [LTRE600ScreenMode.W1920]: 590,
        },
    },

    // m4
    {
        dtf_name: 'm4_v',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 193,
            [LTRE600ScreenMode.W1920]: 297,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 767,
            [LTRE600ScreenMode.W1920]: 1174
            ,
        },
    },
    {
        dtf_name: 'm4_i',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 193,
            [LTRE600ScreenMode.W1920]: 297,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 852,
            [LTRE600ScreenMode.W1920]: 1305,
        },
    },
    {
        dtf_name: 'm4_p',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 193,
            [LTRE600ScreenMode.W1920]: 297,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 947,
            [LTRE600ScreenMode.W1920]: 1450,
        },
    },

    // m5
    {
        dtf_name: 'm5_speed',
        top_offsets: {
            [LTRE600ScreenMode.W1280]: 276,
            [LTRE600ScreenMode.W1920]: 423,
        },
        left_offsets: {
            [LTRE600ScreenMode.W1280]: 300,
            [LTRE600ScreenMode.W1920]: 462,
        },
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
const lt_re600_screen_mode = ref<LTRE600ScreenMode | null>(null);
const dtf_font_size = computed(() => {
    if (lt_re600_screen_mode.value === LTRE600ScreenMode.W1280)
        return '16px';
    else if (lt_re600_screen_mode.value === LTRE600ScreenMode.W1920)
        return '28px';
    else
        return '16px';
});
const dtf_width = computed(() => {
    if (lt_re600_screen_mode.value === LTRE600ScreenMode.W1280)
        return '64px';
    else if (lt_re600_screen_mode.value === LTRE600ScreenMode.W1920)
        return '95px';
    else
        return '64px';
});

function toggle_fullscreen() {
    const __map = {
        'absolute': 'relative',
        'relative': 'absolute',
    };
    lt_re600_control_panel_pos.value = __map[lt_re600_control_panel_pos.value];
    if (lt_re600_control_panel_pos.value === 'relative') {
        lt_re600_screen_mode.value = null;
        return;
    }

    const window_width = window.innerWidth;
    if (window_width < 1600)
        lt_re600_screen_mode.value = LTRE600ScreenMode.W1280;
    else
        lt_re600_screen_mode.value = LTRE600ScreenMode.W1920;
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
    <div id="lt_re600_control_main_cont">
        <Button icon="pi pi-expand" id="expand_btn" title="Toggle Full Screen" rounded text @click="toggle_fullscreen()" />
        <TabView id="lt_re600_tabview" :pt="tabview_pt">
            <TabPanel header="System Diagram" :pt="tabpanel_pt">
                <img style="width: 90%; margin-left: 5%;" :src="system_diagram_src" alt="System Diagram">
                <input v-if="lt_re600_screen_mode" v-for="dtf in dtfs" :style="`top: ${dtf.top_offsets[lt_re600_screen_mode]}px; left: ${dtf.left_offsets[lt_re600_screen_mode]}px;`" class="dt_tf" type="text" readonly>
            </TabPanel>
            <TabPanel header="Chart 1" :pt="tabpanel_pt">
                <span>Chart 1</span>
            </TabPanel>
            <TabPanel header="Chart 2" :pt="tabpanel_pt">
                <span>Chart 2</span>
            </TabPanel>
        </TabView>
    </div>
</template>

<style scoped>
.dt_tf {
    position: absolute;
    width: v-bind(dtf_width);
    color: var(--font-color);
    border: none;
    background-color: var(--light-bg-color);
    /* background-color: transparent; */
    font-size: v-bind(dtf_font_size);
    font-weight: bold;
    padding: 4px;
    border: 1px solid var(--accent-color);
    border-radius: 2px;
    cursor: default;
}

.dt_tf:focus {
    outline: none;
}

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
}
</style>