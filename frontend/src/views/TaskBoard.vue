<template>
  <div class="space-y-6">
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">
          Quadro de Tarefas
        </h1>
        <button class="btn btn-primary">
          Nova Tarefa
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex space-x-4 mb-6">
        <select class="input w-64">
          <option value="">Todos os Processos</option>
          <option value="process1">Processo 1</option>
          <option value="process2">Processo 2</option>
        </select>
        <select class="input w-48">
          <option value="">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="in-progress">Em Andamento</option>
          <option value="completed">Concluído</option>
        </select>
      </div>

      <!-- KanBan Board -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Coluna: Pendente -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span class="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
            Pendente
            <span class="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
              {{ pendingTasks.length }}
            </span>
          </h3>
          
          <div class="space-y-3">
            <div
              v-for="task in pendingTasks"
              :key="task.id"
              class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            >
              <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ task.process }}</p>
              <div class="flex justify-between items-center mt-3">
                <span class="text-xs text-gray-500">{{ task.createdAt }}</span>
                <span class="text-xs text-red-600">{{ task.sla }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna: Em Andamento -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Em Andamento
            <span class="ml-auto bg-yellow-200 text-yellow-700 px-2 py-1 rounded-full text-sm">
              {{ inProgressTasks.length }}
            </span>
          </h3>
          
          <div class="space-y-3">
            <div
              v-for="task in inProgressTasks"
              :key="task.id"
              class="bg-white rounded-lg p-4 shadow-sm border border-yellow-200 cursor-pointer hover:shadow-md transition-shadow"
            >
              <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ task.process }}</p>
              <div class="flex justify-between items-center mt-3">
                <span class="text-xs text-gray-500">{{ task.createdAt }}</span>
                <span class="text-xs text-yellow-600">{{ task.sla }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna: Concluído -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Concluído
            <span class="ml-auto bg-green-200 text-green-700 px-2 py-1 rounded-full text-sm">
              {{ completedTasks.length }}
            </span>
          </h3>
          
          <div class="space-y-3">
            <div
              v-for="task in completedTasks"
              :key="task.id"
              class="bg-white rounded-lg p-4 shadow-sm border border-green-200 cursor-pointer hover:shadow-md transition-shadow"
            >
              <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ task.process }}</p>
              <div class="flex justify-between items-center mt-3">
                <span class="text-xs text-gray-500">{{ task.createdAt }}</span>
                <span class="text-xs text-green-600">{{ task.sla }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'TaskBoard',
  setup() {
    const pendingTasks = ref([])
    const inProgressTasks = ref([])
    const completedTasks = ref([])

    onMounted(() => {
      // Simular dados por enquanto
      pendingTasks.value = [
        {
          id: 1,
          title: 'Revisar Documento',
          process: 'Processo de Aprovação',
          createdAt: '2024-01-15 10:30',
          sla: 'SLA: 2 dias'
        },
        {
          id: 2,
          title: 'Validar Dados',
          process: 'Processo de Validação',
          createdAt: '2024-01-15 09:15',
          sla: 'SLA: 1 dia'
        }
      ]

      inProgressTasks.value = [
        {
          id: 3,
          title: 'Análise Técnica',
          process: 'Processo de Desenvolvimento',
          createdAt: '2024-01-14 14:20',
          sla: 'SLA: 3 dias'
        }
      ]

      completedTasks.value = [
        {
          id: 4,
          title: 'Configuração Inicial',
          process: 'Processo de Setup',
          createdAt: '2024-01-13 16:45',
          sla: 'SLA: 1 dia'
        },
        {
          id: 5,
          title: 'Teste de Integração',
          process: 'Processo de QA',
          createdAt: '2024-01-12 11:30',
          sla: 'SLA: 2 dias'
        }
      ]
    })

    return {
      pendingTasks,
      inProgressTasks,
      completedTasks
    }
  }
}
</script> 