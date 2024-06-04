<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

import NavBarIcon from './NavBarIcon.vue';
import SquareTerminalIcon from '@renderer/components/icons/SquareTerminal.vue';
import SettingsIcon from '@renderer/components/icons/Settings.vue';
import DatabaseIcon from '@renderer/components/icons/Database.vue';
import BookOpenCover from '@renderer/components/icons/BookOpenCover.vue';
import PhotoCapture from '@renderer/components/icons/PhotoCapture.vue';
import CircleXmark from '@renderer/components/icons/CircleXmark.vue';
import { NavMenuItem } from '@common/models';
import { post_event, subscribe } from '@common/mediator';
import { toggle_screenshot_mode, screenshot_mode } from '@renderer/lib/screenshot';

const toast_service = useToast();
const MENU_ITEMS: NavMenuItem[] = [
    {
        label: 'DEVICE TERMINAL',
        icon: SquareTerminalIcon,
        menu_action() {
            post_event('toggle_control_panel', {});
            post_event('hide_data_panel', {});
            post_event('hide_settings_panel', {});
        },
    },
    {
        label: 'DATA PANEL',
        icon: DatabaseIcon,
        menu_action() {
            post_event('toggle_data_panel', {});
            post_event('hide_control_panel', {});
            post_event('hide_settings_panel', {});
        },
    },
    {
        label: 'DEVICE MANUAL',
        icon: BookOpenCover,
        menu_action() { post_event('toggle_dmp', {}) },
    },
    {
        label: 'SCREENSHOT',
        icon: PhotoCapture,
        menu_action() {
            toggle_screenshot_mode();
            active_flags.value[3] = screenshot_mode();
            const mode_str_repr = screenshot_mode() ? 'ON' : 'OFF';
            const mode_msg = screenshot_mode() ? 'Click on a UI Component to Capture Screenshot' : 'Screenshot Mode is Disabled';
            toast_service.add({ severity: 'info', summary: `Screenshot ${mode_str_repr}`, detail: mode_msg, life: 3000 });
        },
    },
    {
        label: 'SETTINGS',
        icon: SettingsIcon,
        menu_action() {
            post_event('toggle_settings_panel', {});
            post_event('hide_control_panel', {});
            post_event('hide_data_panel', {});
        },
    },
];
const EXIT_MENU_ITEM: NavMenuItem = {
    label: 'EXIT',
    icon: CircleXmark,
    menu_action() { post_event('nav_bar_exit', {}) },
}
const active_flags = ref(MENU_ITEMS.map(_ => false));

function trigger_icon_active_flag_reset(index: number) {
    const RESET_LIST = [0, 1, 4];
    if (!RESET_LIST.includes(index))
        return;

    for (let flag_idx of RESET_LIST) {
        if (flag_idx === index)
            active_flags.value[flag_idx] = !active_flags.value[flag_idx];
        else
            active_flags.value[flag_idx] = false;
    }
}

onMounted(() => {
    active_flags.value[3] = screenshot_mode();
    subscribe('toggle_control_panel', 'toggle_control_panel_icon', _ => trigger_icon_active_flag_reset(0));
    subscribe('toggle_data_panel', 'toggle_data_panel_icon', _ => trigger_icon_active_flag_reset(1));
    subscribe('toggle_dmp', 'toggle_dmp_icon', _ => active_flags.value[2] = !active_flags.value[2]);
    subscribe('toggle_settings_panel', 'toggle_settings_panel_icon', _ => trigger_icon_active_flag_reset(4));
});

</script>

<template>
    <div id="nav_bar_cont">
        <NavBarIcon v-for="(item, idx) in MENU_ITEMS" :menu_item="item" :is_active="active_flags[idx]" />
        <div style="flex-grow: 1;"></div>
        <NavBarIcon :menu_item="EXIT_MENU_ITEM" :is_active="false" />
    </div>
</template>

<style scoped>
#nav_bar_cont {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
    background-color: var(--light-bg-color);
    padding: 16px 0px;
    width: 60px;
}
</style>