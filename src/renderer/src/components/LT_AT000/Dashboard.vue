<script lang="ts" setup>
import Wind from '../LT_AT000/Wind.vue'
import Pedal from './Pedal.vue';
import Fuel from './Fuel.vue';
import Engine from './Engine.vue';
import { subscribe } from '@common/mediator';
import {  ref } from 'vue';


const mode = ref(1)

subscribe('change_lt_at000_screen_mode', 'change_lt_at000_screen_mode_dashboard', (screen) => { mode.value = screen._screen_mode })


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
    grid-template-columns: 30fr 50fr 30fr;
    padding-block: 8px;
    padding-inline: 16px;
    justify-content: center;
}

.dashboard_container2 {
    width: 100%;
    display: grid;
    grid-template-columns: 30fr 50fr 30fr;
    padding: 24px;
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
    padding: 8px;
    border-radius: 4px;
}
</style>
