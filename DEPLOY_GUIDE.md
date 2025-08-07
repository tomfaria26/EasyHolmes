# 🚀 Guia de Deploy - EasyHolmes

## 📋 Visão Geral

O EasyHolmes é uma aplicação web que integra com a API Holmes para gerenciamento de processos BPMN. O sistema é composto por:

- **Frontend**: Interface Vue.js (porta 8083)
- **Backend**: API Node.js (porta 3001)
- **Database**: PostgreSQL (porta 5433)

## 🔧 Pré-requisitos

- Docker e Docker Compose instalados
- Portas 3001, 8083 e 5433 disponíveis
- Arquivo `.env` configurado

## 🚀 Deploy Rápido

### 1. Deploy Automatizado
```bash
cd /home/suporteapp/EasyHolmes
./deploy.sh
```

### 2. Deploy Manual
```bash
# Copiar arquivo de ambiente
cp env.example .env

# Build e deploy
docker-compose build
docker-compose up -d

# Verificar status
docker-compose ps
```

## 📊 Status dos Serviços

### Verificar Status
```bash
docker-compose ps
```

### Ver Logs
```bash
# Todos os serviços
docker-compose logs

# Serviço específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database
```

### Testar Conectividade
```bash
# Backend
curl http://localhost:3001

# Frontend
curl http://localhost:8083

# Database
docker exec easyholmes-database pg_isready -U easyholmes
```

## 🌐 Acesso às Aplicações

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:8083 | Interface web principal |
| Backend API | http://localhost:3001 | API REST |
| Database | localhost:5433 | PostgreSQL |

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```bash
# Configurações do Backend
NODE_ENV=development
PORT=3000

# JWT Secret Key
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# API Token Holmes
API_TOKEN=eyJhbGciOiJIUzI1NiJ9...

# URLs das APIs Holmes
HOLMES_API_BASE_URL=https://app-api.holmesdoc.io/v1
HOLMES_PROCESSES_URL=https://app-api.holmesdoc.io/v1/processes/
HOLMES_WORKFLOW_START_URL=https://app-api.holmesdoc.io/v1/workflows/...

# Configurações do Frontend
VUE_APP_API_URL=http://localhost:3001
VUE_APP_TITLE=EasyHolmes - BPMN Manager
```

## 🛠️ Comandos Úteis

### Gerenciamento de Containers
```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Rebuild
docker-compose build --no-cache
```

### Backup do Banco
```bash
# Backup
docker exec easyholmes-database pg_dump -U easyholmes easyholmes > backup.sql

# Restore
docker exec -i easyholmes-database psql -U easyholmes easyholmes < backup.sql
```

### Limpeza
```bash
# Remover containers parados
docker container prune

# Remover imagens não utilizadas
docker image prune

# Limpeza completa
docker system prune -a
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Porta já em uso
```bash
# Verificar portas em uso
netstat -tlnp | grep -E ":(3001|8083|5433)"

# Parar containers conflitantes
docker-compose down
```

#### 2. Container não inicia
```bash
# Verificar logs
docker-compose logs [serviço]

# Verificar recursos
docker stats
```

#### 3. Problemas de conectividade
```bash
# Testar rede interna
docker exec easyholmes-backend ping easyholmes-database

# Verificar variáveis de ambiente
docker exec easyholmes-backend env | grep DB_
```

## 📈 Monitoramento

### Health Checks
```bash
# Verificar saúde dos containers
docker-compose ps

# Verificar uso de recursos
docker stats easyholmes-backend easyholmes-frontend easyholmes-database
```

### Logs em Tempo Real
```bash
# Seguir logs
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
```

## 🔐 Segurança

### Produção
- Alterar `JWT_SECRET` para uma chave forte
- Configurar HTTPS
- Usar variáveis de ambiente seguras
- Implementar rate limiting

### Desenvolvimento
- Usar configurações padrão
- Logs detalhados ativados
- Hot reload ativado

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar logs dos containers
2. Consultar este guia
3. Verificar configurações do `.env`
4. Testar conectividade entre serviços

---

**Última atualização**: $(date)
**Versão**: 1.0.0 