import { defineStore } from 'pinia';
import { processService, taskService } from '../services/api';
import { useNotifications } from '../composables/useNotifications';

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
     * Buscar todas as tarefas (sem paginação)
     */
    async fetchTasks(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const { status, processId } = params;
        
        const response = await taskService.getAllTasks({ 
          status,
          processId
        });
        
        if (response.success) {
          this.tasks = response.data.tasks || response.data || [];
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
        const response = await taskService.getAllTasks({ processId });
        
        if (response.success) {
          this.tasks = response.data.tasks || response.data || [];
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
          // Atualizar a tarefa na lista local
          const taskIndex = this.tasks.findIndex(task => task.id === taskId);
          if (taskIndex !== -1) {
            this.tasks[taskIndex].status = newStatus;
            this.updateStats();
          }
          
          const { showSuccess } = useNotifications();
          showSuccess('Status da tarefa atualizado com sucesso!');
          
          return response;
        } else {
          throw new Error(response.message || 'Erro ao atualizar status');
        }
      } catch (error) {
        console.error(`Erro ao atualizar status da tarefa ${taskId}:`, error);
        const { showError } = useNotifications();
        showError('Erro ao atualizar status da tarefa');
        throw error;
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
      this.loading = true;
      this.error = null;

      try {
        await Promise.all([
          this.fetchProcessesInternal(),
          this.fetchTasksInternal()
        ]);
        this.updateStats();
      } catch (error) {
        console.error('Erro ao inicializar dados:', error);
        this.error = 'Falha ao carregar dados';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Buscar processos (versão interna sem gerenciamento de loading)
     */
    async fetchProcessesInternal() {
      try {
        const response = await processService.getProcesses();
        
        if (response.success) {
          // Garantir que processes seja sempre um array
          this.processes = response.data.processes || response.data || [];
        } else {
          this.error = response.message || 'Erro ao buscar processos';
        }
      } catch (error) {
        console.error('Erro ao buscar processos:', error);
        this.error = 'Falha ao carregar processos';
      }
    },

    /**
     * Buscar tarefas (versão interna sem gerenciamento de loading)
     */
    async fetchTasksInternal(params = {}) {
      try {
        const response = await taskService.getAllTasks(params);
        
        if (response.success) {
          this.tasks = response.data.tasks || response.data || [];
        } else {
          this.error = response.message || 'Erro ao buscar tarefas';
        }
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        this.error = 'Falha ao carregar tarefas';
      }
    }
  }
}); 