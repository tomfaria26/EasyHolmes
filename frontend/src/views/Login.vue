<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          EasyHolmes
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Faça login para acessar o sistema
        </p>
      </div>
      
      <!-- Mensagem de erro -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="input rounded-t-md"
              placeholder="Email"
              :disabled="loading"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Senha</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="input rounded-b-md"
              placeholder="Senha"
              :disabled="loading"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-full"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Entrando...
            </span>
            <span v-else>Entrar</span>
          </button>
        </div>

        <!-- Credenciais de demonstração -->
        <div class="text-center">
          <p class="text-xs text-gray-500">
            <strong>Credenciais de demonstração:</strong><br>
            Email: admin@easyholmes.com<br>
            Senha: password
          </p>
        </div>
      </form>
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