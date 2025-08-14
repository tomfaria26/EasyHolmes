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
      const processesList = processes.processes || processes || [];
      
      // Log específico para verificar se o processo R70-HIN-PR está sendo retornado
      const r70HinPrProcess = processesList.find(p => p.identifier === 'Auditoria BIM-R70-HIN-PR');
      console.log('Processo R70-HIN-PR encontrado na API:', r70HinPrProcess ? {
        id: r70HinPrProcess.id,
        name: r70HinPrProcess.name,
        identifier: r70HinPrProcess.identifier,
        status: r70HinPrProcess.status
      } : 'NÃO ENCONTRADO');
      
      // Filtrar apenas processos ativos (não cancelados) e adicionar descrição
      const filteredProcesses = processesList
        .filter(process => process.status !== "canceled")
        .map(process => ({
          ...process,
          description: process.description || `Processo ${process.identifier || process.name}`,
          displayName: process.identifier || process.name
        }));
      
      res.json({
        success: true,
        data: { processes: filteredProcesses }
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
        
        if (taskId) {
          if (!allTasks[taskId]) {
            allTasks[taskId] = {
              process_id: id,
              process_identifier: processIdentifier,
              task_name: props.task_name,
              long_link: props.long_link || null,
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

  /**
   * Invalidar cache de um processo específico
   * POST /api/processes/:id/invalidate-cache
   */
  async invalidateProcessCache(req, res) {
    try {
      const { id } = req.params;
      
      // Invalidar cache do processo
      holmesService.invalidateProcessCache(id);
      
      res.json({
        success: true,
        message: `Cache do processo ${id} invalidado com sucesso`
      });
    } catch (error) {
      console.error(`Erro ao invalidar cache do processo ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Limpar todo o cache
   * POST /api/processes/clear-cache
   */
  async clearAllCache(req, res) {
    try {
      // Limpar todo o cache
      holmesService.clearCache();
      
      res.json({
        success: true,
        message: 'Todo o cache foi limpo com sucesso'
      });
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Atualizar dados automaticamente (buscar dados atualizados)
   * POST /api/processes/refresh
   */
  async refreshData(req, res) {
    try {
      console.log('[REFRESH] Iniciando busca de dados atualizados...');
      
      // Buscar processos ativos
      const activeProcesses = await holmesService.getActiveProcesses();
      
      // Buscar tarefas ativas
      const activeTasks = await holmesService.getAllActiveTasks();
      
      console.log(`[REFRESH] Busca concluída: ${activeProcesses.processes?.length || 0} processos ativos, ${activeTasks.length} tarefas`);
      
      res.json({
        success: true,
        message: 'Dados atualizados com sucesso',
        data: {
          processes: activeProcesses.processes || [],
          tasks: activeTasks,
          summary: {
            activeProcesses: activeProcesses.processes?.length || 0,
            activeTasks: activeTasks.length,
            dataFresh: true
          }
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }


}

module.exports = new ProcessController(); 
