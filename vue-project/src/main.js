import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css';

import App from './App.vue'
import router from './router'

import './assets/main.scss'

const app = createApp(App);

app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.mount('#app')

