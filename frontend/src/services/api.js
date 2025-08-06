import axios from 'axios';

/**
 * Cliente HTTP para APIs do backend
 */
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Interceptor para adicionar token de autenticação
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para tratar respostas de erro
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Serviço de autenticação
 */
export const authService = {
  /**
   * Login do usuário
   */
  async login(email, password) {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password
    });
    return response.data;
  },

  /**
   * Logout do usuário
   */
  async logout() {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },

  /**
   * Verificar token atual
   */
  async verifyToken() {
    const response = await apiClient.get('/api/auth/verify');
    return response.data;
  },

  /**
   * Testar conexão com Holmes
   */
  async testHolmesConnection() {
    const response = await apiClient.get('/api/auth/test-holmes');
    return response.data;
  }
};

/**
 * Serviço de processos
 */
export const processService = {
  /**
   * Buscar todos os processos
   */
  async getProcesses() {
    const response = await apiClient.get('/api/processes');
    return response.data;
  },

  /**
   * Buscar processo por ID
   */
  async getProcessById(id) {
    const response = await apiClient.get(`/api/processes/${id}`);
    return response.data;
  },

  /**
   * Iniciar novo processo
   */
  async startProcess(workflowId, data = {}) {
    const response = await apiClient.post('/api/processes/start', {
      workflowId,
      data
    });
    return response.data;
  },

  /**
   * Buscar tarefas de um processo
   */
  async getProcessTasks(processId) {
    const response = await apiClient.get(`/api/processes/${processId}/tasks`);
    return response.data;
  },

  /**
   * Buscar histórico de um processo
   */
  async getProcessHistory(processId, payload = {}) {
    const response = await apiClient.post(`/api/processes/${processId}/history`, {
      payload
    });
    return response.data;
  },

  /**
   * Buscar template BPMN de um processo
   */
  async getProcessTemplate(processId) {
    const response = await apiClient.get(`/api/processes/${processId}/template`);
    return response.data;
  }
};

/**
 * Serviço de usuários
 */
export const userService = {
  /**
   * Buscar todos os usuários
   */
  async getAllUsers() {
    const response = await apiClient.get('/api/users');
    return response.data;
  },

  /**
   * Buscar usuário por ID
   */
  async getUserById(id) {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },

  /**
   * Criar novo usuário
   */
  async createUser(userData) {
    const response = await apiClient.post('/api/users', userData);
    return response.data;
  },

  /**
   * Atualizar usuário
   */
  async updateUser(id, userData) {
    const response = await apiClient.put(`/api/users/${id}`, userData);
    return response.data;
  },

  /**
   * Deletar usuário
   */
  async deleteUser(id) {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },

  /**
   * Alterar senha do usuário
   */
  async changePassword(id, passwordData) {
    const response = await apiClient.post(`/api/users/${id}/change-password`, passwordData);
    return response.data;
  }
};

/**
 * Serviço de tarefas
 */
export const taskService = {
  /**
   * Buscar todas as tarefas
   */
  async getAllTasks(params = {}) {
    const response = await apiClient.get('/api/tasks', { params });
    return response.data;
  },

  /**
   * Buscar tarefas por status
   */
  async getTasksByStatus(status, params = {}) {
    const response = await apiClient.get(`/api/tasks/status/${status}`, { params });
    return response.data;
  },

  /**
   * Buscar detalhes de uma tarefa
   */
  async getTaskDetails(taskId) {
    const response = await apiClient.get(`/api/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Atualizar status de uma tarefa
   */
  async updateTaskStatus(taskId, status) {
    const response = await apiClient.patch(`/api/tasks/${taskId}/status`, {
      status
    });
    return response.data;
  },

  /**
   * Buscar propriedades de uma tarefa
   */
  async getTaskProperties(taskId) {
    const response = await apiClient.get(`/api/tasks/${taskId}/properties`);
    return response.data;
  },

  /**
   * Concluir uma tarefa
   */
  async completeTask(taskId, propertyValues = []) {
    const response = await apiClient.post(`/api/tasks/${taskId}/complete`, {
      propertyValues
    });
    return response.data;
  },

  /**
   * Buscar instâncias disponíveis
   */
  async getInstances() {
    const response = await apiClient.get('/api/processes/instances');
    return response.data;
  },

  /**
   * Criar novo processo
   */
  async createProcess(data) {
    const response = await apiClient.post('/api/processes/create', data);
    return response.data;
  }
};

export default apiClient; 