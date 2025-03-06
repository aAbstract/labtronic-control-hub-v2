
<script lang="ts" setup>
import { ref } from 'vue';
const left_pedal_val = ref(80)


</script>

<template>
    <div class="container">
        <div class="pedal_container">

            <div class="progress-container" >
                <div class="progress-fill" :style="{ height: left_pedal_val + '%' }"></div>
            </div>
        
        </div>
     
    </div>
</template>




<style scoped>
.container {
    width: 100%;
    height: 100%;
    display: flex;
}

.pedal_container {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
    align-items: center;
    justify-content: center;
}

.pedal_val {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;

}

.progress-container {
    width: 40px;
    height: 100%;
    border: 2px solid var(--accent-color);
    background-color: transparent;
    position: relative;
    overflow: hidden;
}

.progress-fill {
    width: 100%;
    position: absolute;
    bottom: 0;
    background: linear-gradient(to bottom, var(--danger-color), var(--font-color));
    transition: height 0.3s ease-in-out;
}

h3 {
    font-size: 32px;
    margin: 0;
    color: var(--accent-color);
}

img {
    width: 10%;
}

.mode1_text {
    font-size: 20px;
}

.mode1_progress {
    height: 50%;
}
</style>
