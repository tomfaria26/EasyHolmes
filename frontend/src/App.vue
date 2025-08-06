<template>
  <div id="app">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Título -->
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">EasyHolmes</h1>
          </div>

          <!-- Navegação -->
          <nav class="flex space-x-8">
            <router-link 
              to="/dashboard" 
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 bg-blue-50"
            >
              Dashboard
            </router-link>
            <router-link 
              to="/tasks" 
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 bg-blue-50"
            >
              Tarefas
            </router-link>
          </nav>

          <!-- Informações do usuário -->
          <div class="flex items-center space-x-4" v-if="user">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">{{ userInitials }}</span>
              </div>
              <span class="text-sm text-gray-700">{{ user.name }}</span>
            </div>
            <button 
              @click="logout" 
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Conteúdo principal -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-view />
      </div>
    </main>

    <!-- Loading overlay -->
    <div 
      v-if="loading" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="text-gray-700">Carregando...</span>
      </div>
    </div>

    <!-- Notificações globais -->
    <NotificationToast />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import NotificationToast from './components/NotificationToast.vue'

export default {
  name: 'App',
  components: {
    NotificationToast
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const loading = ref(false)

    const user = computed(() => authStore.user)
    
    const userInitials = computed(() => {
      if (!user.value || !user.value.name) return 'U'
      return user.value.name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    const logout = async () => {
      try {
        loading.value = true
        await authStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      console.log('App montado')
      await authStore.initAuth()
    })

    return {
      user,
      userInitials,
      loading,
      logout
    }
  }
}
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f8fafc;
}

/* Transições para fade e slide */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style> 