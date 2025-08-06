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

    <!-- Seção de Ações Rápidas -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <router-link
          to="/tasks"
          class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">Gerenciar Tarefas</h4>
            <p class="text-sm text-gray-600">Visualizar e gerenciar todas as tarefas</p>
          </div>
        </router-link>

        <button
          @click="createNewProcess"
          class="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
        >
          <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">Novo Processo</h4>
            <p class="text-sm text-gray-600">Criar um novo processo BPMN</p>
          </div>
        </button>

        <router-link
          v-if="isAdmin"
          to="/users"
          class="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">Usuários</h4>
            <p class="text-sm text-gray-600">Gerenciar usuários do sistema</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Gráfico de Progresso -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Progresso Geral</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Tarefas Concluídas</span>
          <span class="text-sm font-medium text-gray-900">{{ stats.completedTasks }} / {{ stats.completedTasks + stats.pendingTasks + stats.inProgressTasks }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div 
            class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
            :style="{ width: `${getOverallProgress()}%` }"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>

    <!-- Lista de Processos Recentes -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Processos Recentes</h3>
        <div class="flex space-x-3">
          <router-link
            to="/tasks"
            class="btn btn-primary"
          >
            Ver Todas as Tarefas
          </router-link>
          <router-link
            v-if="isAdmin"
            to="/users"
            class="btn btn-secondary"
          >
            Gerenciar Usuários
          </router-link>
        </div>
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
          @click="viewProcessDetail(process)"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-900">{{ process.name || 'Processo sem nome' }}</h4>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ process.status || 'ativo' }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mb-3">{{ process.description || 'Sem descrição' }}</p>
              
              <!-- Progresso do Processo -->
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>Progresso</span>
                  <span>{{ getProcessProgress(process.id) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${getProcessProgress(process.id)}%` }"
                  ></div>
                </div>
              </div>
              
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{{ getProcessTasksCount(process.id) }} tarefas</span>
                  <span>{{ getCompletedTasksCount(process.id) }} concluídas</span>
                </div>
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

    const getProcessTasksCount = (processId) => {
      return processesStore.tasksByProcess(processId).length
    }

    const getCompletedTasksCount = (processId) => {
      const tasks = processesStore.tasksByProcess(processId)
      return tasks.filter(task => task.status === 'completed').length
    }

    const getProcessProgress = (processId) => {
      const tasks = processesStore.tasksByProcess(processId)
      if (tasks.length === 0) return 0
      const completed = tasks.filter(task => task.status === 'completed').length
      return Math.round((completed / tasks.length) * 100)
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
      const total = stats.value.completedTasks + stats.value.pendingTasks + stats.value.inProgressTasks
      if (total === 0) return 0
      return Math.round((stats.value.completedTasks / total) * 100)
    }

    const createNewProcess = () => {
      // Por enquanto, navegar para a página de tarefas
      router.push('/tasks')
      showSuccess('Funcionalidade de criação de processo será implementada em breve!')
    }

    onMounted(async () => {
      await processesStore.initializeData()
    })

    return {
      loading,
      error,
      stats,
      processes,
      isAdmin,
      refreshData,
      viewProcessDetail,
      getProcessTasksCount,
      getCompletedTasksCount,
      getProcessProgress,
      formatDate,
      getOverallProgress,
      createNewProcess
    }
  }
}
</script> 