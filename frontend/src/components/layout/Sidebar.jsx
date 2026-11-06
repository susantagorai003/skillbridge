import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, LogOut, LayoutDashboard, User, Zap, Target, Briefcase, FileText,
  Building2, Users, ClipboardList, BarChart3, ShieldCheck, GraduationCap,
  BookOpen, Sparkles, Award, FileSpreadsheet
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'

const menuItems = {
  student: [
    { icon: LayoutDashboard, label: 'Overview', path: '/student' },
    { icon: User, label: 'Resume & Profile', path: '/student/profile' },
    { icon: Zap, label: 'My Skills', path: '/student/skills' },
    { icon: Target, label: 'AI Skill Gap Engine', path: '/student/skill-gap' },
    { icon: Briefcase, label: 'Opportunities', path: '/student/opportunities' },
    { icon: FileText, label: 'Applications', path: '/student/applications' },
    { icon: BookOpen, label: 'Training Bootcamps', path: '/student/trainings' },
  ],
  company: [
    { icon: LayoutDashboard, label: 'Overview', path: '/company' },
    { icon: Building2, label: 'Company Profile', path: '/company/profile' },
    { icon: Briefcase, label: 'Post Opportunity', path: '/company/post' },
    { icon: Users, label: 'Candidate Matcher', path: '/company/candidates' },
    { icon: ClipboardList, label: 'Application Pipeline', path: '/company/applications' },
  ],
  faculty: [
    { icon: LayoutDashboard, label: 'Curriculum & Overview', path: '/faculty' },
    { icon: Users, label: 'Department Students', path: '/faculty/students' },
    { icon: BookOpen, label: 'Mentoring & Training', path: '/faculty/trainings' },
  ],
  tpo: [
    { icon: LayoutDashboard, label: 'Overview & Drives', path: '/tpo' },
    { icon: Users, label: 'Student Directory', path: '/tpo/students' },
    { icon: Building2, label: 'Companies & MoUs', path: '/tpo/companies' },
    { icon: BookOpen, label: 'Training Programs', path: '/tpo/trainings' },
    { icon: BarChart3, label: 'Placement Analytics', path: '/tpo/analytics' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Overview & Health', path: '/admin' },
    { icon: Users, label: 'User Governance', path: '/admin/users' },
    { icon: Building2, label: 'Departments & Batches', path: '/admin/departments' },
    { icon: ShieldCheck, label: 'System Audit Logs', path: '/admin/logs' },
  ],
}

export default function Sidebar({ role, isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = menuItems[role] || []

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-midnight text-white">
      {/* Brand Header */}
      <div className="px-6 h-20 flex items-center justify-between border-b border-slate-800">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal to-mint flex items-center justify-center text-midnight font-heading font-black text-lg shadow-sm">
            S
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-white">
            Skill<span className="text-teal">Bridge</span>
          </span>
        </NavLink>
        <button
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Role Pill Indicator */}
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-midnight-light border border-slate-800 text-xs">
          <span className="text-slate-400 uppercase tracking-wider font-bold">Portal Role</span>
          <span className="font-extrabold text-teal capitalize bg-teal/15 px-2.5 py-0.5 rounded-full border border-teal/30">
            {role}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${role}`}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal to-teal-dark text-midnight shadow-md shadow-teal/20 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={isActive ? 'text-midnight stroke-[2.5]' : 'text-slate-400 group-hover:text-white'}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer User Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-midnight-dark/60">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'SkillBridge User'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-coral rounded-lg hover:bg-slate-800/80 transition-colors"
            title="Sign out of platform"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-40 shadow-xl border-r border-slate-800">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-midnight/70 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
