<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">
              EasyHolmes
            </h1>
            <span class="ml-2 text-sm text-gray-500">BPMN Manager</span>
          </div>
                     <nav class="flex items-center space-x-8">
             <router-link 
               to="/" 
               class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
               active-class="text-blue-600 bg-blue-50"
             >
               Dashboard
             </router-link>
             <router-link 
               to="/tasks" 
               class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
               active-class="text-blue-600 bg-blue-50"
             >
               Tarefas
             </router-link>
             
             <!-- Informações do usuário e logout -->
             <div v-if="authStore.isLoggedIn" class="flex items-center space-x-4">
               <div class="flex items-center space-x-2">
                 <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                   <span class="text-white text-sm font-medium">
                     {{ userInitials }}
                   </span>
                 </div>
                 <div class="text-sm">
                   <p class="text-gray-900 font-medium">{{ authStore.userInfo?.name || 'Usuário' }}</p>
                   <p class="text-gray-500">{{ authStore.userInfo?.email }}</p>
                 </div>
               </div>
               <button
                 @click="handleLogout"
                 :disabled="loading"
                 class="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                 title="Sair"
               >
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                 </svg>
               </button>
             </div>
           </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>

    <!-- Loading Overlay -->
    <div 
      v-if="loading" 
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">Carregando...</h3>
          <p class="text-sm text-gray-500 mt-2">Aguarde enquanto carregamos os dados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

export default {
  name: 'App',
                                 setup() {
                 const loading = ref(false)
                 const router = useRouter()
                 const authStore = useAuthStore()

                 // Computed para iniciais do usuário
                 const userInitials = computed(() => {
                   const user = authStore.userInfo
                   if (!user || !user.name) return 'U'
                   
                   const names = user.name.split(' ')
                   if (names.length >= 2) {
                     return (names[0][0] + names[1][0]).toUpperCase()
                   }
                   return names[0][0].toUpperCase()
                 })

                 // Função de logout
                 const handleLogout = async () => {
                   loading.value = true
                   try {
                     await authStore.logout()
                     router.push('/login')
                   } catch (error) {
                     console.error('Erro no logout:', error)
                   } finally {
                     loading.value = false
                   }
                 }

                     onMounted(async () => {
                   // Inicializar autenticação
                   await authStore.initAuth()
                   
                   // Verificar se usuário está autenticado
                   if (!authStore.isLoggedIn && router.currentRoute.value.path !== '/login') {
                     router.push('/login')
                   }
                 })

     return {
       loading,
       authStore,
       userInitials,
       handleLogout
     }
   }
}
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Estilos globais */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s;
}
.slide-enter, .slide-leave-to {
  transform: translateX(-100%);
}
</style> 