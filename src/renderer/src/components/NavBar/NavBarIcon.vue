<script setup lang="ts">

import { computed, Ref } from 'vue';

import { compute_tooltip_pt } from '@renderer/lib/util';

interface NavMenuItem {
    label: string;
    icon: any;
    icon_size: string;
    panel_name: string;
    panel_pos: 'LEFT' | 'RIGHT';
    is_active: Ref<boolean>;
    action: (event: MouseEvent) => void;
};

const props = defineProps<{ menu_item: NavMenuItem }>();
const { icon_size } = props.menu_item;

const icon_class = computed(() => props.menu_item.is_active.value ? 'nav_bar_icon_cont nav_bar_icon_cont_active' : 'nav_bar_icon_cont nav_bar_icon_cont_inactive');
const font_color = document.documentElement.style.getPropertyValue('--font-color');
const accent_color = document.documentElement.style.getPropertyValue('--accent-color');
const icon_fill_color = computed(() => props.menu_item.is_active.value ? accent_color : font_color);

</script>

<template>
    <div :class="icon_class" @click="menu_item.action" v-tooltip="{ value: menu_item.label, pt: compute_tooltip_pt('right') }">
        <component class="menu_icon" :is="menu_item.icon" :fill_color="icon_fill_color" />
    </div>
</template>

<style scoped>
.menu_icon {
    width: v-bind(icon_size);
    height: v-bind(icon_size);
}

.nav_bar_icon_cont {
    background-color: var(--light-bg-shadow-color);
    border: 1px solid var(--empty-gauge-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    transition: 0.3s ease;
    margin-bottom: 16px;
    width: 40px;
    height: 40px;
    padding: 4px;
    border-radius: 4px;
}

.nav_bar_icon_cont_active {
    color: var(--accent-color);
}

.nav_bar_icon_cont_inactive {
    color: var(--font-color);
}

/* .nav_bar_icon_cont:hover {
    color: var(--accent-color);
    border-left: 4px solid var(--accent-color);
} */

.nav_bar_icon_cont span {
    font-size: 16px;
    font-weight: normal;
}

.nav_bar_icon_cont {
    font-weight: bold;
}
</style>