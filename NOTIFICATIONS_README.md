# Sistema de Notificações - EasyHolmes

## Visão Geral

O sistema de notificações foi implementado para fornecer feedback visual aos usuários sobre ações realizadas na aplicação, como sucessos, erros e informações importantes.

## Como Funciona

### 1. Composable Global (`useNotifications`)

O sistema utiliza um composable Vue 3 que gerencia o estado global das notificações:

```javascript
import { useNotifications } from '../composables/useNotifications'

const { showSuccess, showError, showInfo, clearAll } = useNotifications()
```

### 2. Componente Global (`NotificationToast`)

As notificações são exibidas através de um componente global que está registrado no `App.vue`:

```vue
<!-- Sistema de Notificações Global -->
<NotificationToast />
```

### 3. Métodos Disponíveis

#### `showSuccess(message, duration = 5000)`
Exibe uma notificação de sucesso (verde)
```javascript
showSuccess('Operação realizada com sucesso!')
```

#### `showError(message, duration = 7000)`
Exibe uma notificação de erro (vermelho)
```javascript
showError('Ocorreu um erro na operação!')
```

#### `showInfo(message, duration = 5000)`
Exibe uma notificação informativa (azul)
```javascript
showInfo('Informação importante para o usuário!')
```

#### `clearAll()`
Remove todas as notificações ativas
```javascript
clearAll()
```

## Implementação nas Páginas

### Login.vue
```javascript
const { showSuccess, showError } = useNotifications()

const handleLogin = async () => {
  if (!email.value || !password.value) {
    showError('Por favor, preencha email e senha')
    return
  }

  const result = await authStore.login(email.value, password.value)
  
  if (result.success) {
    showSuccess('Login realizado com sucesso!')
    router.push('/dashboard')
  } else {
    showError(result.error || 'Erro no login')
  }
}
```

### Dashboard.vue
```javascript
const { showSuccess, showError } = useNotifications()

const refreshData = async () => {
  try {
    await processesStore.initializeData()
    showSuccess('Dados atualizados com sucesso!')
  } catch (error) {
    showError('Erro ao atualizar dados')
  }
}
```

### TaskBoard.vue
```javascript
const { showSuccess, showError, showInfo } = useNotifications()

const completeTask = async () => {
  // Validação
  if (missingProperties.length > 0) {
    showError(`Por favor, preencha as propriedades obrigatórias: ${missingProperties.map(p => p.name).join(', ')}`)
    return
  }
  
  try {
    const result = await taskService.completeTask(taskId, propertyValues)
    if (result.success) {
      showSuccess('Tarefa concluída com sucesso!')
    } else {
      showError(`Erro ao concluir tarefa: ${result.error}`)
    }
  } catch (error) {
    showError('Erro ao concluir tarefa. Verifique o console para mais detalhes.')
  }
}
```

## Implementação nos Stores

### processes.js
```javascript
import { useNotifications } from '../composables/useNotifications'

async updateTaskStatus(taskId, newStatus) {
  const { showSuccess, showError } = useNotifications()
  
  try {
    const response = await taskService.updateTaskStatus(taskId, newStatus)
    
    if (response.success) {
      showSuccess('Status da tarefa atualizado com sucesso!')
      return { success: true }
    } else {
      showError(`Erro ao atualizar tarefa: ${response.message}`)
      return { success: false, error: response.message }
    }
  } catch (error) {
    showError('Falha ao atualizar tarefa')
    return { success: false, error: 'Falha ao atualizar tarefa' }
  }
}
```

## Características do Sistema

### 1. Posicionamento
- As notificações aparecem no canto superior direito da tela
- Posição fixa com z-index alto (9999)

### 2. Animações
- Entrada suave da direita para a esquerda
- Fade in/out com transições CSS
- Duração de 300ms para as animações

### 3. Auto-remoção
- Notificações de sucesso: 5 segundos
- Notificações de erro: 7 segundos
- Notificações de info: 5 segundos

### 4. Cores e Ícones
- **Sucesso**: Verde (#10b981) com ícone ✅
- **Erro**: Vermelho (#ef4444) com ícone ❌
- **Info**: Azul (#3b82f6) com ícone ℹ️

### 5. Interatividade
- Botão de fechar (X) em cada notificação
- Clique para remover manualmente
- Múltiplas notificações simultâneas

## Teste do Sistema

Para testar o sistema de notificações, você pode:

1. **Abrir o arquivo de teste**: `frontend/test-notifications.html`
2. **Usar a aplicação**: Fazer login, concluir tarefas, etc.
3. **Verificar o console**: Logs de debug estão habilitados

## Estrutura de Arquivos

```
frontend/
├── src/
│   ├── composables/
│   │   └── useNotifications.js      # Composable principal
│   ├── components/
│   │   └── NotificationToast.vue    # Componente de exibição
│   ├── views/
│   │   ├── Login.vue                # Implementação no login
│   │   ├── Dashboard.vue            # Implementação no dashboard
│   │   └── TaskBoard.vue            # Implementação no quadro de tarefas
│   ├── stores/
│   │   ├── auth.js                  # Implementação no store de auth
│   │   └── processes.js             # Implementação no store de processos
│   └── App.vue                      # Registro do componente global
├── test-notifications.html          # Arquivo de teste
└── NOTIFICATIONS_README.md          # Este arquivo
```

## Solução de Problemas

### Notificações não aparecem
1. Verifique se o componente `NotificationToast` está registrado no `App.vue`
2. Confirme se o composable `useNotifications` está sendo importado corretamente
3. Verifique o console do navegador para erros JavaScript

### Notificações aparecem mas não animam
1. Verifique se o CSS está sendo carregado corretamente
2. Confirme se as classes CSS estão sendo aplicadas

### Múltiplas notificações não funcionam
1. Verifique se o estado global está sendo compartilhado corretamente
2. Confirme se não há conflitos de ID entre notificações

## Melhorias Futuras

1. **Persistência**: Salvar notificações importantes no localStorage
2. **Som**: Adicionar sons para diferentes tipos de notificação
3. **Progress Bar**: Barra de progresso para notificações longas
4. **Agrupamento**: Agrupar notificações similares
5. **Templates**: Templates personalizados para diferentes tipos de notificação 