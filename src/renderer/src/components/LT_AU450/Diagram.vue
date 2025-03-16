<script lang="ts" setup>
import { inject, onMounted, ref } from 'vue';
import { DeviceMsg } from '@common/models';
import { electron_renderer_invoke } from '@renderer/lib/util';

defineProps(['full_screen'])
const device_model = inject('device_model');

const data_values = ref([10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
const data_names = ['T1', 'T2', 'T3', 'T4', 'Air Flow', 'Air Press', 'Fuel Press', 'Fuel Flow', 'RPM', 'Load']
let allow_update = Array(10).fill(true)

const data_positions = [
    'top: 82%; left:32%',
    'top: 60%; left:32.5%',
    'top: 70%; left:62.5%',
    'top: 82%; left:45%',
    'top: 82%; left:17.5%',
    'top: 50%; left:35%',
    'top: 0%; left:50%',
    'top: 0%; left:65%',
    'top: 55%; left:10%',
    'top: 60%; left:10%',
]




window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
    const device_msg: DeviceMsg = data.device_msg;
    const { msg_type } = device_msg.config;

    if (msg_type == 0 && allow_update[0]) {
        data_values.value[0] = device_msg.msg_value;
        allow_update[0] = false
    }
    else if (msg_type == 1 && allow_update[1]) {
        data_values.value[1] = device_msg.msg_value;
        allow_update[1] = false
    }
    else if (msg_type == 2 && allow_update[2]) {
        data_values.value[2] = device_msg.msg_value;
        allow_update[2] = false
    }
    else if (msg_type == 3 && allow_update[3]) {
        data_values.value[3] = device_msg.msg_value;
        allow_update[3] = false
    }
    else if (msg_type == 42 && allow_update[4]) {
        data_values.value[4] = device_msg.msg_value;
        allow_update[4] = false
    }
    else if (msg_type == 27 && allow_update[5]) {
        data_values.value[5] = device_msg.msg_value;
        allow_update[5] = false
    }
    else if (msg_type == 22 && allow_update[6]) {
        data_values.value[6] = device_msg.msg_value;
        allow_update[6] = false
    }
    else if (msg_type == 51 && allow_update[7]) {
        data_values.value[7] = device_msg.msg_value;
        allow_update[7] = false
    }
    else if (msg_type == 24 && allow_update[8]) {
        data_values.value[8] = device_msg.msg_value;
        allow_update[8] = false
    }
    else if (msg_type == 23 && allow_update[9]) {
        data_values.value[9] = device_msg.msg_value;
        allow_update[9] = false
    }


}
)

const system_diagram_src = ref('')
onMounted(() => {
    electron_renderer_invoke<string>('load_devie_asset', { asset_path: 'etc/lt_au450/lt_au450.png' }).then(base64_src => {
        if (!base64_src)
            return;
        system_diagram_src.value = base64_src;
    });
})

setInterval(() => {
    allow_update = Array(10).fill(true)
}, 1000)

</script>

<template>

    <div id="diagrm_container">
        <img style="width: 90%; margin-left: 5%;" :src="system_diagram_src" alt="Diagram">
        <div v-if="full_screen" v-for="value, i in data_values" style="position: absolute;" :style="data_positions[i]">
            <span>{{ data_names[i] }}:</span>
            <p> {{ value }}</p>
        </div>

    </div>



</template>



<style scoped>
#diagrm_container {
    position: relative;
}

p {
    font-size: 24px;
    color: var(--font-color);
    font-weight: bolder;
    display: inline;
}

span {
    color: var(--font-color);
    font-size: 16px;
}
</style>