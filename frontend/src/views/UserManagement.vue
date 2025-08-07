<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
            <p class="text-sm text-gray-600">Gerencie usuários e permissões do sistema</p>
          </div>
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Novo Usuário
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="usersStore.loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="usersStore.error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Erro ao carregar usuários</h3>
            <p class="text-sm text-red-700 mt-1">{{ usersStore.error }}</p>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Lista de Usuários</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">Todos os usuários registrados no sistema</p>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th 
                  @click="sortBy('name')"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <div class="flex items-center">
                    Usuário
                    <svg v-if="sortField === 'name'" class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </th>
                <th 
                  @click="sortBy('email')"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <div class="flex items-center">
                    Email
                    <svg v-if="sortField === 'email'" class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </th>
                <th 
                  @click="sortBy('role')"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <div class="flex items-center">
                    Função
                    <svg v-if="sortField === 'role'" class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </th>
                <th 
                  @click="sortBy('is_active')"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <div class="flex items-center">
                    Status
                    <svg v-if="sortField === 'is_active'" class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </th>
                <th 
                  @click="sortBy('created_at')"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <div class="flex items-center">
                    Criado em
                    <svg v-if="sortField === 'created_at'" class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="user in sortedUsers" 
                :key="user.id" 
                class="hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <td class="px-6 py-4 whitespace-nowrap align-middle">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div 
                        class="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                        :style="{ backgroundColor: getUserAvatarColor(user.name) }"
                      >
                        <span class="text-sm">{{ user.name.charAt(0).toUpperCase() }}</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                      <div class="text-sm text-gray-500">ID: {{ user.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap align-middle">
                  <div class="text-sm text-gray-900">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap align-middle">
                  <span 
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer relative',
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    ]"
                    @mouseenter="() => { clearTooltipTimer('status'); showTooltipWithDelay('status', user.id); }"
                    @mouseleave="() => { clearTooltipTimer('status'); hideTooltipWithDelay('status'); }"
                  >
                    {{ user.role === 'admin' ? 'Administrador' : 'Usuário' }}
                    <!-- Tooltip customizado para função -->
                    <div
                      v-if="showStatusTooltip === user.id"
                      class="absolute z-50 px-2.5 py-1.5 text-xs text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm max-w-40"
                      style="top: 100%; left: 50%; transform: translateX(-50%); margin-top: 6px; white-space: nowrap;"
                    >
                      {{ user.role === 'admin' ? 'Acesso completo' : 'Acesso básico' }}
                      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-b-3 border-transparent border-b-gray-200"></div>
                    </div>
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap align-middle">
                  <span 
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer relative',
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    ]"
                    @mouseenter="() => { clearTooltipTimer('status'); showTooltipWithDelay('status', 'status-' + user.id); }"
                    @mouseleave="() => { clearTooltipTimer('status'); hideTooltipWithDelay('status'); }"
                  >
                    {{ user.is_active ? 'Ativo' : 'Inativo' }}
                    <!-- Tooltip customizado para status -->
                    <div
                      v-if="showStatusTooltip === 'status-' + user.id"
                      class="absolute z-50 px-2.5 py-1.5 text-xs text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm max-w-40"
                      style="top: 100%; left: 50%; transform: translateX(-50%); margin-top: 6px; white-space: nowrap;"
                    >
                      {{ user.is_active ? 'Pode fazer login' : 'Não pode fazer login' }}
                      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-b-3 border-transparent border-b-gray-200"></div>
                    </div>
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-middle">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center align-middle">
                  <div class="flex justify-center space-x-3">
                    <button
                      @click.stop="editUser(user)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      title="Editar usuário"
                    >
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      Editar
                    </button>
                    <button
                      v-if="user.id !== authStore.user?.id"
                      @click.stop="deleteUser(user)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      title="Deletar usuário"
                    >
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="sortedUsers.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
          <p class="mt-1 text-sm text-gray-500">Comece criando um novo usuário.</p>
        </div>
      </div>
    </div>

    <!-- Modal de Editar/Criar Usuário -->
    <div v-if="showEditModal || showCreateModal" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop padronizado -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <!-- Modal Container -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              {{ showCreateModal ? 'Novo Usuário' : `Editar Usuário: ${userToEdit?.name || ''}` }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Content com scroll -->
          <div class="flex-1 overflow-y-auto p-5">
            <!-- Feedback Message -->
            <div v-if="feedbackMessage" class="mb-4 p-3 rounded-md" :class="feedbackType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'">
              <div class="flex items-center">
                <svg v-if="feedbackType === 'success'" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ feedbackMessage }}
              </div>
            </div>

            <form @submit.prevent="saveUser">
              <!-- Bloco 1: Informações Básicas -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Informações Básicas
                </h4>

                <!-- Name -->
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="userForm.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                    :class="{
                      'border-red-300 focus:border-red-500 focus:ring-red-500': nameError
                    }"
                    placeholder="Digite o nome completo"
                    @blur="validateName"
                    @input="validateName"
                  />
                  <div v-if="nameError" class="mt-1 text-xs text-red-600">
                    {{ nameError }}
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="userForm.email"
                    type="email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                    :class="{
                      'border-red-300 focus:border-red-500 focus:ring-red-500': emailError
                    }"
                    placeholder="Digite o e-mail"
                    @blur="validateEmail"
                    @input="validateEmail"
                  />
                  <div v-if="emailError" class="mt-1 text-xs text-red-600">
                    {{ emailError }}
                  </div>
                </div>
              </div>

              <!-- Bloco 2: Configurações de Acesso -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  Configurações de Acesso
                </h4>

                <!-- Password -->
                <div class="mb-3 relative">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ showCreateModal ? 'Senha' : 'Nova Senha' }}
                    <span v-if="showCreateModal" class="text-red-500">*</span>
                    <span v-else class="text-gray-500 font-normal">(opcional)</span>
                    <button
                      type="button"
                      @mouseenter="() => { clearTooltipTimer('password'); showTooltipWithDelay('password'); }"
                      @mouseleave="() => { clearTooltipTimer('password'); hideTooltipWithDelay('password'); }"
                      class="ml-1 text-gray-400 hover:text-blue-500 transition-colors relative"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <!-- Tooltip customizado -->
                      <div
                        v-if="showPasswordTooltip"
                        class="absolute z-50 px-2.5 py-1.5 text-xs text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm max-w-40"
                        style="top: 100%; left: 50%; transform: translateX(-50%); margin-top: 6px; white-space: nowrap;"
                      >
                        Mínimo 6 caracteres
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-b-3 border-transparent border-b-gray-200"></div>
                      </div>
                    </button>
                  </label>
                  <input
                    v-model="userForm.password"
                    type="password"
                    :required="showCreateModal"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                    :class="{
                      'border-red-300 focus:border-red-500 focus:ring-red-500': passwordError
                    }"
                    :placeholder="showCreateModal ? 'Digite a senha (mín. 6 caracteres)' : 'Deixe em branco para não alterar'"
                    @blur="validatePassword"
                    @input="validatePassword"
                  />
                  <div v-if="passwordError" class="mt-1 text-xs text-red-600">
                    {{ passwordError }}
                  </div>
                  <div v-if="!showCreateModal && !passwordError" class="mt-1 flex items-center text-xs text-gray-500">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Se não quiser alterar a senha, deixe este campo em branco
                  </div>
                  <div v-if="showCreateModal && userForm.password && !passwordError" class="mt-1 flex items-center text-xs text-green-600">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Senha válida
                  </div>
                </div>

                <!-- Role -->
                <div class="relative">
                  <label class="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Função
                    <span class="text-red-500 ml-1">*</span>
                    <button
                      type="button"
                      @mouseenter="() => { clearTooltipTimer('role'); showTooltipWithDelay('role'); }"
                      @mouseleave="() => { clearTooltipTimer('role'); hideTooltipWithDelay('role'); }"
                      class="ml-1 text-gray-400 hover:text-blue-500 transition-colors relative"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <!-- Tooltip customizado -->
                      <div
                        v-if="showRoleTooltip"
                        class="absolute z-50 px-2.5 py-1.5 text-xs text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm max-w-40"
                        style="top: 100%; left: 50%; transform: translateX(-50%); margin-top: 6px; white-space: nowrap;"
                      >
                        {{ userForm.role === 'admin' ? 'Acesso completo' : 'Acesso básico' }}
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-b-3 border-transparent border-b-gray-200"></div>
                      </div>
                    </button>
                  </label>
                  <select
                    v-model="userForm.role"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <div class="mt-1 flex items-center text-xs text-gray-500">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Define os níveis de acesso do usuário no sistema
                  </div>
                </div>
              </div>

              <!-- Bloco 3: Status do Usuário -->
              <div v-if="authStore.user?.role === 'admin' && showEditModal">
                <h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Status do Usuário
                </h4>
                
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-700 mr-3">Usuário ativo</span>
                    <span class="text-xs text-gray-500">Permite acesso ao sistema</span>
                  </div>
                  <button
                    type="button"
                    @click="userForm.is_active = !userForm.is_active"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                      userForm.is_active ? 'bg-indigo-600' : 'bg-gray-200'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                        userForm.is_active ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    ></span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Footer com botões fixos -->
          <div class="flex items-center justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
            <button
              @click="closeModal"
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              @click="saveUser"
              type="button"
              :disabled="nameError || emailError || passwordError || isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span v-if="isSubmitting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
              <span v-else>
                {{ showCreateModal ? 'Criar Usuário' : 'Salvar Alterações' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Critical Changes Confirmation Modal -->
    <div v-if="showCriticalChangesModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4 text-center">Confirmar Alteração Crítica</h3>
          <p class="text-sm text-gray-500 mt-2 text-center">
            {{ criticalChangeMessage }}
          </p>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="cancelCriticalChange"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              @click="confirmCriticalChange"
              class="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4 text-center">Confirmar exclusão</h3>
          <p class="text-sm text-gray-500 mt-2 text-center">
            Tem certeza que deseja deletar o usuário <strong>{{ userToDelete?.name }}</strong>? Esta ação não pode ser desfeita.
          </p>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              @click="confirmDelete"
              :disabled="usersStore.loading"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {{ usersStore.loading ? 'Deletando...' : 'Deletar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue';
import { useUsersStore } from '../stores/users';
import { useAuthStore } from '../stores/auth';

export default {
  name: 'UserManagement',
  setup() {
    const usersStore = useUsersStore();
    const authStore = useAuthStore();

    // Modal states
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const showDeleteModal = ref(false);
    const showCriticalChangesModal = ref(false);
    const userToDelete = ref(null);
    const userToEdit = ref(null);
    const isSubmitting = ref(false);

    // Sorting state
    const sortField = ref('name');
    const sortDirection = ref('asc');

    // Feedback states
    const feedbackMessage = ref('');
    const feedbackType = ref('success');

    // Critical changes state
    const criticalChangeMessage = ref('');
    const pendingCriticalChange = ref(null);

    // Form data
    const userForm = reactive({
      name: '',
      email: '',
      password: '',
      role: 'user',
      is_active: true
    });

    // Store original values for comparison
    const originalUserData = ref(null);

    // Load users on mount
    onMounted(async () => {
      await usersStore.fetchUsers();
    });

    // Sorted users computed property
    const sortedUsers = computed(() => {
      const users = [...usersStore.allUsers];
      
      users.sort((a, b) => {
        let aValue = a[sortField.value];
        let bValue = b[sortField.value];
        
        // Handle special cases
        if (sortField.value === 'name') {
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
        } else if (sortField.value === 'email') {
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
        } else if (sortField.value === 'role') {
          aValue = a.role === 'admin' ? 1 : 0;
          bValue = b.role === 'admin' ? 1 : 0;
        } else if (sortField.value === 'is_active') {
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
        } else if (sortField.value === 'created_at') {
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
        }
        
        if (aValue < bValue) {
          return sortDirection.value === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection.value === 'asc' ? 1 : -1;
        }
        return 0;
      });
      
      return users;
    });

    // Sort function
    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortField.value = field;
        sortDirection.value = 'asc';
      }
    };

    // Generate avatar color based on user name
    const getUserAvatarColor = (name) => {
      const colors = [
        '#3B82F6', // blue
        '#8B5CF6', // purple
        '#10B981', // green
        '#F59E0B', // yellow
        '#EF4444', // red
        '#06B6D4', // cyan
        '#F97316', // orange
        '#EC4899', // pink
        '#84CC16', // lime
        '#6366F1'  // indigo
      ];
      
      const hash = name.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      
      return colors[Math.abs(hash) % colors.length];
    };

    // Tooltip functions
    const getRoleTooltip = (role) => {
      if (role === 'admin') {
        return 'Administrador: Acesso completo ao sistema, pode gerenciar usuários e todas as funcionalidades';
      } else {
        return 'Usuário: Acesso limitado às funcionalidades básicas do sistema';
      }
    };

    const getStatusTooltip = (isActive) => {
      if (isActive) {
        return 'Usuário ativo: Pode fazer login e usar o sistema normalmente';
      } else {
        return 'Usuário inativo: Não pode fazer login no sistema';
      }
    };

    // Show feedback message
    const showFeedback = (message, type = 'success') => {
      feedbackMessage.value = message;
      feedbackType.value = type;
      
      // Auto-hide success messages after 3 seconds
      if (type === 'success') {
        setTimeout(() => {
          feedbackMessage.value = '';
        }, 3000);
      }
    };

    // Clear feedback
    const clearFeedback = () => {
      feedbackMessage.value = '';
    };

    // Validation states
    const nameError = ref('');
    const emailError = ref('');
    const passwordError = ref('');

    // Tooltip states
    const showRoleTooltip = ref(false);
    const showPasswordTooltip = ref(false);
    const showStatusTooltip = ref(null);
    
    // Tooltip timers
    let roleTooltipTimer = null;
    let passwordTooltipTimer = null;
    let statusTooltipTimer = null;

    // Show tooltip with delay
    const showTooltipWithDelay = (tooltipType, value, delay = 200) => {
      const timer = setTimeout(() => {
        if (tooltipType === 'role') {
          showRoleTooltip.value = true;
        } else if (tooltipType === 'password') {
          showPasswordTooltip.value = true;
        } else if (tooltipType === 'status') {
          showStatusTooltip.value = value;
        }
      }, delay);
      
      if (tooltipType === 'role') {
        roleTooltipTimer = timer;
      } else if (tooltipType === 'password') {
        passwordTooltipTimer = timer;
      } else if (tooltipType === 'status') {
        statusTooltipTimer = timer;
      }
    };

    // Hide tooltip with delay
    const hideTooltipWithDelay = (tooltipType, delay = 200) => {
      const timer = setTimeout(() => {
        if (tooltipType === 'role') {
          showRoleTooltip.value = false;
        } else if (tooltipType === 'password') {
          showPasswordTooltip.value = false;
        } else if (tooltipType === 'status') {
          showStatusTooltip.value = null;
        }
      }, delay);
      
      if (tooltipType === 'role') {
        roleTooltipTimer = timer;
      } else if (tooltipType === 'password') {
        passwordTooltipTimer = timer;
      } else if (tooltipType === 'status') {
        statusTooltipTimer = timer;
      }
    };

    // Clear tooltip timer
    const clearTooltipTimer = (tooltipType) => {
      if (tooltipType === 'role' && roleTooltipTimer) {
        clearTimeout(roleTooltipTimer);
        roleTooltipTimer = null;
      } else if (tooltipType === 'password' && passwordTooltipTimer) {
        clearTimeout(passwordTooltipTimer);
        passwordTooltipTimer = null;
      } else if (tooltipType === 'status' && statusTooltipTimer) {
        clearTimeout(statusTooltipTimer);
        statusTooltipTimer = null;
      }
    };

    // Validate name
    const validateName = () => {
      if (!userForm.name.trim()) {
        nameError.value = 'Nome é obrigatório';
      } else {
        nameError.value = '';
      }
    };

    // Validate email
    const validateEmail = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!userForm.email.trim()) {
        emailError.value = 'Email é obrigatório';
      } else if (!emailRegex.test(userForm.email)) {
        emailError.value = 'Formato de email inválido';
      } else {
        emailError.value = '';
      }
    };

    // Validate password
    const validatePassword = () => {
      if (showCreateModal.value && !userForm.password.trim()) {
        passwordError.value = 'Senha é obrigatória para novos usuários';
      } else if (userForm.password && userForm.password.length < 6) {
        passwordError.value = 'A senha deve ter pelo menos 6 caracteres';
      } else {
        passwordError.value = '';
      }
    };

    // Check for critical changes
    const hasCriticalChanges = (originalData, newData) => {
      // Role change
      if (originalData.role !== newData.role) {
        return {
          type: 'role',
          message: `Tem certeza que deseja alterar a função do usuário "${originalData.name}" de "${originalData.role === 'admin' ? 'Administrador' : 'Usuário'}" para "${newData.role === 'admin' ? 'Administrador' : 'Usuário'}"?`
        };
      }
      
      // Status change (activation/deactivation)
      if (originalData.is_active !== newData.is_active) {
        return {
          type: 'status',
          message: `Tem certeza que deseja ${newData.is_active ? 'ativar' : 'desativar'} o usuário "${originalData.name}"? ${newData.is_active ? 'Ele poderá fazer login no sistema.' : 'Ele não poderá mais fazer login no sistema.'}`
        };
      }
      
      return null;
    };

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('pt-BR');
    };

    // Create user
    const createUser = async () => {
      clearFeedback();
      validateName();
      validateEmail();
      validatePassword();
      
      if (nameError.value || emailError.value || passwordError.value) {
        showFeedback('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
        return;
      }

      // Preparar dados para envio
      const userData = {
        name: userForm.name.trim(),
        email: userForm.email.trim().toLowerCase(),
        password: userForm.password.trim(),
        role: userForm.role,
        is_active: userForm.is_active
      };
      
      try {
        const result = await usersStore.createUser(userData);
        if (result.success) {
          showFeedback('Usuário criado com sucesso!', 'success');
          setTimeout(() => {
            closeModal();
            resetForm();
          }, 1500);
        } else {
          // Tratar diferentes tipos de erro
          let errorMessage = result.error;
          
          if (result.error.includes('400') || result.error.includes('Bad Request')) {
            errorMessage = 'Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.';
          } else if (result.error.includes('409') || result.error.includes('Conflict')) {
            errorMessage = 'Este email já está sendo usado por outro usuário.';
          } else if (result.error.includes('500') || result.error.includes('Internal Server Error')) {
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
          } else if (result.error.includes('connection') || result.error.includes('network')) {
            errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
          }
          
          showFeedback(errorMessage, 'error');
        }
      } catch (error) {
        console.error('Erro detalhado ao criar usuário:', error);
        
        let errorMessage = 'Erro ao criar usuário. Tente novamente.';
        
        // Analisar o erro específico
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          
          switch (status) {
            case 400:
              if (data.message) {
                errorMessage = `Erro de validação: ${data.message}`;
              } else if (data.errors) {
                const validationErrors = Object.values(data.errors).flat();
                errorMessage = `Erro de validação: ${validationErrors.join(', ')}`;
              } else {
                errorMessage = 'Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.';
              }
              break;
            case 409:
              errorMessage = 'Este email já está sendo usado por outro usuário.';
              break;
            case 401:
              errorMessage = 'Sessão expirada. Faça login novamente.';
              break;
            case 403:
              errorMessage = 'Você não tem permissão para criar usuários.';
              break;
            case 500:
              errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
              break;
            default:
              errorMessage = `Erro ${status}: ${data.message || 'Erro desconhecido'}`;
          }
        } else if (error.request) {
          errorMessage = 'Erro de conexão. Verifique se o servidor está rodando e tente novamente.';
        } else {
          errorMessage = 'Erro inesperado. Tente novamente.';
        }
        
        showFeedback(errorMessage, 'error');
      }
    };

    // Edit user
    const editUser = (user) => {
      userToEdit.value = user;
      userForm.name = user.name;
      userForm.email = user.email;
      userForm.password = '';
      userForm.role = user.role;
      userForm.is_active = user.is_active;
      
      // Store original data for comparison
      originalUserData.value = {
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      };
      
      clearFeedback();
      showEditModal.value = true;
    };

    // Update user
    const updateUser = async () => {
      clearFeedback();
      validateName();
      validateEmail();
      validatePassword();
      
      if (nameError.value || emailError.value || passwordError.value) {
        showFeedback('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
        return;
      }
      
      // Check for critical changes
      const criticalChange = hasCriticalChanges(originalUserData.value, userForm);
      
      if (criticalChange) {
        criticalChangeMessage.value = criticalChange.message;
        pendingCriticalChange.value = criticalChange;
        showCriticalChangesModal.value = true;
        return;
      }
      
      // No critical changes, proceed with update
      await performUpdate();
    };

    // Perform the actual update
    const performUpdate = async () => {
      try {
        const result = await usersStore.updateUser(userToEdit.value.id, userForm);
        if (result.success) {
          showFeedback('Usuário atualizado com sucesso!', 'success');
          setTimeout(() => {
            closeModal();
            resetForm();
          }, 1500);
        } else {
          // Tratar diferentes tipos de erro
          let errorMessage = result.error;
          
          if (result.error.includes('400') || result.error.includes('Bad Request')) {
            errorMessage = 'Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.';
          } else if (result.error.includes('409') || result.error.includes('Conflict')) {
            errorMessage = 'Este email já está sendo usado por outro usuário.';
          } else if (result.error.includes('404') || result.error.includes('Not Found')) {
            errorMessage = 'Usuário não encontrado.';
          } else if (result.error.includes('500') || result.error.includes('Internal Server Error')) {
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
          } else if (result.error.includes('connection') || result.error.includes('network')) {
            errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
          }
          
          showFeedback(errorMessage, 'error');
        }
      } catch (error) {
        console.error('Erro detalhado ao atualizar usuário:', error);
        
        let errorMessage = 'Erro ao atualizar usuário. Tente novamente.';
        
        // Analisar o erro específico
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          
          switch (status) {
            case 400:
              if (data.message) {
                errorMessage = `Erro de validação: ${data.message}`;
              } else if (data.errors) {
                const validationErrors = Object.values(data.errors).flat();
                errorMessage = `Erro de validação: ${validationErrors.join(', ')}`;
              } else {
                errorMessage = 'Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.';
              }
              break;
            case 404:
              errorMessage = 'Usuário não encontrado.';
              break;
            case 409:
              errorMessage = 'Este email já está sendo usado por outro usuário.';
              break;
            case 401:
              errorMessage = 'Sessão expirada. Faça login novamente.';
              break;
            case 403:
              errorMessage = 'Você não tem permissão para editar usuários.';
              break;
            case 500:
              errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
              break;
            default:
              errorMessage = `Erro ${status}: ${data.message || 'Erro desconhecido'}`;
          }
        } else if (error.request) {
          errorMessage = 'Erro de conexão. Verifique se o servidor está rodando e tente novamente.';
        } else {
          errorMessage = 'Erro inesperado. Tente novamente.';
        }
        
        showFeedback(errorMessage, 'error');
      }
    };

    // Confirm critical change
    const confirmCriticalChange = async () => {
      showCriticalChangesModal.value = false;
      await performUpdate();
    };

    // Cancel critical change
    const cancelCriticalChange = () => {
      showCriticalChangesModal.value = false;
      pendingCriticalChange.value = null;
      
      // Revert form to original values
      if (originalUserData.value) {
        userForm.role = originalUserData.value.role;
        userForm.is_active = originalUserData.value.is_active;
      }
    };

    // Delete user
    const deleteUser = (user) => {
      userToDelete.value = user;
      showDeleteModal.value = true;
    };

    // Confirm delete
    const confirmDelete = async () => {
      try {
        const result = await usersStore.deleteUser(userToDelete.value.id);
        if (result.success) {
          showFeedback('Usuário deletado com sucesso!', 'success');
          showDeleteModal.value = false;
          userToDelete.value = null;
        } else {
          showFeedback(`Erro ao deletar usuário: ${result.error}`, 'error');
        }
      } catch (error) {
        showFeedback('Erro ao deletar usuário. Tente novamente.', 'error');
      }
    };

    // Close modal
    const closeModal = () => {
      showCreateModal.value = false;
      showEditModal.value = false;
      clearFeedback();
      resetForm();
      userToEdit.value = null;
      originalUserData.value = null;
    };

    // Reset form
    const resetForm = () => {
      userForm.name = '';
      userForm.email = '';
      userForm.password = '';
      userForm.role = 'user';
      userForm.is_active = true;
      nameError.value = '';
      emailError.value = '';
      passwordError.value = '';
    };

    return {
      usersStore,
      authStore,
      showCreateModal,
      showEditModal,
      showDeleteModal,
      showCriticalChangesModal,
      userToDelete,
      userForm,
      sortField,
      sortDirection,
      sortedUsers,
      feedbackMessage,
      feedbackType,
      criticalChangeMessage,
      formatDate,
      sortBy,
      getUserAvatarColor,
      getRoleTooltip,
      getStatusTooltip,
      createUser,
      editUser,
      updateUser,
      confirmCriticalChange,
      cancelCriticalChange,
      deleteUser,
      confirmDelete,
      closeModal,
      nameError,
      emailError,
      passwordError,
      validateName,
      validateEmail,
      validatePassword,
      showRoleTooltip,
      showPasswordTooltip,
      showStatusTooltip,
      showTooltipWithDelay,
      hideTooltipWithDelay,
      clearTooltipTimer,
      isSubmitting
    };
  }
};
</script>

<style scoped>
/* Melhorar transições e hover effects */
.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.hover\:shadow-sm:hover {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Melhorar cursor pointer para elementos clicáveis */
.cursor-pointer {
  cursor: pointer;
}

.cursor-help {
  cursor: help;
}

/* Melhorar transições */
.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

/* Melhorar alinhamento vertical */
.align-middle {
  vertical-align: middle;
}

/* Melhorar espaçamento dos botões */
.space-x-3 > * + * {
  margin-left: 0.75rem;
}

/* Melhorar hover dos headers da tabela */
thead th:hover {
  background-color: #f3f4f6;
}

/* Melhorar contraste dos botões */
.bg-blue-600 {
  background-color: #2563eb;
}

.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.bg-red-600 {
  background-color: #dc2626;
}

.hover\:bg-red-700:hover {
  background-color: #b91c1c;
}

/* Tooltip animations */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

.tooltip-enter-to,
.tooltip-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style> 