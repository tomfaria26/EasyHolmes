const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Função para fazer login
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password
    });
    return response.data.data.token;
  } catch (error) {
    console.error('Erro no login:', error.response?.data || error.message);
    return null;
  }
}

// Função para testar criação de usuário
async function testCreateUser(token) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users`, {
      name: 'Usuário Teste',
      email: 'teste@easyholmes.com',
      password: '123456',
      role: 'user'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Usuário criado com sucesso:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.response?.data || error.message);
    return null;
  }
}

// Função para testar busca de usuários
async function testGetUsers(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Usuários encontrados:', response.data.data.length);
    return response.data.data;
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error.response?.data || error.message);
    return null;
  }
}

// Função para testar atualização de usuário
async function testUpdateUser(token, userId) {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/users/${userId}`, {
      name: 'Usuário Teste Atualizado',
      email: 'teste.atualizado@easyholmes.com',
      role: 'admin'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Usuário atualizado com sucesso:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error.response?.data || error.message);
    return null;
  }
}

// Função para testar deleção de usuário
async function testDeleteUser(token, userId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Usuário deletado com sucesso:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error.response?.data || error.message);
    return false;
  }
}

// Função principal de teste
async function runTests() {
  console.log('🚀 Iniciando testes do gerenciamento de usuários...\n');

  // 1. Login como admin
  console.log('1. Fazendo login como admin...');
  const token = await login('admin@easyholmes.com', 'admin123');
  if (!token) {
    console.error('❌ Falha no login. Abortando testes.');
    return;
  }
  console.log('✅ Login realizado com sucesso\n');

  // 2. Buscar usuários existentes
  console.log('2. Buscando usuários existentes...');
  const existingUsers = await testGetUsers(token);
  console.log('');

  // 3. Criar novo usuário
  console.log('3. Criando novo usuário...');
  const newUser = await testCreateUser(token);
  console.log('');

  if (newUser) {
    // 4. Atualizar usuário
    console.log('4. Atualizando usuário...');
    await testUpdateUser(token, newUser.id);
    console.log('');

    // 5. Deletar usuário
    console.log('5. Deletando usuário...');
    await testDeleteUser(token, newUser.id);
    console.log('');
  }

  // 6. Buscar usuários novamente
  console.log('6. Buscando usuários após operações...');
  await testGetUsers(token);
  console.log('');

  console.log('🎉 Testes concluídos!');
}

// Executar testes
runTests().catch(console.error); 