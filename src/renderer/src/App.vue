<script setup lang="ts">

import { onBeforeMount, provide, ref } from 'vue';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

import TopBar from '@renderer/components/TopBar/TopBar.vue';
import NavBar from '@renderer/components/NavBar/NavBar.vue';
import TerminalPanel from '@renderer/components/DeviceTerminal/TerminalPanel.vue';
import DeviceStatePanel from '@renderer/components/DeviceStatePanel/DeviceStatePanel.vue';
import DeviceModelPanel from '@renderer/components/DeviceModelPanel/DeviceModelPanel.vue';
import DataTool from '@renderer/components/DataTool/DataTool.vue';
import SettingsPanel from '@renderer/components/SettingsPanel.vue';
// import DeviceManualPanel from '@renderer/components/DeviceManualPanel.vue';
import DevicePDFPanel from '@renderer/components/DevicePDFPanel.vue';
import Alert from '@renderer/components/Alert.vue';
import LTAIPanel from '@renderer/components/LTAIPanel.vue';
import ChartToolPanel from '@renderer/components/ChartToolPanel.vue';
import { DEVICE_UI_CONFIG_MAP } from '@renderer/lib/device_ui_config';
import { CHXCloudSettings, MsgTypeConfig, _ToastMessageOptions } from '@common/models';
import { set_base_url, inject_source_csp } from '@renderer/lib/lt_cdn_api';
import { post_event, subscribe } from '@common/mediator';
import { electron_renderer_invoke, electron_renderer_send } from '@renderer/lib/util';

import LT_HT103 from '@renderer/components/DeviceControl/LT_HT103.vue';

const APP_THEME = {
  '--dark-bg-color': '#0B0E1F',
  '--light-bg-color': '#111D2D',
  '--light-bg-shadow-color': '#1A2636',
  '--font-color': '#8BA2CC',
  '--accent-color': '#29B2F8',
  '--empty-gauge-color': '#2D3A4B',
};
const DEVICE_MODEL = 'LT-HT103';
const toast_service = useToast();
const spring_display = ref<string>('block');

provide('device_model', DEVICE_MODEL);

function load_theme(theme: Record<string, string>) {
  for (const theme_var in theme)
    document.documentElement.style.setProperty(theme_var, theme[theme_var]);
}

onBeforeMount(() => {
  load_theme(APP_THEME);

  electron_renderer_send('load_device_driver', {});

  electron_renderer_invoke<CHXCloudSettings>('get_chx_cloud_settings').then(chx_cloud_settings => {
    if (!chx_cloud_settings)
      return;
    const { labtronic_cdn_base_url } = chx_cloud_settings;
    inject_source_csp(labtronic_cdn_base_url);
    set_base_url(labtronic_cdn_base_url);
    post_event('chx_settings_loaded', {});
  });

  subscribe('remove_ui_springs', 'remove_ui_springs', _ => spring_display.value = 'none');

  // update ui params for dynamic msg_types like computed parameters
  window.electron?.ipcRenderer.on(`${DEVICE_MODEL}_device_config_ready`, () => {
    electron_renderer_invoke<MsgTypeConfig>(`${DEVICE_MODEL}_get_device_config`).then(device_config => post_event(`${DEVICE_MODEL}_update_ui_params`, { device_config }));
    post_event('device_config_ready', {});
  });

  window.electron?.ipcRenderer.on('show_system_notif', (_, data) => toast_service.add(data.notif));
});

</script>

<template>
  <div id="app_shell">
    <TopBar />
    <Toast />
    <Alert />
    <div id="main_panel">
      <NavBar />
      <div id="left_panel_cont">
        <LTAIPanel style="position: absolute;" />
        <ChartToolPanel style="position: absolute;" />
        <div id="model_control_cont">
          <div class="ui_spring"></div>
          <DeviceModelPanel :device_ui_config="DEVICE_UI_CONFIG_MAP[DEVICE_MODEL]" />
          <LT_HT103 />
          <div class="ui_spring"></div>
        </div>
        <TerminalPanel />
        <SettingsPanel />
      </div>
      <div id="right_panel_cont">
        <DeviceStatePanel />
        <DataTool />
        <DevicePDFPanel />
      </div>
    </div>
  </div>
</template>

<style>
.ui_spring {
  display: v-bind(spring_display);
  flex-grow: 1;
}

.device_model_panel {
  width: 100%;
  height: 100%;
}

#right_panel_cont {
  position: relative;
  flex-grow: 1;
  height: 100%;
  overflow-x: hidden;
}

#left_panel_cont {
  position: relative;
  min-width: 40vw;
  width: 40vw;
  height: 100%;
}

#left_panel_cont #model_control_cont {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

#app_shell {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 100%;
}

#main_panel {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-grow: 1;
  width: 100%;
}

body,
html {
  width: 100%;
  height: 100%;
  margin: 0;
  background-color: var(--dark-bg-color);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-family: "Cairo", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c2c2c;
  width: 100%;
  height: 100%;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: var(--empty-gauge-color);
}

::-webkit-scrollbar-thumb {
  background: var(--font-color);
  border-radius: 8px;
}

::-webkit-scrollbar-corner {
  background-color: var(--empty-gauge-color);
}

::placeholder {
  color: var(--empty-gauge-color);
}
</style>
