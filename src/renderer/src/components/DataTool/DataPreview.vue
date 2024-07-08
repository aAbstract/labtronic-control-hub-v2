<script setup lang="ts">

import { ref, onMounted, shallowRef, inject } from 'vue';
import Dialog from 'primevue/dialog';

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
const table_headers = shallowRef<TableHeader[]>();
let data_points_cache: DataPointType[] = [];
const data_points = shallowRef<DataPointType[]>();
const dialog_pt = {
    header: { style: 'padding: 12px 16px;' },
    content: { style: 'padding: 0px 16px;' },
};

onMounted(() => {
    subscribe('show_data_preview', 'show_data_preview', _ => {
        dialog_visible.value = true;
    });

    window.electron?.ipcRenderer.on(`${device_model}_device_config_ready`, () => {
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
    });

    subscribe('clear_recorded_data', 'clear_recorded_data_data_preview', () => {
        data_points_cache = [];
        data_points.value = [];
    });
});

</script>

<template>
    <Dialog style="font-family: Cairo, sans-serif;" v-model:visible="dialog_visible" header="Data Preview" :style="{ width: '50%' }" :pt="dialog_pt">
        <div id="data_preview_cont">
            <!-- table header -->
            <div class="data_point_row" style="border-bottom: 2px solid var(--font-color); padding-bottom: 8px;">
                <span v-for="header in table_headers" style="width: 100px;">{{ header.header_name }}</span>
            </div>

            <!-- table body -->
            <div class="data_point_row" v-for="dp in data_points">
                <span v-for="header in table_headers" style="width: 100px;" :title="header.header_name">{{ header.header_key === 'time_ms' ? (dp[header.header_key] / 1000).toFixed() : dp[header.header_key].toFixed(2) }}</span>
            </div>
            <div style="height: 16px;"></div>
        </div>
    </Dialog>
</template>

<style scoped>
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
    border-radius: 4px;
    font-size: 12px;
    font-family: "Lucida Console", "Courier New", monospace;
    font-weight: bold;
    overflow-x: scroll;
    overflow-y: scroll;
    margin-bottom: 16px;
}
</style>