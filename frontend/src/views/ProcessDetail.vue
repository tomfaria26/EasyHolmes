<template>
  <div class="space-y-6">
    <!-- Header do Processo -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-center space-x-3 mb-2">
            <button @click="$router.go(-1)" class="text-blue-100 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 class="text-2xl font-bold">{{ process?.displayName || process?.name || 'Processo' }}</h1>
          </div>
          <p class="text-blue-100">{{ process?.description || 'Sem descrição disponível' }}</p>
          <div class="flex items-center space-x-4 mt-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white bg-opacity-20">
              <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {{ getStatusText(process?.status) }}
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

    <!-- Cards de Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-500">Total de Tarefas</p>
            <p class="text-xl font-bold text-gray-900">{{ allTasks.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-500">Concluídas</p>
            <p class="text-xl font-bold text-gray-900">{{ completedTasks.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-500">Pendentes</p>
            <p class="text-xl font-bold text-gray-900">{{ pendingTasks.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-500">Em Andamento</p>
            <p class="text-xl font-bold text-gray-900">{{ inProgressTasks.length }}</p>
          </div>
        </div>
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
                <p class="text-sm text-gray-500">Identificador</p>
                <p class="font-medium">{{ process?.identifier || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Status</p>
                <p class="font-medium">{{ getStatusText(process?.status) }}</p>
              </div>
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

          <!-- Lista de Tarefas -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Tarefas do Processo</h3>
            <div class="space-y-3">
              <div
                v-for="task in allTasks"
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
                  <div>
                    <h4 class="font-medium text-gray-900">{{ task.name }}</h4>
                    <p class="text-sm text-gray-500">{{ task.description || 'Sem descrição' }}</p>
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

        <!-- Tab: Diagrama BPMN -->
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
              <button @click="resetView" class="btn btn-secondary text-sm" title="Resetar visualização">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Instruções de uso -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="text-sm text-blue-800">
                <p class="font-medium mb-1">Como usar o diagrama:</p>
                <ul class="space-y-1 text-xs">
                  <li>• <strong>Zoom:</strong> Use a roda do mouse ou os botões acima</li>
                  <li>• <strong>Pan (mover):</strong> Clique e arraste com o botão esquerdo do mouse</li>
                  <li>• <strong>Selecionar:</strong> Clique em qualquer elemento do diagrama</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Container do BPMN -->
          <div class="bg-gray-50 rounded-lg border-2 border-gray-200 relative" style="height: 600px;">
            <div v-if="bpmnLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <div class="text-center">
                <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="mt-2 text-gray-600">Carregando diagrama...</p>
              </div>
            </div>
            <div id="bpmn-container" class="w-full h-full cursor-grab active:cursor-grabbing"></div>
          </div>

          <!-- Legenda -->
          <div class="bg-white rounded-lg border p-4">
            <h4 class="font-medium text-gray-900 mb-3">Legenda</h4>
            <div class="flex space-x-6">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">Concluído</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">Pendente</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                <span class="text-sm text-gray-600">Em Andamento</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Atividades -->
        <div v-if="activeTab === 'activities'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Tarefas Pendentes -->
            <div class="bg-yellow-50 rounded-lg p-4">
              <h4 class="font-medium text-yellow-900 mb-3 flex items-center">
                <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Tarefas Pendentes
              </h4>
              <div class="space-y-2">
                <div
                  v-for="task in pendingTasks"
                  :key="task.id"
                  class="bg-white rounded p-3 border border-yellow-200"
                >
                  <h5 class="font-medium text-gray-900">{{ task.name }}</h5>
                  <p class="text-sm text-gray-600">{{ task.description || 'Sem descrição' }}</p>
                </div>
                <div v-if="pendingTasks.length === 0" class="text-center py-4 text-yellow-700">
                  Nenhuma tarefa pendente
                </div>
              </div>
            </div>

            <!-- Tarefas Concluídas -->
            <div class="bg-green-50 rounded-lg p-4">
              <h4 class="font-medium text-green-900 mb-3 flex items-center">
                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Tarefas Concluídas
              </h4>
              <div class="space-y-2">
                <div
                  v-for="task in completedTasks"
                  :key="task.id"
                  class="bg-white rounded p-3 border border-green-200"
                >
                  <h5 class="font-medium text-gray-900">{{ task.name }}</h5>
                  <p class="text-sm text-gray-600">{{ task.description || 'Sem descrição' }}</p>
                  <p class="text-xs text-green-600 mt-1">
                    Concluída em {{ formatDate(task.completion_date) }}
                  </p>
                </div>
                <div v-if="completedTasks.length === 0" class="text-center py-4 text-green-700">
                  Nenhuma tarefa concluída
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useProcessesStore } from '../stores/processes'
import { useNotifications } from '../composables/useNotifications'
import { processService } from '../services/api'
import BpmnJS from 'bpmn-js'

export default {
  name: 'ProcessDetail',
  setup() {
    const route = useRoute()
    const processesStore = useProcessesStore()
    const { showError } = useNotifications()

    const activeTab = ref('overview')
    const bpmnLoading = ref(false)
    const bpmnViewer = ref(null)

    const tabs = [
      { id: 'overview', name: 'Visão Geral' },
      { id: 'bpmn', name: 'Diagrama BPMN' },
      { id: 'activities', name: 'Atividades' }
    ]

    const process = computed(() => {
      const processId = route.params.id
      return processesStore.processes.find(p => p.id === processId)
    })

    const allTasks = computed(() => {
      if (!process.value) return []
      return processesStore.tasksByProcess(process.value.id)
    })

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

    const getStatusText = (status) => {
      const statusMap = {
        'active': 'Ativo',
        'completed': 'Concluído',
        'pending': 'Pendente',
        'in-progress': 'Em Andamento'
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Data não disponível'
      try {
        const dt = new Date(dateString)
        const saoPauloOffset = -3 * 60
        const localTime = new Date(dt.getTime() + (saoPauloOffset * 60 * 1000))
        return localTime.toLocaleDateString('pt-BR')
      } catch (error) {
        return 'Data inválida'
      }
    }

    // Funções do BPMN
    const initBpmnViewer = async () => {
      if (!process.value) return

      try {
        bpmnLoading.value = true
        
        // Aguardar o próximo tick para garantir que o DOM foi atualizado
        await nextTick()
        
        // Verificar se o container existe
        const container = document.getElementById('bpmn-container')
        if (!container) {
          throw new Error('Container BPMN não encontrado')
        }
        
        // Destruir instância anterior se existir
        if (bpmnViewer.value) {
          bpmnViewer.value.destroy()
          bpmnViewer.value = null
        }
        
        // Criar instância do BPMN.js com configurações de interação
        bpmnViewer.value = new BpmnJS({
          container: '#bpmn-container',
          keyboard: {
            bindTo: document
          }
        })

        // Buscar o template BPMN real do processo
        const response = await processService.getProcessTemplate(process.value.id)
        
        if (!response.success || !response.data) {
          throw new Error('Template BPMN não encontrado para este processo')
        }
        
        const xmlContent = response.data
        
        // Validar se o XML é uma string válida
        if (typeof xmlContent !== 'string' || xmlContent.trim().length === 0) {
          throw new Error('Template BPMN inválido: conteúdo não é uma string válida')
        }
        
        await bpmnViewer.value.importXML(xmlContent)
        
        // Aguardar um pouco para garantir que o diagrama foi renderizado
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Configurar interações de mouse
        setupMouseInteractions()
        
        // Aplicar cores baseadas no status das tarefas
        colorBpmnElements()
        
        // Ajustar zoom inicial
        const canvas = bpmnViewer.value.get('canvas')
        if (canvas && canvas.zoom) {
          canvas.zoom('fit-viewport', 'auto')
        }
        
        console.log('BPMN Viewer inicializado com sucesso')
        
      } catch (error) {
        console.error('Erro ao carregar BPMN:', error)
        showError(`Erro ao carregar diagrama BPMN: ${error.message}`)
      } finally {
        bpmnLoading.value = false
      }
    }

    const setupMouseInteractions = () => {
      if (!bpmnViewer.value) return

      const canvas = bpmnViewer.value.get('canvas')
      const container = document.getElementById('bpmn-container')

      // Prevenir seleção de texto
      container.style.userSelect = 'none'
      container.style.webkitUserSelect = 'none'
      container.style.mozUserSelect = 'none'
      container.style.msUserSelect = 'none'

      // Configurar zoom com roda do mouse
      container.addEventListener('wheel', (event) => {
        event.preventDefault()
        const delta = event.deltaY > 0 ? -0.1 : 0.1
        const currentZoom = canvas.zoom()
        const newZoom = Math.max(0.1, Math.min(5, currentZoom + delta))
        
        // Zoom no ponto do mouse
        const rect = container.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        canvas.zoom(newZoom, { x, y })
      })

      // Configurar pan com arraste do mouse
      let isPanning = false
      let lastX = 0
      let lastY = 0

      container.addEventListener('mousedown', (event) => {
        if (event.button === 0) { // Botão esquerdo
          event.preventDefault() // Prevenir seleção de texto
          isPanning = true
          lastX = event.clientX
          lastY = event.clientY
          container.style.cursor = 'grabbing'
        }
      })

      container.addEventListener('mousemove', (event) => {
        if (isPanning) {
          event.preventDefault() // Prevenir seleção de texto
          const deltaX = event.clientX - lastX
          const deltaY = event.clientY - lastY
          
          // Inverter a direção do pan
          canvas.scroll({
            dx: deltaX,
            dy: deltaY
          })
          
          lastX = event.clientX
          lastY = event.clientY
        }
      })

      container.addEventListener('mouseup', (event) => {
        if (isPanning) {
          event.preventDefault() // Prevenir seleção de texto
        }
        isPanning = false
        container.style.cursor = 'grab'
      })

      container.addEventListener('mouseleave', () => {
        isPanning = false
        container.style.cursor = 'grab'
      })

      // Prevenir seleção de texto em todo o container
      container.addEventListener('selectstart', (event) => {
        event.preventDefault()
      })
    }

    const colorBpmnElements = () => {
      if (!bpmnViewer.value) return

      try {
        const elementRegistry = bpmnViewer.value.get('elementRegistry')
        
        // Aguardar um pouco para garantir que os elementos foram renderizados
        setTimeout(() => {
          // Colorir elementos baseado no status das tarefas
          allTasks.value.forEach(task => {
            const elements = findElementsByName(elementRegistry, task.name)
            elements.forEach(element => {
              const gfx = elementRegistry.getGraphics(element)
              if (gfx) {
                // Tentar diferentes seletores para encontrar o elemento visual
                const visual = gfx.querySelector('.djs-visual > *') || 
                              gfx.querySelector('.djs-visual') ||
                              gfx.querySelector('rect') ||
                              gfx.querySelector('path') ||
                              gfx.querySelector('circle')
                
                if (visual) {
                  switch (task.status) {
                    case 'completed':
                      visual.style.fill = '#d4edda'
                      visual.style.stroke = '#155724'
                      visual.style.strokeWidth = '2'
                      break
                    case 'in-progress':
                      visual.style.fill = '#fff3cd'
                      visual.style.stroke = '#856404'
                      visual.style.strokeWidth = '2'
                      break
                    case 'pending':
                      visual.style.fill = '#f8d7da'
                      visual.style.stroke = '#721c24'
                      visual.style.strokeWidth = '2'
                      break
                  }
                }
              }
            })
          })
        }, 500) // Aguardar 500ms para garantir renderização
      } catch (error) {
        console.error('Erro ao colorir elementos BPMN:', error)
      }
    }

    const findElementsByName = (registry, nameToFind) => {
      const normalizedNameToFind = normalizeString(nameToFind)
      const allElements = registry.getAll()
      
      return allElements.filter(el => {
        if (el.businessObject && el.businessObject.name) {
          const normalizedElementName = normalizeString(el.businessObject.name)
          return normalizedElementName.includes(normalizedNameToFind) || 
                 normalizedNameToFind.includes(normalizedElementName)
        }
        return false
      })
    }

    const normalizeString = (str) => {
      if (typeof str !== 'string') return ''
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    }

    const zoomIn = () => {
      console.log('Zoom In clicked')
      if (bpmnViewer.value && bpmnViewer.value.get) {
        try {
          const canvas = bpmnViewer.value.get('canvas')
          if (canvas && canvas.zoom) {
            const currentZoom = canvas.zoom()
            const newZoom = Math.min(5, currentZoom + 0.2)
            console.log('Current zoom:', currentZoom, 'New zoom:', newZoom)
            canvas.zoom(newZoom)
          } else {
            console.error('Canvas ou método zoom não encontrado')
          }
        } catch (error) {
          console.error('Erro no zoom in:', error)
        }
      } else {
        console.error('BPMN Viewer não inicializado')
      }
    }

    const zoomOut = () => {
      console.log('Zoom Out clicked')
      if (bpmnViewer.value && bpmnViewer.value.get) {
        try {
          const canvas = bpmnViewer.value.get('canvas')
          if (canvas && canvas.zoom) {
            const currentZoom = canvas.zoom()
            const newZoom = Math.max(0.1, currentZoom - 0.2)
            console.log('Current zoom:', currentZoom, 'New zoom:', newZoom)
            canvas.zoom(newZoom)
          } else {
            console.error('Canvas ou método zoom não encontrado')
          }
        } catch (error) {
          console.error('Erro no zoom out:', error)
        }
      } else {
        console.error('BPMN Viewer não inicializado')
      }
    }

    const zoomFit = () => {
      console.log('Zoom Fit clicked')
      if (bpmnViewer.value && bpmnViewer.value.get) {
        try {
          const canvas = bpmnViewer.value.get('canvas')
          if (canvas && canvas.zoom) {
            canvas.zoom('fit-viewport', 'auto')
            console.log('Zoom fit aplicado')
          } else {
            console.error('Canvas ou método zoom não encontrado')
          }
        } catch (error) {
          console.error('Erro no zoom fit:', error)
        }
      } else {
        console.error('BPMN Viewer não inicializado')
      }
    }

    const resetView = () => {
      console.log('Reset View clicked')
      if (bpmnViewer.value && bpmnViewer.value.get) {
        try {
          const canvas = bpmnViewer.value.get('canvas')
          if (canvas && canvas.zoom && canvas.centerOn) {
            canvas.zoom(1, 'auto')
            const rootElement = canvas.get('rootElement')
            if (rootElement) {
              canvas.centerOn(rootElement)
              console.log('Reset view aplicado')
            }
          } else {
            console.error('Canvas ou métodos não encontrados')
          }
        } catch (error) {
          console.error('Erro no reset view:', error)
        }
      } else {
        console.error('BPMN Viewer não inicializado')
      }
    }

    onMounted(async () => {
      await processesStore.initializeData()
      
      // Inicializar BPMN quando a tab for ativada
      if (activeTab.value === 'bpmn') {
        await initBpmnViewer()
      }
    })

    onUnmounted(() => {
      if (bpmnViewer.value) {
        bpmnViewer.value.destroy()
      }
    })

    // Observar mudanças na tab ativa
    watch(activeTab, async (newTab) => {
      if (newTab === 'bpmn') {
        // Aguardar um pouco para garantir que o DOM foi renderizado
        await nextTick()
        setTimeout(async () => {
          if (!bpmnViewer.value) {
            await initBpmnViewer()
          }
        }, 100)
      }
    })

    return {
      activeTab,
      tabs,
      process,
      allTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      progressPercentage,
      bpmnLoading,
      getStatusText,
      formatDate,
      zoomIn,
      zoomOut,
      zoomFit,
      resetView
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

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

/* Prevenir seleção de texto no container BPMN */
#bpmn-container {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

#bpmn-container * {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style> 