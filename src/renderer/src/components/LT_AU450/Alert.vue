<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Message from 'primevue/message';


defineProps(['show_dialog','header','MSG'])

const dialog_pt = {
    header: { style: 'padding: 12px 16px;' },
    content: { style: 'padding: 0px 16px;' },
    closeButton: { style: 'display:none;' }
};


</script>

<template>
    <Dialog :visible="show_dialog" modal :header="header" :style="{ width: '40%' }" :pt="dialog_pt">
        <Message severity="warn" :closable="false">{{ MSG }}</Message>
    </Dialog>
</template>

<style scoped>
.footer_btn {
    padding: 8px;
    width: 150px;
}
</style>