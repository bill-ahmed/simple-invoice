import { createApp } from 'vue'
import Toast, { POSITION  } from "vue-toastification";

import App from './App.vue';
import Store from './store';

import './styles/app.css';
import "vue-toastification/dist/index.css";

// TODO: Remove this!
console.warn = () => {}

const app = createApp(App);

const toastOptions = {
  position: POSITION.BOTTOM_RIGHT,
  timeout: 3000,
  maxToasts: 3
}

app.use(Store);
app.use(Toast, toastOptions);
app.mount('#app')
