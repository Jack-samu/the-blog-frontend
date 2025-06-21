import { createApp } from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import 'element-plus/dist/index.css'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'


const app = createApp(App)
const pinia = createPinia()
// localStorage持久化插件
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')