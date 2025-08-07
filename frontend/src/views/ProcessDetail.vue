<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Erro ao carregar dados</h3>
            <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-4">
        <!-- Process Header -->
        <div class="bg-blue-600 rounded-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button @click="$router.go(-1)" class="text-white hover:text-blue-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold">{{ getProcessDisplayName() }}</h1>
                <div class="flex items-center space-x-4 mt-2">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white border border-green-400">
                    Aberto
                  </span>
                  <span class="text-blue-100">Criado em {{ formatDate(process?.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                ]"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <!-- Tab: Visão Geral -->
            <div v-if="activeTab === 'overview'" class="space-y-4">
              <!-- Status Filters -->
              <div class="flex items-center space-x-4 w-full max-w-2xl">
                <label class="text-sm font-medium text-gray-700">Filtrar por status:</label>
                <select v-model="selectedStatusFilter" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option v-for="filter in statusFilters" :key="filter.value" :value="filter.value">
                    {{ filter.label }}
                  </option>
                </select>
              </div>

              <!-- Task List -->
              <div class="space-y-3">
                <div
                  v-for="task in filteredTasks"
                  :key="task.id"
                  class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center justify-between">
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
                    <div class="text-right ml-3 flex-shrink-0">
                      <span 
                        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border shadow-sm"
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
              <!-- Diagrama do Processo -->
              <div class="bg-white rounded-lg border border-gray-200">
                <div class="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 class="text-lg font-medium text-gray-900">Diagrama do Processo</h3>
                  <div class="flex items-center space-x-2">
                    <button
                      @click="zoomIn"
                      class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      title="Ampliar"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                      </svg>
                    </button>
                    <button
                      @click="zoomOut"
                      class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      title="Reduzir"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
                      </svg>
                    </button>
                    <button
                      @click="resetZoom"
                      class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      title="Ajustar à tela"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                      </svg>
                    </button>
                    <button
                      @click="centerDiagram"
                      class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      title="Ajustar ao centro"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div class="h-96 bg-gray-50 relative overflow-auto">
                  <!-- Loading state -->
                  <div v-if="loadingBpmn" class="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div class="text-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p class="text-gray-500">Carregando diagrama...</p>
                    </div>
                  </div>
                  
                  <!-- BPMN Viewer usando bpmn-js -->
                  <div 
                    v-if="!loadingBpmn && bpmnXml"
                    id="bpmn-container" 
                    class="h-full bg-white min-w-full min-h-full"
                  ></div>
                  
                  <!-- Mensagem se não há XML -->
                  <div v-else-if="!loadingBpmn && !bpmnXml" class="flex items-center justify-center h-full text-gray-500">
                    <p>Nenhum diagrama BPMN disponível para este processo</p>
                  </div>
                </div>
                
                <!-- Legenda -->
                <div class="p-4 border-t border-gray-200 bg-gray-50">
                  <h4 class="text-sm font-medium text-gray-700 mb-3">Legenda do Status das Tarefas</h4>
                  <div class="flex flex-wrap gap-4">
                    <div class="flex items-center">
                      <div class="w-4 h-4 bg-green-100 border-2 border-green-600 rounded mr-2"></div>
                      <span class="text-sm text-gray-600">Concluída</span>
                    </div>
                    <div class="flex items-center">
                      <div class="w-4 h-4 bg-orange-100 border-2 border-orange-600 rounded mr-2"></div>
                      <span class="text-sm text-gray-600">Em andamento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useProcessesStore } from '@/stores/processes'

export default {
  name: 'ProcessDetail',
  setup() {
    const route = useRoute()
    const processesStore = useProcessesStore()
    
    const activeTab = ref('overview')
    const selectedStatusFilter = ref('all')
    const allTasks = ref([])
    const loadingBpmn = ref(false)
    const loading = ref(false)
    const error = ref(null)
    const bpmnXml = ref(null)
    const bpmnViewer = ref(null)
    const process = ref(null)

    const tabs = [
      { id: 'overview', name: 'Visão Geral' },
      { id: 'bpmn', name: 'Fluxo do Processo' }
    ]

    const statusFilters = [
      { value: 'all', label: 'Todos' },
      { value: 'completed', label: 'Concluídos' }
    ]

    const filteredTasks = computed(() => {
      if (!allTasks.value) return []
      
      let filtered = allTasks.value
      
      if (selectedStatusFilter.value === 'completed') {
        filtered = filtered.filter(task => task.status === 'completed')
      }
      
      // Ordenar: em andamento primeiro, depois concluídas
      return filtered.sort((a, b) => {
        if (a.status === 'in-progress' && b.status !== 'in-progress') return -1
        if (a.status !== 'in-progress' && b.status === 'in-progress') return 1
        return 0
      })
    })

    const getStatusText = (status) => {
      switch (status) {
        case 'completed': return 'Concluído'
        case 'in-progress': return 'Em andamento'
        case 'pending': return 'Pendente'
        default: return 'Desconhecido'
      }
    }

    const getTaskDate = (task) => {
      if (task.status === 'in-progress') {
        return `SLA: ${formatDate(task.due_date)}`
      } else if (task.status === 'completed') {
        return `Concluído em: ${formatDate(task.completion_date)}`
      }
      return ''
    }

    const getProcessDisplayName = () => {
      return process.value?.identifier || process.value?.name || 'Processo'
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    }

    const zoomIn = () => {
      if (bpmnViewer.value) {
        const canvas = bpmnViewer.value.get('canvas')
        const currentZoom = canvas.zoom()
        canvas.zoom(currentZoom * 1.2)
      }
    }

    const zoomOut = () => {
      if (bpmnViewer.value) {
        const canvas = bpmnViewer.value.get('canvas')
        const currentZoom = canvas.zoom()
        canvas.zoom(currentZoom * 0.8)
      }
    }

    const resetZoom = () => {
      if (bpmnViewer.value) {
        const canvas = bpmnViewer.value.get('canvas')
        canvas.zoom('fit-viewport')
      }
    }

    const centerDiagram = () => {
      if (bpmnViewer.value) {
        const canvas = bpmnViewer.value.get('canvas')
        canvas.zoom('fit-viewport')
        canvas.scroll({ dx: 0, dy: 0 })
      }
    }

    const loadProcessData = async () => {
      if (!route.params.id) return
      
      loading.value = true
      error.value = null
      
      try {
        console.log('Carregando dados do processo:', route.params.id)
        
        const processData = await processesStore.getProcessById(route.params.id)
        process.value = processData
        console.log('Dados do processo carregados:', processData)
        
        // Carregar tarefas do processo
        console.log('Carregando tarefas do processo...')
        
        let tasksData = await processesStore.getProcessTasks(route.params.id)
        console.log('Tarefas carregadas (método específico):', tasksData)
        
        if (!tasksData || !Array.isArray(tasksData) || tasksData.length === 0) {
          console.log('Tentando método alternativo...')
          await processesStore.fetchProcessTasks({ processId: route.params.id })
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

        // Carregar XML do BPMN
        await loadBpmnXml()

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

    const loadBpmnXml = async () => {
      if (!route.params.id) return
      
      loadingBpmn.value = true
      
      try {
        console.log('[BPMN] Carregando XML do processo:', route.params.id)
        
        const xmlData = await processesStore.getProcessBpmn(route.params.id)
        console.log('[BPMN] XML carregado:', xmlData ? 'Sim' : 'Não')
        
        if (xmlData) {
          bpmnXml.value = xmlData
          await nextTick()
          await initBpmnViewer()
        }
        
      } catch (error) {
        console.error('[BPMN] Erro ao carregar XML:', error)
      } finally {
        loadingBpmn.value = false
      }
    }

    const initBpmnViewer = async () => {
      try {
        // Importar bpmn-js dinamicamente
        const { default: BpmnJS } = await import('bpmn-js/dist/bpmn-viewer.production.min.js')
        
        const container = document.getElementById('bpmn-container')
        if (!container) {
          console.error('[BPMN] Container não encontrado')
          return
        }

        console.log('[BPMN] Inicializando viewer...')
        
        bpmnViewer.value = new BpmnJS({
          container: container,
          keyboard: {
            bindTo: window
          }
        })

        console.log('[BPMN] Importando XML...')
        await bpmnViewer.value.importXML(bpmnXml.value)
        
        console.log('[BPMN] XML importado, colorindo tarefas...')
        await colorizeTasks()
        
        console.log('[BPMN] Ajustando zoom...')
        bpmnViewer.value.get('canvas').zoom('fit-viewport')
        
        // Habilitar pan e zoom com mouse após carregamento
        const canvas = bpmnViewer.value.get('canvas')
        
        // Habilitar zoom com scroll do mouse
        container.addEventListener('wheel', function(event) {
          event.preventDefault()
          const delta = event.deltaY > 0 ? -0.1 : 0.1
          const currentZoom = canvas.zoom()
          const newZoom = Math.max(0.2, Math.min(4.0, currentZoom + delta))
          canvas.zoom(newZoom)
        })
        
        // Habilitar pan com arrastar do mouse
        let isPanning = false
        let lastX = 0
        let lastY = 0
        
        container.addEventListener('mousedown', function(event) {
          if (event.button === 0) { // Botão esquerdo
            isPanning = true
            lastX = event.clientX
            lastY = event.clientY
            container.style.cursor = 'grabbing'
          }
        })
        
        container.addEventListener('mousemove', function(event) {
          if (isPanning) {
            const deltaX = event.clientX - lastX
            const deltaY = event.clientY - lastY
            canvas.scroll({ dx: deltaX, dy: deltaY })
            lastX = event.clientX
            lastY = event.clientY
          }
        })
        
        container.addEventListener('mouseup', function(event) {
          if (event.button === 0) {
            isPanning = false
            container.style.cursor = 'grab'
          }
        })
        
        container.addEventListener('mouseleave', function() {
          isPanning = false
          container.style.cursor = 'grab'
        })
        
        // Definir cursor inicial
        container.style.cursor = 'grab'
        
        console.log('[BPMN] Diagrama carregado com sucesso! Pan e zoom habilitados.')
        
      } catch (error) {
        console.error('[BPMN] Erro ao inicializar viewer:', error)
      }
    }

    const colorizeTasks = async () => {
      if (!bpmnViewer.value || !allTasks.value.length) return
      
      try {
        const elementRegistry = bpmnViewer.value.get('elementRegistry')
        
        // Função para normalizar strings (igual ao exemplo)
        const normalizeString = (str) => {
          if (typeof str !== 'string') return ''
          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
        }
        
        // Função para encontrar elementos por nome (igual ao exemplo)
        const findElementsByName = (registry, nameToFind) => {
          const normalizedNameToFind = normalizeString(nameToFind)
          return registry.filter(el => {
            if (el.businessObject && el.businessObject.name) {
              const normalizedElementName = normalizeString(el.businessObject.name)
              return normalizedElementName === normalizedNameToFind
            }
            return false
          })
        }
        
        // Separar tarefas por status
        const completedTasks = allTasks.value
          .filter(task => task.status === 'completed')
          .map(task => task.name)
        
        const inProgressTasks = allTasks.value
          .filter(task => task.status === 'in-progress')
          .map(task => task.name)
        
        console.log(`[BPMN] Colorindo tarefas: ${completedTasks.length} concluídas, ${inProgressTasks.length} em andamento`)
        
        // Colorir tarefas concluídas (verde)
        completedTasks.forEach(name => {
          const elements = findElementsByName(elementRegistry, name)
          elements.forEach(element => {
            const gfx = elementRegistry.getGraphics(element)
            if (gfx) {
              const visual = gfx.querySelector('.djs-visual > *')
              if (visual) {
                visual.style.fill = '#d4edda'  // Verde claro
                visual.style.stroke = '#155724' // Verde escuro
              }
            }
          })
        })
        
        // Colorir tarefas em andamento (laranja) com destaque visual
        inProgressTasks.forEach(name => {
          const elements = findElementsByName(elementRegistry, name)
          elements.forEach(element => {
            const gfx = elementRegistry.getGraphics(element)
            if (gfx) {
              const visual = gfx.querySelector('.djs-visual > *')
              if (visual) {
                visual.style.fill = '#fff3cd'  // Laranja claro
                visual.style.stroke = '#2563eb' // Borda azul para destaque
                visual.style.strokeWidth = '3'  // Borda mais grossa
                
                // Adicionar classe para destaque visual
                gfx.classList.add('task-in-progress')
                
                // Implementar animação suave para elementos SVG
                let startTime = Date.now()
                const animate = () => {
                  const elapsed = Date.now() - startTime
                  const cycle = Math.sin(elapsed * 0.003) // 2 segundos por ciclo
                  
                  // Variação da opacidade entre 0.7 e 1.0
                  const opacity = 0.7 + (0.3 * (cycle + 1) / 2)
                  
                  // Variação da espessura da borda entre 3 e 4
                  const strokeWidth = 3 + (cycle + 1) / 2
                  
                  visual.style.strokeOpacity = opacity
                  visual.style.strokeWidth = strokeWidth + 'px'
                  
                  requestAnimationFrame(animate)
                }
                
                // Iniciar animação
                requestAnimationFrame(animate)
              }
            }
          })
        })
        
        console.log('[BPMN] Colorização SVG concluída (preservando textos)')
        
      } catch (error) {
        console.error('[BPMN] Erro ao colorir tarefas:', error)
      }
    }

    onMounted(async () => {
      console.log('Componente ProcessDetail montado')
      console.log('ID do processo da rota:', route.params.id)
      
      if (route.params.id) {
        await loadProcessData()
      } else {
        console.error('ID do processo não encontrado na rota')
      }
    })

    watch(activeTab, async (newTab) => {
      if (newTab === 'bpmn' && bpmnXml.value && !bpmnViewer.value) {
        await nextTick()
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
      resetZoom,
      centerDiagram,
      loading,
      loadingBpmn,
      error,
      bpmnXml,
      loadProcessData
    }
  }
}
</script>

<style scoped>
/* Estilos para o diagrama BPMN */
#bpmn-container {
  background: white;
  border: none;
  border-radius: 0;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  min-width: 100%;
  min-height: 100%;
}

/* Estilos para tarefas em andamento */
.task-in-progress {
  position: relative;
}

/* Destaque visual para tarefas em andamento */
.task-in-progress {
  position: relative;
}

#bpmn-container:active {
  cursor: grabbing;
}

/* Desabilitar seleção de texto durante pan */
#bpmn-container * {
  user-select: none;
}

/* Garantir que os textos sejam sempre visíveis */
#bpmn-container .djs-label {
  fill: #000000 !important;
  stroke: none !important;
  font-weight: 500 !important;
}

#bpmn-container text {
  fill: #000000 !important;
  stroke: none !important;
  font-weight: 500 !important;
}

/* Preservar textos em elementos coloridos */
#bpmn-container .djs-visual text {
  fill: #000000 !important;
  stroke: none !important;
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