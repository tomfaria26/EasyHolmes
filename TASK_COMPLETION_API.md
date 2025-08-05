# API de Conclusão de Tarefas - EasyHolmes

## Visão Geral

Esta documentação descreve a nova funcionalidade implementada para concluir tarefas no sistema EasyHolmes, extraindo automaticamente o ID do botão de ação "Ok" das tarefas da API do Holmes.

## Funcionalidades Implementadas

### 1. Função `extractOkActionId(taskData)`

**Localização:** `backend/src/controllers/taskController.js`

**Descrição:** Extrai o ID do botão de ação "Ok" de uma tarefa.

**Parâmetros:**
- `taskData` (Object): Dados da tarefa retornados pela API do Holmes

**Retorno:**
- `String`: ID do botão de ação "Ok" ou `null` se não encontrado

**Exemplo de uso:**
```javascript
const taskData = {
  "id": "6891fe6487bb701522c59e98",
  "actions": [
    {
      "id": "Flow_0cnz1ps",
      "name": "Ok",
      "color": "#2d9cdb",
      "require_validation": true
    }
  ]
};

const okActionId = extractOkActionId(taskData);
// Retorna: "Flow_0cnz1ps"
```

### 2. Método `executeTaskAction(taskId, actionId)`

**Localização:** `backend/src/services/holmesService.js`

**Descrição:** Executa uma ação específica em uma tarefa através da API do Holmes.

**Parâmetros:**
- `taskId` (String): ID da tarefa
- `actionId` (String): ID da ação a ser executada

**Endpoint da API Holmes:**
```
POST https://app-api.holmesdoc.io/v1/tasks/:task_id/action
```

**Payload enviado:**
```json
{
  "task": {
    "action_id": "Flow_0cnz1ps",
    "property_values": [],
    "confirm_action": false
  }
}
```

### 3. Endpoint `POST /api/tasks/:id/complete`

**Localização:** `backend/src/controllers/taskController.js` e `backend/src/routes/tasks.js`

**Descrição:** Endpoint para concluir uma tarefa automaticamente.

**URL:** `POST /api/tasks/:id/complete`

**Parâmetros:**
- `id` (String): ID da tarefa a ser concluída

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Tarefa concluída com sucesso",
  "data": {
    "taskId": "6891fe6487bb701522c59e98",
    "actionId": "Flow_0cnz1ps",
    "result": { /* resposta da API do Holmes */ }
  }
}
```

**Resposta de erro (ação não encontrada):**
```json
{
  "error": "Ação \"Ok\" não encontrada",
  "message": "Esta tarefa não possui um botão de ação \"Ok\" disponível"
}
```

## Fluxo de Funcionamento

1. **Requisição recebida:** O frontend envia uma requisição POST para `/api/tasks/:id/complete`

2. **Busca detalhes da tarefa:** O backend busca os detalhes completos da tarefa na API do Holmes

3. **Extração do ID da ação:** A função `extractOkActionId()` procura por uma ação com `name: "Ok"` no array `actions`

4. **Validação:** Se não encontrar a ação "Ok", retorna erro 400

5. **Execução da ação:** Se encontrar, executa a ação através do método `executeTaskAction()`

6. **Resposta:** Retorna sucesso com os dados da operação

## Exemplo de Integração no Frontend

```javascript
// Exemplo de como usar no frontend
async function completeTask(taskId) {
  try {
    const response = await fetch(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Tarefa concluída:', result.data);
      // Atualizar interface do usuário
    } else {
      console.error('Erro ao concluir tarefa:', result.error);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}
```

## Estrutura do JSON da API do Holmes

O sistema espera que as tarefas tenham a seguinte estrutura:

```json
{
  "id": "6891fe6487bb701522c59e98",
  "task_id": "Activity_08te6d6",
  "name": "Nome da Tarefa",
  "status": "opened",
  "actions": [
    {
      "id": "Flow_0cnz1ps",
      "name": "Ok",
      "color": "#2d9cdb",
      "require_validation": true
    }
  ]
}
```

## Tratamento de Erros

- **Ação não encontrada:** Retorna erro 400 se não houver botão "Ok"
- **Erro de rede:** Retorna erro 500 para problemas de comunicação com a API do Holmes
- **Tarefa não encontrada:** Retorna erro 500 se a tarefa não existir

## Segurança

- Todas as rotas requerem autenticação via middleware `authenticateToken`
- Validação de entrada para evitar IDs inválidos
- Logs detalhados para auditoria e debugging 