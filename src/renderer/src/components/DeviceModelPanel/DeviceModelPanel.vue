<script setup lang="ts">

import { onMounted, inject, ref } from 'vue';

import { add_log, electron_renderer_invoke } from '@renderer/lib/util';
import { DeviceUIConfig } from '@renderer/lib/device_ui_config';
import * as GfxApi from '@renderer/lib/gfx_api';
import { subscribe, post_event } from '@common/mediator';

import Message from 'primevue/message';

const props = defineProps<{ device_ui_config: DeviceUIConfig }>();
const device_model = inject('device_model') as string;
const device_model_labeled_img = ref('');
const device_model_cont_width = ref('96%');
const device_model_cont_margin_bottom = ref('16px');
const show_device_model_panel_msg = ref(false);
const device_model_panel_severity = ref('warn');
const device_model_panel_content = ref('Device Model Panel Message');
const pv_msg_pt: any = {
    root: { style: 'margin: 0px; width: 100%; height: fit-content; font-family: Cairo, sans-serif;' },
    wrapper: { style: 'padding: 4px 8px;' },
};

// @ts-ignore
function render_msg_value(msg_type: number, msg_value: string) {
    const card_pos_info = props.device_ui_config.get_info_card_pos(msg_type);
    if (!card_pos_info) {
        // add_log({ level: 'ERROR', msg: `Device Model Panel | Unknown Msg Type: ${msg_type}` });
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

    electron_renderer_invoke<string>('load_devie_asset', { asset_path: `device_models_labeled/${device_model.toLowerCase().replace('-', '_')}.png` }).then(base64_src => {
        if (!base64_src) {
            device_model_panel_severity.value = 'warn';
            device_model_panel_content.value = 'No Assets Found for this CHX Module';
            show_device_model_panel_msg.value = true;
            return;
        }
        device_model_labeled_img.value = base64_src;
    });

    subscribe('change_device_model_asset', 'change_device_model_asset', args => {
        const _asset = args._asset;
        const asset_path = `etc/${device_model.toLowerCase().replace('-', '_')}/${_asset}.png`;
        electron_renderer_invoke<string>('load_devie_asset', { asset_path }).then(base64_src => {
            if (!base64_src)
                return;
            device_model_labeled_img.value = base64_src;
        });
        show_device_model_panel_msg.value = false;
        // device_model_labeled_img.value = new URL(`../../device_assets/etc/${device_model.toLowerCase().replace('-', '_')}/${_asset}.png`, import.meta.url).href;
    });

    subscribe('update_device_model_cont_width', 'update_device_model_cont_width', args => {
        const wdith: string = args.width;
        const margin_bottom: string = args.margin_bottom;
        if (wdith)
            device_model_cont_width.value = wdith;
        if (margin_bottom)
            device_model_cont_margin_bottom.value = margin_bottom;
    });

    subscribe('show_device_model_panel_msg', 'show_device_model_panel_msg', args => {
        const severity: string = args.severity;
        const content: string = args.content;
        device_model_panel_severity.value = severity;
        device_model_panel_content.value = content;
        show_device_model_panel_msg.value = true;
    });
});

</script>

<template>
    <div id="main_canvas_cont" @click="post_event('show_device_model_details', {})">
        <img v-if="!show_device_model_panel_msg" id="device_img" :src="device_model_labeled_img" alt="Device Solid Model" @load="canvas_setup()">
        <canvas v-if="!show_device_model_panel_msg" id="device_canvas" @click="GfxApi.debug_canvas_click"></canvas>
        <div v-if="show_device_model_panel_msg" id="device_model_panel_msg_cont">
            <Message :severity="device_model_panel_severity" :pt="pv_msg_pt" :closable="false">{{ device_model_panel_content }}</Message>
        </div>
    </div>
</template>

<style scoped>
#device_model_panel_msg_cont {
    width: 100%;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

#main_canvas_cont {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-bottom: v-bind(device_model_cont_margin_bottom);
    width: v-bind(device_model_cont_width);
    border-radius: 4px;
    cursor: pointer;
}

#device_img,
#device_canvas {
    width: 100%;
    border-radius: 4px;
}

#device_canvas {
    position: absolute;
}
</style>