<script setup lang="ts">

defineProps<{ paragraphs: string[] }>();

</script>

<template>
    <div class="dm_p_main_cont">
        <p class="dm_p" v-for="p in paragraphs">{{ p }}</p>
    </div>
</template>

<style scoped>
.dm_p_main_cont {
    margin-top: 8px;
}

.dm_p {
    margin: 0px 32px;
    margin-bottom: 8px;
    font-size: 16px;
    color: var(--font-color);
    font-weight: bold;
}
</style>