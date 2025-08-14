const axios = require('axios');

/**
 * Cache simples para evitar requests duplicados
 */
const requestCache = new Map();

// TTLs diferentes para diferentes tipos de dados - REDUZIDOS para evitar problemas de duplicação
const CACHE_TTL = {
  PROCESSES: 2 * 60 * 1000,         // 2 minutos para processos (reduzido de 10)
  PROCESS_HISTORY: 15 * 1000,       // 15 segundos para histórico (reduzido de 30)
  TASK_DETAILS: 1 * 60 * 1000,      // 1 minuto para detalhes de tarefas (reduzido de 5)
  PROPERTY_OPTIONS: 10 * 60 * 1000, // 10 minutos para opções de propriedades (reduzido de 30)
  TEMPLATES: 30 * 60 * 1000,        // 30 minutos para templates (reduzido de 60)
  DEFAULT: 1 * 60 * 1000            // 1 minuto padrão (reduzido de 5)
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
   * Buscar todos os processos (sem cache)
   */
  async getProcesses() {
    try {
      console.log('[CACHE] Buscando processos diretamente do Holmes (sem cache)');
      const response = await holmesClient.get('/processes/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar processos:', error.message);
      throw new Error('Falha ao buscar processos do Holmes');
    }
  }

  /**
   * Buscar processos ativos (sem cache)
   */
  async getActiveProcesses() {
    try {
      console.log('[CACHE] Buscando processos ativos diretamente do Holmes (sem cache)');
      
      // Buscar processos atualizados
      const response = await holmesClient.get('/processes/');
      const allProcesses = response.data;
      
      // Filtrar apenas processos ativos (não cancelados/excluídos)
      const activeProcesses = allProcesses.processes?.filter(process => 
        process.status !== 'canceled' && 
        process.status !== 'cancelled' &&
        process.status !== 'deleted' &&
        process.status !== 'terminated'
      ) || [];
      
      console.log(`[CACHE] ${activeProcesses.length} processos ativos encontrados de ${allProcesses.processes?.length || 0} total`);
      
      return { ...allProcesses, processes: activeProcesses };
    } catch (error) {
      console.error('Erro ao buscar processos ativos:', error.message);
      throw new Error('Falha ao buscar processos ativos do Holmes');
    }
  }

  /**
   * Buscar processo por ID (sem cache)
   */
  async getProcessById(processId) {
    try {
      console.log(`[CACHE] Buscando processo ${processId} diretamente do Holmes (sem cache)`);
      const response = await holmesClient.get(`/processes/${processId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar processo ${processId}:`, error.message);
      throw new Error('Falha ao buscar processo do Holmes');
    }
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
   * Buscar instâncias disponíveis (sem cache)
   */
  async getInstances(entityId, searchPayload = {}) {
    try {
      console.log(`[CACHE] Buscando instâncias diretamente do Holmes (sem cache)`);
      const response = await holmesClient.post(
        `/entities/${entityId}/instances/search`,
        searchPayload
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error.message);
      throw new Error('Falha ao buscar instâncias do Holmes');
    }
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
   * Buscar histórico de um processo (sem cache)
   */
  async getProcessHistory(processId, historyPayload = {}) {
    try {
      console.log(`[CACHE] Buscando histórico do processo ${processId} diretamente do Holmes (sem cache)`);
      const response = await holmesClient.post(
        `/processes/${processId}/history`,
        historyPayload
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar histórico do processo ${processId}:`, error.message);
      throw new Error('Falha ao buscar histórico do processo');
    }
  }

  /**
   * Buscar detalhes de uma tarefa (sem cache)
   */
  async getTaskDetails(taskId) {
    try {
      console.log(`[CACHE] Buscando detalhes da tarefa ${taskId} diretamente do Holmes (sem cache)`);
      const response = await holmesClient.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tarefa ${taskId}:`, error.message);
      throw new Error('Falha ao buscar detalhes da tarefa');
    }
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
   * Gerar XML BPMN a partir dos dados do processo
   */
  generateBpmnXml(processData, tasks = []) {
    const processId = processData.id || 'Process_1';
    const processName = processData.name || 'Processo';
    
    // Criar elementos BPMN baseados nas tarefas
    let taskElements = '';
    let flowElements = '';
    let currentFlowId = 1;
    
    // Adicionar start event
    taskElements += `
    <bpmn:startEvent id="StartEvent_1" name="Início">
      <bpmn:outgoing>Flow_${currentFlowId}</bpmn:outgoing>
    </bpmn:startEvent>`;
    
    // Adicionar tarefas
    tasks.forEach((task, index) => {
      const taskId = `Task_${index + 1}`;
      const taskName = task.name || task.task_name || `Tarefa ${index + 1}`;
      const status = task.status || 'pending';
      
      taskElements += `
    <bpmn:task id="${taskId}" name="${taskName}">
      <bpmn:incoming>Flow_${currentFlowId}</bpmn:incoming>
      <bpmn:outgoing>Flow_${currentFlowId + 1}</bpmn:outgoing>
    </bpmn:task>`;
      
      flowElements += `
    <bpmn:sequenceFlow id="Flow_${currentFlowId}" sourceRef="${index === 0 ? 'StartEvent_1' : `Task_${index}`}" targetRef="${taskId}" />`;
      
      currentFlowId++;
    });
    
    // Adicionar end event se houver tarefas
    if (tasks.length > 0) {
      taskElements += `
    <bpmn:endEvent id="EndEvent_1" name="Fim">
      <bpmn:incoming>Flow_${currentFlowId}</bpmn:incoming>
    </bpmn:endEvent>`;
      
      flowElements += `
    <bpmn:sequenceFlow id="Flow_${currentFlowId}" sourceRef="Task_${tasks.length}" targetRef="EndEvent_1" />`;
    } else {
      // Se não há tarefas, conectar start diretamente ao end
      taskElements += `
    <bpmn:endEvent id="EndEvent_1" name="Fim">
      <bpmn:incoming>Flow_1</bpmn:incoming>
    </bpmn:endEvent>`;
      
      flowElements += `
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1" />`;
    }
    
    // Gerar XML BPMN completo
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="${processId}" name="${processName}" isExecutable="false">
    ${taskElements}
    ${flowElements}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processId}">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="158" y="145" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>`;
    
    // Adicionar elementos visuais para tarefas
    let xPosition = 250;
    tasks.forEach((task, index) => {
      const taskId = `Task_${index + 1}`;
      xml += `
      <bpmndi:BPMNShape id="${taskId}_di" bpmnElement="${taskId}">
        <dc:Bounds x="${xPosition}" y="80" width="100" height="80" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="${xPosition + 10}" y="115" width="80" height="30" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>`;
      xPosition += 150;
    });
    
    // Adicionar end event visual
    xml += `
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="${xPosition}" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="${xPosition + 6}" y="145" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>`;
    
    // Adicionar flows visuais
    let flowXPosition = 188;
    tasks.forEach((task, index) => {
      xml += `
      <bpmndi:BPMNEdge id="Flow_${index + 1}_di" bpmnElement="Flow_${index + 1}">
        <di:waypoint x="${flowXPosition}" y="120" />
        <di:waypoint x="${flowXPosition + 62}" y="120" />
      </bpmndi:BPMNEdge>`;
      flowXPosition += 150;
    });
    
    // Adicionar último flow se houver tarefas
    if (tasks.length > 0) {
      xml += `
      <bpmndi:BPMNEdge id="Flow_${tasks.length + 1}_di" bpmnElement="Flow_${tasks.length + 1}">
        <di:waypoint x="${flowXPosition}" y="120" />
        <di:waypoint x="${flowXPosition + 62}" y="120" />
      </bpmndi:BPMNEdge>`;
    } else {
      xml += `
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="250" y="120" />
      </bpmndi:BPMNEdge>`;
    }
    
    xml += `
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
    
    return xml;
  }

  /**
   * Buscar template BPMN de um processo (com cache)
   */
  async getProcessTemplate(processId) {
    return cachedRequest(`template_${processId}`, async () => {
      try {
        console.log(`[DEBUG] Buscando template para processo ${processId}`)
        const response = await holmesClient.get(
          `/admin/processes/${processId}/troubleshooting/template`
        );
        console.log(`[DEBUG] Resposta da API Holmes para template:`, {
          status: response.status,
          dataType: typeof response.data,
          dataKeys: response.data ? Object.keys(response.data) : 'null/undefined',
          dataPreview: response.data ? JSON.stringify(response.data).substring(0, 500) + '...' : 'null/undefined'
        })
        
        // Verificar se a resposta contém o XML
        if (response.data && response.data.xml) {
          console.log(`[DEBUG] XML encontrado, tamanho: ${response.data.xml.length}`)
          return response.data.xml;
        } else if (response.data && typeof response.data === 'string') {
          console.log(`[DEBUG] Resposta é string direta, tamanho: ${response.data.length}`)
          return response.data;
        } else {
          // Gerar XML BPMN a partir dos dados do processo
          console.log(`[DEBUG] Gerando XML BPMN a partir dos dados do processo`)
          
          // Buscar tarefas do processo para incluir no XML
          let tasks = [];
          try {
            const tasksResponse = await this.getProcessTasks(processId);
            if (tasksResponse && Array.isArray(tasksResponse)) {
              tasks = tasksResponse;
            }
          } catch (error) {
            console.log(`[DEBUG] Erro ao buscar tarefas: ${error.message}`)
          }
          
          const generatedXml = this.generateBpmnXml(response.data, tasks);
          console.log(`[DEBUG] XML gerado com sucesso, tamanho: ${generatedXml.length}`)
          return generatedXml;
        }
      } catch (error) {
        console.error(`Erro ao buscar template do processo ${processId}:`, error.message);
        throw new Error('Falha ao buscar template BPMN do processo');
      }
    }, CACHE_TTL.TEMPLATES);
  }

  /**
   * Buscar tarefas de um processo (sem cache)
   */
  async getProcessTasks(processId) {
    try {
      console.log(`[CACHE] Buscando tarefas do processo ${processId} diretamente do Holmes (sem cache)`);
      const response = await holmesClient.get(`/processes/${processId}/tasks`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tarefas do processo ${processId}:`, error.message);
      throw new Error('Falha ao buscar tarefas do processo');
    }
  }

  /**
   * Buscar todas as tarefas ativas (sem cache)
   */
  async getAllActiveTasks() {
    try {
      console.log('[CACHE] Buscando todas as tarefas ativas diretamente do Holmes (sem cache)');
      
      // Buscar processos ativos
      const activeProcesses = await this.getActiveProcesses();
      
      // Buscar tarefas de todos os processos ativos
      const allTasks = [];
      const activeProcessIds = activeProcesses.processes?.map(p => p.id) || [];
      
      console.log(`[CACHE] Buscando tarefas de ${activeProcessIds.length} processos ativos...`);
      
      for (const processId of activeProcessIds) {
        try {
          const processTasks = await this.getProcessTasks(processId);
          if (processTasks && processTasks.tasks) {
            allTasks.push(...processTasks.tasks);
          }
        } catch (error) {
          console.warn(`[CACHE] Erro ao buscar tarefas do processo ${processId}:`, error.message);
        }
      }
      
      console.log(`[CACHE] ${allTasks.length} tarefas encontradas de processos ativos`);
      
      return allTasks;
    } catch (error) {
      console.error('Erro ao buscar tarefas ativas:', error.message);
      throw new Error('Falha ao buscar tarefas ativas');
    }
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
   * Buscar opções de uma propriedade (sem cache)
   */
  async getPropertyOptions(propertyTypeId) {
    try {
      console.log(`[CACHE] Buscando opções da propriedade ${propertyTypeId} diretamente do Holmes (sem cache)`);
      
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
   * Invalidar cache de um processo específico (útil quando processo é excluído no Holmes)
   */
  invalidateProcessCache(processId) {
    const cacheKeys = Array.from(requestCache.keys());
    const processKeys = cacheKeys.filter(key => 
      key === 'processes' || 
      key === `process_${processId}` || 
      key.startsWith(`history_${processId}_`) ||
      key.startsWith(`process_tasks_${processId}`)
    );
    
    if (processKeys.length > 0) {
      console.log(`[CACHE] Invalidando ${processKeys.length} chaves de cache do processo ${processId}`);
      processKeys.forEach(key => {
        requestCache.delete(key);
        console.log(`[CACHE] Removido: ${key}`);
      });
    }
    
    console.log(`[CACHE] Cache invalidado para processo ${processId}`);
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
