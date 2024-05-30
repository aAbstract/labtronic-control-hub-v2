<script setup lang="ts">

import { ref, onMounted, onUpdated } from 'vue';

import { get_base_url } from '@renderer/lib/lt_cdn_api';
import { get_asset_link } from '@renderer/lib/lt_cdn_api';

interface ImageListItem {
    img_fn: string;
    label: string;
};
const props = defineProps<{ items: ImageListItem[] }>();

let comp_state: string[] | null = null; // state var used to trigger asset reload
const img_src_list = ref<string[]>([]);

function load_assets() {
    comp_state = props.items.map(x => x.img_fn);
    Promise.all(props.items.map(x => get_asset_link(x.img_fn).then(res => {
        if (res.ok) {
            const { asset_link } = res.ok;
            return `${get_base_url()}${asset_link}`;
        }
        return '';
    }))).then(agg_res => { img_src_list.value = agg_res as string[] });
}

onMounted(() => { load_assets() });

onUpdated(() => {
    if (!comp_state)
        return;

    const new_state = props.items.map(x => x.img_fn);
    if (comp_state.toString() !== new_state.toString())
        load_assets();
});

</script>

<template>
    <div class="img_list_cont">
        <div v-for="(item, index) in items" class="img_list_item">
            <img v-if="img_src_list.length !== 0" :src="img_src_list[index]" alt="CDN Image">
            <span>{{ `${index + 1}- ${item.label}` }}</span>
        </div>
    </div>
</template>

<style scoped>
.img_list_item {
    border: 1px solid var(--empty-gauge-color);
    border-radius: 4px;
    padding: 8px;
    margin: 8px 32px 8px 32px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    color: var(--font-color);
    font-weight: bold;
}

.img_list_item span {
    margin-left: 32px;
}
</style>