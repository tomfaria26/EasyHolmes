import { defineStore } from 'pinia';
import { authService } from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Verificar se o usuário está autenticado
     */
    isLoggedIn: (state) => {
      return state.isAuthenticated && !!state.token;
    },

    /**
     * Obter informações do usuário
     */
    userInfo: (state) => {
      return state.user;
    }
  },

  actions: {
    /**
     * Login do usuário
     */
    async login(email, password) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.login(email, password);
        
        if (response.success) {
          this.user = response.data.user;
          this.token = response.data.token;
          this.isAuthenticated = true;

          // Salvar no localStorage
          localStorage.setItem('auth_token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));

          return { success: true };
        } else {
          this.error = response.message || 'Erro no login';
          return { success: false, error: this.error };
        }
      } catch (error) {
        console.error('Erro no login:', error);
        
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
     * Logout do usuário
     */
    async logout() {
      try {
        await authService.logout();
      } catch (error) {
        console.warn('Erro no logout:', error);
      } finally {
        this.clearAuth();
      }
    },

    /**
     * Verificar token atual
     */
    async verifyToken() {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        this.clearAuth();
        return false;
      }

      try {
        const response = await authService.verifyToken();
        
        if (response.success) {
          this.user = response.data.user;
          this.token = token;
          this.isAuthenticated = true;
          return true;
        } else {
          this.clearAuth();
          return false;
        }
      } catch (error) {
        console.error('Erro na verificação do token:', error);
        this.clearAuth();
        return false;
      }
    },

    /**
     * Testar conexão com Holmes
     */
    async testHolmesConnection() {
      try {
        const response = await authService.testHolmesConnection();
        return response;
      } catch (error) {
        console.error('Erro ao testar conexão com Holmes:', error);
        throw error;
      }
    },

    /**
     * Limpar dados de autenticação
     */
    clearAuth() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.error = null;

      // Remover do localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    },

    /**
     * Inicializar autenticação
     */
    async initAuth() {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          this.token = token;
          this.user = JSON.parse(user);
          this.isAuthenticated = true;

          // Verificar se o token ainda é válido
          const isValid = await this.verifyToken();
          if (!isValid) {
            this.clearAuth();
          }
        } catch (error) {
          console.error('Erro ao inicializar autenticação:', error);
          this.clearAuth();
        }
      }
    },

    /**
     * Atualizar dados do usuário
     */
    updateUserData(userData) {
      this.user = { ...this.user, ...userData };
      
      // Atualizar no localStorage
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  }
}); 