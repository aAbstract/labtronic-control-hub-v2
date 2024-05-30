<script setup lang="ts">

import { ref, onMounted, onUpdated } from 'vue';
import Carousel from 'primevue/carousel';

import { get_base_url, get_asset_link } from '@renderer/lib/lt_cdn_api';

interface ImageSequence {
    img_fn: string;
    caption: string;
};

const props = defineProps<{
    vp_width: number;
    vp_height: number;
    sequence: ImageSequence[];
}>();

let comp_state: string[] | null = null; // state var used to trigger asset reload
const img_src_list = ref<string[]>([]);

function load_assets() {
    comp_state = props.sequence.map(x => x.img_fn);
    Promise.all(props.sequence.map(x => get_asset_link(x.img_fn).then(res => {
        if (res.err)
            return;
        const { asset_link } = res.ok;
        return `${get_base_url()}${asset_link}`;
    }))).then(agg_res => { img_src_list.value = agg_res as string[] });
}

onMounted(() => { load_assets() });

onUpdated(() => {
    if (!comp_state)
        return;

    const new_state = props.sequence.map(x => x.img_fn);
    if (comp_state.toString() !== new_state.toString())
        load_assets();
});

</script>

<template>
    <Carousel :value="sequence" :numVisible="1" :numScroll="1">
        <template #item="slotProps">
            <div class="img_seq_item_cont">
                <img v-if="img_src_list.length !== 0" :width="vp_width" :height="vp_height" :src="img_src_list[slotProps.index]" alt="Device Manual Image Sequence Item">
                <span>{{ slotProps.data.caption }}</span>
            </div>
        </template>
    </Carousel>
</template>

<style scoped>
.img_seq_item_cont span {
    width: 80%;
    color: var(--font-color);
    font-weight: bold;
    font-family: "Cairo", sans-serif;
}

.img_seq_item_cont {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}
</style>