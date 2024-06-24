<script setup lang="ts">

import { onMounted, inject } from 'vue';

import { add_log } from '@renderer/lib/util';
import { DeviceUIConfig } from '@renderer/lib/device_ui_config';
import * as GfxApi from '@renderer/lib/gfx_api';
import { screenshot_handlers } from '@renderer/lib/screenshot';
import { subscribe } from '@common/mediator';

const props = defineProps<{ device_ui_config: DeviceUIConfig }>();
const device_model = inject('device_model') as string;
const device_model_labeled_img = new URL(`../../device_assets/device_models_labeled/${device_model.toLowerCase().replace('-', '_')}.png`, import.meta.url).href;

function render_msg_value(msg_type: number, msg_value: string) {
    const card_pos_info = props.device_ui_config.get_info_card_pos(msg_type);
    if (!card_pos_info) {
        add_log({ level: 'ERROR', msg: `Unknown Msg Type: ${msg_type}` });
        return;
    }
    const { pos, cell_count } = card_pos_info;
    GfxApi.clear_digit_cells(pos, cell_count);
    GfxApi.write_digit_cells(pos, msg_value.padStart(cell_count, ' ').slice(0, cell_count));
}

// event handlers
function canvas_setup() {
    const canvas = document.querySelector('#device_canvas') as HTMLCanvasElement;
    const device_img = document.querySelector('#device_img') as HTMLImageElement;
    if (canvas)
        GfxApi.init_gfx(canvas, device_img.width, device_img.height);
    else
        add_log({ level: 'ERROR', msg: 'Faild to Initialize Device Canvas' });
    props.device_ui_config.get_all_info_card_pos().forEach(card => GfxApi.clear_digit_cells(card.pos, card.cell_count));
}

onMounted(() => {
    subscribe('update_device_model_panel', 'update_device_model_panel', args => {
        const _msg_values_cache: Record<number, string> = args._msg_values_cache;
        Object.entries(_msg_values_cache).forEach(([_msg_type, _msg_value]) => {
            const msg_type = Number(_msg_type);
            if (msg_type < 16)
                render_msg_value(msg_type, _msg_value);
        });
    });

    // window.electron.ipcRenderer.on('device_error', () => GfxApi.start_error_animation(device_parts_pos_map['TANK']));
    // window.electron.ipcRenderer.on('device_disconnected', () => GfxApi.stop_animation(device_parts_pos_map['TANK']));
});

</script>

<template>
    <div id="main_canvas_cont" v-on="screenshot_handlers">
        <img id="device_img" :src="device_model_labeled_img" alt="Device Solid Model" @load="canvas_setup()">
        <canvas id="device_canvas" @click="GfxApi.debug_canvas_click"></canvas>
    </div>
</template>

<style scoped>
#main_canvas_cont {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-bottom: 16px;
    width: 96%;
    border-radius: 8px;
}

#device_img,
#device_canvas {
    width: 100%;
    border-radius: 8px;
}

#device_canvas {
    position: absolute;
}
</style>