import api from './api'

const authService = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  refreshToken: (data) => api.post('/auth/refresh/', data),
  getCurrentUser: () => api.get('/auth/me/'),
  forgotPassword: (data) => api.post('/auth/forgot-password/', data),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/?token=${token}`),
  updateProfile: (data) => api.put('/auth/me/', data),
}

export default authService
