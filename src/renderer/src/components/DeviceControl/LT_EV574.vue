<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useToast } from 'primevue/usetoast';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { electron_renderer_send } from '@renderer/lib/util';


const device_model = inject('device_model');
const toast_service = useToast();

const checkbox_pt: any = {
  root: { style: 'background-color: transparent; width:fit-content;height:fit-content;' },
  box: { style: 'height: 40px; width:40px; border-color: var(--accent-color);' },
  icon: { style: 'display: none;' }
};
const labels = ['Button 1', 'Button 2', 'Button 3', 'Button 4', 'Button 5', 'Button 6'];
const states = ref([false, false, false, false, false, false]);


function reset() {
  states.value = [false, false, false, false, false, false];
  send_data()
}
function send_data() {
  const packet_value = compute_packet()
  electron_renderer_send(`${device_model}_exec_device_cmd`, { cmd: `SET CONTROL_BUTTONS ${packet_value}` });
  toast_service.add({ severity: 'info', summary: 'Data Sent', detail: 'Buttons State Sent', life: 3000 });
}

function compute_packet() {
  let value = 0
  for (let i = 0; i < states.value.length; i++) {
    value = states.value[i] ? value + Math.pow(2, i) : value
  }
  return '0x' + value.toString(16);
}

onMounted(() => {
  window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
    console.log(data);
  });
});

</script>

<template>
  <div id="lt_ev574_control_main_cont">
    <div id="lt_ev574_state_container">
      <div id="lt_ev574_state" v-for="(_, i) in states">
        <Checkbox :pt="checkbox_pt" v-model="states[i]" :binary="true" />
        <p>{{ labels[i] }}</p>
      </div>
    </div>
    <div id="lt_ev574_actions_container">
      <Button label="Reset" @click="reset" />
      <Button label="Send Data" @click="send_data" />
    </div>
  </div>
</template>

<style scoped>
#lt_ev574_actions_container>button {
  color: var(--accent-color);
  width: 8rem;
  background-color: transparent;
  padding: 0.5rem;
}

#lt_ev574_state {
  width: fit-content;
  height: fit-content;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-direction: column;
}

#lt_ev574_state>p {
  font-size: 20px;
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
  margin-bottom: 1rem;
  gap: 0.5rem;
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
  padding: 8px;
  padding-block: 24px;
}
</style>
