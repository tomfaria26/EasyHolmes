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
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20,
      hasMore: false
    },
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
     * Buscar tarefas com paginação
     */
    async fetchTasks(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const { page = 1, limit = 20, status, processId } = params;
        const offset = (page - 1) * limit;
        
        const response = await taskService.getAllTasks({ 
          limit, 
          offset, 
          page,
          status,
          processId
        });
        
        if (response.success) {
          this.tasks = response.data.tasks || response.data || [];
          
          // Atualizar informações de paginação
          this.pagination = {
            currentPage: page,
            totalPages: Math.ceil(response.data.total / limit),
            totalItems: response.data.total,
            itemsPerPage: limit,
            hasMore: response.data.hasMore || false
          };
          
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
     * Carregar próxima página de tarefas
     */
    async loadNextPage() {
      if (!this.pagination.hasMore || this.loading) return;
      
      const nextPage = this.pagination.currentPage + 1;
      await this.fetchTasks({ 
        page: nextPage, 
        limit: this.pagination.itemsPerPage 
      });
    },

    /**
     * Carregar página específica de tarefas
     */
    async loadPage(page) {
      if (page < 1 || page > this.pagination.totalPages) return;
      
      await this.fetchTasks({ 
        page, 
        limit: this.pagination.itemsPerPage 
      });
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
      const { showSuccess, showError } = useNotifications();
      
      try {
        const response = await taskService.updateTaskStatus(taskId, newStatus);
        
        if (response.success) {
          // Atualizar a tarefa na lista
          const taskIndex = this.tasks.findIndex(task => task.id === taskId);
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], status: newStatus };
            this.updateStats();
          }
          showSuccess('Status da tarefa atualizado com sucesso!');
          return { success: true };
        } else {
          showError(`Erro ao atualizar tarefa: ${response.message}`);
          return { success: false, error: response.message };
        }
      } catch (error) {
        console.error(`Erro ao atualizar tarefa ${taskId}:`, error);
        showError('Falha ao atualizar tarefa');
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
        const { page = 1, limit = 20 } = params;
        const offset = (page - 1) * limit;
        
        const response = await taskService.getAllTasks({ 
          limit, 
          offset, 
          page
        });
        
        if (response.success) {
          this.tasks = response.data.tasks || response.data || [];
          
          // Atualizar informações de paginação
          this.pagination = {
            currentPage: page,
            totalPages: Math.ceil(response.data.total / limit),
            totalItems: response.data.total,
            itemsPerPage: limit,
            hasMore: response.data.hasMore || false
          };
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