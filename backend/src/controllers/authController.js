const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const holmesService = require('../services/holmesService');

/**
 * Controlador de autenticação
 */
class AuthController {
  /**
   * Login do usuário
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      // Validar dados de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Por enquanto, vamos usar credenciais fixas para demonstração
      // Em produção, isso viria do banco de dados
      const validCredentials = {
        email: 'admin@easyholmes.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // "password"
      };

      // Também aceitar admin123 para facilitar os testes
      const testCredentials = {
        email: 'admin@easyholmes.com',
        password: 'admin123'
      };

      // Verificar se o email existe
      if (email !== validCredentials.email) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      }

      // Verificar senha (aceitar tanto "password" quanto "admin123")
      let isValidPassword = false;
      
      // Tentar com a senha hashada
      isValidPassword = await bcrypt.compare(password, validCredentials.password);
      
      // Se não funcionou, tentar com admin123
      if (!isValidPassword && password === 'admin123') {
        isValidPassword = true;
      }
      
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        {
          userId: 'admin-user-id',
          email: email,
          role: 'admin'
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
            id: 'admin-user-id',
            email: email,
            role: 'admin',
            name: 'Administrador'
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