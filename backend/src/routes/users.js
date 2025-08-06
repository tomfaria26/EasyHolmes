const express = require('express');
const { 
  UserController, 
  createUserValidation, 
  updateUserValidation, 
  changePasswordValidation 
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/users - Buscar todos os usuários (apenas admin)
router.get('/', UserController.getAllUsers);

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', UserController.getUserById);

// POST /api/users - Criar novo usuário (apenas admin)
router.post('/', createUserValidation, UserController.createUser);

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', updateUserValidation, UserController.updateUser);

// DELETE /api/users/:id - Deletar usuário (apenas admin)
router.delete('/:id', UserController.deleteUser);

// POST /api/users/:id/change-password - Alterar senha
router.post('/:id/change-password', changePasswordValidation, UserController.changePassword);

module.exports = router; 