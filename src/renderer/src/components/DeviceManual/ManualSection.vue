<script setup lang="ts">

import Paragraph from './Paragraph.vue';
import BulletPoints from './BulletPoints.vue';
import ImagesList from './ImagesList.vue';
import YTVideo from './YTVideo.vue';
import BlockImage from './BlockImage.vue';
import RadioQuiz from './RadioQuiz.vue';
import TextImage from './TextImage.vue';
import ImageSequence from './ImageSequence.vue';
import AIQuiz from './AIQuiz.vue';

type ComponentType =
    'PARAGRAPH' |
    'BULLET_POINTS' |
    'IMAGES_LIST' |
    'BLOCK_IMAGE' |
    'TEXT_IMAGE' |
    'RADIO_QUIZ' |
    'VIDEO' |
    'EMBED_IMAGE_FORM' |
    'IMAGE_SEQUENCE' |
    'SIMULATIONS' |
    'AI_QUIZ';

interface ManualComponent {
    header: string;
    component_type: ComponentType;
    data: any;
};

interface ManualSection {
    header: string;
    description: string;
    components: ManualComponent[];
};

defineProps<{ sidx: number, section: ManualSection }>();

const MANUAL_COMPONENTS_MAP: Record<ComponentType, any> = {
    PARAGRAPH: Paragraph,
    BULLET_POINTS: BulletPoints,
    IMAGES_LIST: ImagesList,
    VIDEO: YTVideo,
    BLOCK_IMAGE: BlockImage,
    RADIO_QUIZ: RadioQuiz,
    TEXT_IMAGE: TextImage,
    IMAGE_SEQUENCE: ImageSequence,
    AI_QUIZ: AIQuiz,

    EMBED_IMAGE_FORM: null,
    SIMULATIONS: null,
};
</script>

<template>
    <div class="dm_section" :id="`dm_sec_${sidx}`">
        <h3>{{ `${sidx + 1} ${section.header}` }}</h3>
        <p class="dm_sec_desc">{{ section.description }}</p>
        <div v-for="(comp, cidx) in  section.components" class="dm_comp" :id="`dm_comp_${sidx}_${cidx}`">
            <h4>{{ `${sidx + 1}.${cidx + 1} ${comp.header}` }}</h4>
            <component :is="MANUAL_COMPONENTS_MAP[comp.component_type]" v-bind="comp.data" />
        </div>
    </div>
</template>

<style scoped>
.dm_section {
    width: 100%;
}

.dm_sec_desc {
    margin: 8px;
    font-size: 16px;
    font-weight: bold;
    color: var(--font-color);
}

.dm_section h3 {
    margin: 0px;
    width: 100%;
    color: var(--accent-color);
    border-bottom: 2px solid var(--accent-color);
}

.dm_comp h4 {
    margin: 0px;
    margin-left: 8px;
    color: var(--accent-color);
}
</style>