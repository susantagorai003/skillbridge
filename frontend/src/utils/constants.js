export const ROLES = {
  STUDENT: 'student',
  COMPANY: 'company',
  FACULTY: 'faculty',
  TPO: 'tpo',
  ADMIN: 'admin',
}

export const API_BASE_URL = '/api/v1'

export const PROFICIENCY_LEVELS = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
}

export const PROFICIENCY_LABELS = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
}

export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  SELECTED: 'selected',
  REJECTED: 'rejected',
}

export const STATUS_LABELS = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Scheduled',
  selected: 'Selected',
  rejected: 'Rejected',
}

export const DASHBOARD_ROUTES = {
  student: '/student',
  company: '/company',
  faculty: '/faculty',
  tpo: '/tpo',
  admin: '/admin',
}

export const NAV_LINKS = [
  { label: 'How It Works', href: '/#workflow' },
  { label: 'Students', href: '/#for-students' },
  { label: 'Companies', href: '/#for-companies' },
  { label: 'Universities', href: '/#for-universities' },
  { label: 'Opportunities', href: '/#opportunities' },
]
