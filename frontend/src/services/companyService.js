import api from './api'

const companyService = {
  getProfile: () => api.get('/companies/profile/'),
  updateProfile: (data) => api.put('/companies/profile/', data),
  getCandidates: (params) => api.get('/companies/candidates/', { params }),
  getDashboard: () => api.get('/companies/dashboard/'),
}

export default companyService
