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

// PATCH /api/tasks/:id/status - Atualizar status de uma tarefa
router.patch('/:id/status', taskController.updateTaskStatus);

module.exports = router; 