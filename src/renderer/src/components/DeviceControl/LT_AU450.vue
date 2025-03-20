<script setup lang="ts">

import { computed, onMounted, ref, inject, watch } from 'vue';
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
import { electron_renderer_send } from '@renderer/lib/util';
import { subscribe } from '@common/mediator';
import { useToast } from 'primevue/usetoast';

const toast_service = useToast()


const tabview_pt = {
    root: { style: 'width: 100%; height: 100%; border-radius: 4px; font-family: "Cairo", sans-serif;' },
    panelContainer: { style: 'background-color: transparent; padding: 0px;' },
};
const tabpanel_pt = {
    headerAction: { style: 'padding: 8px 16px; border-radius: 0px; background-color: transparent; font-size: 14px;' },
    content: { style: 'position: relative;' },
};

const device_model = inject('device_model') as string;
const system_components_src = ref('')
const lt_au450_control_panel_pos = ref('relative');
const lt_au450_control_panel_width = computed(() => lt_au450_control_panel_pos.value === 'relative' ? '96%' : 'calc(100vw - 60px - 16px)');
const lt_au450_control_panel_left_offset = computed(() => lt_au450_control_panel_pos.value === 'relative' ? '0px' : '8px');
const lt_au450_control_panel_top_offset = computed(() => lt_au450_control_panel_pos.value === 'relative' ? '0px' : '8px');
const lt_au450_control_panel_border = computed(() => lt_au450_control_panel_pos.value === 'relative' ? 'none' : '2px solid var(--empty-gauge-color)');

const show_controls_panel = ref(false)

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






const piston_val = ref(0)
function threshold_value(x: any, upper_limit: number): number {
    if (isNaN(x) || x < 0)
        return 0;
    return Math.min(upper_limit, x);
}

function send_digital(packet_value: string) {
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET OUTREG ${packet_value}` });
}
function send_analog() {
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET ANALOG ${piston_val.value}` });
}

let piston_timeout: NodeJS.Timeout
watch(piston_val, (current, old) => {
    if (old == 0 && current > 0) {
        piston_timeout = setTimeout(() => {
            piston_val.value= 0
            send_analog()
            toast_service.add({ severity: 'warn', summary: 'Piston Exceeded Time', detail: 'Piston Value Exceeded the Limit for More Than 3 minutes', life: 3000 });

        }, 1000 * 60 * 3)
    }
    else if (current == 0) {
        clearTimeout(piston_timeout)
    }
})






onMounted(() => {
    post_event('change_device_model_asset', {})
    post_event('update_device_model_cont_width', { width: '60%', margin_bottom: '8px' });
    post_event('remove_ui_springs', {});
    send_digital('0x10')
    electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'etc/lt_au450/lt_au450_components.png' }).then(base64_src => {
        if (!base64_src)
            return;
        system_components_src.value = base64_src;
    });
    post_event('set_chart_msg_type_name_map', { _msg_type_chart_name_map });
    post_event('set_default_sampling_dt', { _sampling_dt: 1 });
    window.electron?.ipcRenderer.on(`${device_model}_secret_controls`, () => {
        show_controls_panel.value = !show_controls_panel.value
    }
    )

    subscribe('increase_piston', 'increase_piston', (args) => {
        let value = 5
        if (args.value)
            value = args.value
        piston_val.value = threshold_value(piston_val.value + value, 200);
        send_analog()
    })
    subscribe('decrease_piston', 'decrease_piston', (args) => {
        let value = 5
        if (args.value)
            value = args.value
        piston_val.value = threshold_value(piston_val.value - value, 200);
        send_analog()
    })
    subscribe('send_piston', 'send_piston', (args) => {
        piston_val.value = threshold_value(args.piston, 200);
        send_analog()
    })

    subscribe('send_digital', 'send_digital', (args) => {
        console.log(args)
        send_digital(args.digital)
    })

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

</script>

<template>
    <SecretPanel />
    <div id="lt_au450_control_main_cont" v-on="screenshot_handlers">

        <Button icon="pi pi-expand" id="expand_btn" title="Toggle Full Screen" rounded text @click="toggle_fullscreen()" />
        <TabView id="lt_au450_tabview" :pt="tabview_pt">

            <TabPanel header="Dashboard" :pt="tabpanel_pt">
                <Dashboard />
            </TabPanel>
            <TabPanel header="Chart" :pt="tabpanel_pt">
                <LT_AU450_Chart />
            </TabPanel>
            <TabPanel header="Diagram" :pt="tabpanel_pt">
                <Diagram :full_screen="lt_au450_control_panel_pos == 'absolute'" />
            </TabPanel>
            <TabPanel header="Components" :pt="tabpanel_pt">
                <img style="width: 90%; margin: 5%;" :src="system_components_src" alt="Componenets">
            </TabPanel>
            <TabPanel header="Controls" :pt="tabpanel_pt" v-if="show_controls_panel">
                <Controls :full_screen="lt_au450_control_panel_pos == 'absolute'" />
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