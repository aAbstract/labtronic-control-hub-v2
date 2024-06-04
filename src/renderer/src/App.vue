<script setup lang="ts">

import { onBeforeMount, provide } from 'vue';
import Toast from 'primevue/toast';

import TopBar from '@renderer/components/TopBar/TopBar.vue';
import NavBar from '@renderer/components/NavBar/NavBar.vue';
import TerminalPanel from '@renderer/components/DeviceTerminal/TerminalPanel.vue';
import DeviceStatePanel from '@renderer/components/DeviceStatePanel/DeviceStatePanel.vue';
import DeviceModelPanel from '@renderer/components/DeviceModelPanel/DeviceModelPanel.vue';
import DataPanel from '@renderer/components/DataPanel/DataPanel.vue';
import SettingsPanel from '@renderer/components/SettingsPanel.vue';
import LT_CH000 from '@renderer/components/DeviceControl/LT_CH000.vue';
import DeviceManualPanel from '@renderer/components/DeviceManualPanel.vue';
import Alert from '@renderer/components/Alert.vue';
import { DEVICE_UI_CONFIG_MAP } from '@renderer/lib/device_ui_config';
import { CHXSettings } from '@common/models';
import { set_base_url, inject_source_csp } from '@renderer/lib/lt_cdn_api';
import { post_event } from '@common/mediator';
import { electron_renderer_invoke } from '@renderer/lib/util';

const APP_THEME = {
  '--dark-bg-color': '#0B0E1F',
  '--light-bg-color': '#111D2D',
  '--light-bg-shadow-color': '#1A2636',
  '--font-color': '#8BA2CC',
  '--accent-color': '#29B2F8',
  '--empty-gauge-color': '#2D3A4B',
};
const DEVICE_MODEL = 'LT-CH000';

provide('device_model', DEVICE_MODEL);

function load_theme(theme: Record<string, string>) {
  for (const theme_var in theme)
    document.documentElement.style.setProperty(theme_var, theme[theme_var]);
}

onBeforeMount(() => {
  load_theme(APP_THEME);
  electron_renderer_invoke<CHXSettings>('get_chx_settings').then(chx_settings => {
    if (!chx_settings)
      return;
    const { labtronic_cdn_base_url } = chx_settings;
    inject_source_csp(labtronic_cdn_base_url);
    set_base_url(labtronic_cdn_base_url);
    post_event('chx_settings_loaded', {});
  });
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
        <div id="model_control_cont">
          <div style="flex-grow: 1;"></div>
          <DeviceModelPanel :device_ui_config="DEVICE_UI_CONFIG_MAP[DEVICE_MODEL]" />
          <LT_CH000 />
          <div style="flex-grow: 1;"></div>
        </div>
        <TerminalPanel />
        <DataPanel :device_ui_config="DEVICE_UI_CONFIG_MAP[DEVICE_MODEL]" />
        <SettingsPanel />
      </div>
      <div id="right_panel_cont">
        <DeviceStatePanel />
        <DeviceManualPanel />
      </div>
    </div>
  </div>
</template>

<style>
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
</style>
