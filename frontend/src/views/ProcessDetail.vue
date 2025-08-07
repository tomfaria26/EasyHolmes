<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">Carregando dados do processo...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center">
        <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 class="text-lg font-medium text-red-800">Erro ao carregar dados</h3>
          <p class="text-red-600">{{ error }}</p>
        </div>
      </div>
      <button @click="loadProcessData" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
        Tentar novamente
      </button>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Cabeçalho do Processo -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-center space-x-3 mb-2">
            <button @click="$router.go(-1)" class="text-blue-100 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 class="text-2xl font-bold">{{ process?.displayName || process?.name || 'Auditoria BIM-R181-ARQ-EP' }}</h1>
          </div>
          <div class="flex items-center space-x-4 mt-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white bg-opacity-20">
              <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {{ getStatusText(process?.status) || 'opened' }}
            </span>
            <span class="text-blue-100 text-sm">
              Criado em {{ formatDate(process?.created_at) }}
            </span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-bold">{{ completedTasks.length }}/{{ allTasks.length }}</div>
          <div class="text-blue-100 text-sm">Tarefas Concluídas</div>
          <div class="w-24 h-2 bg-white bg-opacity-20 rounded-full mt-2">
            <div 
              class="h-2 bg-green-400 rounded-full transition-all duration-500"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cartões de Resumo Simplificados -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <div class="text-3xl font-bold text-gray-900 mb-2">{{ allTasks.length }}</div>
        <div class="text-sm text-gray-500">Total de Tarefas</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <div class="text-3xl font-bold text-gray-900 mb-2">{{ completedTasks.length }}</div>
        <div class="text-sm text-gray-500">Tarefas Concluídas</div>
      </div>
    </div>

    <!-- Tabs de Navegação -->
    <div class="bg-white rounded-lg shadow">
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Conteúdo das Tabs -->
      <div class="p-6">
        <!-- Tab: Visão Geral -->
        <div v-if="activeTab === 'overview'" class="space-y-6">
          <!-- Informações do Processo -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Informações do Processo</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Data de Criação</p>
                <p class="font-medium">{{ formatDate(process?.created_at) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Progresso</p>
                <p class="font-medium">{{ progressPercentage }}%</p>
              </div>
            </div>
          </div>

          <!-- Filtros de Status -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Filtrar por Status</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="filter in statusFilters"
                :key="filter.value"
                @click="selectedStatusFilter = filter.value"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  selectedStatusFilter === filter.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>

          <!-- Lista de Tarefas -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Lista de Tarefas</h3>
            <div class="space-y-3">
              <div
                v-for="task in filteredTasks"
                :key="task.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-3 h-3 rounded-full"
                    :class="{
                      'bg-green-500': task.status === 'completed',
                      'bg-yellow-500': task.status === 'pending',
                      'bg-orange-500': task.status === 'in-progress'
                    }"
                  ></div>
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ task.name }}</h4>
                    <p class="text-sm text-gray-500">{{ task.description || 'Sem descrição' }}</p>
                    <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {{ formatDate(task.due_date) || 'Sem vencimento' }}
                      </span>
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        {{ task.assignee || 'Não atribuído' }}
                      </span>
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        {{ getPriorityText(task.priority) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': task.status === 'completed',
                      'bg-yellow-100 text-yellow-800': task.status === 'pending',
                      'bg-orange-100 text-orange-800': task.status === 'in-progress'
                    }"
                  >
                    {{ getStatusText(task.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Fluxo do Processo -->
        <div v-if="activeTab === 'bpmn'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Diagrama do Processo</h3>
            <div class="flex space-x-2">
              <button @click="zoomIn" class="btn btn-secondary text-sm" title="Aproximar">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                </svg>
              </button>
              <button @click="zoomOut" class="btn btn-secondary text-sm" title="Afastar">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10v3m0 0v3m0-3h3m-3 0H7"></path>
                </svg>
              </button>
              <button @click="zoomFit" class="btn btn-secondary text-sm" title="Ajustar à tela">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                </svg>
              </button>
            </div>
          </div>
          <div id="bpmn-container" class="border border-gray-200 rounded-lg" style="height: 500px;"></div>
        </div>

        <!-- Tab: Histórico de Ações -->
        <div v-if="activeTab === 'history'" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Histórico de Ações</h3>
          <div class="space-y-3">
            <div
              v-for="(action, index) in processHistory"
              :key="index"
              class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
            >
              <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ action.action }}</p>
                <p class="text-sm text-gray-500">{{ action.description }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ formatDate(action.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProcessesStore } from '@/stores/processes'
import { formatDate } from '@/utils/dateUtils'

export default {
  name: 'ProcessDetail',
  setup() {
    const route = useRoute()
    const processesStore = useProcessesStore()
    
    const activeTab = ref('overview')
    const selectedStatusFilter = ref('all')
    const process = ref(null)
    const allTasks = ref([])
    const processHistory = ref([])
    const bpmnViewer = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const tabs = [
      { id: 'overview', name: 'Visão Geral' },
      { id: 'bpmn', name: 'Fluxo do Processo' },
      { id: 'history', name: 'Histórico de Ações' }
    ]

    const statusFilters = [
      { value: 'all', label: 'Todos' },
      { value: 'completed', label: 'Concluídos' },
      { value: 'in-progress', label: 'Em andamento' },
      { value: 'pending', label: 'Pendentes' }
    ]

    const completedTasks = computed(() => 
      allTasks.value.filter(task => task.status === 'completed')
    )

    const pendingTasks = computed(() => 
      allTasks.value.filter(task => task.status === 'pending')
    )

    const inProgressTasks = computed(() => 
      allTasks.value.filter(task => task.status === 'in-progress')
    )

    const progressPercentage = computed(() => {
      if (allTasks.value.length === 0) return 0
      return Math.round((completedTasks.value.length / allTasks.value.length) * 100)
    })

    const filteredTasks = computed(() => {
      if (selectedStatusFilter.value === 'all') {
        return allTasks.value
      }
      return allTasks.value.filter(task => task.status === selectedStatusFilter.value)
    })

    const getStatusText = (status) => {
      const statusMap = {
        'completed': 'Concluído',
        'pending': 'Pendente',
        'in-progress': 'Em andamento',
        'opened': 'Aberto',
        'closed': 'Fechado'
      }
      return statusMap[status] || status
    }

    const getPriorityText = (priority) => {
      const priorityMap = {
        'high': 'Alta',
        'medium': 'Média',
        'low': 'Baixa'
      }
      return priorityMap[priority] || 'Não definida'
    }

    const loadProcessData = async () => {
      loading.value = true
      error.value = null
      
      try {
        const processId = route.params.id
        console.log('Carregando dados do processo:', processId)
        
        // Testar dados mock para debug
        if (!processId) {
          throw new Error('ID do processo não fornecido')
        }
        
        // Carregar dados do processo
        const processData = await processesStore.getProcessById(processId)
        process.value = processData
        console.log('Dados do processo carregados:', processData)
        
        // Carregar tarefas do processo
        console.log('Carregando tarefas do processo...')
        
        // Tentar primeiro com o método específico
        let tasksData = await processesStore.getProcessTasks(processId)
        console.log('Tarefas carregadas (método específico):', tasksData)
        
        // Se não funcionar, tentar com o método fetchProcessTasks
        if (!tasksData || !Array.isArray(tasksData) || tasksData.length === 0) {
          console.log('Tentando método alternativo...')
          await processesStore.fetchProcessTasks({ processId })
          tasksData = processesStore.tasks
          console.log('Tarefas carregadas (método alternativo):', tasksData)
        }
        
        // Se não houver tarefas, definir como array vazio
        if (!tasksData || !Array.isArray(tasksData)) {
          console.warn('Nenhuma tarefa encontrada ou formato inválido:', tasksData)
          tasksData = []
        }
        
        if (tasksData && Array.isArray(tasksData)) {
          allTasks.value = tasksData.map(task => ({
            ...task,
            status: task.status || 'pending',
            priority: task.priority || 'medium',
            assignee: task.assignee || 'Não atribuído',
            due_date: task.due_date || null
          }))
        } else {
          console.warn('Nenhuma tarefa encontrada ou formato inválido:', tasksData)
          allTasks.value = []
        }

        // Carregar histórico do processo
        console.log('Carregando histórico do processo...')
        const historyData = await processesStore.getProcessHistory(processId)
        processHistory.value = historyData || []
        console.log('Histórico carregado:', processHistory.value)

      } catch (err) {
        console.error('Erro ao carregar dados do processo:', err)
        
        // Verificar se é um erro de rede/API
        if (err.response) {
          const status = err.response.status
          const statusText = err.response.statusText
          
          if (status === 500) {
            error.value = `Erro interno do servidor (500): ${statusText}. Verifique os logs do backend.`
          } else if (status === 404) {
            error.value = 'Processo não encontrado (404). Verifique se o ID está correto.'
          } else if (status === 401) {
            error.value = 'Não autorizado (401). Verifique se está logado.'
          } else {
            error.value = `Erro ${status}: ${statusText}`
          }
        } else if (err.request) {
          error.value = 'Erro de conexão. Verifique se o backend está rodando.'
        } else {
          error.value = 'Erro ao carregar dados do processo: ' + err.message
        }
        
        // Definir valores padrão em caso de erro
        allTasks.value = []
        processHistory.value = []
      } finally {
        loading.value = false
      }
    }

    const initBpmnViewer = async () => {
      if (typeof window !== 'undefined' && window.BpmnJS) {
        const container = document.getElementById('bpmn-container')
        if (container) {
          bpmnViewer.value = new window.BpmnJS({
            container: container,
            keyboard: {
              bindTo: window
            }
          })

          try {
            const processId = route.params.id
            const bpmnXml = await processesStore.getProcessBpmn(processId)
            if (bpmnXml) {
              await bpmnViewer.value.importXML(bpmnXml)
              bpmnViewer.value.get('canvas').zoom('fit-viewport')
            }
          } catch (error) {
            console.error('Erro ao carregar diagrama BPMN:', error)
          }
        }
      }
    }

    const zoomIn = () => {
      if (bpmnViewer.value) {
        bpmnViewer.value.get('canvas').zoom(bpmnViewer.value.get('canvas').zoom() * 1.2)
      }
    }

    const zoomOut = () => {
      if (bpmnViewer.value) {
        bpmnViewer.value.get('canvas').zoom(bpmnViewer.value.get('canvas').zoom() * 0.8)
      }
    }

    const zoomFit = () => {
      if (bpmnViewer.value) {
        bpmnViewer.value.get('canvas').zoom('fit-viewport')
      }
    }

    onMounted(async () => {
      console.log('Componente ProcessDetail montado')
      console.log('ID do processo da rota:', route.params.id)
      
      if (route.params.id) {
        await loadProcessData()
        
        // Carregar BPMN.js se estiver na aba de diagrama
        if (activeTab.value === 'bpmn') {
          await initBpmnViewer()
        }
      } else {
        console.error('ID do processo não encontrado na rota')
      }
    })

    watch(activeTab, async (newTab) => {
      if (newTab === 'bpmn' && !bpmnViewer.value) {
        await initBpmnViewer()
      }
    })

    return {
      activeTab,
      selectedStatusFilter,
      process,
      allTasks,
      processHistory,
      tabs,
      statusFilters,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      progressPercentage,
      filteredTasks,
      getStatusText,
      getPriorityText,
      formatDate,
      zoomIn,
      zoomOut,
      zoomFit,
      loading,
      error,
      loadProcessData
    }
  }
}
</script>

<style scoped>
.btn {
  @apply px-3 py-2 rounded-md text-sm font-medium transition-colors;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

#bpmn-container {
  background: white;
}
</style> 