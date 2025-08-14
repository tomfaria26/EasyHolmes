const express = require('express');
const processController = require('../controllers/processController');
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/processes - Buscar todos os processos
router.get('/', processController.getProcesses);

// GET /api/instances - Buscar instâncias disponíveis (DEVE vir antes de /:id)
router.get('/instances', taskController.getInstances);

// POST /api/processes/create - Criar novo processo
router.post('/create', taskController.createProcess);

// POST /api/processes/start - Iniciar novo processo
router.post('/start', processController.startProcess);

// GET /api/processes/:id - Buscar processo por ID
router.get('/:id', processController.getProcessById);

// GET /api/processes/:id/tasks - Buscar tarefas de um processo
router.get('/:id/tasks', processController.getProcessTasks);

// POST /api/processes/:id/history - Buscar histórico de um processo
router.post('/:id/history', processController.getProcessHistory);

// GET /api/processes/:id/template - Buscar template BPMN de um processo
router.get('/:id/template', processController.getProcessTemplate);

// POST /api/processes/:id/invalidate-cache - Invalidar cache de um processo específico
router.post('/:id/invalidate-cache', processController.invalidateProcessCache);

// POST /api/processes/clear-cache - Limpar todo o cache
router.post('/clear-cache', processController.clearAllCache);

// POST /api/processes/refresh - Atualizar automaticamente (limpar cache e buscar dados atualizados)
router.post('/refresh', processController.refreshData);

module.exports = router; 