<script setup lang="ts">

defineProps<{
    vp_width: number;
    vp_height: number;
    link: string;
}>();

</script>

<template>
    <div class="ytv_iframe_cont">
        <iframe id="ytv_iframe" :width="vp_width" :height="vp_height" :src="link" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>
</template>

<style scoped>
.ytv_iframe_cont {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 8px 0px;
}
</style>