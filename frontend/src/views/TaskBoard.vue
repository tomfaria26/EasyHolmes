<template>
  <div class="space-y-6">
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">
          Quadro de Tarefas
        </h1>
        <div class="flex space-x-3">
          <button
            @click="refreshData"
            :disabled="loading"
            class="btn btn-secondary flex items-center"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Atualizar
          </button>
          <button @click="openNewProcessModal" class="btn btn-primary">
            Novo Processo
          </button>
          


        </div>
      </div>

      <!-- Mensagem de erro -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Campo de Pesquisa com Tags -->
      <div class="mb-6">
        <div class="flex flex-wrap items-center gap-2 p-3 border border-gray-300 rounded-lg bg-white">
          <!-- Tags ativas -->
          <div
            v-for="tag in activeTags"
            :key="tag.id"
            class="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
          >
            <span>{{ tag.label }}</span>
            <button
              @click="removeTag(tag.id)"
              class="ml-1 text-blue-600 hover:text-blue-800"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Campo de pesquisa -->
          <input
            v-model="searchQuery"
            @input="handleSearchInput"
            @keydown.enter="addCurrentSuggestion"
            @keydown.escape="clearSearch"
            @focus="showSuggestions = true"
            @blur="handleBlur"
            type="text"
            placeholder="Pesquisar por processo, obra, disciplina, fase..."
            class="flex-1 min-w-0 px-2 py-1 border-none outline-none text-sm"
          />
          
          <!-- Botão limpar -->
          <button
            v-if="activeTags.length > 0"
            @click="clearAllTags"
            class="text-gray-500 hover:text-gray-700 text-sm"
          >
            Limpar tudo
          </button>
        </div>
        
        <!-- Sugestões -->
        <div
          v-if="showSuggestions && filteredSuggestions.length > 0"
          class="absolute z-10 w-full max-w-2xl mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <div
            v-for="suggestion in filteredSuggestions"
            :key="suggestion.id"
            @click="addTag(suggestion)"
            @mouseenter="hoveredSuggestion = suggestion.id"
            :class="[
              'px-4 py-2 cursor-pointer text-sm hover:bg-gray-100',
              hoveredSuggestion === suggestion.id ? 'bg-gray-100' : ''
            ]"
          >
            <div class="flex items-center gap-2">
              <span class="text-gray-500 text-xs">{{ suggestion.type }}</span>
              <span class="font-medium">{{ suggestion.label }}</span>
              <span v-if="suggestion.description" class="text-gray-600 text-xs">{{ suggestion.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-lg font-medium text-gray-700 mb-2">Carregando dados...</p>
          <p class="text-sm text-gray-500">Buscando tarefas e processos</p>
          <div class="mt-4 flex space-x-2">
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTasks.length === 0" class="text-center py-12">
        <svg class="h-16 w-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <p class="mt-4 text-gray-500">
          {{ activeTags.length > 0 ? 'Nenhuma tarefa encontrada com os filtros aplicados' : 'Nenhuma tarefa encontrada' }}
        </p>
        <p class="text-sm text-gray-400">
          {{ activeTags.length > 0 ? 'Tente ajustar os filtros ou limpar a pesquisa' : 'Tente ajustar os filtros ou criar uma nova tarefa' }}
        </p>
        <div v-if="activeTags.length > 0" class="mt-4">
          <button
            @click="clearAllTags"
            class="btn btn-secondary text-sm"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

             <!-- KanBan Board -->
       <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- Coluna: Em Andamento -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Em Andamento
                         <span class="ml-auto bg-yellow-200 text-yellow-700 px-2 py-1 rounded-full text-sm">
               {{ filteredTasks.filter(t => t.status === 'in-progress').length }}
             </span>
          </h3>

                     <div class="space-y-3 min-h-[200px]">
             <div
               v-for="task in filteredTasks.filter(t => t.status === 'in-progress')"
               :key="task.id"
               class="bg-white rounded-lg p-4 shadow-sm border border-yellow-200 cursor-pointer hover:shadow-md transition-shadow"
               @click="openTaskDetails(task)"
             >
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-medium text-gray-900 text-sm">{{ task.name || 'Tarefa sem nome' }}</h4>
              </div>
              <p class="text-xs text-gray-600 mb-2">{{ task.processIdentifier || 'Processo não encontrado' }}</p>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500 flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Criada: {{ formatDate(task.created_at, false) }}
                </span>
                <span v-if="task.due_date" class="text-xs flex items-center" :class="getSlaColor(task.due_date)">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  SLA: {{ formatDate(task.due_date, false) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna: Concluído -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 flex items-center">
              <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Concluído
              <span class="ml-2 bg-green-200 text-green-700 px-2 py-1 rounded-full text-sm">
                {{ filteredTasks.filter(t => t.status === 'completed').length }}
              </span>
            </h3>
                         <div class="flex space-x-2" v-if="Object.keys(groupedCompletedTasks).length > 0">
               <button
                 @click="expandAllGroups"
                 class="text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                 title="Expandir todos os grupos"
               >
                 <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                 </svg>
                 Expandir
               </button>
               <button
                 @click="collapseAllGroups"
                 class="text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                 title="Recolher todos os grupos"
               >
                 <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                 </svg>
                 Recolher
               </button>
             </div>
          </div>

          <div class="space-y-4 min-h-[200px]">
            <!-- Grupos de processos -->
                         <div
               v-for="(processGroup, processIdentifier) in groupedCompletedTasks"
               :key="processIdentifier"
               class="bg-white rounded-lg border border-gray-200 overflow-hidden"
             >
               <!-- Header do grupo -->
               <div
                 class="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                 @click="toggleProcessGroup(processIdentifier)"
               >
                 <div class="flex items-center space-x-2">
                   <svg
                     :class="[
                       'w-4 h-4 text-gray-600 transition-transform duration-200',
                       expandedGroups.includes(processIdentifier) ? 'rotate-90' : ''
                     ]"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                   </svg>
                   <div>
                     <h4 class="font-medium text-gray-800 text-sm">{{ processIdentifier || 'Processo não identificado' }}</h4>
                     <p class="text-xs text-gray-600">{{ processGroup.length }} tarefa{{ processGroup.length !== 1 ? 's' : '' }} concluída{{ processGroup.length !== 1 ? 's' : '' }}</p>
                   </div>
                 </div>
                 <div class="flex items-center space-x-2">
                   <span class="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                     {{ processGroup.length }}
                   </span>
                 </div>
               </div>

                             <!-- Conteúdo do grupo (dropdown) -->
               <div
                 v-show="expandedGroups.includes(processIdentifier)"
                 class="divide-y divide-gray-100"
               >
                <div
                  v-for="task in processGroup"
                  :key="task.id"
                  class="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  @click="openTaskDetails(task)"
                >
                  <div class="flex justify-between items-start mb-2">
                    <h5 class="font-medium text-gray-900 text-sm flex-1 mr-2">{{ task.name || 'Tarefa sem nome' }}</h5>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-500 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Criada: {{ formatDate(task.created_at, false) }}
                    </span>
                    <span v-if="task.completion_date" class="text-green-600 font-medium flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Concluída: {{ formatDate(task.completion_date, false) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Estado vazio para tarefas concluídas -->
            <div v-if="Object.keys(groupedCompletedTasks).length === 0" class="text-center py-8">
              <svg class="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm text-gray-500">Nenhuma tarefa concluída</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal de Detalhes da Tarefa -->
    <div v-if="showTaskModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <!-- Header do Modal -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ selectedTask?.status === 'completed' ? 'Detalhes da Tarefa' : 'Concluir Tarefa' }}
            </h3>
          </div>
          <button
            @click="closeTaskModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="p-6">
          <!-- Informações da Tarefa -->
          <div class="space-y-4">
            <!-- Nome da Tarefa -->
            <div>
              <h4 class="text-xl font-medium text-gray-900 mb-2">
                {{ selectedTask?.name || 'Tarefa sem nome' }}
              </h4>
            </div>

            <!-- Processo -->
            <div class="flex items-center">
              <span class="text-sm font-medium text-gray-700 mr-2">Processo:</span>
              <span class="text-sm text-gray-600">{{ selectedTask?.processIdentifier || 'Processo não encontrado' }}</span>
            </div>

            <!-- Status -->
            <div class="flex items-center">
              <span class="text-sm font-medium text-gray-700 mr-2">Status:</span>
              <span 
                v-if="selectedTask?.status === 'completed'"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                Concluído
              </span>
              <span 
                v-else
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
              >
                Em Andamento
              </span>
            </div>

            <!-- Data de Criação -->
            <div class="flex items-center">
              <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-sm font-medium text-gray-700 mr-2">Criada:</span>
              <span class="text-sm text-gray-600">{{ formatDate(selectedTask?.created_at, false) }}</span>
            </div>

            <!-- SLA -->
            <div v-if="selectedTask?.due_date" class="flex items-center">
              <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span class="text-sm font-medium text-gray-700 mr-2">SLA:</span>
              <span class="text-sm" :class="getSlaColor(selectedTask?.due_date)">
                {{ formatDate(selectedTask?.due_date, false) }}
              </span>
            </div>

            <!-- Data de Conclusão -->
            <div v-if="selectedTask?.completion_date" class="flex items-center">
              <svg class="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-sm font-medium text-gray-700 mr-2">Concluída:</span>
              <span class="text-sm text-green-600 font-medium">
                {{ formatDate(selectedTask?.completion_date, false) }}
              </span>
            </div>
          </div>

          <!-- Propriedades da Tarefa -->
          <div v-if="selectedTask?.status !== 'completed' && taskProperties.filter(p => !p.hidden).length > 0" class="mt-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Propriedades da Tarefa</h4>
            <div class="space-y-4">
              <div
                v-for="property in taskProperties.filter(p => !p.hidden)"
                :key="property.id"
                class="space-y-2"
              >
                <label :for="property.id" class="block text-sm font-medium text-gray-700">
                  {{ property.name }}
                  <span v-if="property.required" class="text-red-500">*</span>
                </label>
                <!-- Propriedade somente leitura -->
                <template v-if="property.read_only === true">
                  <span 
                    class="inline-block w-full bg-gray-100 px-3 py-2 rounded-md text-gray-600 border border-gray-300 cursor-not-allowed select-none pointer-events-none user-select-none"
                    style="user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; pointer-events: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent;"
                    @click.prevent
                    @keydown.prevent
                    @input.prevent
                    @focus.prevent
                    @blur.prevent
                    @mousedown.prevent
                    @mouseup.prevent
                    @touchstart.prevent
                    @touchend.prevent
                    tabindex="-1"
                    contenteditable="false"
                    unselectable="on"
                  >
                    {{ property.value || '—' }}
                  </span>
                </template>
                <!-- Dropdown -->
                <template v-else-if="property.options && property.options.length > 0">
                  <select
                    :id="property.id"
                    v-model="selectedPropertyValues[property.id]"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    :required="property.required"
                  >
                    <option value="">Selecione uma opção</option>
                    <option
                      v-for="option in property.options"
                      :key="option.id"
                      :value="option.id"
                    >
                      {{ option.name }}
                    </option>
                  </select>
                </template>
                <!-- Campo de texto -->
                <template v-else>
                  <input
                    :id="property.id"
                    v-model="selectedPropertyValues[property.id]"
                    type="text"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    :placeholder="`Digite o valor para ${property.name}`"
                    :required="property.required"
                  />
                </template>
              </div>
            </div>
          </div>

          <!-- Pergunta de Confirmação -->
          <div v-if="selectedTask?.status !== 'completed'" class="mt-6">
            <p class="text-gray-700">Deseja marcar esta tarefa como concluída?</p>
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            @click="closeTaskModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ selectedTask?.status === 'completed' ? 'Fechar' : 'Cancelar' }}
          </button>
          <button
            v-if="selectedTask?.status !== 'completed'"
            @click="completeTask"
            :disabled="updatingTasks.includes(selectedTask?.id)"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg v-if="updatingTasks.includes(selectedTask?.id)" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ updatingTasks.includes(selectedTask?.id) ? 'Concluindo...' : 'Concluir Tarefa' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Novo Processo -->
    <div v-if="showNewProcessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <!-- Header do Modal -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">
              Novo Processo
            </h3>
          </div>
          <button
            @click="closeNewProcessModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="p-6">
          <form @submit.prevent="createNewProcess" class="space-y-4">
            <!-- Disciplina -->
            <div>
              <label for="disciplina" class="block text-sm font-medium text-gray-700 mb-1">
                Disciplina *
              </label>
              <input
                id="disciplina"
                v-model="newProcessForm.disciplina"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: ARQ, EST, HID, HIN..."
              />
            </div>

            <!-- Etapa -->
            <div>
              <label for="etapa" class="block text-sm font-medium text-gray-700 mb-1">
                Etapa *
              </label>
              <input
                id="etapa"
                v-model="newProcessForm.etapa"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: EP, PB, PR, PE..."
              />
            </div>

            <!-- Instância -->
            <div>
              <label for="instancia" class="block text-sm font-medium text-gray-700 mb-1">
                Instância *
              </label>
              <select
                id="instancia"
                v-model="newProcessForm.instancia"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :disabled="loadingInstances"
              >
                <option value="">Selecione uma instância</option>
                <option
                  v-for="instance in instances"
                  :key="instance.id"
                  :value="instance.id"
                >
                  {{ instance.name }}
                </option>
              </select>
              <div v-if="loadingInstances" class="mt-1 text-sm text-gray-500">
                Carregando instâncias...
              </div>
            </div>
          </form>
        </div>

        <!-- Botões de Ação -->
        <div class="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            @click="closeNewProcessModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            @click="createNewProcess"
            :disabled="creatingProcess || !newProcessForm.disciplina.trim() || !newProcessForm.etapa.trim() || !newProcessForm.instancia"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg v-if="creatingProcess" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ creatingProcess ? 'Criando...' : 'Criar Processo' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useProcessesStore } from '../stores/processes'
import { storeToRefs } from 'pinia'
import { taskService } from '../services/api'
import { useNotifications } from '../composables/useNotifications'

export default {
  name: 'TaskBoard',
  setup() {
    const processesStore = useProcessesStore()
    const { loading } = storeToRefs(processesStore)
    
    const selectedProcess = ref('')
    const selectedObra = ref('')
    const selectedDisciplina = ref('')
    const selectedFase = ref('')
    
    // Sistema de tags
    const searchQuery = ref('')
    const activeTags = ref([])
    const showSuggestions = ref(false)
    const hoveredSuggestion = ref(null)
    
    // Loading states
    const updatingTasks = ref([])
    const filteringTasks = ref(false)
    
    // Estado dos grupos expandidos
    const expandedGroups = ref([])

    // Estado do modal
    const showTaskModal = ref(false)
    const selectedTask = ref(null)

    // Propriedades da tarefa
    const taskProperties = ref([])
    const selectedPropertyValues = ref({})

    // Estado do modal de novo processo
    const showNewProcessModal = ref(false)
    const newProcessForm = ref({
      disciplina: '',
      etapa: '',
      instancia: ''
    })
    const instances = ref([])
    const loadingInstances = ref(false)
    const creatingProcess = ref(false)

    // Usar sistema de notificações global
    const { showSuccess, showError, showInfo } = useNotifications()


    const error = computed(() => processesStore.error)
    const tasks = computed(() => processesStore.tasks)
    const processes = computed(() => processesStore.processes)
    const tasksByStatus = computed(() => processesStore.tasksByStatus)

    // Função para extrair componentes do identifier do processo
    const extractProcessComponents = (identifier) => {
      if (!identifier) return { obra: '', disciplina: '', fase: '' }
      
      // Padrão: "Auditoria BIM-R24-ARQ-PB"
      const match = identifier.match(/Auditoria BIM-([^-]+)-([^-]+)-([^-]+)/)
      if (match) {
        return {
          obra: match[1],
          disciplina: match[2],
          fase: match[3]
        }
      }
      return { obra: '', disciplina: '', fase: '' }
    }

    // Extrair valores únicos para os filtros
    const uniqueObras = computed(() => {
      const obras = new Set()
      processes.value.forEach(process => {
        const { obra } = extractProcessComponents(process.identifier)
        if (obra) obras.add(obra)
      })
      return Array.from(obras).sort()
    })

    const uniqueDisciplinas = computed(() => {
      const disciplinas = new Set()
      processes.value.forEach(process => {
        const { disciplina } = extractProcessComponents(process.identifier)
        if (disciplina) disciplinas.add(disciplina)
      })
      return Array.from(disciplinas).sort()
    })

    const uniqueFases = computed(() => {
      const fases = new Set()
      processes.value.forEach(process => {
        const { fase } = extractProcessComponents(process.identifier)
        if (fase) fases.add(fase)
      })
      return Array.from(fases).sort()
    })

             // Gerar todas as sugestões disponíveis
    const allSuggestions = computed(() => {
      const suggestions = []
      
      // Processos completos
      processes.value.forEach(process => {
        if (process.identifier) {
          suggestions.push({
            id: `process-${process.id}`,
            type: 'Processo',
            label: process.identifier,
            value: process.id,
            filterType: 'process',
            description: 'Processo completo'
          })
        }
      })
      
      // Obras
      uniqueObras.value.forEach(obra => {
        suggestions.push({
          id: `obra-${obra}`,
          type: 'Obra',
          label: obra,
          value: obra,
          filterType: 'obra',
          description: 'Filtrar por obra'
        })
      })
      
      // Disciplinas
      uniqueDisciplinas.value.forEach(disciplina => {
        suggestions.push({
          id: `disciplina-${disciplina}`,
          type: 'Disciplina',
          label: disciplina,
          value: disciplina,
          filterType: 'disciplina',
          description: 'Filtrar por disciplina'
        })
      })
      
      // Fases
      uniqueFases.value.forEach(fase => {
        suggestions.push({
          id: `fase-${fase}`,
          type: 'Fase',
          label: fase,
          value: fase,
          filterType: 'fase',
          description: 'Filtrar por fase'
        })
      })
      
      return suggestions
    })

    // Filtrar sugestões baseado na pesquisa
    const filteredSuggestions = computed(() => {
      if (!searchQuery.value) return allSuggestions.value
      
      const query = searchQuery.value.toLowerCase()
      return allSuggestions.value.filter(suggestion => {
        // Verificar se já está ativa
        const isActive = activeTags.value.some(tag => tag.id === suggestion.id)
        if (isActive) return false
        
        return suggestion.label.toLowerCase().includes(query) ||
               suggestion.type.toLowerCase().includes(query) ||
               suggestion.description.toLowerCase().includes(query)
      })
    })

                                                                                                                                                               // Filtrar tarefas baseado nas tags ativas
    const filteredTasks = computed(() => {
      let filtered = tasks.value
      
      activeTags.value.forEach(tag => {
        switch (tag.filterType) {
          case 'process':
            // Filtrar por processo específico - comparar tanto processId quanto processIdentifier
            filtered = filtered.filter(task => {
              const matchesById = task.processId === tag.value
              const matchesByIdentifier = task.processIdentifier === tag.label
              return matchesById || matchesByIdentifier
            })
            break
          case 'obra':
            filtered = filtered.filter(task => {
              const { obra } = extractProcessComponents(task.processIdentifier)
              return obra === tag.value
            })
            break
          case 'disciplina':
            filtered = filtered.filter(task => {
              const { disciplina } = extractProcessComponents(task.processIdentifier)
              return disciplina === tag.value
            })
            break
          case 'fase':
            filtered = filtered.filter(task => {
              const { fase } = extractProcessComponents(task.processIdentifier)
              return fase === tag.value
            })
            break
        }
      })
      
      return filtered
    })

          // Agrupar tarefas concluídas por processo
    const groupedCompletedTasks = computed(() => {
      const completedTasks = filteredTasks.value.filter(task => task.status === 'completed')
      
      const grouped = {}
      
      completedTasks.forEach(task => {
        const processIdentifier = task.processIdentifier || 'Processo não identificado'
        if (!grouped[processIdentifier]) {
          grouped[processIdentifier] = []
        }
        grouped[processIdentifier].push(task)
      })
      
      // Ordenar tarefas dentro de cada grupo por data de conclusão (mais recente primeiro)
      Object.keys(grouped).forEach(processIdentifier => {
        grouped[processIdentifier].sort((a, b) => {
          const dateA = new Date(a.completion_date || 0)
          const dateB = new Date(b.completion_date || 0)
          return dateB - dateA
        })
      })
      
      // Ordenar grupos por número de tarefas (mais tarefas primeiro)
      const sortedGroups = {}
      Object.keys(grouped)
        .sort((a, b) => grouped[b].length - grouped[a].length)
        .forEach(processIdentifier => {
          sortedGroups[processIdentifier] = grouped[processIdentifier]
        })
      
      return sortedGroups
    })

    const refreshData = async () => {
      await processesStore.initializeData()
    }

    const filterByProcess = () => {
      if (selectedProcess.value) {
        processesStore.fetchProcessTasks(selectedProcess.value)
      } else {
        processesStore.fetchTasks()
      }
    }

    // Funções para gerenciar tags
    const addTag = (suggestion) => {
      activeTags.value.push(suggestion)
      searchQuery.value = ''
      showSuggestions.value = false
    }

    const removeTag = (tagId) => {
      activeTags.value = activeTags.value.filter(tag => tag.id !== tagId)
    }

    const clearAllTags = () => {
      activeTags.value = []
      searchQuery.value = ''
      showSuggestions.value = false
    }

    const handleSearchInput = () => {
      showSuggestions.value = true
    }

    const addCurrentSuggestion = () => {
      if (filteredSuggestions.value.length > 0) {
        addTag(filteredSuggestions.value[0])
      }
    }

    const clearSearch = () => {
      searchQuery.value = ''
      showSuggestions.value = false
    }

    const handleBlur = () => {
      // Delay para permitir cliques nas sugestões
      setTimeout(() => {
        showSuggestions.value = false
      }, 200)
    }

    const clearFilters = () => {
      selectedProcess.value = ''
      selectedObra.value = ''
      selectedDisciplina.value = ''
      selectedFase.value = ''
      activeTags.value = []
      searchQuery.value = ''
      processesStore.fetchTasks()
    }

    // Função para alternar expansão de grupos
    const toggleProcessGroup = (processIdentifier) => {
      const index = expandedGroups.value.indexOf(processIdentifier)
      if (index > -1) {
        expandedGroups.value.splice(index, 1)
      } else {
        expandedGroups.value.push(processIdentifier)
      }
    }

    // Expandir todos os grupos
    const expandAllGroups = () => {
      expandedGroups.value = Object.keys(groupedCompletedTasks.value)
    }

    // Recolher todos os grupos
    const collapseAllGroups = () => {
      expandedGroups.value = []
    }

    const updateTaskStatus = async (taskId, newStatus) => {
      // Adicionar task ao loading state
      updatingTasks.value.push(taskId)
      
      try {
        const result = await processesStore.updateTaskStatus(taskId, newStatus)
        if (result.success) {
          // Atualizar dados após mudança de status
          await processesStore.fetchTasks()
        } else {
          console.error('Erro ao atualizar status:', result.error)
        }
      } catch (error) {
        console.error('Erro ao atualizar status:', error)
      } finally {
        // Remover task do loading state
        const index = updatingTasks.value.indexOf(taskId)
        if (index > -1) {
          updatingTasks.value.splice(index, 1)
        }
      }
    }

    const openTaskDetails = async (task) => {
      selectedTask.value = task
      showTaskModal.value = true
      
      // Limpar valores anteriores
      selectedPropertyValues.value = {}
      
      // Garantir que propriedades read_only nunca sejam incluídas
      // no selectedPropertyValues para evitar edição
      
      // Buscar propriedades da tarefa se não estiver concluída
      if (task.status !== 'completed') {
        try {
          const response = await taskService.getTaskProperties(task.id)
          if (response.success) {
            taskProperties.value = response.data.properties || []
            
            // Preencher valores das propriedades que já têm valor (apenas as editáveis)
            taskProperties.value.forEach(property => {
              console.log(`[DEBUG] Propriedade: ${property.name}, read_only: ${property.read_only}, hidden: ${property.hidden}, value: ${property.value}`)
              console.log(`[DEBUG] Tipo da propriedade read_only: ${typeof property.read_only}, hidden: ${typeof property.hidden}`)
              console.log(`[DEBUG] Propriedade completa:`, property)
              
              if (property.value && !property.read_only) {
                selectedPropertyValues.value[property.id] = property.value
                console.log(`[DEBUG] Preenchendo ${property.name} com valor: ${property.value}`)
              } else if (property.read_only) {
                console.log(`[DEBUG] Propriedade ${property.name} é read_only, não preenchendo no selectedPropertyValues`)
              }
              // Para propriedades somente leitura, NÃO preencher no selectedPropertyValues
              // para evitar que sejam editadas
            })
          } else {
            console.error('Erro ao buscar propriedades:', response.error)
            taskProperties.value = []
          }
        } catch (error) {
          console.error('Erro ao buscar propriedades da tarefa:', error)
          taskProperties.value = []
        }
      } else {
        taskProperties.value = []
      }
    }

    const closeTaskModal = () => {
      showTaskModal.value = false
      selectedTask.value = null
      taskProperties.value = []
      selectedPropertyValues.value = {}
    }

    // Funções do modal de novo processo
    const openNewProcessModal = async () => {
      showNewProcessModal.value = true
      await loadInstances()
    }

    const closeNewProcessModal = () => {
      showNewProcessModal.value = false
      newProcessForm.value = {
        disciplina: '',
        etapa: '',
        instancia: ''
      }
    }

    const loadInstances = async () => {
      loadingInstances.value = true
      try {
        const response = await taskService.getInstances()
        if (response.success) {
          instances.value = response.data || []
        } else {
          showError('Erro ao carregar instâncias')
        }
      } catch (error) {
        console.error('Erro ao carregar instâncias:', error)
        showError('Erro ao carregar instâncias')
      } finally {
        loadingInstances.value = false
      }
    }

    const createNewProcess = async () => {
      if (!newProcessForm.value.disciplina.trim() || 
          !newProcessForm.value.etapa.trim() || 
          !newProcessForm.value.instancia) {
        showError('Todos os campos são obrigatórios')
        return
      }

      creatingProcess.value = true
      try {
        const response = await taskService.createProcess({
          disciplina: newProcessForm.value.disciplina,
          etapa: newProcessForm.value.etapa,
          instancia: newProcessForm.value.instancia
        })
        
        if (response.success) {
          showSuccess('Processo criado com sucesso!')
          closeNewProcessModal()
          // Atualizar dados após criação
          await processesStore.fetchTasks()
        } else {
          showError(`Erro ao criar processo: ${response.error}`)
        }
      } catch (error) {
        console.error('Erro ao criar processo:', error)
        showError('Erro ao criar processo. Verifique o console para mais detalhes.')
      } finally {
        creatingProcess.value = false
      }
    }



    const completeTask = async () => {
      if (!selectedTask.value) {
        console.error('selectedTask.value é null')
        return
      }
      
      const taskId = selectedTask.value.id
      if (!taskId) {
        console.error('selectedTask.value.id é null ou undefined')
        return
      }
      
      // Validar propriedades obrigatórias (apenas as visíveis e não hidden)
      const visibleProperties = taskProperties.value.filter(p => !p.hidden)
      const requiredProperties = visibleProperties.filter(p => p.required)
      const missingProperties = requiredProperties.filter(p => !selectedPropertyValues.value[p.id])
      
      if (missingProperties.length > 0) {
        showError(`Por favor, preencha as propriedades obrigatórias: ${missingProperties.map(p => p.name).join(', ')}`)
        return
      }
      
      // Preparar valores das propriedades no formato esperado pela API
      // Apenas incluir propriedades que não são read_only, não são hidden, e têm valor
      const propertyValues = visibleProperties
        .filter(p => !p.read_only && selectedPropertyValues.value[p.id])
        .map(p => {
          const selectedOption = p.options?.find(opt => opt.id === selectedPropertyValues.value[p.id])
          return {
            id: p.id,
            value: selectedPropertyValues.value[p.id],
            text: selectedOption?.name || selectedPropertyValues.value[p.id]
          }
        })
      
      console.log('[DEBUG] Enviando propertyValues:', propertyValues)
      
      // Adicionar task ao loading state
      updatingTasks.value.push(taskId)
      
      try {
        const result = await taskService.completeTask(taskId, propertyValues)
        if (result.success) {
          // Atualizar dados após conclusão da tarefa
          await processesStore.fetchTasks()
          closeTaskModal()
          
          // Mostrar notificação de sucesso
          showSuccess('Tarefa concluída com sucesso!')
        } else {
          console.error('Erro ao concluir tarefa:', result.error)
          showError(`Erro ao concluir tarefa: ${result.error}`)
        }
      } catch (error) {
        console.error('Erro ao concluir tarefa:', error)
        
        // Verificar se é um erro de permissão (403)
        if (error.response && error.response.status === 403) {
          const errorMessage = error.response.data?.message || error.response.data?.error || 'Erro de permissão'
          showError(`❌ ${errorMessage}\n\n💡 Possível solução: Esta tarefa pode não estar atribuída ao seu usuário na plataforma HOLMES. Verifique se você tem permissão para concluir esta tarefa.`)
        } else {
          showError('Erro ao concluir tarefa. Verifique o console para mais detalhes.')
        }
      } finally {
        // Remover task do loading state
        const index = updatingTasks.value.indexOf(taskId)
        if (index > -1) {
          updatingTasks.value.splice(index, 1)
        }
      }
    }



    const getProcessName = (processId) => {
      const process = processes.value.find(p => p.id === processId)
      return process ? process.name : 'Processo não encontrado'
    }

    const formatDate = (dateString, includeTime = true) => {
      if (!dateString) return 'Data não disponível'
      
      try {
        // Converter para data local (UTC para horário de São Paulo)
        const dt = new Date(dateString)
        
        // Verificar se a data é válida
        if (isNaN(dt.getTime())) {
          return 'Data inválida'
        }
        
        const saoPauloOffset = -3 * 60 // -3 horas em minutos
        const localTime = new Date(dt.getTime() + (saoPauloOffset * 60 * 1000))
        
        if (includeTime) {
          return localTime.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        } else {
          return localTime.toLocaleDateString('pt-BR')
        }
      } catch (error) {
        return 'Data inválida'
      }
    }

    const getSlaColor = (dueDate) => {
      if (!dueDate) return 'text-gray-500'
      
      try {
        const dt = new Date(dueDate)
        if (isNaN(dt.getTime())) return 'text-gray-500'
        
        const now = new Date()
        const saoPauloOffset = -3 * 60 // -3 horas em minutos
        const localNow = new Date(now.getTime() + (saoPauloOffset * 60 * 1000))
        
        // Comparar apenas a data (sem hora)
        const dueDateOnly = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
        const todayOnly = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate())
        
        if (dueDateOnly < todayOnly) {
          return 'text-red-600 font-semibold' // Atrasado - vermelho
        } else if (dueDateOnly.getTime() === todayOnly.getTime()) {
          return 'text-yellow-600 font-semibold' // Vence hoje - amarelo
        } else {
          return 'text-green-600 font-medium' // No prazo - verde
        }
      } catch (error) {
        return 'text-gray-500'
      }
    }

    onMounted(async () => {
      await processesStore.initializeData()
    })

    

    return {
      loading,
      error,
      tasks,
      processes,
      tasksByStatus,
      filteredTasks,
      selectedProcess,
      selectedObra,
      selectedDisciplina,
      selectedFase,
      uniqueObras,
      uniqueDisciplinas,
      uniqueFases,
      searchQuery,
      activeTags,
      showSuggestions,
      hoveredSuggestion,
      filteredSuggestions,
      updatingTasks,
      filteringTasks,
      expandedGroups,
      groupedCompletedTasks,
      showTaskModal,
      selectedTask,
      taskProperties,
      selectedPropertyValues,
      showNewProcessModal,
      newProcessForm,
      instances,
      loadingInstances,
      creatingProcess,
      refreshData,
      filterByProcess,
      addTag,
      removeTag,
      clearAllTags,
      handleSearchInput,
      addCurrentSuggestion,
      clearSearch,
      handleBlur,
      clearFilters,
      toggleProcessGroup,
      expandAllGroups,
      collapseAllGroups,
      updateTaskStatus,
      openTaskDetails,
      closeTaskModal,
      completeTask,
      openNewProcessModal,
      closeNewProcessModal,
      createNewProcess,
      getProcessName,
      formatDate,
      getSlaColor
    }
  }
}
</script> 