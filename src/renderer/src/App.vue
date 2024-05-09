<script setup lang="ts">

import { onBeforeMount, provide } from 'vue';

import TopBar from '@renderer/components/TopBar/TopBar.vue';
import NavBar from '@renderer/components/NavBar/NavBar.vue';
import TerminalPanel from '@renderer/components/DeviceTerminal/TerminalPanel.vue';
import DeviceStatePanel from '@renderer/components/DeviceStatePanel/DeviceStatePanel.vue';
import DeviceModelPanel from '@renderer/components/DeviceModelPanel/DeviceModelPanel.vue';
import LT_CH000 from '@renderer/components/DeviceControl/LT_CH000.vue';
import { DEVICE_UI_CONFIG_MAP } from '@renderer/lib/device_ui_config';

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
});

</script>

<template>
  <div id="app_shell">
    <TopBar />
    <div id="main_panel">
      <NavBar />
      <div id="slider_panel_cont">
        <div id="model_control_cont">
          <div style="flex-grow: 1;"></div>
          <DeviceModelPanel :device_ui_config="DEVICE_UI_CONFIG_MAP[DEVICE_MODEL]" />
          <LT_CH000 />
          <div style="flex-grow: 1;"></div>
        </div>
        <TerminalPanel />
      </div>
      <DeviceStatePanel />
    </div>
  </div>
</template>

<style>
.device_model_panel {
  width: 100%;
  height: 100%;
}

#slider_panel_cont {
  position: relative;
  min-width: 40vw;
  width: 40vw;
  height: 100%;
}

#slider_panel_cont #model_control_cont {
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
