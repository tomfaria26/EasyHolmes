import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/css/main.css'

// Criar aplicação Vue
const app = createApp(App)

// Configurar Pinia para gerenciamento de estado
const pinia = createPinia()
app.use(pinia)

// Configurar router
app.use(router)

// Montar aplicação
app.mount('#app') 