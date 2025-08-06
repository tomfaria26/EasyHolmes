const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./src/routes/auth');
const processRoutes = require('./src/routes/processes');
const taskRoutes = require('./src/routes/tasks');
const userRoutes = require('./src/routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança e performance
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Configuração CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:8080'] 
    : ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'EasyHolmes API - Backend funcionando!',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      processes: '/api/processes',
      tasks: '/api/tasks'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor EasyHolmes rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🔐 API Endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Processes: http://localhost:${PORT}/api/processes`);
  console.log(`   - Tasks: http://localhost:${PORT}/api/tasks`);
});

module.exports = app; 