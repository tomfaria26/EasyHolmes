import { defineStore } from 'pinia';
import { processService, taskService } from '../services/api';

export const useProcessesStore = defineStore('processes', {
  state: () => ({
    processes: [],
    tasks: [],
    selectedProcess: null,
    loading: false,
    error: null,
    stats: {
      activeProcesses: 0,
      pendingTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0
    }
  }),

  getters: {
    /**
     * Tarefas agrupadas por status
     */
    tasksByStatus: (state) => {
      const tasks = state.tasks || [];
      return {
        pending: tasks.filter(task => task.status === 'pending'),
        inProgress: tasks.filter(task => task.status === 'in-progress'),
        completed: tasks.filter(task => task.status === 'completed')
      };
    },

    /**
     * Tarefas filtradas por processo
     */
    tasksByProcess: (state) => (processId) => {
      return (state.tasks || []).filter(task => task.processId === processId);
    },

    /**
     * Processos ativos
     */
    activeProcesses: (state) => {
      return (state.processes || []).filter(process => process.status === 'active');
    }
  },

  actions: {
    /**
     * Buscar todos os processos
     */
    async fetchProcesses() {
      this.loading = true;
      this.error = null;

      try {
        const response = await processService.getProcesses();
        
        if (response.success) {
          // Garantir que processes seja sempre um array
          this.processes = response.data.processes || response.data || [];
          this.updateStats();
        } else {
          this.error = response.message || 'Erro ao buscar processos';
        }
      } catch (error) {
        console.error('Erro ao buscar processos:', error);
        this.error = 'Falha ao carregar processos';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Buscar tarefas
     */
    async fetchTasks(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await taskService.getAllTasks(params);
        
        if (response.success) {
          this.tasks = response.data.tasks || [];
          this.updateStats();
        } else {
          this.error = response.message || 'Erro ao buscar tarefas';
        }
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        this.error = 'Falha ao carregar tarefas';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Buscar tarefas por status
     */
    async fetchTasksByStatus(status, params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await taskService.getTasksByStatus(status, params);
        
        if (response.success) {
          // Atualizar apenas as tarefas do status específico
          const otherTasks = this.tasks.filter(task => task.status !== status);
          this.tasks = [...otherTasks, ...response.data.tasks];
          this.updateStats();
        } else {
          this.error = response.message || 'Erro ao buscar tarefas';
        }
      } catch (error) {
        console.error(`Erro ao buscar tarefas por status ${status}:`, error);
        this.error = 'Falha ao carregar tarefas';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Buscar tarefas de um processo específico
     */
    async fetchProcessTasks(processId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await processService.getProcessTasks(processId);
        
        if (response.success) {
          // Substituir todas as tarefas pelas do processo selecionado
          this.tasks = (response.data || []).map(task => ({
            ...task,
            processId: processId
          }));
          this.updateStats();
        } else {
          this.error = response.message || 'Erro ao buscar tarefas do processo';
        }
      } catch (error) {
        console.error(`Erro ao buscar tarefas do processo ${processId}:`, error);
        this.error = 'Falha ao carregar tarefas do processo';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Atualizar status de uma tarefa
     */
    async updateTaskStatus(taskId, newStatus) {
      try {
        const response = await taskService.updateTaskStatus(taskId, newStatus);
        
        if (response.success) {
          // Atualizar a tarefa na lista
          const taskIndex = this.tasks.findIndex(task => task.id === taskId);
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], status: newStatus };
            this.updateStats();
          }
          return { success: true };
        } else {
          return { success: false, error: response.message };
        }
      } catch (error) {
        console.error(`Erro ao atualizar tarefa ${taskId}:`, error);
        return { success: false, error: 'Falha ao atualizar tarefa' };
      }
    },

    /**
     * Selecionar processo
     */
    selectProcess(process) {
      this.selectedProcess = process;
    },

    /**
     * Limpar processo selecionado
     */
    clearSelectedProcess() {
      this.selectedProcess = null;
    },

    /**
     * Atualizar estatísticas
     */
    updateStats() {
      this.stats = {
        activeProcesses: this.activeProcesses.length,
        pendingTasks: this.tasksByStatus.pending.length,
        inProgressTasks: this.tasksByStatus.inProgress.length,
        completedTasks: this.tasksByStatus.completed.length
      };
    },

    /**
     * Inicializar dados
     */
    async initializeData() {
      await Promise.all([
        this.fetchProcesses(),
        this.fetchTasks()
      ]);
    }
  }
}); 