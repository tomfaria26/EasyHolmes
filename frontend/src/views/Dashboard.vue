<template>
  <div class="space-y-6">
    <!-- Header do Dashboard -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p class="text-gray-600">
            Bem-vindo ao EasyHolmes! Aqui você pode gerenciar seus processos BPMN.
          </p>
        </div>
        <button
          @click="refreshData"
          :disabled="loading"
          class="btn btn-secondary flex items-center"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Atualizar
        </button>
      </div>
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
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      <!-- Card de Tarefas Pendentes -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Tarefas Pendentes</h3>
            <p class="text-2xl font-bold text-yellow-600">{{ stats.pendingTasks }}</p>
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
          v-for="process in processes.slice(0, 5)"
          :key="process.id"
          class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="selectProcess(process)"
        >
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-medium text-gray-900">{{ process.name || 'Processo sem nome' }}</h4>
              <p class="text-sm text-gray-500 mt-1">{{ process.description || 'Sem descrição' }}</p>
              <div class="flex items-center mt-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ process.status || 'ativo' }}
                </span>
                <span class="ml-2 text-xs text-gray-500">
                  Criado em {{ formatDate(process.created_at) }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">{{ getProcessTasksCount(process.id) }} tarefas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useProcessesStore } from '../stores/processes'

export default {
  name: 'Dashboard',
  setup() {
    const processesStore = useProcessesStore()

    const loading = computed(() => processesStore.loading)
    const error = computed(() => processesStore.error)
    const stats = computed(() => processesStore.stats)
    const processes = computed(() => processesStore.processes)

    const refreshData = async () => {
      await processesStore.initializeData()
    }

    const selectProcess = (process) => {
      processesStore.selectProcess(process)
      // Aqui você pode navegar para uma página de detalhes do processo
      console.log('Processo selecionado:', process)
    }

    const getProcessTasksCount = (processId) => {
      return processesStore.tasksByProcess(processId).length
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

    onMounted(async () => {
      await processesStore.initializeData()
    })

    return {
      loading,
      error,
      stats,
      processes,
      refreshData,
      selectProcess,
      getProcessTasksCount,
      formatDate
    }
  }
}
</script> 