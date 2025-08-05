# 🚀 EasyHolmes - Gerenciador BPMN

Aplicação web para gerenciamento de processos BPMN integrada com a plataforma Holmes.

## 📋 Funcionalidades

- ✅ **Autenticação de usuários**
- ✅ **Visualização de tarefas em estilo KanBan**
- ✅ **Início de novos processos**
- ✅ **Diagramas BPMN interativos**
- ✅ **Integração com APIs Holmes**
- ✅ **Interface responsiva e moderna**

## 🛠️ Tecnologias

### Frontend
- **Vue.js 3** - Framework JavaScript
- **Vue Router** - Roteamento
- **Pinia** - Gerenciamento de estado
- **Tailwind CSS** - Estilização
- **BPMN.js** - Renderização de diagramas
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **Axios** - Cliente HTTP

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **Nginx** - Servidor web (produção)

## 🚀 Instalação e Execução

### Pré-requisitos
- Docker e Docker Compose instalados
- Git

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd EasyHolmes
```

### 2. Configure as variáveis de ambiente
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Execute com Docker
```bash
# Desenvolvimento
docker-compose up --build

# Produção
docker-compose -f docker-compose.prod.yml up --build
```

### 4. Acesse a aplicação
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📁 Estrutura do Projeto

```
EasyHolmes/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/     # Controladores
│   │   ├── middleware/      # Middlewares
│   │   ├── models/          # Modelos de dados
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Serviços
│   │   └── utils/           # Utilitários
│   ├── database/            # Banco SQLite
│   ├── Dockerfile           # Imagem Docker
│   └── package.json
├── frontend/                # Aplicação Vue.js
│   ├── src/
│   │   ├── components/      # Componentes Vue
│   │   ├── views/           # Páginas
│   │   ├── router/          # Configuração de rotas
│   │   ├── store/           # Gerenciamento de estado
│   │   ├── services/        # Serviços API
│   │   └── utils/           # Utilitários
│   ├── public/              # Arquivos estáticos
│   ├── Dockerfile           # Imagem Docker
│   └── package.json
├── docker-compose.yml       # Orquestração Docker
├── .env                     # Variáveis de ambiente
└── README.md
```

## 🔧 Desenvolvimento

### Comandos úteis

```bash
# Ver logs dos containers
docker-compose logs -f

# Executar comandos no container
docker-compose exec backend npm run dev
docker-compose exec frontend npm run serve

# Parar containers
docker-compose down

# Rebuild das imagens
docker-compose build --no-cache
```

### Desenvolvimento local (sem Docker)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run serve
```

## 🔌 APIs Holmes Integradas

- **Busca de Processos**: `GET /v1/processes/`
- **Iniciar Processo**: `POST /v1/workflows/{id}/start`
- **Busca de Instâncias**: `POST /v1/entities/{id}/instances/search`
- **Histórico de Processos**: `POST /v1/processes/{id}/history`
- **Detalhes de Tarefas**: `GET /v1/tasks/{id}`
- **Template BPMN**: `GET /v1/admin/processes/{id}/troubleshooting/template`

## 🎨 Interface

### Cores do Sistema
- **Verde** (#22c55e): Tarefas concluídas
- **Amarelo** (#f59e0b): Tarefas em andamento
- **Azul** (#3b82f6): Elementos primários
- **Cinza** (#6b7280): Elementos secundários

### Componentes Principais
- **KanBan Board**: Visualização de tarefas em colunas
- **BPMN Viewer**: Diagrama interativo do processo
- **Task Cards**: Cards com informações das tarefas
- **Process Selector**: Seletor de processos ativos

## 🔒 Segurança

- Autenticação JWT
- CORS configurado
- Headers de segurança (Helmet)
- Validação de dados
- Sanitização de inputs

## 📊 Monitoramento

- Health check endpoint: `/health`
- Logs estruturados
- Métricas de performance
- Tratamento de erros

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, envie um email para [seu-email@exemplo.com] ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ pela equipe EasyHolmes** 