# 👥 Gerenciamento de Usuários - EasyHolmes

Este documento descreve o sistema completo de gerenciamento de usuários implementado no EasyHolmes.

## 📋 Funcionalidades

### ✅ Implementadas
- **Autenticação segura** com JWT e bcrypt
- **CRUD completo** de usuários (Criar, Ler, Atualizar, Deletar)
- **Controle de acesso** baseado em roles (admin/user)
- **Interface moderna** com Vue.js e Tailwind CSS
- **Validação de dados** no frontend e backend
- **Notificações** em tempo real
- **Banco de dados SQLite** para persistência

### 🔐 Segurança
- Senhas hashadas com bcrypt
- Tokens JWT com expiração
- Validação de permissões por rota
- Proteção contra ataques comuns

## 🏗️ Arquitetura

### Backend (Node.js + Express)

#### Modelo de Usuário (`backend/src/models/User.js`)
```javascript
// Estrutura da tabela users
{
  id: INTEGER PRIMARY KEY,
  name: TEXT NOT NULL,
  email: TEXT UNIQUE NOT NULL,
  password: TEXT NOT NULL,
  role: TEXT DEFAULT 'user',
  is_active: BOOLEAN DEFAULT 1,
  created_at: DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP
}
```

#### Controlador (`backend/src/controllers/userController.js`)
- `getAllUsers()` - Listar todos os usuários (apenas admin)
- `getUserById()` - Buscar usuário por ID
- `createUser()` - Criar novo usuário (apenas admin)
- `updateUser()` - Atualizar usuário
- `deleteUser()` - Deletar usuário (apenas admin)
- `changePassword()` - Alterar senha

#### Rotas (`backend/src/routes/users.js`)
```
GET    /api/users                    - Listar usuários
GET    /api/users/:id                - Buscar usuário
POST   /api/users                    - Criar usuário
PUT    /api/users/:id                - Atualizar usuário
DELETE /api/users/:id                - Deletar usuário
POST   /api/users/:id/change-password - Alterar senha
```

### Frontend (Vue.js 3 + Pinia)

#### Store (`frontend/src/stores/users.js`)
- Gerenciamento de estado reativo
- Integração com API
- Notificações automáticas
- Cache local de dados

#### Página (`frontend/src/views/UserManagement.vue`)
- Interface moderna e responsiva
- Modais para criação/edição
- Confirmação para exclusão
- Filtros e ordenação
- Estados de loading e erro

#### Serviços (`frontend/src/services/api.js`)
- Cliente HTTP com interceptors
- Tratamento automático de tokens
- Tratamento de erros centralizado

## 🚀 Como Usar

### 1. Acesso ao Sistema
- **URL**: `/users`
- **Permissão**: Apenas administradores
- **Login padrão**: `admin@easyholmes.com` / `admin123`

### 2. Criar Novo Usuário
1. Clique em "Novo Usuário"
2. Preencha os campos obrigatórios:
   - **Nome**: Nome completo do usuário
   - **Email**: Email único do usuário
   - **Senha**: Mínimo 6 caracteres
   - **Função**: Admin ou Usuário
3. Clique em "Criar"

### 3. Editar Usuário
1. Clique em "Editar" na linha do usuário
2. Modifique os campos desejados
3. Deixe a senha em branco para não alterar
4. Clique em "Salvar"

### 4. Deletar Usuário
1. Clique em "Deletar" na linha do usuário
2. Confirme a exclusão no modal
3. **⚠️ Atenção**: Esta ação não pode ser desfeita

### 5. Alterar Senha
1. Acesse o perfil do usuário
2. Use a funcionalidade de alteração de senha
3. Para usuários normais: informe a senha atual
4. Para admins: pode alterar sem senha atual

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# Backend (.env)
JWT_SECRET=your-super-secret-jwt-key
DB_PATH=./database/easyholmes.db

# Frontend (.env)
VUE_APP_API_URL=http://localhost:3000
```

### Banco de Dados
O sistema cria automaticamente:
- Tabela `users` se não existir
- Usuário admin padrão se não existir

### Permissões
- **Admin**: Acesso total ao sistema
- **User**: Acesso limitado (não pode gerenciar usuários)

## 🧪 Testes

### Executar Testes Automatizados
```bash
# Instalar dependências
npm install axios

# Executar testes
node test_user_management.js
```

### Testes Manuais
1. **Login como admin**
2. **Criar usuário teste**
3. **Editar usuário**
4. **Deletar usuário**
5. **Verificar permissões**

## 📱 Interface

### Características
- **Responsiva**: Funciona em desktop e mobile
- **Acessível**: Suporte a navegação por teclado
- **Intuitiva**: Interface familiar e moderna
- **Rápida**: Carregamento otimizado

### Estados Visuais
- **Loading**: Spinner durante operações
- **Sucesso**: Notificações verdes
- **Erro**: Notificações vermelhas
- **Vazio**: Estado quando não há dados

## 🔒 Segurança

### Autenticação
- Tokens JWT com expiração de 24h
- Refresh automático de tokens
- Logout automático em token expirado

### Autorização
- Verificação de roles por rota
- Proteção de rotas sensíveis
- Validação de permissões no frontend e backend

### Dados
- Senhas hashadas com bcrypt (salt rounds: 10)
- Validação de entrada em todas as operações
- Sanitização de dados
- Proteção contra SQL injection

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. "Acesso negado" ao tentar acessar /users
- **Causa**: Usuário não é administrador
- **Solução**: Fazer login com conta admin

#### 2. "Email já existe" ao criar usuário
- **Causa**: Email já está em uso
- **Solução**: Usar email diferente

#### 3. "Token inválido" ao fazer operações
- **Causa**: Token expirado ou inválido
- **Solução**: Fazer login novamente

#### 4. Banco de dados não encontrado
- **Causa**: Pasta database não existe
- **Solução**: O sistema cria automaticamente

### Logs
- **Backend**: Console do servidor Node.js
- **Frontend**: Console do navegador (F12)
- **Banco**: Arquivo `backend/database/easyholmes.db`

## 📈 Próximas Melhorias

### Planejadas
- [ ] **Perfis de usuário** com foto
- [ ] **Histórico de atividades** do usuário
- [ ] **Logs de auditoria** detalhados
- [ ] **Recuperação de senha** por email
- [ ] **Autenticação de dois fatores** (2FA)
- [ ] **Importação/exportação** de usuários
- [ ] **Filtros avançados** na listagem
- [ ] **Paginação** para muitos usuários

### Sugestões
- [ ] **Integração com LDAP/Active Directory**
- [ ] **Sincronização com sistemas externos**
- [ ] **Relatórios de usuários**
- [ ] **Backup automático** do banco

## 🤝 Contribuição

Para contribuir com melhorias:

1. **Fork** o repositório
2. **Crie** uma branch para sua feature
3. **Implemente** as mudanças
4. **Teste** completamente
5. **Submeta** um pull request

## 📞 Suporte

Para dúvidas ou problemas:
- **Issues**: GitHub Issues
- **Documentação**: Este README
- **Código**: Comentários no código

---

**Desenvolvido com ❤️ para o EasyHolmes** 