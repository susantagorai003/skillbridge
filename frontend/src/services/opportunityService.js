import api from './api'

const opportunityService = {
  getAll: (params) => api.get('/opportunities/', { params }),
  getById: (id) => api.get(`/opportunities/${id}/`),
  create: (data) => api.post('/opportunities/', data),
  update: (id, data) => api.put(`/opportunities/${id}/`, data),
  delete: (id) => api.delete(`/opportunities/${id}/`),
  getFeatured: () => api.get('/opportunities/featured/'),
  getByCompany: () => api.get('/opportunities/my/'),
  searchInternshala: (params) => api.get('/opportunities/internshala/', { params }),
}

export default opportunityService
