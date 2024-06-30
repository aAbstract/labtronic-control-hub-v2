<script setup lang="ts">

import { computed, ref } from 'vue';
import { useToast } from 'primevue/usetoast';

import { CHXEquation, Result } from '@common/models';
import { add_log, clone_object } from '@renderer/lib/util';

const props = defineProps<{ chx_eq: CHXEquation }>();
const func_name = computed(() => `${props.chx_eq.func_name} (`);
const args_hint = computed(() => props.chx_eq.args_list.join(', '));
const end_symbol = ') = ';
const eq_params = ref<string>();
const eq_result = ref();
const toast_service = useToast();

function compute_chx_equation() {
    if (!window.electron) {
        add_log({ level: 'ERROR', msg: 'Operation Denied Browser Sandbox' });
        return;
    }

    const _params = eq_params.value;
    if (!_params) {
        toast_service.add({ severity: 'error', summary: 'ERROR', detail: 'Attempt to Compute Device Equation with no Parameters', life: 0 });
        return;
    }

    const _params_list_str = _params.replaceAll(' ', '').split(',');
    if (_params_list_str.length !== props.chx_eq.args_list.length) {
        toast_service.add({ severity: 'error', summary: 'ERROR', detail: 'Parameters do not Match Args List', life: 0 });
        return;
    }

    const _params_list = _params_list_str.map(x => Number(x));
    if (_params_list.some(x => isNaN(x))) {
        toast_service.add({ severity: 'error', summary: 'ERROR', detail: 'Invalid Device Equation Parameters', life: 0 });
        return;
    }

    window.electron.ipcRenderer.invoke('compute_chx_equation', clone_object(props.chx_eq), _params_list).then((res: Result<number>) => {
        if (res.err)
            toast_service.add({ severity: 'error', summary: 'ERROR', detail: res.err, life: 0 });
        else
            eq_result.value = res.ok;
    });
}

</script>

<template>
    <div class="deq_cont">
        <span>{{ func_name }}</span>
        <input class="deq_tf" style="flex-grow: 1; margin: 0px 4px;" title="Function Arguments" @keyup.enter="compute_chx_equation()" :placeholder="args_hint" v-model="eq_params" type="text">
        <span>{{ end_symbol }}</span>
        <input class="deq_tf" style="margin: 0px 4px;" title="Function Arguments" type="text" v-model="eq_result" readonly>
        <span style="width: 24px;">{{ chx_eq.result_unit }}</span>
    </div>
</template>

<style scoped>
.deq_cont {
    width: calc(100% - 16px);
    margin: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.deq_tf {
    font-family: "Lucida Console", "Courier New", monospace;
    width: 100px;
    color: var(--font-color);
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 12px;
    font-weight: bold;
    padding: 4px;
}

.deq_tf:focus {
    outline: none;
    border: 1px solid var(--accent-color);
}
</style>