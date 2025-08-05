<template>
  <div class="space-y-6">
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">
        Dashboard
      </h1>
      <p class="text-gray-600">
        Bem-vindo ao EasyHolmes! Aqui você pode gerenciar seus processos BPMN.
      </p>
    </div>

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
            <p class="text-2xl font-bold text-blue-600">{{ activeProcesses }}</p>
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
            <p class="text-2xl font-bold text-yellow-600">{{ pendingTasks }}</p>
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
            <p class="text-2xl font-bold text-green-600">{{ completedTasks }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Botão para ir para o quadro de tarefas -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Quadro de Tarefas</h3>
          <p class="text-gray-600">Visualize e gerencie suas tarefas em estilo KanBan</p>
        </div>
        <router-link
          to="/tasks"
          class="btn btn-primary"
        >
          Ver Tarefas
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Dashboard',
  setup() {
    const activeProcesses = ref(0)
    const pendingTasks = ref(0)
    const completedTasks = ref(0)

    onMounted(() => {
      // Simular dados por enquanto
      activeProcesses.value = 5
      pendingTasks.value = 12
      completedTasks.value = 28
    })

    return {
      activeProcesses,
      pendingTasks,
      completedTasks
    }
  }
}
</script> 