const { body, validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * Controlador de usuários
 */
class UserController {
  /**
   * Buscar todos os usuários
   * GET /api/users
   */
  async getAllUsers(req, res) {
    try {
      // Verificar se o usuário é admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Apenas administradores podem acessar esta funcionalidade'
        });
      }

      const users = await User.findAll();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao buscar usuários'
      });
    }
  }

  /**
   * Buscar usuário por ID
   * GET /api/users/:id
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o usuário é admin ou está buscando seus próprios dados
      if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você só pode visualizar seus próprios dados'
        });
      }

      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          message: 'O usuário especificado não existe'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao buscar usuário'
      });
    }
  }

  /**
   * Criar novo usuário
   * POST /api/users
   */
  async createUser(req, res) {
    try {
      // Verificar se o usuário é admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Apenas administradores podem criar usuários'
        });
      }

      // Validar dados de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { name, email, password, role = 'user' } = req.body;

      // Verificar se o email já existe
      const emailExists = await User.emailExists(email);
      if (emailExists) {
        return res.status(400).json({
          error: 'Email já existe',
          message: 'Já existe um usuário com este email'
        });
      }

      // Criar usuário
      const newUser = await User.create({
        name,
        email,
        password,
        role
      });

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao criar usuário'
      });
    }
  }

  /**
   * Atualizar usuário
   * PUT /api/users/:id
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o usuário é admin ou está atualizando seus próprios dados
      if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você só pode atualizar seus próprios dados'
        });
      }

      // Validar dados de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { name, email, password, role, is_active } = req.body;

      // Verificar se o usuário existe
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          message: 'O usuário especificado não existe'
        });
      }

      // Verificar se o email já existe (excluindo o usuário atual)
      if (email && email !== existingUser.email) {
        const emailExists = await User.emailExists(email, id);
        if (emailExists) {
          return res.status(400).json({
            error: 'Email já existe',
            message: 'Já existe um usuário com este email'
          });
        }
      }

      // Apenas admins podem alterar role e is_active
      const updateData = { name, email };
      if (req.user.role === 'admin') {
        updateData.role = role;
        updateData.is_active = is_active;
      }
      if (password) {
        updateData.password = password;
      }

      // Atualizar usuário
      const updatedUser = await User.update(id, updateData);

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: updatedUser
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao atualizar usuário'
      });
    }
  }

  /**
   * Deletar usuário
   * DELETE /api/users/:id
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o usuário é admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Apenas administradores podem deletar usuários'
        });
      }

      // Verificar se não está tentando deletar a si mesmo
      if (req.user.userId === parseInt(id)) {
        return res.status(400).json({
          error: 'Operação inválida',
          message: 'Você não pode deletar sua própria conta'
        });
      }

      // Verificar se o usuário existe
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          message: 'O usuário especificado não existe'
        });
      }

      // Deletar usuário
      const result = await User.delete(id);

      if (result.deleted) {
        res.json({
          success: true,
          message: 'Usuário deletado com sucesso'
        });
      } else {
        res.status(500).json({
          error: 'Erro ao deletar usuário',
          message: 'Falha ao deletar usuário'
        });
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao deletar usuário'
      });
    }
  }

  /**
   * Alterar senha do usuário
   * POST /api/users/:id/change-password
   */
  async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      // Verificar se o usuário é admin ou está alterando sua própria senha
      if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você só pode alterar sua própria senha'
        });
      }

      // Validar dados de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      // Verificar se o usuário existe
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          message: 'O usuário especificado não existe'
        });
      }

      // Se não for admin, verificar a senha atual
      if (req.user.role !== 'admin') {
        const isValidPassword = await User.verifyPassword(existingUser.email, currentPassword);
        if (!isValidPassword) {
          return res.status(400).json({
            error: 'Senha atual incorreta',
            message: 'A senha atual fornecida está incorreta'
          });
        }
      }

      // Atualizar senha
      await User.update(id, { password: newPassword });

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao alterar senha'
      });
    }
  }
}

// Validações para criação de usuário
const createUserValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role deve ser admin ou user')
];

// Validações para atualização de usuário
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role deve ser admin ou user'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active deve ser true ou false')
];

// Validações para alteração de senha
const changePasswordValidation = [
  body('currentPassword')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
];

module.exports = {
  UserController: new UserController(),
  createUserValidation,
  updateUserValidation,
  changePasswordValidation
}; 