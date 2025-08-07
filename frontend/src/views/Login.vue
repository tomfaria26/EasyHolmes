<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Container principal -->
    <div class="max-w-md w-full mx-4">
      <!-- Card de login -->
      <div class="bg-white dark:bg-gray-800 rounded-t-2xl rounded-b-xl shadow-lg dark:shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <!-- Header do card -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-white mb-1">EasyHolmes</h1>
            <p class="text-blue-100 text-sm">Gerenciador BPMN</p>
          </div>
        </div>

        <!-- Formulário -->
        <div class="px-6 py-6">
          <!-- Mensagem de erro -->
          <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <!-- Campo Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="email"
                  name="email"
                  type="email"
                  required
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Digite seu email"
                  :disabled="loading"
                />
              </div>
            </div>

            <!-- Campo Senha -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="password"
                  name="password"
                  type="password"
                  required
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Digite sua senha"
                  :disabled="loading"
                />
              </div>
            </div>

            <!-- Botão de Login -->
            <div class="pt-1">
              <button
                type="submit"
                :disabled="loading"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span v-if="loading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
                <span v-else class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  Entrar
                </span>
              </button>
            </div>
          </form>

          <!-- Credenciais de demonstração -->
          <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">Credenciais de demonstração</h3>
                <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Email:</strong> admin@easyholmes.com</p>
                  <p><strong>Senha:</strong> admin123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          © 2025 EasyHolmes. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotifications } from '../composables/useNotifications'

export default {
  name: 'Login',
  setup() {
    const email = ref('')
    const password = ref('')
    const router = useRouter()
    const authStore = useAuthStore()
    const { showSuccess, showError } = useNotifications()

    const loading = computed(() => authStore.loading)
    const error = computed(() => authStore.error)

    const handleLogin = async () => {
      if (!email.value || !password.value) {
        showError('Por favor, preencha email e senha')
        return
      }

      const result = await authStore.login(email.value, password.value)
      
      if (result.success) {
        showSuccess('Login realizado com sucesso!')
        router.push('/dashboard')
      } else {
        showError(result.error || 'Erro no login')
      }
    }

    return {
      email,
      password,
      loading,
      error,
      handleLogin
    }
  }
}
</script> 