import { defineStore } from 'pinia';
import { userService } from '../services/api';
import { useNotifications } from '../composables/useNotifications';

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Obter todos os usuários
     */
    allUsers: (state) => {
      return state.users;
    },

    /**
     * Obter usuários ativos
     */
    activeUsers: (state) => {
      return state.users.filter(user => user.is_active);
    },

    /**
     * Obter usuários administradores
     */
    adminUsers: (state) => {
      return state.users.filter(user => user.role === 'admin');
    },

    /**
     * Obter usuário atual
     */
    userInfo: (state) => {
      return state.currentUser;
    }
  },

  actions: {
    /**
     * Buscar todos os usuários
     */
    async fetchUsers() {
      this.loading = true;
      this.error = null;

      try {
        const response = await userService.getAllUsers();
        
        if (response.success) {
          this.users = response.data;
          return { success: true };
        } else {
          this.error = response.message || 'Erro ao buscar usuários';
          return { success: false, error: this.error };
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        
        if (error.response?.data?.message) {
          this.error = error.response.data.message;
        } else {
          this.error = 'Erro de conexão. Tente novamente.';
        }

        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Buscar usuário por ID
     */
    async fetchUserById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await userService.getUserById(id);
        
        if (response.success) {
          this.currentUser = response.data;
          return { success: true, data: response.data };
        } else {
          this.error = response.message || 'Erro ao buscar usuário';
          return { success: false, error: this.error };
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        
        if (error.response?.data?.message) {
          this.error = error.response.data.message;
        } else {
          this.error = 'Erro de conexão. Tente novamente.';
        }

        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Criar novo usuário
     */
    async createUser(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await userService.createUser(userData);
        
        if (response.success) {
          // Adicionar o novo usuário à lista
          this.users.push(response.data);
          
          // Remover a chamada problemática do showNotification
          // const { showNotification } = useNotifications();
          // showNotification('Usuário criado com sucesso!', 'success');
          
          return { success: true, data: response.data };
        } else {
          this.error = response.message || 'Erro ao criar usuário';
          return { success: false, error: this.error };
        }
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
        
        if (error.response?.data?.message) {
          this.error = error.response.data.message;
        } else if (error.response?.data?.error) {
          this.error = error.response.data.error;
        } else if (error.response?.data) {
          this.error = JSON.stringify(error.response.data);
        } else {
          this.error = 'Erro de conexão. Tente novamente.';
        }

        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Atualizar usuário
     */
    async updateUser(id, userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await userService.updateUser(id, userData);
        
        if (response.success) {
          // Atualizar o usuário na lista
          const index = this.users.findIndex(user => user.id === parseInt(id));
          if (index !== -1) {
            this.users[index] = { ...this.users[index], ...response.data };
          }

          // Se for o usuário atual, atualizar também
          if (this.currentUser && this.currentUser.id === parseInt(id)) {
            this.currentUser = { ...this.currentUser, ...response.data };
          }
          
          // Remover a chamada problemática do showNotification
          // const { showNotification } = useNotifications();
          // showNotification('Usuário atualizado com sucesso!', 'success');
          
          return { success: true, data: response.data };
        } else {
          this.error = response.message || 'Erro ao atualizar usuário';
          return { success: false, error: this.error };
        }
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        
        if (error.response?.data?.message) {
          this.error = error.response.data.message;
        } else {
          this.error = 'Erro de conexão. Tente novamente.';
        }

        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Deletar usuário
     */
    async deleteUser(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await userService.deleteUser(id);
        
        if (response.success) {
          // Remover o usuário da lista
          this.users = this.users.filter(user => user.id !== parseInt(id));
          
          // Remover a chamada problemática do showNotification
          // const { showNotification } = useNotifications();
          // showNotification('Usuário deletado com sucesso!', 'success');
          
          return { success: true };
        } else {
          this.error = response.message || 'Erro ao deletar usuário';
          return { success: false, error: this.error };
        }
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        
        if (error.response?.data?.message) {
          this.error = error.response.data.message;
        } else {
          this.error = 'Erro de conexão. Tente novamente.';
        }

        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Alterar senha do usuário
     */
    async changePassword(id, passwordData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await userService.changePassword(id, passwordData);
        
        if (response.success) {
          // Remover a chamada problemática do showNotification
          // const { showNotification } = useNotifications();
          // showNotification('Senha alterada com sucesso!', 'success');
          
          return { success: true };
        } else {
          this.error = response.message || 'Erro ao alterar senha';
          return { success: false, error: this.error };
        }
      } catch (error) {
        console.error('Erro ao alterar senha:', error);
        
        if (error.response?.data?.message) {
          this.error = error.response.data.message;
        } else {
          this.error = 'Erro de conexão. Tente novamente.';
        }

        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Limpar dados do store
     */
    clearUsers() {
      this.users = [];
      this.currentUser = null;
      this.error = null;
    }
  }
}); 