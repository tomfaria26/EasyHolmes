<template>
  <div class="fixed top-4 right-4 z-[9999] space-y-3" style="pointer-events: auto;">
    <TransitionGroup
      name="notification"
      tag="div"
      class="space-y-3"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'flex items-center p-4 rounded-lg shadow-md max-w-sm',
          'transform transition-all duration-300 ease-out',
          notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : '',
          notification.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : '',
          notification.type === 'info' ? 'bg-blue-50 border border-blue-200 text-blue-800' : ''
        ]"
        :style="{
          'opacity': notification.visible ? '1' : '0',
          'transform': notification.visible ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.95)',
          'position': 'relative',
          'z-index': '10000'
        }"
      >
        <div class="flex-shrink-0 mr-3">
          <div :class="[
            'w-8 h-8 rounded-full flex items-center justify-center',
            notification.type === 'success' ? 'bg-green-100' : '',
            notification.type === 'error' ? 'bg-red-100' : '',
            notification.type === 'info' ? 'bg-blue-100' : ''
          ]">
            <span v-if="notification.type === 'success'" class="text-green-600 text-lg">✓</span>
            <span v-else-if="notification.type === 'error'" class="text-red-600 text-lg">✕</span>
            <span v-else class="text-blue-600 text-lg">ℹ</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium leading-relaxed">{{ notification.message }}</p>
        </div>
        <div class="ml-3 flex-shrink-0">
          <button
            @click="removeNotification(notification.id)"
            class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-colors duration-200"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { useNotifications } from '../composables/useNotifications'

export default {
  name: 'NotificationToast',
  setup() {
    const { notifications, removeNotification } = useNotifications()

    return {
      notifications,
      removeNotification
    }
  }
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style> 