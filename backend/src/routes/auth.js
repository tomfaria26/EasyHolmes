const express = require('express');
const { AuthController, loginValidation } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const holmesService = require('../services/holmesService');

const router = express.Router();

// POST /api/auth/login - Login do usuário
router.post('/login', loginValidation, AuthController.login);

// POST /api/auth/logout - Logout do usuário
router.post('/logout', authenticateToken, AuthController.logout);

// GET /api/auth/verify - Verificar token atual
router.get('/verify', authenticateToken, AuthController.verifyToken);

// GET /api/auth/test-holmes - Testar conexão com Holmes
router.get('/test-holmes', AuthController.testHolmesConnection);

// GET /api/auth/cache/stats - Obter estatísticas do cache
router.get('/cache/stats', authenticateToken, (req, res) => {
  try {
    const stats = holmesService.getCacheStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// POST /api/auth/cache/clear - Limpar cache
router.post('/cache/clear', authenticateToken, (req, res) => {
  try {
    holmesService.clearCache();
    res.json({
      success: true,
      message: 'Cache limpo com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// POST /api/auth/cache/refresh - Forçar atualização dos dados
router.post('/cache/refresh', authenticateToken, (req, res) => {
  try {
    // Limpar cache e forçar nova busca
    holmesService.clearCache();
    res.json({
      success: true,
      message: 'Cache limpo e dados serão atualizados na próxima requisição'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

module.exports = router; 