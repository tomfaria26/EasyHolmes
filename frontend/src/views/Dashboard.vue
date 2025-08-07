<template>
  <div class="space-y-6">
    <!-- Botão Atualizar -->
    <div class="flex justify-end">
      <button
        @click="refreshData"
        :disabled="loading"
        class="text-gray-500 hover:text-gray-700 flex items-center text-sm transition-colors"
      >
        <svg v-if="loading" class="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Atualizar
      </button>
    </div>

    <!-- Mensagem de erro -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
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

    <!-- Cards de Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card de Processos Ativos -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Processos Ativos</h3>
            <p class="text-2xl font-bold text-blue-600">{{ stats.activeProcesses }}</p>
          </div>
        </div>
      </div>

      <!-- Card de Tarefas em Andamento -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Em Andamento</h3>
            <p class="text-2xl font-bold text-orange-600">{{ stats.inProgressTasks }}</p>
          </div>
        </div>
      </div>

      <!-- Card de Tarefas Concluídas -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Tarefas Concluídas</h3>
            <p class="text-2xl font-bold text-green-600">{{ stats.completedTasks }}</p>
          </div>
        </div>
      </div>
    </div>



    <!-- Lista de Processos Recentes -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Processos Recentes</h3>
        <router-link
          to="/tasks"
          class="btn btn-primary"
        >
          Ver Todas as Tarefas
        </router-link>
      </div>
      
      <div v-if="loading" class="text-center py-8">
        <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-gray-500">Carregando processos...</p>
      </div>

      <div v-else-if="processes.length === 0" class="text-center py-8">
        <svg class="h-12 w-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <p class="mt-2 text-gray-500">Nenhum processo encontrado</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="process in processes"
          :key="process.id"
          class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="viewProcessDetail(process)"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-900">{{ getProcessDisplayName(process) }}</h4>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ translateStatus(process.status) }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mb-3">{{ process.description || 'Sem descrição' }}</p>
              
              <div class="flex items-center justify-between mt-3">
                <span class="text-xs text-gray-400">
                  Criado em {{ formatDate(process.created_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProcessesStore } from '../stores/processes'
import { useAuthStore } from '../stores/auth'
import { useNotifications } from '../composables/useNotifications'

export default {
  name: 'Dashboard',
  setup() {
    const router = useRouter()
    const processesStore = useProcessesStore()
    const authStore = useAuthStore()
    const { showSuccess, showError } = useNotifications()

    const loading = computed(() => processesStore.loading)
    const error = computed(() => processesStore.error)
    const stats = computed(() => processesStore.stats)
    const processes = computed(() => processesStore.processes)
    const isAdmin = computed(() => authStore.user?.role === 'admin')

    const refreshData = async () => {
      try {
        await processesStore.initializeData()
        showSuccess('Dados atualizados com sucesso!')
      } catch (error) {
        showError('Erro ao atualizar dados')
      }
    }

    const viewProcessDetail = (process) => {
      router.push(`/process/${process.id}`)
    }





    const formatDate = (dateString, includeTime = false) => {
      if (!dateString) return 'Data não disponível'
      try {
        // Converter para data local (UTC para horário de São Paulo)
        const dt = new Date(dateString)
        const saoPauloOffset = -3 * 60 // -3 horas em minutos
        const localTime = new Date(dt.getTime() + (saoPauloOffset * 60 * 1000))
        
        if (includeTime) {
          return localTime.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        } else {
          return localTime.toLocaleDateString('pt-BR')
        }
      } catch (error) {
        console.error('Erro ao formatar data:', error)
        return 'Data inválida'
      }
    }

    const getOverallProgress = () => {
      const total = stats.value.completedTasks + stats.value.inProgressTasks
      if (total === 0) return 0
      return Math.round((stats.value.completedTasks / total) * 100)
    }



    const getProcessDisplayName = (process) => {
      // Priorizar o identificador do processo se disponível (nome completo)
      if (process.identifier) {
        return process.identifier
      } else if (process.name) {
        return process.name
      } else if (process.description) {
        return process.description
      } else {
        return 'Processo sem nome'
      }
    }

    const translateStatus = (status) => {
      switch (status?.toLowerCase()) {
        case 'opened':
        case 'open':
        case 'active':
          return 'Aberto'
        case 'closed':
        case 'completed':
          return 'Fechado'
        case 'inactive':
          return 'Inativo'
        case 'in_progress':
          return 'Em Andamento'
        default:
          return status || 'Ativo'
      }
    }

    onMounted(async () => {
      await processesStore.initializeData()
      console.log(`[DASHBOARD] Processos carregados: ${processesStore.processes.length}`)
      console.log(`[DASHBOARD] Tarefas carregadas: ${processesStore.tasks.length}`)
    })

    return {
      loading,
      error,
      stats,
      processes,
      isAdmin,
      refreshData,
      viewProcessDetail,
      formatDate,
      getProcessDisplayName,
      translateStatus
    }
  }
}
</script> 