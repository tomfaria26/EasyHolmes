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
      
      // Usar a mesma lógica do taskController para buscar tarefas do histórico
      const historyPayload = {
        "filters": [], 
        "page": 1, 
        "per_page": 100, 
        "sortBy": ["created_at", "asc"]
      };

      const historyResponse = await holmesService.getProcessHistory(id, historyPayload);
      if (!historyResponse || !historyResponse.histories) {
        return res.json({
          success: true,
          data: []
        });
      }

      const allTasks = {};
      
      // Buscar o identifier do processo
      let processIdentifier = 'Auditoria BIM'; // Fallback
      try {
        const processResponse = await holmesService.getProcessById(id);
        if (processResponse && processResponse.identifier) {
          processIdentifier = processResponse.identifier;
        }
      } catch (error) {
        console.warn(`Erro ao buscar detalhes do processo ${id}:`, error.message);
      }

      // Primeira passagem: coletar todas as tarefas do histórico
      for (const hist of historyResponse.histories) {
        const props = hist.properties || {};
        const taskId = props.task_id;
        
        if (taskId && props.long_link) {
          if (!allTasks[taskId]) {
            allTasks[taskId] = {
              process_id: id,
              process_identifier: processIdentifier,
              task_name: props.task_name,
              long_link: props.long_link,
              task_id: taskId,
              created_at: hist.created_at || '',
              status: 'in-progress'
            };
          }
        }
      }

      // Segunda passagem: verificar tarefas completadas
      for (const hist of historyResponse.histories) {
        if (hist.key === 'history.take_action') {
          const props = hist.properties || {};
          const taskId = props.task_id;
          
          if (taskId && allTasks[taskId]) {
            const completionDate = hist.created_at;
            const currentCompletion = allTasks[taskId].completion_date;
            
            if (!currentCompletion || completionDate > currentCompletion) {
              allTasks[taskId].is_completed = true;
              allTasks[taskId].completion_date = completionDate;
              allTasks[taskId].status = 'completed';
            }
          }
        }
      }

      // Terceira passagem: buscar detalhes para tarefas pendentes
      for (const taskId in allTasks) {
        const taskDetails = allTasks[taskId];
        if (!taskDetails.is_completed) {
          try {
            const taskApiData = await holmesService.getTaskDetails(taskId);
            if (taskApiData && taskApiData.due_date) {
              taskDetails.due_date = taskApiData.due_date;
            }
          } catch (error) {
            console.warn(`Erro ao buscar detalhes da tarefa ${taskId}:`, error.message);
          }
        }
      }

      // Converter para array e formatar
      const tasksArray = Object.values(allTasks).map(task => ({
        id: task.task_id,
        name: task.task_name,
        status: task.status,
        processId: task.process_id,
        processName: processIdentifier,
        processIdentifier: task.process_identifier,
        created_at: task.created_at,
        due_date: task.due_date,
        completion_date: task.completion_date,
        is_completed: task.is_completed || false,
        long_link: task.long_link,
        task_id: task.task_id,
        task_name: task.task_name
      }));

      res.json({
        success: true,
        data: tasksArray
      });
    } catch (error) {
      const { id } = req.params;
      console.error(`Erro ao buscar tarefas do processo ${id}:`, error);
      
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao buscar tarefas do processo'
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