<template>
  <div class="space-y-4">
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
        <div class="flex items-center space-x-3 mb-3">
          <button @click="$router.go(-1)" class="text-blue-100 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-2xl font-bold">{{ getProcessDisplayName() }}</h1>
        </div>
        <div class="flex items-center space-x-4">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-500 text-white border border-green-400">
            <span class="w-2 h-2 bg-white rounded-full mr-2"></span>
            Aberto
          </span>
          <span class="text-blue-100 text-sm">
            Criado em {{ formatDate(process?.created_at) }}
          </span>
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
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
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
          <div v-if="activeTab === 'overview'" class="space-y-4">
            <!-- Filtros de Status -->
            <div class="w-full max-w-2xl">
              <h3 class="text-lg font-medium text-gray-900 mb-3">Filtrar por Status</h3>
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
              <h3 class="text-lg font-medium text-gray-900 mb-3">Lista de Tarefas</h3>
              <div class="space-y-3">
                <div
                  v-for="task in filteredTasks"
                  :key="task.id"
                  class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div class="flex items-center space-x-3 flex-1 min-w-0">
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-gray-900 truncate">{{ task.name }}</h4>
                      <div class="flex items-center mt-3 text-sm text-gray-500">
                        <span class="flex items-center">
                          <span v-if="task.status === 'in-progress'" class="mr-2 text-base">📅</span>
                          <span v-else-if="task.status === 'completed'" class="mr-2 text-base">✅</span>
                          {{ getTaskDate(task) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="text-right ml-3 flex-shrink-0">
                    <span 
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                      :class="{
                        'bg-green-50 text-green-700 border-green-200': task.status === 'completed',
                        'bg-orange-500 text-white border-orange-600': task.status === 'in-progress'
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
    const bpmnViewer = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const tabs = [
      { id: 'overview', name: 'Visão Geral' },
      { id: 'bpmn', name: 'Fluxo do Processo' }
    ]

    const statusFilters = [
      { value: 'all', label: 'Todos' },
      { value: 'completed', label: 'Concluídos' }
    ]

    const getProcessDisplayName = () => {
      // Priorizar identifier (nome completo do processo da API Holmes)
      return process.value?.identifier || 
             process.value?.displayName || 
             process.value?.name || 
             'Auditoria BIM-R181-ARQ-EP'
    }

    const filteredTasks = computed(() => {
      let tasks = allTasks.value
      
      // Ordenar tarefas: primeiro as em andamento, depois as concluídas
      tasks = tasks.sort((a, b) => {
        if (a.status === 'in-progress' && b.status === 'completed') return -1
        if (a.status === 'completed' && b.status === 'in-progress') return 1
        return 0
      })
      
      // Aplicar filtro
      if (selectedStatusFilter.value === 'all') {
        return tasks
      }
      return tasks.filter(task => task.status === selectedStatusFilter.value)
    })

    const getStatusText = (status) => {
      const statusMap = {
        'completed': 'Concluído',
        'in-progress': 'Em andamento',
        'opened': 'Aberto',
        'closed': 'Fechado'
      }
      return statusMap[status] || status
    }

    const getTaskDate = (task) => {
      if (task.status === 'completed') {
        // Para tarefas concluídas, mostrar data de conclusão com rótulo
        const date = task.completion_date ? formatDate(task.completion_date) : 'Data não disponível'
        return `Concluído em: ${date}`
      } else if (task.status === 'in-progress') {
        // Para tarefas em andamento, mostrar data de SLA com rótulo
        const date = task.due_date ? formatDate(task.due_date) : 'Data não disponível'
        return `SLA: ${date}`
      }
      return 'Data não disponível'
    }

    const loadProcessData = async () => {
      loading.value = true
      error.value = null
      
      try {
        const processId = route.params.id
        console.log('Carregando dados do processo:', processId)
        
        if (!processId) {
          throw new Error('ID do processo não fornecido')
        }
        
        // Carregar dados do processo
        const processData = await processesStore.getProcessById(processId)
        process.value = processData
        console.log('Dados do processo carregados:', processData)
        
        // Carregar tarefas do processo
        console.log('Carregando tarefas do processo...')
        
        let tasksData = await processesStore.getProcessTasks(processId)
        console.log('Tarefas carregadas (método específico):', tasksData)
        
        if (!tasksData || !Array.isArray(tasksData) || tasksData.length === 0) {
          console.log('Tentando método alternativo...')
          await processesStore.fetchProcessTasks({ processId })
          tasksData = processesStore.tasks
          console.log('Tarefas carregadas (método alternativo):', tasksData)
        }
        
        if (!tasksData || !Array.isArray(tasksData)) {
          console.warn('Nenhuma tarefa encontrada ou formato inválido:', tasksData)
          tasksData = []
        }
        
        if (tasksData && Array.isArray(tasksData)) {
          allTasks.value = tasksData.map(task => ({
            ...task,
            status: task.status || 'pending',
            due_date: task.due_date || null,
            completion_date: task.completion_date || null
          }))
        } else {
          allTasks.value = []
        }

      } catch (err) {
        console.error('Erro ao carregar dados do processo:', err)
        
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
        
        allTasks.value = []
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
      tabs,
      statusFilters,
      filteredTasks,
      getStatusText,
      getTaskDate,
      getProcessDisplayName,
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

/* Responsividade para telas menores */
@media (max-width: 768px) {
  .space-y-4 > * + * {
    margin-top: 1rem;
  }
  
  .p-6 {
    padding: 1rem;
  }
  
  .text-2xl {
    font-size: 1.5rem;
  }
  
  .flex-wrap {
    flex-wrap: wrap;
  }
  
  .min-w-0 {
    min-width: 0;
  }
  
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .max-w-2xl {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .space-x-3 > * + * {
    margin-left: 0.5rem;
  }
  
  .space-x-4 > * + * {
    margin-left: 0.75rem;
  }
  
  .space-x-8 > * + * {
    margin-left: 1.5rem;
  }
  
  .p-4 {
    padding: 0.75rem;
  }
  
  .text-sm {
    font-size: 0.875rem;
  }
}
</style> 