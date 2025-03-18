<script lang="ts" setup>
import Wind from '../LT_AU450/Wind.vue'
import Pedal from './Pedal.vue';
import Fuel from './Fuel.vue';
import Engine from './Engine.vue';
import { subscribe } from '@common/mediator';
import { ref,inject, onMounted } from 'vue';
import { electron_renderer_send } from '@renderer/lib/util';


const mode = ref(1)
const device_model = inject('device_model');

const CV = ref(0)
const SG = ref(0)

subscribe('change_lt_au450_screen_mode', 'change_lt_au450_screen_mode_dashboard', (screen) => { mode.value = screen._screen_mode })
function send_CV(value: number) {
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET CV ${value}` });
}
function send_SG(value: number) {
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET SG ${value}` });
}

onMounted(()=>{
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: 'GET CV' });
    window.electron?.ipcRenderer.on(`${device_model}_CV`, (_, data) => {
        CV.value = data.CV
    }
    )
    electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: 'GET SG' });
    window.electron?.ipcRenderer.on(`${device_model}_SG`, (_, data) => {
        SG.value = data.SG
    }
    )
})
</script>


<template>
    <div class="dashboard_container">
        <div class="dashboard_container1" v-if="mode == 1">
            <div class="pedal">
                <Pedal :mode="mode" />
            </div>
            <div class="engine">
                <Engine :mode="mode" />
            </div>
            <div class="fuel_wind">
                <Wind :mode="mode" />
                <Fuel :mode="mode" />
            </div>

        </div>
        <div class="lt_au450_CV_SG" v-if="mode == 1">
            <div class="lt_au450_CV">
                <span>Calorific Value</span>
                <input style="width: 50px;" class="lt_au450_inp" type="number" v-model="CV" @change="send_CV(CV)" />
            </div>
            <div class="lt_au450_CV">
                <span>Specific Gravity</span>
                <input style="width: 50px;" class="lt_au450_inp" type="number" v-model="SG" @change="send_SG(SG)" />
            </div>
        </div>

        <div class="dashboard_container2" v-if="mode == 2">
            <div class="pedal_wind">
                <Wind class="wind" :mode="mode" />
                <Pedal :mode="mode" />
            </div>
            <div class="engine">
                <Engine :mode="mode" />
            </div>
            <div class="fuel">
                <Fuel :mode="mode" />
            </div>
        </div>
    </div>
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
.lt_au450_CV {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 160px;
    margin-bottom: 16px;
}

.lt_au450_CV>span {
    color: var(--font-color);
}

.lt_au450_CV_SG {
    display: flex;
    flex-direction: row;
    justify-content: space-around;

}

.dashboard_container {
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    aspect-ratio: 2/1;
}

.dashboard_container1 {
    width: 100%;
    display: grid;
    grid-template-columns: 20fr 40fr 25fr;
    padding: 8px;
    padding-top: 8px;
}

.dashboard_container2 {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 25fr 30fr 30fr;
    padding-inline: 24px;
    justify-content: center;
}

.pedal_wind {
    width: 100%;
    height: 90%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-self: center;
    gap: 10%;
}

.engine {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

}

.fuel {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}




#OBD_device_connector_cont {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 8px 0px;
    padding-inline: 8px;
    border-radius: 4px;
}
</style>
