<script setup lang="ts">

import { ref, computed, onMounted } from 'vue';

import { LT_RE600_ScreenMode, LT_RE600_MeterParams, DeviceMsg } from '@common/models';
import { subscribe } from '@common/mediator';

const props = defineProps<{ meter_params: LT_RE600_MeterParams }>();

const __smw_map: Record<LT_RE600_ScreenMode, string> = {
    [LT_RE600_ScreenMode.W1280]: '300px',
    [LT_RE600_ScreenMode.W1920]: '400px',
};
const __smtfs_map: Record<LT_RE600_ScreenMode, string> = {
    [LT_RE600_ScreenMode.W1280]: '16px',
    [LT_RE600_ScreenMode.W1920]: '20px',
};
const __smifs_map: Record<LT_RE600_ScreenMode, string> = {
    [LT_RE600_ScreenMode.W1280]: '14px',
    [LT_RE600_ScreenMode.W1920]: '16px',
};

const screen_mode = ref<LT_RE600_ScreenMode | null>(null);
const top_offset = computed(() => props.meter_params.top_offsets[screen_mode.value ?? LT_RE600_ScreenMode.W1280] + 'px');
const left_offset = computed(() => props.meter_params.left_offsets[screen_mode.value ?? LT_RE600_ScreenMode.W1280] + 'px');
const meter_msg_values = ref<Record<number, number>>({});
const meter_width = computed(() => __smw_map[screen_mode.value ?? LT_RE600_ScreenMode.W1280]);
const meter_title_font_size = computed(() => __smtfs_map[screen_mode.value ?? LT_RE600_ScreenMode.W1280]);
const meter_value_font_size = computed(() => __smifs_map[screen_mode.value ?? LT_RE600_ScreenMode.W1280]);
const msg_type_set = new Set(props.meter_params.meter_values.map(x => x.msg_type));

onMounted(() => {
    subscribe('change_lt_re600_screen_mode', args => {
        const _screen_mode: LT_RE600_ScreenMode | null = args._screen_mode;
        screen_mode.value = _screen_mode;
    });

    subscribe('device_msg', data => {
        const device_msg: DeviceMsg = data.device_msg;
        const { msg_type } = device_msg.config;
        const { msg_value } = device_msg;
        if (msg_type_set.has(msg_type))
            meter_msg_values.value[msg_type] = msg_value;
    });
});

</script>

<template>
    <div v-if="screen_mode" class="lt_re600_meter_cont">
        <h3 class="meter_title">{{ meter_params.meter_name }}</h3>
        <div v-for="mv in meter_params.meter_values" class="meter_value">
            <span>{{ mv.msg_name }}: </span>
            <span>{{ (meter_msg_values[mv.msg_type] ?? 0).toFixed(2) }}</span>
        </div>
    </div>
</template>

<style scoped>
.meter_value {
    font-weight: bold;
    font-size: v-bind(meter_value_font_size);
    width: 33%;
    display: inline-block;
    color: var(--font-color);
}

.meter_title {
    margin: 0px;
    margin-bottom: 8px;
    font-size: v-bind(meter_title_font_size);
    color: var(--accent-color);
}

.lt_re600_meter_cont {
    position: absolute;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    top: v-bind(top_offset);
    left: v-bind(left_offset);
    width: v-bind(meter_width);
    height: fit-content;
    border-radius: 4px;
    background-color: var(--dark-bg-color);
    border: 2px solid var(--accent-color);
    padding: 4px;
}
</style>