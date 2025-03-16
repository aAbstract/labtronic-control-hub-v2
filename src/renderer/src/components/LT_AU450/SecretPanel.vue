<script setup lang="ts">

import { ref, onMounted, inject } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { electron_renderer_send } from '@renderer/lib/util';
const device_model = inject('device_model');
const input_consts_names = ref<string[] | null>()
const dialog_visible = ref(false);

const dialog_pt = {
    header: { style: 'padding: 12px 16px;' },
    content: { style: 'padding: 0px 16px;' },
    footer: { style: 'padding: 8px 16px; direction: ltr; display: flex; justify-content: flex-start;' },
};





const input_consts_values = ref<Object>({})
const input_consts_config = [
    // this array contains the names of varables and titles MUST HAVE SAME ORDER AS input_consts_names
    {
        name: 'VAVG_VMAX',
        desc: 'Vaveragr / Vmax',
        unit: '',
    },
    {
        name: 'CP',
        desc: 'Air Velocity Coefficient',
        unit: '',
    },


    {
        name: 'R',
        desc: 'Intake Air Pipe Radius',
        unit: 'm',
    },

    {
        name: 'DO',
        desc: 'Water Density',
        unit: 'Kg/m^3',
    }, 
    {
        name: 'SG',
        desc: 'Fuel Specific Gravity',
        unit: '',
    },
    {
        name: 'Q_WATER',
        desc: 'Water Flow Rate',
        unit: 'l/min',
    },
    {
        name: 'C_WATER',
        desc: 'Water Specific Heat Capacity',
        unit: 'j/kg degC',
    },
    {
        name: 'D',
        desc: 'Delta T Water',
        unit: 'degC',
    },
    {
        name: 'SF',
        desc: 'Stroke Factor',
        unit: '',
    },
    {
        name: 'SV',
        desc: 'Swept Volume',
        unit: '',
    },
    {
        name: 'CV',
        desc: 'Water Calorific Value',
        unit: 'Mj/Kg',
    },
    {
        name: 'ME',
        desc: 'System Mechanical Efficiency',
        unit: '',
    }
]
onMounted(() => {
    window.electron?.ipcRenderer.on(`${device_model}_secret_panel`, (_,data) => {
        dialog_visible.value = true;
        input_consts_names.value = data.input_consts as string[]
        input_consts_values.value  = data.device_config 
    }
    )
});

function update_input_constant(name:string , value:number){
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET ${name} ${value}` });
}

</script>

<template>
    <Dialog style="font-family: Cairo, sans-serif;" v-model:visible="dialog_visible" header="Input Constants" :style="{ width: '44%' }" :pt="dialog_pt">
        <div class="input_constants_container">
            <div class="input_constant_element" v-for="conf in input_consts_config">
                <span>{{ conf.desc }}</span>
                <InputText style="width: 50px;" class="lt_au450_inp" type='number' v-model="input_consts_values[conf.name]" @change="update_input_constant(conf.name,input_consts_values[conf.name])" />
                <span> {{ conf.unit }}</span>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>

.lt_au450_inp {
    font-family: "Lucida Console", "Courier New", monospace;
    color: var(--font-color);
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 12px;
    font-weight: bold;
    padding: 4px;
    width: 60px;
    text-align: center;
}
.input_constant_element{
    display: grid;
    grid-template-columns: 240px 60px 80px;
    margin-block: 8px;
}
.input_constants_container{
    padding: 16px;
}
span{
    font-size: 14px;
    color: var(--font-color);
}

</style>