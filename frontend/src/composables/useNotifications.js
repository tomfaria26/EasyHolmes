import { ref } from 'vue'

// Estado global das notificações
const notifications = ref([])
let notificationId = 0

export function useNotifications() {
  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = ++notificationId
    const notification = {
      id,
      message,
      type,
      visible: false
    }

    notifications.value.push(notification)

    // Forçar reatividade
    notifications.value = [...notifications.value]

    // Animar entrada - versão mais simples
    setTimeout(() => {
      notification.visible = true
      // Forçar reatividade novamente
      notifications.value = [...notifications.value]
    }, 50)

    // Auto-remover após o tempo especificado
    setTimeout(() => {
      removeNotification(id)
    }, duration)

    return id
  }

  const removeNotification = (id) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.visible = false
      setTimeout(() => {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index > -1) {
          notifications.value.splice(index, 1)
        }
      }, 150)
    }
  }

  const showSuccess = (message, duration = 5000) => {
    return addNotification(message, 'success', duration)
  }

  const showError = (message, duration = 7000) => {
    return addNotification(message, 'error', duration)
  }

  const showInfo = (message, duration = 5000) => {
    return addNotification(message, 'info', duration)
  }

  const clearAll = () => {
    notifications.value = []
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    clearAll
  }
} 