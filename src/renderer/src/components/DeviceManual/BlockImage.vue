<script setup lang="ts">

import { ref, onMounted, onUpdated } from 'vue';

import { get_base_url } from '@renderer/lib/lt_cdn_api';
import { get_asset_link } from '@renderer/lib/lt_cdn_api';

const props = defineProps<{
    vp_width: number;
    vp_height: number;
    img_fn: string;
}>();

let comp_state: string | null = null; // state var used to trigger asset reload
const img_src = ref('');

function load_assets() {
    comp_state = props.img_fn;
    get_asset_link(props.img_fn).then(res => {
        if (res.ok) {
            const { asset_link } = res.ok;
            img_src.value = `${get_base_url()}${asset_link}`;
            return;
        }
        img_src.value = '';
    });
}

onMounted(() => { load_assets() });

onUpdated(() => {
    if (!comp_state)
        return;

    const new_state = props.img_fn;
    if (comp_state !== new_state)
        load_assets();
});

</script>

<template>
    <div class="block_img_cont">
        <img :src="img_src" alt="Device Manual Block Image" :width="vp_width" :height="vp_height">
    </div>
</template>

<style scoped>
.block_img_cont {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 8px 0px;
}
</style>