const holmesService = require('../services/holmesService');

/**
 * Controlador de processos
 */
class ProcessController {
  /**
   * Buscar todos os processos
   * GET /api/processes
   */
  async getProcesses(req, res) {
    try {
      const processes = await holmesService.getProcesses();
      
      res.json({
        success: true,
        data: processes
      });
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Buscar processo por ID
   * GET /api/processes/:id
   */
  async getProcessById(req, res) {
    try {
      const { id } = req.params;
      const process = await holmesService.getProcessById(id);
      
      res.json({
        success: true,
        data: process
      });
    } catch (error) {
      console.error(`Erro ao buscar processo ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Iniciar novo processo
   * POST /api/processes/start
   */
  async startProcess(req, res) {
    try {
      const { workflowId, data } = req.body;
      
      if (!workflowId) {
        return res.status(400).json({
          error: 'Workflow ID é obrigatório'
        });
      }

      const result = await holmesService.startWorkflow(workflowId, data);
      
      res.json({
        success: true,
        message: 'Processo iniciado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao iniciar processo:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Buscar tarefas de um processo
   * GET /api/processes/:id/tasks
   */
  async getProcessTasks(req, res) {
    try {
      const { id } = req.params;
      const tasks = await holmesService.getProcessTasks(id);
      
      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error(`Erro ao buscar tarefas do processo ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Buscar histórico de um processo
   * POST /api/processes/:id/history
   */
  async getProcessHistory(req, res) {
    try {
      const { id } = req.params;
      const { payload } = req.body;
      
      const history = await holmesService.getProcessHistory(id, payload);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error(`Erro ao buscar histórico do processo ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Buscar template BPMN de um processo
   * GET /api/processes/:id/template
   */
  async getProcessTemplate(req, res) {
    try {
      const { id } = req.params;
      const template = await holmesService.getProcessTemplate(id);
      
      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error(`Erro ao buscar template do processo ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}

module.exports = new ProcessController(); 