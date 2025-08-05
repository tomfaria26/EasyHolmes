const holmesService = require('../services/holmesService');

/**
 * Controlador de tarefas
 */
class TaskController {
  /**
   * Buscar detalhes de uma tarefa
   * GET /api/tasks/:id
   */
  async getTaskDetails(req, res) {
    try {
      const { id } = req.params;
      const task = await holmesService.getTaskDetails(id);
      
      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error(`Erro ao buscar tarefa ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Atualizar status de uma tarefa
   * PATCH /api/tasks/:id/status
   */
  async updateTaskStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          error: 'Status é obrigatório'
        });
      }

      const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Status inválido',
          message: 'Status deve ser: pending, in-progress, completed ou cancelled'
        });
      }

      const result = await holmesService.updateTaskStatus(id, status);
      
      res.json({
        success: true,
        message: 'Status da tarefa atualizado com sucesso',
        data: result
      });
    } catch (error) {
      console.error(`Erro ao atualizar tarefa ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Buscar todas as tarefas (com filtros opcionais)
   * GET /api/tasks
   */
  async getAllTasks(req, res) {
    try {
      const { processId, status, limit = 50, offset = 0 } = req.query;
      
      // Por enquanto, vamos buscar todas as tarefas dos processos
      // Em uma implementação mais robusta, poderíamos ter um endpoint específico
      let allTasks = [];
      
      if (processId) {
        // Buscar tarefas de um processo específico
        const tasks = await holmesService.getProcessTasks(processId);
        allTasks = tasks;
      } else {
        // Buscar todos os processos e suas tarefas
        const processes = await holmesService.getProcesses();
        
        for (const process of processes.slice(0, 10)) { // Limitar a 10 processos
          try {
            const tasks = await holmesService.getProcessTasks(process.id);
            allTasks = allTasks.concat(tasks.map(task => ({
              ...task,
              processName: process.name,
              processId: process.id
            })));
          } catch (error) {
            console.warn(`Erro ao buscar tarefas do processo ${process.id}:`, error.message);
          }
        }
      }

      // Aplicar filtros
      if (status) {
        allTasks = allTasks.filter(task => task.status === status);
      }

      // Aplicar paginação
      const paginatedTasks = allTasks.slice(offset, offset + limit);
      
      res.json({
        success: true,
        data: {
          tasks: paginatedTasks,
          total: allTasks.length,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Buscar tarefas por status
   * GET /api/tasks/status/:status
   */
  async getTasksByStatus(req, res) {
    try {
      const { status } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Status inválido',
          message: 'Status deve ser: pending, in-progress, completed ou cancelled'
        });
      }

      // Buscar todas as tarefas e filtrar por status
      const processes = await holmesService.getProcesses();
      let allTasks = [];
      
      for (const process of processes.slice(0, 10)) {
        try {
          const tasks = await holmesService.getProcessTasks(process.id);
          const filteredTasks = tasks
            .filter(task => task.status === status)
            .map(task => ({
              ...task,
              processName: process.name,
              processId: process.id
            }));
          allTasks = allTasks.concat(filteredTasks);
        } catch (error) {
          console.warn(`Erro ao buscar tarefas do processo ${process.id}:`, error.message);
        }
      }

      // Aplicar paginação
      const paginatedTasks = allTasks.slice(offset, offset + limit);
      
      res.json({
        success: true,
        data: {
          tasks: paginatedTasks,
          total: allTasks.length,
          status,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error(`Erro ao buscar tarefas por status ${req.params.status}:`, error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}

module.exports = new TaskController(); 