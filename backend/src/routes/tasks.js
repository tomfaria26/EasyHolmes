const express = require('express');
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/tasks - Buscar todas as tarefas
router.get('/', taskController.getAllTasks);

// GET /api/tasks/status/:status - Buscar tarefas por status
router.get('/status/:status', taskController.getTasksByStatus);

// GET /api/tasks/:id - Buscar detalhes de uma tarefa
router.get('/:id', taskController.getTaskDetails);

// GET /api/tasks/:id/properties - Buscar propriedades de uma tarefa
router.get('/:id/properties', taskController.getTaskProperties);

// PATCH /api/tasks/:id/status - Atualizar status de uma tarefa
router.patch('/:id/status', taskController.updateTaskStatus);

// POST /api/tasks/:id/complete - Concluir uma tarefa
router.post('/:id/complete', taskController.completeTask);

// POST /api/tasks/refresh - Atualizar tarefas automaticamente
router.post('/refresh', taskController.refreshTasks);

module.exports = router; 