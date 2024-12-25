<script setup lang="ts">

import { ref, onMounted, shallowRef, inject } from 'vue';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';

import { MsgTypeConfig } from '@common/models';
import { subscribe } from '@common/mediator';
import { electron_renderer_invoke } from '@renderer/lib/util';

type DataPointType = Record<string, number>;
interface TableHeader {
    header_name: string;
    header_key: string;
};

const device_model = inject('device_model');
const dialog_visible = ref(false);
const auto_scroll = ref(true);
const table_headers = shallowRef<TableHeader[]>();
const data_points = shallowRef<DataPointType[]>();
const dialog_pt = {
    header: { style: 'padding: 12px 16px;' },
    content: { style: 'padding: 0px 16px;' },
    footer: { style: 'padding: 8px 16px; direction: ltr; display: flex; justify-content: flex-start;' },
};
const checkbox_pt: any = {
    box: { style: 'background-color: var(--dark-bg-color); border-color: var(--empty-gauge-color);' },
    icon: { style: 'color: var(--font-color);' },
};

let data_points_cache: DataPointType[] = [];

function scroll_table_down() {
    if (!dialog_visible.value || !auto_scroll.value)
        return;
    const data_preview_cont = document.querySelector('#data_preview_cont') as HTMLElement;
    data_preview_cont.scrollTop = data_preview_cont.scrollHeight;
}

onMounted(() => {
    subscribe('show_data_preview', 'show_data_preview', _ => {
        dialog_visible.value = true;
    });

    subscribe('device_config_ready', 'device_config_ready_DataPreview', () => {
        electron_renderer_invoke<MsgTypeConfig[]>(`${device_model}_get_device_config`).then(device_config => {
            if (!device_config)
                return;
            const read_config = device_config.filter(x => x.msg_name.startsWith('READ_'));
            table_headers.value = [
                { header_key: 'time_ms', header_name: 'time_s' },
                ...read_config.map(x => {
                    return {
                        header_key: String(x.msg_type),
                        header_name: x.msg_name.replace('READ_', ''),
                    } as TableHeader;
                }),
            ];
        });
    });

    subscribe('record_data_point', 'record_data_point_data_preview', args => {
        data_points_cache.push(args._data_point);
        data_points.value = [...data_points_cache];
        scroll_table_down();
    });

    subscribe('clear_recorded_data', 'clear_recorded_data_data_preview', () => {
        data_points_cache = [];
        data_points.value = [];
    });
});

</script>

<template>
    <Dialog style="font-family: Cairo, sans-serif;" v-model:visible="dialog_visible" header="Data Preview" :style="{ width: '44%' }" :pt="dialog_pt">
        <div id="data_preview_cont">
            <!-- table header -->
            <div class="data_point_row" id="data_preview_table_header">
                <span v-for="header in table_headers" style="width: 100px;">{{ header.header_name }}</span>
            </div>

            <!-- table body -->
            <div class="data_point_row" v-for="dp in data_points">
                <span v-for="header in table_headers" style="width: 100px;" :title="header.header_name">{{ header.header_key === 'time_ms' ? (dp[header.header_key] / 1000).toFixed() : dp[header.header_key].toFixed(2) }}</span>
            </div>
            <div style="height: 16px;"></div>
        </div>
        <template #footer>
            <div id="data_preview_footer">
                <Checkbox v-model="auto_scroll" :pt="checkbox_pt" binary />
                <div style="width: 8px;"></div>
                <span style="color: var(--font-color);">Auto Scroll</span>
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
#data_preview_footer {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

#data_preview_table_header {
    position: sticky;
    top: 0px;
    padding: 8px 0px;
    border-bottom: 2px solid var(--font-color);
    background-color: var(--dark-bg-color);
}

.data_point_row {
    min-width: 100%;
    width: fit-content;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 4px;
}

#data_preview_cont {
    max-width: 100%;
    height: 500px;
    background-color: var(--dark-bg-color);
    color: var(--font-color);
    padding: 8px;
    padding-top: 0px;
    border-radius: 4px;
    font-size: 12px;
    font-family: "Lucida Console", "Courier New", monospace;
    font-weight: bold;
    overflow-x: scroll;
    overflow-y: scroll;
}
</style>