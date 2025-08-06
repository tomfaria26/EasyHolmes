const axios = require('axios');

/**
 * Cache simples para evitar requests duplicados
 */
const requestCache = new Map();

// TTLs diferentes para diferentes tipos de dados
const CACHE_TTL = {
  PROCESSES: 10 * 60 * 1000,        // 10 minutos para processos
  PROCESS_HISTORY: 30 * 1000,       // 30 segundos para histórico (muda muito frequentemente)
  TASK_DETAILS: 5 * 60 * 1000,      // 5 minutos para detalhes de tarefas
  PROPERTY_OPTIONS: 30 * 60 * 1000, // 30 minutos para opções de propriedades
  TEMPLATES: 60 * 60 * 1000,        // 1 hora para templates
  DEFAULT: 5 * 60 * 1000            // 5 minutos padrão
};

/**
 * Cliente HTTP para APIs Holmes - Otimizado
 */
const holmesClient = axios.create({
  baseURL: process.env.HOLMES_API_BASE_URL || 'https://app-api.holmesdoc.io/v1',
  timeout: 90000, // Aumentado para 90 segundos
  headers: {
    'Content-Type': 'application/json',
    'api_token': process.env.API_TOKEN
  }
});

/**
 * Função para fazer requests com cache
 */
async function cachedRequest(key, requestFn, ttl = CACHE_TTL.DEFAULT) {
  const now = Date.now();
  const cached = requestCache.get(key);
  
  if (cached && (now - cached.timestamp) < ttl) {
    console.log(`[CACHE] Hit para: ${key}`);
    return cached.data;
  }
  
  console.log(`[CACHE] Miss para: ${key}`);
  const data = await requestFn();
  requestCache.set(key, { data, timestamp: now });
  return data;
}

/**
 * Função para fazer múltiplos requests em paralelo
 */
async function parallelRequests(requests) {
  try {
    const results = await Promise.all(requests);
    return results;
  } catch (error) {
    console.error('Erro em requests paralelos:', error);
    throw error;
  }
}

/**
 * Função para invalidar cache de histórico de processos
 */
function invalidateHistoryCache(taskId, operation = 'operação') {
  const cacheKeys = Array.from(requestCache.keys());
  const historyKeys = cacheKeys.filter(key => key.startsWith('history_'));
  
  if (historyKeys.length > 0) {
    console.log(`[CACHE] Invalidando ${historyKeys.length} chaves de histórico após ${operation} da tarefa ${taskId}`);
    historyKeys.forEach(key => {
      requestCache.delete(key);
      console.log(`[CACHE] Removido: ${key}`);
    });
  }
  
  console.log(`[CACHE] Cache invalidado para tarefa ${taskId} e histórico de processos`);
}

/**
 * Função para invalidar cache de um processo específico
 */
function invalidateProcessHistoryCache(processId, taskId, operation = 'operação') {
  const cacheKeys = Array.from(requestCache.keys());
  const processHistoryKeys = cacheKeys.filter(key => key.startsWith(`history_${processId}_`));
  
  if (processHistoryKeys.length > 0) {
    console.log(`[CACHE] Invalidando ${processHistoryKeys.length} chaves de histórico do processo ${processId} após ${operation} da tarefa ${taskId}`);
    processHistoryKeys.forEach(key => {
      requestCache.delete(key);
      console.log(`[CACHE] Removido: ${key}`);
    });
  }
  
  console.log(`[CACHE] Cache invalidado para processo ${processId} e tarefa ${taskId}`);
}

/**
 * Serviço para integração com APIs Holmes - Otimizado
 */
class HolmesService {
  /**
   * Buscar todos os processos (com cache)
   */
  async getProcesses() {
    return cachedRequest('processes', async () => {
      try {
        const response = await holmesClient.get('/processes/');
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar processos:', error.message);
        throw new Error('Falha ao buscar processos do Holmes');
      }
    }, CACHE_TTL.PROCESSES);
  }

  /**
   * Buscar processo por ID (com cache)
   */
  async getProcessById(processId) {
    return cachedRequest(`process_${processId}`, async () => {
      try {
        const response = await holmesClient.get(`/processes/${processId}`);
        return response.data;
      } catch (error) {
        console.error(`Erro ao buscar processo ${processId}:`, error.message);
        throw new Error('Falha ao buscar processo do Holmes');
      }
    }, CACHE_TTL.DEFAULT);
  }

  /**
   * Iniciar um novo processo
   */
  async startWorkflow(workflowId, data = {}) {
    try {
      const response = await holmesClient.post(
        `/workflows/${workflowId}/start`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao iniciar workflow:', error.message);
      throw new Error('Falha ao iniciar processo no Holmes');
    }
  }

  /**
   * Buscar instâncias disponíveis (com cache)
   */
  async getInstances(entityId, searchPayload = {}) {
    const cacheKey = `instances_${entityId}_${JSON.stringify(searchPayload)}`;
    return cachedRequest(cacheKey, async () => {
      try {
        const response = await holmesClient.post(
          `/entities/${entityId}/instances/search`,
          searchPayload
        );
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar instâncias:', error.message);
        throw new Error('Falha ao buscar instâncias do Holmes');
      }
    }, CACHE_TTL.DEFAULT);
  }

  /**
   * Buscar instâncias para dropdown (formato simplificado)
   */
  async getInstancesForDropdown() {
    const entityId = '68597a8e0b52b4fa33e34995'; // ID da entidade das instâncias
    const searchPayload = {
      "query": {
        "from": 0,
        "size": 200,
        "order": "asc",
        "groups": [{
          "match_all": true,
          "terms": [{
            "field": "entity_id",
            "type": "is",
            "value": entityId
          }]
        }],
        "sort": "8547a640-504b-11f0-a2c8-75d9e0938171"
      }
    };

    try {
      const data = await this.getInstances(entityId, searchPayload);
      const instances = [];
      
      if (data && data.docs) {
        for (const doc of data.docs) {
          if (doc.props && doc.props.length > 0 && doc.props[0].value) {
            instances.push({
              id: doc.instance_id,
              name: doc.props[0].value
            });
          }
        }
      }
      
      return instances;
    } catch (error) {
      console.error('Erro ao buscar instâncias para dropdown:', error);
      throw new Error('Falha ao buscar instâncias disponíveis');
    }
  }

  /**
   * Criar novo processo
   */
  async createProcess(disciplina, etapa, instanciaId) {
    try {
      const workflowId = '684b215594374c145b750317'; // ID do workflow
      const startPayload = {
        "workflow": {
          "start_event": "StartEvent_1",
          "property_values": [
            {
              "id": "f59f23f0-4aec-11f0-83f5-4dfed4731510",
              "value": disciplina
            },
            {
              "id": "f1f6dc70-4aec-11f0-83f5-4dfed4731510",
              "value": etapa
            }
          ],
          "instance_id": instanciaId,
          "whats": "",
          "documents": [],
          "test": false,
          "run_automations": true,
          "run_triggers": true
        }
      };

      console.log(`[DEBUG] Criando processo com payload:`, JSON.stringify(startPayload, null, 2));
      
      const response = await holmesClient.post(`/workflows/${workflowId}/start`, startPayload);
      
      // Invalidar cache de processos após criação
      requestCache.delete('processes');
      
      return response.data;
    } catch (error) {
      console.error('Erro ao criar processo:', error.message);
      if (error.response) {
        console.error(`[DEBUG] Status code: ${error.response.status}`);
        console.error(`[DEBUG] Response data:`, JSON.stringify(error.response.data, null, 2));
      }
      throw new Error('Falha ao criar processo no Holmes');
    }
  }

  /**
   * Buscar histórico de um processo (com cache)
   */
  async getProcessHistory(processId, historyPayload = {}) {
    const cacheKey = `history_${processId}_${JSON.stringify(historyPayload)}`;
    return cachedRequest(cacheKey, async () => {
      try {
        const response = await holmesClient.post(
          `/processes/${processId}/history`,
          historyPayload
        );
        return response.data;
      } catch (error) {
        console.error(`Erro ao buscar histórico do processo ${processId}:`, error.message);
        throw new Error('Falha ao buscar histórico do processo');
      }
    }, CACHE_TTL.PROCESS_HISTORY);
  }

  /**
   * Buscar detalhes de uma tarefa (com cache)
   */
  async getTaskDetails(taskId) {
    return cachedRequest(`task_${taskId}`, async () => {
      try {
        const response = await holmesClient.get(`/tasks/${taskId}`);
        return response.data;
      } catch (error) {
        console.error(`Erro ao buscar tarefa ${taskId}:`, error.message);
        throw new Error('Falha ao buscar detalhes da tarefa');
      }
    }, CACHE_TTL.TASK_DETAILS);
  }

  /**
   * Buscar múltiplos detalhes de tarefas em paralelo (NOVO)
   */
  async getMultipleTaskDetails(taskIds) {
    try {
      console.log(`[PERFORMANCE] Buscando ${taskIds.length} tarefas em paralelo`);
      const requests = taskIds.map(taskId => this.getTaskDetails(taskId));
      const results = await parallelRequests(requests);
      
      // Criar um mapa de resultados
      const taskDetailsMap = {};
      taskIds.forEach((taskId, index) => {
        taskDetailsMap[taskId] = results[index];
      });
      
      return taskDetailsMap;
    } catch (error) {
      console.error('Erro ao buscar múltiplas tarefas:', error);
      throw new Error('Falha ao buscar detalhes das tarefas');
    }
  }

  /**
   * Buscar template BPMN de um processo (com cache)
   */
  async getProcessTemplate(processId) {
    return cachedRequest(`template_${processId}`, async () => {
      try {
        const response = await holmesClient.get(
          `/admin/processes/${processId}/troubleshooting/template`
        );
        return response.data;
      } catch (error) {
        console.error(`Erro ao buscar template do processo ${processId}:`, error.message);
        throw new Error('Falha ao buscar template BPMN do processo');
      }
    }, CACHE_TTL.TEMPLATES);
  }

  /**
   * Buscar tarefas de um processo (com cache)
   */
  async getProcessTasks(processId) {
    return cachedRequest(`process_tasks_${processId}`, async () => {
      try {
        const response = await holmesClient.get(`/processes/${processId}/tasks`);
        return response.data;
      } catch (error) {
        console.error(`Erro ao buscar tarefas do processo ${processId}:`, error.message);
        throw new Error('Falha ao buscar tarefas do processo');
      }
    }, CACHE_TTL.DEFAULT);
  }

  /**
   * Atualizar status de uma tarefa
   */
  async updateTaskStatus(taskId, status) {
    try {
      const response = await holmesClient.patch(`/tasks/${taskId}`, {
        status: status
      });
      
      // Invalidar cache da tarefa após atualização bem-sucedida
      requestCache.delete(`task_${taskId}`);
      
      // Invalidar cache de histórico de processos para forçar atualização da lista de tarefas
      invalidateHistoryCache(taskId, 'atualização de status');
      
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar tarefa ${taskId}:`, error.message);
      throw new Error('Falha ao atualizar status da tarefa');
    }
  }

  /**
   * Buscar opções de uma propriedade (com cache)
   */
  async getPropertyOptions(propertyTypeId) {
    return cachedRequest(`property_options_${propertyTypeId}`, async () => {
      try {
        console.log(`[DEBUG] Buscando opções para propertyTypeId: ${propertyTypeId}`);
        
        // Payload baseado no exemplo do Python
        const searchPayload = {
          "query": {
            "from": 0,
            "size": 200,
            "order": "asc",
            "groups": [{
              "match_all": true,
              "terms": [{
                "field": "entity_id",
                "type": "is",
                "value": propertyTypeId
              }]
            }],
            "sort": "8547a640-504b-11f0-a2c8-75d9e0938171"
          }
        };
        
        const response = await holmesClient.post(`/entities/${propertyTypeId}/instances/search`, searchPayload);
        console.log(`[DEBUG] Resposta da API para ${propertyTypeId}:`, JSON.stringify(response.data, null, 2));
        return response.data;
      } catch (error) {
        console.error(`Erro ao buscar opções da propriedade ${propertyTypeId}:`, error.message);
        if (error.response) {
          console.error(`[DEBUG] Status code: ${error.response.status}`);
          console.error(`[DEBUG] Response data:`, JSON.stringify(error.response.data, null, 2));
        }
        throw new Error('Falha ao buscar opções da propriedade');
      }
    }, CACHE_TTL.PROPERTY_OPTIONS);
  }

  /**
   * Executar ação de uma tarefa (concluir tarefa)
   */
  async executeTaskAction(taskId, actionId, propertyValues = []) {
    try {
      const payload = {
        task: {
          action_id: actionId,
          property_values: propertyValues,
          confirm_action: false
        }
      };

      console.log(`[DEBUG] Executando ação da tarefa ${taskId} com action_id: ${actionId}`);
      console.log(`[DEBUG] Property values:`, JSON.stringify(propertyValues, null, 2));
      console.log(`[DEBUG] Payload enviado:`, JSON.stringify(payload, null, 2));

      const response = await holmesClient.post(`/tasks/${taskId}/action`, payload);
      
      // Invalidar cache da tarefa após execução bem-sucedida
      requestCache.delete(`task_${taskId}`);
      
      // Invalidar cache de histórico de processos para forçar atualização da lista de tarefas
      invalidateHistoryCache(taskId, 'conclusão de ação');
      
      return response.data;
    } catch (error) {
      console.error(`Erro ao executar ação da tarefa ${taskId}:`, error.message);
      
      // Log detalhes adicionais do erro
      if (error.response) {
        console.error(`[DEBUG] Status code: ${error.response.status}`);
        console.error(`[DEBUG] Response data:`, JSON.stringify(error.response.data, null, 2));
        console.error(`[DEBUG] Response headers:`, JSON.stringify(error.response.headers, null, 2));
        
        // Tratar erros específicos da API do HOLMES
        if (error.response.status === 412) {
          if (error.response.data?.error === 'task_not_assigned_to_user') {
            throw new Error('Esta tarefa não está atribuída ao seu usuário. Você não tem permissão para concluí-la.');
          }
        }
      }
      
      throw new Error('Falha ao executar ação da tarefa');
    }
  }

  /**
   * Limpar cache (útil para testes ou quando dados mudam)
   */
  clearCache() {
    requestCache.clear();
    console.log('[CACHE] Cache limpo');
  }

  /**
   * Obter estatísticas do cache
   */
  getCacheStats() {
    return {
      size: requestCache.size,
      keys: Array.from(requestCache.keys())
    };
  }
}

module.exports = new HolmesService(); 
