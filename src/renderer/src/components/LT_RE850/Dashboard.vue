<script lang="ts" setup>
import { ref, onMounted, inject } from 'vue';
import { post_event } from '@common/mediator';
import { electron_renderer_invoke } from '@renderer/lib/util';

defineProps(['full_screen'])
const temps = ref<number[]>([16.5, 16.5, 16.5, 16.5, 16.5,
    16.5, 16.5, 16.5, 16.5, 16.5,
    16.5, 16.5, 16.5, 16.5, 16.5,
    16.5, 16.5, 16.5, 16.5, 16.5])


const device_model_img = ref()
onMounted(() => {
    post_event('update_device_model_cont_width', { width: '70%', margin_bottom: '0px' });
    post_event('remove_ui_springs', {});

    const device_model = inject('device_model') as string
    electron_renderer_invoke<string>('load_devie_asset', { asset_path: `etc/${device_model.toLowerCase().replace('-', '_')}/Geothermal.png` }).then(base64_src => {
        if (!base64_src)
            return;
        device_model_img.value = base64_src;
    });

});

</script>



<template>
    <div class="dashboard_container">
        <img :src="device_model_img" />
        <div v-if="full_screen">
            <p style="top: 20%; left: 42.5%;">{{ temps[0] }}</p>
            <p style="top: 12.5%; left: 37.5%;">{{ temps[1] }}</p>
            <p style="top: 20%; left: 29%;">{{ temps[2] }}</p>
            <p style="top: 12.5%; left: 24%;">{{ temps[3] }}</p>
            <p style="top: 20%; left: 15%;">{{ temps[4] }}</p>
            <p style="top: 12.5%; left: 10%;">{{ temps[5] }}</p>
            <p style="top: 58%; left: 37.5%;">{{ temps[6] }}</p>
            <p style="top: 38%; left: 62%;">{{ temps[7] }}</p>
            <p style="top: 80%; left: 67.5%;">{{ temps[8] }}</p>
            <p style="top: 58%; right: 29%;">{{ temps[9] }}</p>
            <p style="top: 5%; right: 2.5%;">{{ temps[10] }}</p>
            <p style="top: 30%; right: 2.5%;">{{ temps[11] }}</p>
            <p style="top: 15%; left: 62%;">{{ temps[12] }}</p>
            <p style="top: 16%; left: 53%;">{{ temps[13] }}</p>
            <p style="top: 40%; left: 53%;">{{ temps[14] }}</p>
            <p style="top: 70%; left: 75.5%;">{{ temps[15] }}</p>
            <p style="top: 59.5%; left: 75%;">{{ temps[16] }}</p>
            <p style="top: 17.5%; right: 10%;">{{ temps[17] }}</p>
            <p style="top: 17.5%; left: 95.5%;">{{ temps[18] }}</p>
            <p style="top: 80%; left: 86.75%;width: 40px; text-align: center;">{{ temps[19] }}</p>
        </div>


    </div>


</template>



<style scoped>
.dashboard_container {

    margin-inline: auto;
    position: relative;
}

img {
    width: 100%;
}

p {
    position: absolute;
    margin: 0;
    padding: 0;
    font-size: 16px;
}
</style>