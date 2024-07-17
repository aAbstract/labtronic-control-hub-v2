<script setup lang="ts">

import CircleUserIcon from '@renderer/components/icons/CircleUser.vue';

defineProps<{ tag_height: string, icon_size: string }>();

const font_color = document.documentElement.style.getPropertyValue('--font-color');

</script>

<template>
    <div id="user_info_cont">
        <CircleUserIcon id="user_icon" :fill_color="font_color" />
        <div class="txt_cont">
            <span>Guest [GUEST]</span>
        </div>
    </div>
</template>

<style scoped>
#user_icon {
    width: v-bind(icon_size);
    margin-right: 8px;
}

#user_info_cont .txt_cont {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-weight: bold;
}

#user_info_cont {
    background-color: var(--light-bg-color);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 8px 16px;
    color: var(--font-color);
    border-radius: 4px;
    height: v-bind(tag_height);
}
</style>