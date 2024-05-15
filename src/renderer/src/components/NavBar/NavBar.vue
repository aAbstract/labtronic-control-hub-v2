<script setup lang="ts">

import { ref, onMounted } from 'vue';

import NavBarIcon from './NavBarIcon.vue';
import SquareTerminalIcon from '@renderer/components/icons/SquareTerminal.vue';
import SettingsIcon from '@renderer/components/icons/Settings.vue';
import DatabaseIcon from '@renderer/components/icons/Database.vue';
import CircleXmark from '@renderer/components/icons/CircleXmark.vue';
import { NavMenuItem } from '@common/models';
import { post_event, subscribe } from '@common/mediator';

const MENU_ITEMS: NavMenuItem[] = [
    {
        label: 'CONTROL',
        icon: SquareTerminalIcon,
        menu_action() { post_event('toggle_control_panel', {}) },
    },
    {
        label: 'DATA',
        icon: DatabaseIcon,
        menu_action() { post_event('toggle_data_panel', {}) },
    },
    {
        label: 'SETTINGS',
        icon: SettingsIcon,
        menu_action() { post_event('toggle_settings_panel', {}) },
    },
];
const EXIT_MENU_ITEM: NavMenuItem = {
    label: 'EXIT',
    icon: CircleXmark,
    menu_action() { },
    // menu_action() { exlectron_renderer_exec({ cmd: 'EXIT' }) },
}
const active_flags = ref([false, false, false]);

function trigger_icon_active_flag(index: number) {
    const new_active_flags = [false, false, false];
    new_active_flags[index] = !active_flags.value[index];
    active_flags.value = new_active_flags;
}

onMounted(() => {
    subscribe('toggle_control_panel', 'toggle_control_panel_icon', _ => trigger_icon_active_flag(0));
    subscribe('toggle_data_panel', 'toggle_data_panel_icon', _ => trigger_icon_active_flag(1));
    // subscribe('toggle_settings_panel', 'toggle_settings_panel_icon', _ => trigger_icon_active_flag(2));
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