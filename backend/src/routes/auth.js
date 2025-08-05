const express = require('express');
const { AuthController, loginValidation } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login - Login do usuário
router.post('/login', loginValidation, AuthController.login);

// POST /api/auth/logout - Logout do usuário
router.post('/logout', authenticateToken, AuthController.logout);

// GET /api/auth/verify - Verificar token atual
router.get('/verify', authenticateToken, AuthController.verifyToken);

// GET /api/auth/test-holmes - Testar conexão com Holmes
router.get('/test-holmes', AuthController.testHolmesConnection);

module.exports = router; 