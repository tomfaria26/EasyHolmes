const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona o usuário ao request
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Token de acesso não fornecido',
      message: 'É necessário fornecer um token de autenticação'
    });
  }

  try {
    // Verificar token usando a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'easyholmes-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error.message);
    return res.status(403).json({
      error: 'Token inválido',
      message: 'O token fornecido não é válido ou expirou'
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Não bloqueia a requisição se não houver token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'easyholmes-secret-key');
      req.user = decoded;
    } catch (error) {
      // Token inválido, mas não bloqueia a requisição
      console.warn('Token inválido fornecido:', error.message);
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
}; 