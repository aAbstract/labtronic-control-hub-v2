import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';
import App from './App.vue';

import 'primeicons/primeicons.css';
import 'primevue/resources/primevue.min.css';
import 'primevue/resources/themes/lara-dark-blue/theme.css';

createApp(App)
    .use(PrimeVue, { ripple: true })
    .use(ToastService)
    .mount('#app');