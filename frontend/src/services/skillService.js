import api from './api'

const skillService = {
  getCategories: () => api.get('/skills/categories/'),
  getSkills: (params) => api.get('/skills/', { params }),
  getJobRoles: (params) => api.get('/skills/job-roles/', { params }),
  getJobRoleSkills: (roleId) => api.get(`/skills/job-roles/${roleId}/skills/`),
}

export default skillService
