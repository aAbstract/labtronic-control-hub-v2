<script setup lang="ts">

import { ref, onMounted, onUpdated } from 'vue';

import { get_base_url } from '@renderer/lib/lt_cdn_api';
import { get_asset_link } from '@renderer/lib/lt_cdn_api';

const props = defineProps<{
    img_fn: string;
    text: string[];
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
    <div class="txt_img_cont">
        <div class="txt_cont">
            <p v-for="p in text">{{ p }}</p>
        </div>
        <img :src="img_src" alt="Device Manual Text Image">
    </div>
</template>

<style scoped>
.txt_img_cont .txt_cont {
    width: 60%;
}

.txt_img_cont .txt_cont p {
    margin: 0px;
}

.txt_img_cont img {
    width: 40%;
}

.txt_img_cont {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    margin: 8px 32px 8px 32px;
    color: var(--font-color);
    font-weight: bold;
}
</style>