const axios = require('axios');

/**
 * Cliente HTTP para APIs Holmes
 */
const holmesClient = axios.create({
  baseURL: process.env.HOLMES_API_BASE_URL || 'https://app-api.holmesdoc.io/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.API_TOKEN}`
  }
});

/**
 * Serviço para integração com APIs Holmes
 */
class HolmesService {
  /**
   * Buscar todos os processos
   */
  async getProcesses() {
    try {
      const response = await holmesClient.get('/processes/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar processos:', error.message);
      throw new Error('Falha ao buscar processos do Holmes');
    }
  }

  /**
   * Buscar processo por ID
   */
  async getProcessById(processId) {
    try {
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
   * Buscar instâncias disponíveis
   */
  async getInstances(entityId, searchPayload = {}) {
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
  }

  /**
   * Buscar histórico de um processo
   */
  async getProcessHistory(processId, historyPayload = {}) {
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
  }

  /**
   * Buscar detalhes de uma tarefa
   */
  async getTaskDetails(taskId) {
    try {
      const response = await holmesClient.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tarefa ${taskId}:`, error.message);
      throw new Error('Falha ao buscar detalhes da tarefa');
    }
  }

  /**
   * Buscar template BPMN de um processo
   */
  async getProcessTemplate(processId) {
    try {
      const response = await holmesClient.get(
        `/admin/processes/${processId}/troubleshooting/template`
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar template do processo ${processId}:`, error.message);
      throw new Error('Falha ao buscar template BPMN do processo');
    }
  }

  /**
   * Buscar tarefas de um processo
   */
  async getProcessTasks(processId) {
    try {
      const response = await holmesClient.get(`/processes/${processId}/tasks`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tarefas do processo ${processId}:`, error.message);
      throw new Error('Falha ao buscar tarefas do processo');
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
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar tarefa ${taskId}:`, error.message);
      throw new Error('Falha ao atualizar status da tarefa');
    }
  }
}

module.exports = new HolmesService(); 