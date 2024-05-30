<script setup lang="ts">

import { ref } from 'vue';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

defineProps<{ question: string }>();

const ta_val = ref();

</script>

<template>
    <div class="aiq_cont">
        <span>{{ question }}</span>
        <Textarea class="aiq_text_area" v-model="ta_val" rows="5" cols="30" style="width: 100%;" />
        <div class="check_controls">
            <span>Score: UNCHECKED</span>
            <Button size="small" label="CHECK" icon="pi pi-align-center" />
        </div>
    </div>
</template>

<style scoped>
.aiq_text_area {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    font-family: "Cairo", sans-serif;
    color: var(--font-color);
}

.aiq_cont .check_controls {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.aiq_cont {
    margin: 8px 32px 8px 32px;
}

.aiq_cont span {
    color: var(--font-color);
    font-weight: bold;
}
</style>