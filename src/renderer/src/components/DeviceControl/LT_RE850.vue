<script setup lang="ts">

import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import { post_event } from '@common/mediator';
import { LT_RE850_ScreenMode } from '@common/models';
import { screenshot_handlers } from '@renderer/lib/screenshot';
import LT_RE850_Chart from '@renderer/components/LT_RE850/Chart.vue';
import { ref, computed, onMounted,inject } from 'vue';
import cleaned_R410A_Property_Table from '../../../../../device_data/lt-re850/cleaned_R410A_Property_Table.json'
import Dashboard from '../LT_RE850/Dashboard.vue';
import { electron_renderer_invoke } from '@renderer/lib/util';
import Controls from '../LT_RE850/Controls.vue';




const S_set = [...new Set([...cleaned_R410A_Property_Table.SL, ...cleaned_R410A_Property_Table.SV])].sort((a, b) => a - b);
const H_set = [...new Set([...cleaned_R410A_Property_Table.HL, ...cleaned_R410A_Property_Table.HV])].sort((a, b) => a - b);



const TS1 = cleaned_R410A_Property_Table.SL.map((value, index) => ({ x: value, y: cleaned_R410A_Property_Table.T[index] }));
const TS2 = cleaned_R410A_Property_Table.SV.map((value, index) => ({ x: value, y: cleaned_R410A_Property_Table.T[index] }));

const PH1 = cleaned_R410A_Property_Table.HL.map((value, index) => ({ x: value, y: cleaned_R410A_Property_Table.PL[index] }));
const PH2 = cleaned_R410A_Property_Table.HV.map((value, index) => ({ x: value, y: cleaned_R410A_Property_Table.PV[index] }));


const lt_re850_control_panel_pos = ref('relative');
const lt_re850_control_panel_width = computed(() => lt_re850_control_panel_pos.value === 'relative' ? '96%' : 'calc(100vw - 60px - 16px)');
const lt_re850_control_panel_left_offset = computed(() => lt_re850_control_panel_pos.value === 'relative' ? '0px' : '8px');
const lt_re850_control_panel_top_offset = computed(() => lt_re850_control_panel_pos.value === 'relative' ? '0px' : '8px');
const lt_re850_control_panel_border = computed(() => lt_re850_control_panel_pos.value === 'relative' ? 'none' : '2px solid var(--empty-gauge-color)');


const tabview_pt = {
    root: { style: 'width: 100%; height: 100%; border-radius: 4px; font-family: "Cairo", sans-serif;' },
    panelContainer: { style: 'background-color: transparent; padding: 0px;' },
};
const tabpanel_pt = {
    headerAction: { style: 'padding: 8px 16px; border-radius: 0px; background-color: transparent; font-size: 14px;' },
    content: { style: 'position: relative;' },
};
function toggle_fullscreen() {
    const __map = {
        'absolute': 'relative',
        'relative': 'absolute',
    };
    lt_re850_control_panel_pos.value = __map[lt_re850_control_panel_pos.value];
    if (lt_re850_control_panel_pos.value === 'relative') {
        post_event('change_lt_re850_screen_mode', { _screen_mode: null });
        return;
    }

    const window_width = window.innerWidth;
    if (window_width < 1850)
        post_event('change_lt_re850_screen_mode', { _screen_mode: LT_RE850_ScreenMode.W1280 });
    else
        post_event('change_lt_re850_screen_mode', { _screen_mode: LT_RE850_ScreenMode.W1920 });
}

onMounted(() => {
    post_event('update_device_model_cont_width', { width: '70%', margin_bottom: '0px' });
    post_event('remove_ui_springs', {});
    
   
});

const device_model_img = ref()

const device_model = inject('device_model') as string
    electron_renderer_invoke<string>('load_devie_asset', { asset_path: `device_models/${device_model.toLowerCase().replace('-', '_')}.png` }).then(base64_src => {
        if (!base64_src)
            return;
        device_model_img.value = base64_src;
    });
</script>

<template>
    <div id="lt_re850_control_main_cont" v-on="screenshot_handlers">
        <Button icon="pi pi-expand" id="expand_btn" title="Toggle Full Screen" rounded text @click="toggle_fullscreen()" />
        <TabView id="lt_re850_tabview" :pt="tabview_pt">
            <TabPanel header="Dashboard" :pt="tabpanel_pt">
            <div class="dashboard_container">
                <Dashboard  :full_screen="lt_re850_control_panel_pos === 'absolute'"/>
            </div>
              
            </TabPanel>
            <TabPanel header="T-S Chart" :pt="tabpanel_pt">
                <LT_RE850_Chart type="linear" :x_dataset="S_set" :y1_dataset="TS1" :y2_dataset="TS2" />
            </TabPanel>

            <TabPanel header="P-H Chart" :pt="tabpanel_pt">
                <LT_RE850_Chart type="logarithmic" :x_dataset="H_set" :y1_dataset="PH1" :y2_dataset="PH2" />
            </TabPanel>
            

            <TabPanel header="Controls" :pt="tabpanel_pt">
                <Controls :full_screen="lt_re850_control_panel_pos === 'absolute'"/>
            </TabPanel>
            

        </TabView>
    </div>
</template>

<style scoped>

.dashboard_container{
    width: 90%;
    aspect-ratio: 2/1;   
    margin-inline: auto; 
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

#lt_re850_control_main_cont {
    position: v-bind(lt_re850_control_panel_pos);
    width: v-bind(lt_re850_control_panel_width);
    left: v-bind(lt_re850_control_panel_left_offset);
    top: v-bind(lt_re850_control_panel_top_offset);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--light-bg-color);
    border: 1px solid var(--empty-gauge-color);
    border-radius: 4px;
    z-index: 2;
    border: v-bind(lt_re850_control_panel_border);
}
</style>