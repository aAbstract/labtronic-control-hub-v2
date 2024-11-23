<script setup lang="ts">

import { ref, inject, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

import { subscribe } from '@common/mediator';
import { electron_renderer_send } from '@renderer/lib/util';


const device_model = inject('device_model');
const toast_service = useToast();
const checkbox_pt: any = {
  root: { style: 'background-color: transparent; width:fit-content;height:fit-content;' },
  box: { style: 'height: 30px; width:30px; border-color: var(--accent-color); border-radius: 4px;' },
  icon: { style: 'display: none;' },
};
const labels = ['Battery Depleted', 'Motor Controller Input Defective', 'AC Power Failure', 'Motor Encoder VCC Disconnected', 'Motor Controller Output Defective', 'Motor Controller Seneor Defective'];
const states = ref([false, false, false, false, false, false]);
const cs_enrg = ref(0);
const rv_enrg = ref(0);


function reset() {
  states.value = [false, false, false, false, false, false];
  send_data();
}
function send_data() {
  const packet_value = compute_packet();
  electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET CONTROL_BUTTONS ${packet_value}` });
  toast_service.add({ severity: 'info', summary: 'Data Sent', detail: 'Buttons State Sent', life: 3000 });
}

function compute_packet() {
  let value = 0;
  for (let i = 0; i < states.value.length; i++) {
    value = states.value[i] ? value + Math.pow(2, i) : value;
  }
  return '0x' + value.toString(16);
}

onMounted(() => {
  subscribe('record_data_point', 'record_data_point_lt_ev574_control_panel', args => {
    const _data_point: Record<string, number> = args._data_point;
    const bat_v = _data_point[0];
    const bat_i = _data_point[1];
    const bat_pw = bat_v * bat_i;
    const enrg = bat_pw * 0.00028;
    if (bat_i >= 0)
      cs_enrg.value += enrg;
    else if (bat_i < 0)
      rv_enrg.value += enrg;
  });
});

</script>

<template>
  <div id="lt_ev574_control_main_cont">
    <div id="energy_stats">
      <div>
        <span style="font-weight: bold; margin-right: 8px;">Consumed Energy [Wh]:</span>
        <span style="font-weight: bold; color: #FFAB00;">{{ cs_enrg.toFixed(2) }}</span>
      </div>
      <div>
        <span style="font-weight: bold; margin-right: 8px;">Recovered Energy [Wh]:</span>
        <span style="font-weight: bold; color: #64DD17;">{{ rv_enrg.toFixed(2) }}</span>
      </div>
    </div>
    <div id="lt_ev574_state_container">
      <div id="lt_ev574_state" v-for="(_, i) in states">
        <Checkbox :pt="checkbox_pt" v-model="states[i]" binary />
        <p>{{ labels[i] }}</p>
      </div>
    </div>
    <div id="lt_ev574_actions_container">
      <Button outlined icon="pi pi-power-off" label="Reset" @click="reset" />
      <Button outlined icon="pi pi-microchip" label="Send Data" @click="send_data" />
    </div>
  </div>
</template>

<style scoped>
#energy_stats {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  color: var(--font-color);
  margin: 8px 0px;
}

#lt_ev574_actions_container>button {
  height: 30px;
  font-size: 14px;
}

#lt_ev574_state {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: fit-content;
  width: 100%;
}

#lt_ev574_state>p {
  font-size: 16px;
  text-align: center;
  color: var(--accent-color);
  margin: 0rem;
}

#lt_ev574_actions_container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}

#lt_ev574_state_container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;
  gap: 16px;
  margin-bottom: 16px;
}

#lt_ev574_control_main_cont {
  width: 96%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: var(--light-bg-color);
  border: 1px solid var(--empty-gauge-color);
  border-radius: 4px;
  padding-bottom: 16px;
}
</style>
