<script setup lang="ts">

import { ref, onMounted, inject } from 'vue';
import DeviceConnectionTag from './DeviceConnectionTag.vue';
import UserInfoTag from './UserInfoTag.vue';
import DeviceStatusTag from './DeviceStatusTag.vue';
import CloudStatusTag from './CloudStatusTag.vue';

const TAG_HIGHT = '40px';

const device_model = ref('Loading...');

onMounted(() => device_model.value = inject('device_model') as string);

</script>

<template>
    <div id="top_bar_cont">
        <div id="version_tag">
            <span>{{ device_model }}</span>
        </div>
        <div id="tags_cont">
            <div class="tags_sec">
                <DeviceConnectionTag :tag_height="TAG_HIGHT" :icon_size="'24px'" />
                <UserInfoTag :tag_height="TAG_HIGHT" :icon_size="'24px'" />
                <DeviceStatusTag :tag_height="TAG_HIGHT" :icon_size="'24px'" />
                <CloudStatusTag :tag_height="TAG_HIGHT" :icon_size="'24px'" />
            </div>
            <div style="flex-grow: 1;"></div>
            <div class="tags_sec">
                <!-- <FontAwesomeIcon class="right_sec_icon" :icon="['fa-solid', 'maximize']" />
                <FontAwesomeIcon class="right_sec_icon" :icon="['fa-solid', 'fa-question-circle']" /> -->
                <img style="user-select: none;" id="lab_tronic_logo" src="/images/logo_dark_theme.png" alt="LabTronic">
            </div>
        </div>
    </div>
</template>

<style scoped>
.right_sec_icon {
    font-size: 24px;
    color: var(--font-color);
    margin-right: 8px;
    cursor: pointer;
    transition: 0.3s ease;
}

.right_sec_icon:hover {
    color: var(--accent-color);
}

#lab_tronic_logo {
    width: 16vw;
    max-height: 60px;
}

#tags_cont {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-grow: 1;
}

.tags_sec {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

#version_tag {
    width: 16vw;
    height: 100%;
    color: white;
    font-weight: bold;
    background-color: var(--accent-color);
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    clip-path: polygon(0 0, 90% 0, 100% 100%, 0% 100%);
}

#top_bar_cont {
    width: 100%;
    height: 8vh;
    max-height: 60px;
    border-bottom: 4px solid var(--accent-color);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
</style>