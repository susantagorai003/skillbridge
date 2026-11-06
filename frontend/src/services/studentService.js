import api from './api'

const studentService = {
  getProfile: () => api.get('/students/profile/'),
  updateProfile: (data) => api.put('/students/profile/', data),
  getSkills: () => api.get('/students/skills/'),
  addSkill: (data) => api.post('/students/skills/', data),
  updateSkill: (id, data) => api.put(`/students/skills/${id}/`, data),
  removeSkill: (id) => api.delete(`/students/skills/${id}/`),
  getProjects: () => api.get('/students/projects/'),
  uploadResume: (formData) => api.post('/students/resume/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSkillGap: (roleId) => api.get(`/skill-gap/?role_id=${roleId}`),
  getRecommendations: () => api.get('/matching/recommendations/'),
  getDashboard: () => api.get('/students/dashboard/'),
}

export default studentService
