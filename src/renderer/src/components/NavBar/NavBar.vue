<script setup lang="ts">

import { ref, Ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Menu from 'primevue/menu';

import NavBarIcon from './NavBarIcon.vue';
import SquareTerminalIcon from '@renderer/components/icons/SquareTerminal.vue';
import CalculatorMoney from '@renderer/components/icons/CalculatorMoney.vue';
import BookOpenCover from '@renderer/components/icons/BookOpenCover.vue';
import Obelisk from '@renderer/components/icons/Obelisk.vue';
import ChartHistogram from '@renderer/components/icons/ChartHistogram.vue';
import Bolt from '@renderer/components/icons/Bolt.vue';
import CircleXmark from '@renderer/components/icons/CircleXmark.vue';
import { post_event, subscribe } from '@common/mediator';
import { toggle_screenshot_mode, screenshot_mode } from '@renderer/lib/screenshot';

type PanelPosType = 'LEFT' | 'RIGHT';
class NavMenuItem {
    label: string;
    icon: any;
    icon_size: string;
    panel_name: string;
    panel_pos: PanelPosType;
    is_active: Ref<boolean>;
    action: (event: MouseEvent) => void;

    constructor(_label: string, _icon: any, _action: (event: MouseEvent) => void, _panel_name: string = '', _panel_pos: PanelPosType = 'LEFT', _icon_size: string = '24px') {
        this.label = _label;
        this.icon = _icon;
        this.panel_name = _panel_name;
        this.panel_pos = _panel_pos;
        this.is_active = ref(false);
        this.action = _action.bind(this);
        this.icon_size = _icon_size;
    }
};

const toast_service = useToast();
const menu_items: NavMenuItem[] = [
    new NavMenuItem('Device Terminal', SquareTerminalIcon, function (this: NavMenuItem, _event: MouseEvent) { toggle_panel(this.panel_name, this.panel_pos) }, 'control_panel', 'LEFT'),
    new NavMenuItem('Data Tool', CalculatorMoney, function (this: NavMenuItem, _event: MouseEvent) { toggle_panel(this.panel_name, this.panel_pos) }, 'data_tool', 'RIGHT'),
    new NavMenuItem('Chart Tool', ChartHistogram, function (this: NavMenuItem, _event: MouseEvent) { toggle_panel(this.panel_name, this.panel_pos) }, 'chart_tool_panel', 'LEFT'),
    new NavMenuItem('Device Manual', BookOpenCover, function (this: NavMenuItem, _event: MouseEvent) { toggle_panel(this.panel_name, this.panel_pos) }, 'device_pdf_panel', 'RIGHT'),
    new NavMenuItem('Obelisk AI', Obelisk, function (this: NavMenuItem, _event: MouseEvent) {
        this.is_active.value = !this.is_active.value;
        post_event('toggle_ltai_panel', {});
    }, '', 'LEFT', '32px'),
    new NavMenuItem('Quick Actions', Bolt, function (this: NavMenuItem, _event: MouseEvent) {
        quick_actions_menu.value.toggle(_event);
    }),
];
const exit_menu_item = new NavMenuItem('Exit', CircleXmark, function (this: NavMenuItem, _event: MouseEvent) { post_event('nav_bar_exit', {}) });

const quick_actions_menu = ref();
const __qamidx = menu_items.length - 1;
const quick_actions_menu_items = [
    {
        label: 'Record Data',
        icon: 'pi pi-caret-right',
        command: () => post_event('show_data_preview', {}),
    },
    {
        label: 'Screenshot',
        icon: 'pi pi-camera',
        command: () => {
            toggle_screenshot_mode();
            const mode_str_repr = screenshot_mode() ? 'ON' : 'OFF';
            const mode_msg = screenshot_mode() ? 'Click on a UI Component to Capture Screenshot' : 'Screenshot Mode is Disabled';
            toast_service.add({ severity: 'info', summary: `Screenshot ${mode_str_repr}`, detail: mode_msg, life: 3000 });
        },
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => {
            for (const m_item of menu_items) {
                if (m_item.panel_pos === 'LEFT') {
                    post_event(`hide_${m_item.panel_name}`, {});
                    m_item.is_active.value = false;
                }
            }
            post_event('toggle_settings_panel', {});
        },
    },
];

const menu_pt = {
    root: { style: 'border-radius: 4px; background-color: var(--light-bg-color); border-color: var(--empty-gauge-color);' },
    icon: { style: 'color: var(--font-color);' },
    label: { style: 'color: var(--font-color); font-size: 14px;' },
};

function toggle_panel(panel_name: string, panel_pos: PanelPosType) {
    if (!panel_name || !panel_pos)
        return;
    for (const m_item of menu_items) {
        if (panel_name === m_item.panel_name) {
            post_event(`toggle_${m_item.panel_name}`, {});
            m_item.is_active.value = !m_item.is_active.value;
        } else if (panel_pos === m_item.panel_pos) {
            post_event(`hide_${m_item.panel_name}`, {});
            m_item.is_active.value = false;
        }
    }
}

onMounted(() => {
    subscribe('toggle_panel', 'toggle_panel', args => toggle_panel(args.panel_name, args.panel_pos));
});

</script>

<template>
    <div id="nav_bar_cont">
        <Menu style="margin-left: 70px; margin-top: -60px;" ref="quick_actions_menu" :model="quick_actions_menu_items" :pt="menu_pt" popup @focus="menu_items[__qamidx].is_active.value = true" @blur="menu_items[__qamidx].is_active.value = false" />
        <NavBarIcon v-for="m_item in menu_items" :menu_item="m_item" />
        <div style="flex-grow: 1;"></div>
        <NavBarIcon :menu_item="exit_menu_item" />
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