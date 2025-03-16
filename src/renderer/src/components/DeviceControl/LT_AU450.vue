<script setup lang="ts">

import { computed, onMounted, ref } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import { LT_AU450_ScreenMode } from '@common/models';
import { post_event } from '@common/mediator';
import { electron_renderer_invoke } from '@renderer/lib/util';
import { screenshot_handlers } from '@renderer/lib/screenshot';
import LT_AU450_Chart from '@renderer/components/LT_AU450/Chart.vue';
import Dashboard from '../LT_AU450/Dashboard.vue';
import Controls from '../LT_AU450/Controls.vue';
import SecretPanel from '../LT_AU450/SecretPanel.vue';
import Diagram from '../LT_AU450/Diagram.vue';


const tabview_pt = {
    root: { style: 'width: 100%; height: 100%; border-radius: 4px; font-family: "Cairo", sans-serif;' },
    panelContainer: { style: 'background-color: transparent; padding: 0px;' },
};
const tabpanel_pt = {
    headerAction: { style: 'padding: 8px 16px; border-radius: 0px; background-color: transparent; font-size: 14px;' },
    content: { style: 'position: relative;' },
};
const system_components_src = ref('')
const lt_au450_control_panel_pos = ref('relative');
const lt_au450_control_panel_width = computed(() => lt_au450_control_panel_pos.value === 'relative' ? '96%' : 'calc(100vw - 60px - 16px)');
const lt_au450_control_panel_left_offset = computed(() => lt_au450_control_panel_pos.value === 'relative' ? '0px' : '8px');
const lt_au450_control_panel_top_offset = computed(() => lt_au450_control_panel_pos.value === 'relative' ? '0px' : '8px');
const lt_au450_control_panel_border = computed(() => lt_au450_control_panel_pos.value === 'relative' ? 'none' : '2px solid var(--empty-gauge-color)');

function toggle_fullscreen() {
    const __map = {
        'absolute': 'relative',
        'relative': 'absolute',
    };
    lt_au450_control_panel_pos.value = __map[lt_au450_control_panel_pos.value];
    if (lt_au450_control_panel_pos.value === 'relative') {
        post_event('change_lt_au450_screen_mode', { _screen_mode: LT_AU450_ScreenMode.W1280 });
        return;
    }
    post_event('change_lt_au450_screen_mode', { _screen_mode: LT_AU450_ScreenMode.W1920 });

}


onMounted(() => {
    // electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'device_models/lt_au450.png' }).then(base64_src => {
    //     if (!base64_src)
    //         return;
    //     post_event('change_device_model_asset',{_assets:base64_src})
      
    // });
    
    post_event('change_device_model_asset',{})
    post_event('update_device_model_cont_width', { width: '60%', margin_bottom: '8px' });
    post_event('remove_ui_springs', {});
  
    electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'etc/lt_au450/lt_au450_components.png' }).then(base64_src => {
        if (!base64_src)
            return;
        system_components_src.value = base64_src;
    });
});


const _msg_type_chart_name_map: Record<number, string> = {
    [-1]: 'Time [s]',
    0: 'Thermocouple 1 [C]',
    1: 'Thermocouple 2 [C]',
    2: 'Thermocouple 3 [C]',
    3: 'Thermocouple 4 [C]',
    4: 'Thermocouple 5 [C]',
    5: 'LoadCell 1 [kgF]',
    6: 'LoadCell 2 [kgF]',
};

onMounted(() => {
    post_event('set_chart_msg_type_name_map', { _msg_type_chart_name_map });
    post_event('set_default_sampling_dt', { _sampling_dt: 1 });
});

</script>

<template>
    <SecretPanel/>
    <div id="lt_au450_control_main_cont" v-on="screenshot_handlers">
        
        <Button icon="pi pi-expand" id="expand_btn" title="Toggle Full Screen" rounded text @click="toggle_fullscreen()" />
        <TabView id="lt_au450_tabview" :pt="tabview_pt">

            <TabPanel header="Dashboard" :pt="tabpanel_pt">
                <Dashboard  />
            </TabPanel>
            <TabPanel header="Chart" :pt="tabpanel_pt">
                <LT_AU450_Chart />
            </TabPanel>
            <TabPanel header="Diagram" :pt="tabpanel_pt">
            <Diagram :full_screen="lt_au450_control_panel_pos=='absolute'" />
            </TabPanel>
            <TabPanel header="Components" :pt="tabpanel_pt">
                <img style="width: 90%; margin: 5%;" :src="system_components_src" alt="Componenets">
            </TabPanel>
            <TabPanel header="Controls" :pt="tabpanel_pt">
                <Controls :full_screen="lt_au450_control_panel_pos=='absolute'"/>
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

#scan_btn {
    position: absolute;
    right: 24px;
    top: 0px;
    color: var(--accent-color);
    width: 32px;
    height: 32px;
    z-index: 1;
}

#lt_au450_control_main_cont {

    position: v-bind(lt_au450_control_panel_pos);
    width: v-bind(lt_au450_control_panel_width);
    left: v-bind(lt_au450_control_panel_left_offset);
    top: v-bind(lt_au450_control_panel_top_offset);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--light-bg-color);
    border: 1px solid var(--empty-gauge-color);
    border-radius: 4px;
    z-index: 2;
    border: v-bind(lt_au450_control_panel_border);
}
</style>