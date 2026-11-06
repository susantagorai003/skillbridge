import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

// Public pages
import LandingPage from '../pages/public/LandingPage'
import AboutPage from '../pages/public/AboutPage'
import ContactPage from '../pages/public/ContactPage'

// Auth pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'

// Student Dashboard pages (Preserved completely)
import StudentDashboard from '../pages/student/StudentDashboard'
import StudentProfile from '../pages/student/StudentProfile'
import SkillsPage from '../pages/student/SkillsPage'
import SkillGapPage from '../pages/student/SkillGapPage'
import OpportunitiesPage from '../pages/student/OpportunitiesPage'
import ApplicationsPage from '../pages/student/ApplicationsPage'
import StudentTrainings from '../pages/student/StudentTrainings'

// Company Dashboard pages
import CompanyDashboard from '../pages/company/CompanyDashboard'
import CompanyProfile from '../pages/company/CompanyProfile'
import PostOpportunity from '../pages/company/PostOpportunity'
import CandidatesPage from '../pages/company/CandidatesPage'
import ApplicationsReview from '../pages/company/ApplicationsReview'

// Faculty Dashboard pages
import FacultyDashboard from '../pages/faculty/FacultyDashboard'
import StudentsOverview from '../pages/faculty/StudentsOverview'
import FacultyTrainings from '../pages/faculty/FacultyTrainings'

// TPO Dashboard pages
import TPODashboard from '../pages/tpo/TPODashboard'
import PlacementAnalytics from '../pages/tpo/PlacementAnalytics'
import TPOStudentDirectory from '../pages/tpo/TPOStudentDirectory'
import TPOCompanyDirectory from '../pages/tpo/TPOCompanyDirectory'
import TPOTrainings from '../pages/tpo/TPOTrainings'

// Admin Dashboard pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import UserManagement from '../pages/admin/UserManagement'
import DepartmentManagement from '../pages/admin/DepartmentManagement'
import SystemAuditLogs from '../pages/admin/SystemAuditLogs'

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Auth Routes (no layout wrapper) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Student Dashboard (Untouched) */}
      <Route path="/student" element={
        <RoleRoute roles={['student']}>
          <DashboardLayout role="student" />
        </RoleRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="skill-gap" element={<SkillGapPage />} />
        <Route path="opportunities" element={<OpportunitiesPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="trainings" element={<StudentTrainings />} />
      </Route>

      {/* Company Dashboard */}
      <Route path="/company" element={
        <RoleRoute roles={['company']}>
          <DashboardLayout role="company" />
        </RoleRoute>
      }>
        <Route index element={<CompanyDashboard />} />
        <Route path="profile" element={<CompanyProfile />} />
        <Route path="post" element={<PostOpportunity />} />
        <Route path="candidates" element={<CandidatesPage />} />
        <Route path="applications" element={<ApplicationsReview />} />
      </Route>

      {/* Faculty Dashboard */}
      <Route path="/faculty" element={
        <RoleRoute roles={['faculty']}>
          <DashboardLayout role="faculty" />
        </RoleRoute>
      }>
        <Route index element={<FacultyDashboard />} />
        <Route path="students" element={<StudentsOverview />} />
        <Route path="trainings" element={<FacultyTrainings />} />
      </Route>

      {/* TPO Dashboard */}
      <Route path="/tpo" element={
        <RoleRoute roles={['tpo']}>
          <DashboardLayout role="tpo" />
        </RoleRoute>
      }>
        <Route index element={<TPODashboard />} />
        <Route path="students" element={<TPOStudentDirectory />} />
        <Route path="companies" element={<TPOCompanyDirectory />} />
        <Route path="trainings" element={<TPOTrainings />} />
        <Route path="analytics" element={<PlacementAnalytics />} />
      </Route>

      {/* Admin Dashboard */}
      <Route path="/admin" element={
        <RoleRoute roles={['admin']}>
          <DashboardLayout role="admin" />
        </RoleRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="logs" element={<SystemAuditLogs />} />
      </Route>
    </Routes>
  )
}
