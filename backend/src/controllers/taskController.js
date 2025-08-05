const holmesService = require('../services/holmesService');

/**
 * Buscar todas as tarefas de todos os processos (baseado no código Streamlit)
 */
async function getAllTasksFromAllProcesses() {
  try {
    // Buscar todos os processos
    const processesResponse = await holmesService.getProcesses();
    const processes = processesResponse.processes || processesResponse || [];
    
         // Log de todos os processos encontrados
     console.log('Todos os processos encontrados na API Holmes:', processes.map(p => ({
       id: p.id,
       name: p.name,
       identifier: p.identifier,
       status: p.status
     })));
     
     // Filtrar apenas processos "Auditoria BIM" (incluindo closed, excluindo canceled)
     const filteredProcesses = processes.filter(process => 
       process.name === 'Auditoria BIM' && 
       process.status !== 'canceled'
     );
     
     // Log dos processos filtrados
     console.log('Processos filtrados (Auditoria BIM, não cancelados):', filteredProcesses.map(p => ({
       id: p.id,
       name: p.name,
       identifier: p.identifier,
       status: p.status
     })));

    const processIdMap = {};
    const allTasks = {};
    const historyPayload = {
      "filters": [], 
      "page": 1, 
      "per_page": 100, 
      "sortBy": ["created_at", "asc"]
    };

    // Primeira passagem: coletar todas as tarefas de todos os processos
    for (const process of filteredProcesses) {
      const processId = process.id;
      const processIdentifier = process.identifier;
      
      if (!processId || !processIdentifier) continue;
      
      processIdMap[processIdentifier] = processId;
      
      try {
        const historyResponse = await holmesService.getProcessHistory(processId, historyPayload);
        if (!historyResponse || !historyResponse.histories) continue;
        
        let taskCount = 0;
        for (const hist of historyResponse.histories) {
          const props = hist.properties || {};
          const taskId = props.task_id;
          
          if (taskId && props.long_link) {
            if (!allTasks[taskId]) {
              allTasks[taskId] = {
                process_id: processId,
                process_identifier: processIdentifier,
                task_name: props.task_name,
                long_link: props.long_link,
                task_id: taskId,
                created_at: hist.created_at || ''
              };
              taskCount++;
            }
          }
        }
        // Log detalhado para cada processo
        if (processId === '6859b7320b52b4fa33e50298' || processIdentifier === 'Auditoria BIM-R70-HIN-PR') {
          console.log(`[DEBUG] Processo ${processIdentifier} (${processId}) - Tarefas carregadas: ${taskCount}`);
        }
      } catch (error) {
        console.warn(`Erro ao buscar histórico do processo ${processId}:`, error.message);
      }
    }

    // Segunda passagem: verificar tarefas completadas
    for (const process of filteredProcesses) {
      const processId = process.id;
      if (!processId) continue;
      
      try {
        const historyResponse = await holmesService.getProcessHistory(processId, historyPayload);
        if (!historyResponse || !historyResponse.histories) continue;
        
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
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Erro ao verificar tarefas completadas do processo ${processId}:`, error.message);
      }
    }

    // Terceira passagem: buscar detalhes das tarefas pendentes
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

    // Converter para array e formatar (baseado no código Streamlit)
    const allTasksListFinal = Object.values(allTasks)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(task => ({
        id: task.task_id,
        name: task.task_name,
        status: task.is_completed ? 'completed' : 'in-progress',
        processId: task.process_id,
        processName: 'Auditoria BIM',
        processIdentifier: task.process_identifier,
        created_at: task.created_at,
        due_date: task.due_date,
        completion_date: task.completion_date,
        is_completed: task.is_completed || false,
        long_link: task.long_link,
        task_id: task.task_id,
        task_name: task.task_name
      }));

    return allTasksListFinal;
  } catch (error) {
    console.error('Erro ao buscar todas as tarefas:', error);
    return [];
  }
}

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
      
      let allTasks = [];
      
      if (processId) {
        // Buscar tarefas de um processo específico
        const tasks = await this.getTasksFromProcessHistory(processId);
        allTasks = tasks;
      } else {
        // Buscar todas as tarefas de todos os processos (baseado no código Streamlit)
        allTasks = await getAllTasksFromAllProcesses();
      }

      // Aplicar filtros
      if (status) {
        allTasks = allTasks.filter(task => task.status === status);
      }

      // Aplicar paginação
      const paginatedTasks = allTasks.slice(offset, offset + limit);
      
      // Debug: verificar tarefas do processo R70-HIN-PR
      const r70HinPrTasks = allTasks.filter(task => task.processIdentifier === 'Auditoria BIM-R70-HIN-PR');
      console.log(`[DEBUG] Tarefas do processo R70-HIN-PR encontradas: ${r70HinPrTasks.length}`);
      if (r70HinPrTasks.length > 0) {
        console.log('[DEBUG] Primeiras tarefas R70-HIN-PR:', r70HinPrTasks.slice(0, 3).map(t => ({
          id: t.id,
          processIdentifier: t.processIdentifier,
          name: t.name,
          status: t.status
        })));
      }
      
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
      const allTasks = await getAllTasksFromAllProcesses();
      const filteredTasks = allTasks.filter(task => task.status === status);

      // Aplicar paginação
      const paginatedTasks = filteredTasks.slice(offset, offset + limit);
      
      res.json({
        success: true,
        data: {
          tasks: paginatedTasks,
          total: filteredTasks.length,
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

  /**
   * Buscar tarefas do histórico de um processo (baseado no código Streamlit)
   */
  async getTasksFromProcessHistory(processId, processName = 'Auditoria BIM') {
    try {
      const historyPayload = {
        "filters": [], 
        "page": 1, 
        "per_page": 100, 
        "sortBy": ["created_at", "asc"]
      };

      // Buscar histórico do processo
      const historyResponse = await holmesService.getProcessHistory(processId, historyPayload);
      if (!historyResponse || !historyResponse.histories) {
        return [];
      }

      const allTasks = {};
      const processIdentifier = processName; // Simplificado para o exemplo

      // Primeira passagem: coletar todas as tarefas (baseado no código Streamlit)
      for (const hist of historyResponse.histories) {
        const props = hist.properties || {};
        const taskId = props.task_id;
        
        if (taskId && props.long_link) {
          if (!allTasks[taskId]) {
            allTasks[taskId] = {
              process_id: processId,
              process_identifier: processIdentifier,
              task_name: props.task_name,
              long_link: props.long_link,
              task_id: taskId,
              created_at: hist.created_at || '',
              status: 'in-progress' // Status padrão
            };
          }
        }
      }

      // Segunda passagem: verificar tarefas completadas (baseado no código Streamlit)
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

      // Terceira passagem: buscar detalhes das tarefas pendentes (baseado no código Streamlit)
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
        processName: processName,
        processIdentifier: task.process_identifier,
        created_at: task.created_at,
        due_date: task.due_date,
        completion_date: task.completion_date,
        is_completed: task.is_completed || false,
        long_link: task.long_link,
        task_id: task.task_id,
        task_name: task.task_name
      }));

      return tasksArray;
    } catch (error) {
      console.error(`Erro ao buscar tarefas do processo ${processId}:`, error);
      return [];
    }
  }
}

module.exports = new TaskController(); 