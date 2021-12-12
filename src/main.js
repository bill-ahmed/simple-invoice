import { createApp } from 'vue'
import Toast, { POSITION  } from "vue-toastification";

// Cloud auth providers
import * as msal from "@azure/msal-browser";

import App from './App.vue'

import './styles/app.css';
import "vue-toastification/dist/index.css";
import { AUTHENTICATION } from './constants';

// TODO: Remove this!
console.warn = () => {}

const msalConfig = {
  auth: {
    clientId: AUTHENTICATION.azure.client_id,
    authority: 'https://login.microsoftonline.com/consumers/',
    redirectUri: 'http://localhost:8080'
  }
}

const app = createApp(App);
app.config.globalProperties.$msal = new msal.PublicClientApplication(msalConfig)

const toastOptions = {
  position: POSITION.BOTTOM_RIGHT,
  timeout: 3000,
  maxToasts: 3
}

app.use(Toast, toastOptions);
app.mount('#app')
