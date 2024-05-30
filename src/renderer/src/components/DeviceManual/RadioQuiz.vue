<script setup lang="ts">

import { computed, ref } from 'vue';
import Button from 'primevue/button';

interface RadioQuizQuestion {
    question: string;
    options: string[];
    answer_idx: number;
};

const props = defineProps<{ questions: RadioQuizQuestion[] }>();

const answers = ref(props.questions.map(_ => -1));
const score = ref(0);
const answer_color_flags = ref(props.questions.map(_ => -1));
const score_text = computed(() => `Quiz Score: ${score.value} / ${props.questions.length}`);

function sum_arr(arr: number[]) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++)
        sum += arr[i];
    return sum;
}

function item_radio_select(qidx: number, oidx: number) {
    answers.value[qidx] = oidx;
}

function check_answers_btn_click() {
    const bool_map = answers.value.map((ans, idx) => Number(props.questions[idx].answer_idx === ans));
    score.value = sum_arr(bool_map);
    answer_color_flags.value = bool_map.map(flag => flag ? 1 : 0);
}

</script>

<template>
    <div class="qzq_list_cont">
        <div v-for="(q, qidx) in questions" class="qzq_list_item">
            <span :class="{
            'correct_answer': answer_color_flags[qidx] === 1,
            'wrong_answer': answer_color_flags[qidx] === 0,
        }">{{ `${qidx + 1}- ${q.question}` }}</span>
            <div v-for="(opt, oidx) in q.options" class="qzq_opt_cont">
                <input type="radio" :name="`qzq_${qidx}`" :checked="answers[qidx] === oidx" @change="item_radio_select(qidx, oidx)">
                <label :for="`qzq_${qidx}_opt_${oidx}`">{{ opt }}</label>
            </div>
        </div>
        <div class="quiz_score_cont">
            <h4 class="score_text">{{ score_text }}</h4>
            <Button size="small" label="CHECK" icon="pi pi-check" @click="check_answers_btn_click()" />
        </div>
    </div>
</template>

<style scoped>
.wrong_answer {
    color: #DD2C00;
}

.correct_answer {
    color: #00c853;
}

.qzq_opt_cont input[type='radio'] {
    transform: scale(1.5);
}

.quiz_score_cont {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    margin: 8px 0px;
}

.quiz_score_cont .score_text {
    margin: 0px;
}

.qzq_opt_cont {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.qzq_opt_cont label {
    margin-left: 16px;
}

.qzq_list_item {
    border: 1px solid var(--empty-gauge-color);
    border-radius: 4px;
    margin: 8px 32px 8px 32px;
    padding: 8px;
    color: var(--font-color);
    font-weight: bold;
}
</style>