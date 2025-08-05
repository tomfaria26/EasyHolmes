const express = require('express');
const processController = require('../controllers/processController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/processes - Buscar todos os processos
router.get('/', processController.getProcesses);

// GET /api/processes/:id - Buscar processo por ID
router.get('/:id', processController.getProcessById);

// POST /api/processes/start - Iniciar novo processo
router.post('/start', processController.startProcess);

// GET /api/processes/:id/tasks - Buscar tarefas de um processo
router.get('/:id/tasks', processController.getProcessTasks);

// POST /api/processes/:id/history - Buscar histórico de um processo
router.post('/:id/history', processController.getProcessHistory);

// GET /api/processes/:id/template - Buscar template BPMN de um processo
router.get('/:id/template', processController.getProcessTemplate);

module.exports = router; 