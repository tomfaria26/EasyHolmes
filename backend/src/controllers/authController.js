const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const holmesService = require('../services/holmesService');
const User = require('../models/User');

/**
 * Controlador de autenticação
 */
class AuthController {
  /**
   * Login do usuário
   * POST /api/auth/login
   */
  async login(req, res) {
    console.log('Requisição recebida no AuthController.login');
    try {
      // Validar dados de entrada
      const errors = validationResult(req);
      console.log('Corpo da requisição (req.body):', req.body);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuário no banco de dados
      const user = await User.findByEmail(email);
      
      if (!user) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      }

      // Verificar se o usuário está ativo
      if (!user.is_active) {
        return res.status(401).json({
          error: 'Usuário inativo',
          message: 'Sua conta foi desativada. Entre em contato com o administrador.'
        });
      }

      // Verificar senha
      const isValidPassword = await User.verifyPassword(email, password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'easyholmes-secret-key',
        { expiresIn: '24h' }
      );

      // Retornar resposta de sucesso
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
          }
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao processar login'
      });
    }
  }

  /**
   * Logout do usuário
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // Em uma implementação mais robusta, poderíamos invalidar o token
      // Por enquanto, apenas retornamos sucesso
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao processar logout'
      });
    }
  }

  /**
   * Verificar token atual
   * GET /api/auth/verify
   */
  async verifyToken(req, res) {
    try {
      // O middleware de autenticação já verificou o token
      // Aqui apenas retornamos as informações do usuário
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao verificar token'
      });
    }
  }

  /**
   * Testar conexão com Holmes
   * GET /api/auth/test-holmes
   */
  async testHolmesConnection(req, res) {
    try {
      // Tentar buscar processos para testar a conexão
      const processes = await holmesService.getProcesses();
      
      res.json({
        success: true,
        message: 'Conexão com Holmes estabelecida com sucesso',
        data: {
          processesCount: processes.length || 0,
          sampleProcess: processes[0] || null
        }
      });
    } catch (error) {
      console.error('Erro ao testar conexão com Holmes:', error);
      res.status(500).json({
        error: 'Falha na conexão com Holmes',
        message: error.message
      });
    }
  }
}

// Validações para o login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

module.exports = {
  AuthController: new AuthController(),
  loginValidation
}; 