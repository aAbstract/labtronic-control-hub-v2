<script setup lang="ts">

import { onBeforeMount, inject } from 'vue';

import { post_event } from '@common/mediator';
import { LogMsg, DeviceMsg } from '@common/models';
import { DeviceUIConfig } from '@renderer/lib/device_ui_config';
import * as GfxApi from '@renderer/lib/gfx_api';

const props = defineProps<{ device_ui_config: DeviceUIConfig }>();
const device_model = inject('device_model') as string;
const device_model_labeled_img = new URL(`../../device_assets/device_models_labeled/${device_model.toLowerCase().replace('-', '_')}.png`, import.meta.url).href;

// event handlers
function canvas_setup() {
    const canvas = document.querySelector('#device_canvas') as HTMLCanvasElement;
    const device_img = document.querySelector('#device_img') as HTMLImageElement;
    if (canvas)
        GfxApi.init_gfx(canvas, device_img.width, device_img.height);
    else
        post_event('add_sys_log', {
            source: '',
            level: 'ERROR',
            msg: 'Faild to Initialize Device Canvas',
        } as LogMsg);
    props.device_ui_config.get_all_info_card_pos().forEach(card => GfxApi.clear_digit_cells(card.pos, card.cell_count));
}

onBeforeMount(() => {
    window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
        const device_msg: DeviceMsg = data.device_msg;
        const msg_type = device_msg.config.msg_type;
        const msg_value = device_msg.msg_value;
        const card_pos_info = props.device_ui_config.get_info_card_pos(msg_type);
        if (!card_pos_info) {
            post_event('add_sys_log', {
                source: '',
                level: 'ERROR',
                msg: `Unknown Msg Type: ${msg_type}`,
            } as LogMsg);
            return;
        }
        const { pos, cell_count } = card_pos_info;
        GfxApi.clear_digit_cells(pos, cell_count);
        GfxApi.write_digit_cells(pos, String(msg_value).padStart(cell_count, ' ').slice(0, cell_count));
    });
    // window.electron.ipcRenderer.on('device_error', () => GfxApi.start_error_animation(device_parts_pos_map['TANK']));
    // window.electron.ipcRenderer.on('device_disconnected', () => GfxApi.stop_animation(device_parts_pos_map['TANK']));
});

</script>

<template>
    <div id="main_canvas_cont">
        <img id="device_img" :src="device_model_labeled_img" alt="Device Solid Model" @load="canvas_setup()">
        <canvas id="device_canvas" @click="GfxApi.debug_canvas_click"></canvas>
    </div>
</template>

<style scoped>
#main_canvas_cont {
    height: fit-content;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
}

#device_img,
#device_canvas {
    width: 96%;
    margin: 16px 0px;
    border-radius: 8px;
}

#device_canvas {
    position: absolute;
}
</style>