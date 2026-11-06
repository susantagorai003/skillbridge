import api from './api'

const notificationService = {
  getAll: (params) => api.get('/notifications/', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read/`),
  markAllRead: () => api.put('/notifications/read-all/'),
  getUnreadCount: () => api.get('/notifications/unread-count/'),
}

export default notificationService
