<script setup lang="ts">

defineProps<{
    list_type: 'UL' | 'OL';
    points: string[];
}>();

</script>

<template>
    <div class="bps_main_cont">
        <span v-if="list_type === 'UL'" v-for="point in points" class="bps_item">{{ `- ${point}` }}</span>
        <span v-else-if="list_type === 'OL'" v-for="(point, index) in points" class="bps_item">{{ `${index + 1}- ${point}` }}</span>
        <span v-else class="bps_item">{{ `Unknown List Type: ${list_type}, Choose UL for Unordered Lists and OL for Ordered Ones` }}</span>
    </div>
</template>

<style scoped>
.bps_main_cont {
    margin-top: 8px;
}

.bps_item {
    display: inline-block;
    margin: 0px 32px;
    margin-bottom: 8px;
    font-size: 16px;
    color: var(--font-color);
    font-weight: bold;
}
</style>