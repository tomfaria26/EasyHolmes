<template>
  <div id="app">
    <!-- Header - apenas quando não estiver na página de login -->
    <header v-if="!isLoginPage" class="bg-white shadow-sm border-b border-gray-200">
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
            <router-link 
              v-if="user?.role === 'admin'"
              to="/users" 
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 bg-blue-50"
            >
              Usuários
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
            
            <!-- Dropdown do perfil -->
            <div class="relative">
              <button 
                @click="toggleProfileDropdown"
                class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
                Perfil
              </button>
              
              <!-- Dropdown menu -->
              <div 
                v-if="showProfileDropdown"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
              >
                <button
                  @click="openProfileModal"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Editar Perfil
                  </div>
                </button>
                <button
                  @click="logout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Sair
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Conteúdo principal -->
    <main :class="isLoginPage ? 'flex-1' : 'flex-1'">
      <div v-if="!isLoginPage" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-view />
      </div>
      <router-view v-else />
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

    <!-- Modal de Edição de Perfil -->
    <div v-if="showProfileModal" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop padronizado -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <!-- Modal Container -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Editar Perfil
            </h3>
            <button
              @click="closeProfileModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Content com scroll -->
          <div class="flex-1 overflow-y-auto p-5">
            <!-- Feedback Message -->
            <div v-if="profileFeedbackMessage" class="mb-4 p-3 rounded-md" :class="profileFeedbackType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'">
              <div class="flex items-center">
                <svg v-if="profileFeedbackType === 'success'" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ profileFeedbackMessage }}
              </div>
            </div>

            <form @submit.prevent="saveProfile">
              <!-- Nome -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="profileForm.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  :class="{
                    'border-red-300 focus:border-red-500 focus:ring-red-500': profileNameError
                  }"
                  placeholder="Digite seu nome completo"
                  @blur="validateProfileName"
                  @input="validateProfileName"
                />
                <div v-if="profileNameError" class="mt-1 text-xs text-red-600">
                  {{ profileNameError }}
                </div>
              </div>

              <!-- Email (somente leitura) -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  readonly
                  class="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-50 text-gray-600 sm:text-sm cursor-not-allowed"
                  placeholder="Seu e-mail"
                />
                <div class="mt-1 text-xs text-gray-500">
                  O e-mail não pode ser alterado
                </div>
              </div>

              <!-- Nova Senha -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                  <span class="text-gray-500 font-normal">(opcional)</span>
                </label>
                <input
                  v-model="profileForm.password"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  :class="{
                    'border-red-300 focus:border-red-500 focus:ring-red-500': profilePasswordError
                  }"
                  placeholder="Deixe em branco para não alterar"
                  @blur="validateProfilePassword"
                  @input="validateProfilePassword"
                />
                <div v-if="profilePasswordError" class="mt-1 text-xs text-red-600">
                  {{ profilePasswordError }}
                </div>
                <div v-if="!profilePasswordError && profileForm.password" class="mt-1 flex items-center text-xs text-green-600">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Senha válida
                </div>
              </div>

              <!-- Senha Atual (apenas quando nova senha for fornecida) -->
              <div v-if="profileForm.password" class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Senha Atual
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="profileForm.currentPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  :class="{
                    'border-red-300 focus:border-red-500 focus:ring-red-500': profileCurrentPasswordError
                  }"
                  placeholder="Digite sua senha atual"
                  @blur="validateProfileCurrentPassword"
                  @input="validateProfileCurrentPassword"
                />
                <div v-if="profileCurrentPasswordError" class="mt-1 text-xs text-red-600">
                  {{ profileCurrentPasswordError }}
                </div>
              </div>
            </form>
          </div>

          <!-- Footer com botões fixos -->
          <div class="flex items-center justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
            <button
              @click="closeProfileModal"
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              @click="saveProfile"
              type="button"
              :disabled="profileNameError || profilePasswordError || profileCurrentPasswordError || isProfileSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span v-if="isProfileSubmitting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
              <span v-else>
                Salvar Alterações
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useUsersStore } from './stores/users'
import NotificationToast from './components/NotificationToast.vue'

export default {
  name: 'App',
  components: {
    NotificationToast
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const usersStore = useUsersStore()
    const loading = ref(false)
    
    // Profile dropdown
    const showProfileDropdown = ref(false)
    const showProfileModal = ref(false)
    const isProfileSubmitting = ref(false)
    const profileFeedbackMessage = ref('')
    const profileFeedbackType = ref('')
    const profileNameError = ref('')
    const profilePasswordError = ref('')
    const profileCurrentPasswordError = ref('')
    
    const profileForm = ref({
      name: '',
      email: '',
      password: '',
      currentPassword: ''
    })

    const user = computed(() => authStore.user)
    
    const isLoginPage = computed(() => route.path === '/login')
    
    const userInitials = computed(() => {
      if (!user.value || !user.value.name) return 'U'
      return user.value.name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    // Profile dropdown functions
    const toggleProfileDropdown = () => {
      showProfileDropdown.value = !showProfileDropdown.value
    }

    const openProfileModal = async () => {
      showProfileDropdown.value = false
      profileNameError.value = ''
      profilePasswordError.value = ''
      profileCurrentPasswordError.value = ''
      profileFeedbackMessage.value = ''
      showProfileModal.value = true
    }

    const closeProfileModal = () => {
      showProfileModal.value = false
      profileForm.value.name = ''
      profileForm.value.email = ''
      profileForm.value.password = ''
      profileForm.value.currentPassword = ''
      profileNameError.value = ''
      profilePasswordError.value = ''
      profileCurrentPasswordError.value = ''
      profileFeedbackMessage.value = ''
    }

    // Profile validation
    const validateProfileName = () => {
      if (!profileForm.value.name.trim()) {
        profileNameError.value = 'Nome é obrigatório'
        return false
      }
      if (profileForm.value.name.trim().length < 2) {
        profileNameError.value = 'Nome deve ter pelo menos 2 caracteres'
        return false
      }
      profileNameError.value = ''
      return true
    }

    const validateProfilePassword = () => {
      if (profileForm.value.password && profileForm.value.password.length < 6) {
        profilePasswordError.value = 'Senha deve ter pelo menos 6 caracteres'
        return false
      }
      profilePasswordError.value = ''
      return true
    }

    const validateProfileCurrentPassword = () => {
      if (profileForm.value.currentPassword && profileForm.value.currentPassword.length < 6) {
        profileCurrentPasswordError.value = 'Senha atual deve ter pelo menos 6 caracteres'
        return false
      }
      profileCurrentPasswordError.value = ''
      return true
    }

    // Save profile
    const saveProfile = async () => {
      if (!validateProfileName()) return
      if (!validateProfilePassword()) return
      if (profileForm.value.password && !validateProfileCurrentPassword()) return

      try {
        isProfileSubmitting.value = true
        profileFeedbackMessage.value = ''
        
        // Se uma nova senha foi fornecida, usar a rota específica de alteração de senha
        if (profileForm.value.password) {
          const passwordResult = await usersStore.changePassword(user.value.id, {
            currentPassword: profileForm.value.currentPassword,
            newPassword: profileForm.value.password
          })
          
          if (!passwordResult.success) {
            throw new Error(passwordResult.error || 'Erro ao alterar senha')
          }
        }
        
        // Atualizar nome do usuário (se alterado)
        if (profileForm.value.name.trim() !== user.value.name) {
          const updateResult = await usersStore.updateUser(user.value.id, {
            name: profileForm.value.name.trim()
          })
          
          if (!updateResult.success) {
            throw new Error(updateResult.error || 'Erro ao atualizar nome')
          }
          
          // Atualizar dados do usuário no auth store
          await authStore.updateUserData({
            ...user.value,
            name: profileForm.value.name.trim()
          })
        }
        
        profileFeedbackType.value = 'success'
        profileFeedbackMessage.value = 'Perfil atualizado com sucesso!'
        
        // Fechar modal após 2 segundos
        setTimeout(() => {
          closeProfileModal()
        }, 2000)
        
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error)
        profileFeedbackType.value = 'error'
        profileFeedbackMessage.value = error.message || 'Erro ao atualizar perfil'
      } finally {
        isProfileSubmitting.value = false
      }
    }

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

    // Fechar dropdown quando clicar fora
    const handleClickOutside = (event) => {
      if (showProfileDropdown.value && !event.target.closest('.relative')) {
        showProfileDropdown.value = false
      }
    }

    onMounted(async () => {
      await authStore.initAuth()
      
      // Adicionar listener para fechar dropdown
      document.addEventListener('click', handleClickOutside)
    })

    // Watch para carregar dados quando o modal for aberto
    watch(showProfileModal, async (newValue) => {
      if (newValue && user.value) {
        try {
          // Buscar dados completos do usuário atual
          const userResponse = await usersStore.fetchUserById(user.value.userId)
          
          if (userResponse.success && userResponse.data) {
            const fullUserData = userResponse.data
            
            profileForm.value.name = fullUserData.name || ''
            profileForm.value.email = fullUserData.email || user.value.email || ''
            profileForm.value.password = ''
            profileForm.value.currentPassword = ''
          } else {
            // Fallback para dados básicos
            profileForm.value.name = user.value.name || ''
            profileForm.value.email = user.value.email || ''
            profileForm.value.password = ''
            profileForm.value.currentPassword = ''
          }
        } catch (error) {
          console.error('Erro ao buscar dados completos do usuário:', error)
          // Fallback para dados básicos
          profileForm.value.name = user.value.name || ''
          profileForm.value.email = user.value.email || ''
          profileForm.value.password = ''
          profileForm.value.currentPassword = ''
        }
      }
    })

    return {
      user,
      userInitials,
      loading,
      isLoginPage,
      logout,
      // Profile dropdown
      showProfileDropdown,
      showProfileModal,
      isProfileSubmitting,
      profileFeedbackMessage,
      profileFeedbackType,
      profileNameError,
      profilePasswordError,
      profileCurrentPasswordError,
      profileForm,
      toggleProfileDropdown,
      openProfileModal,
      closeProfileModal,
      validateProfileName,
      validateProfilePassword,
      validateProfileCurrentPassword,
      saveProfile
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