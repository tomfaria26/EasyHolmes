import { createRouter, createWebHistory } from 'vue-router'

// Importar componentes (serão criados posteriormente)
const Login = () => import('../views/Login.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const TaskBoard = () => import('../views/TaskBoard.vue')
const UserManagement = () => import('../views/UserManagement.vue')
const ProcessDetail = () => import('../views/ProcessDetail.vue')

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'TaskBoard',
    component: TaskBoard,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/process/:id',
    name: 'ProcessDetail',
    component: ProcessDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Guarda de navegação para autenticação
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next('/dashboard')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router 