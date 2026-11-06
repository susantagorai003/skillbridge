import { Outlet, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/layout/Sidebar'
import { Menu, Bell, Search, Sparkles, Check, ExternalLink, X, Video } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import { getInitials } from '../utils/formatters'
import api from '../services/api'

export default function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef(null)
  const { user } = useAuth()

  const fetchNotifications = () => {
    api.get('/notifications/')
      .then((res) => {
        if (res.data?.success) {
          setNotifications(res.data.items || [])
          setUnreadCount(res.data.unread_count || 0)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read/')
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err) {}
  }

  const handleMarkOneRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read/`)
      setNotifications((prev) => prev.map((n) => n.id === id ? ({ ...n, is_read: true }) : n))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {}
  }

  return (
    <div className="flex min-h-screen bg-offwhite text-charcoal">
      {/* Sidebar */}
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>

            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search skills, opportunities, candidates..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-charcoal placeholder-slate-400 focus:outline-none focus:border-teal focus:bg-white w-72 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live AI Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint/50 border border-teal/20 text-xs font-bold text-midnight">
              <Sparkles size={13} className="text-teal" />
              <span>Skill Engine Active</span>
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] bg-coral text-white text-[10px] font-extrabold rounded-full ring-2 ring-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 bg-midnight text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-teal" />
                      <h4 className="font-heading font-bold text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-teal/20 text-teal text-[11px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-teal hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Check size={12} /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <Bell size={24} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-700">No notifications yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">You are all caught up with campus and hiring updates!</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkOneRead(n.id)}
                          className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                            n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-teal/5 hover:bg-teal/10'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-slate-300' : 'bg-teal'}`} />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-heading font-bold text-xs text-slate-900 leading-tight">
                              {n.title}
                            </h5>
                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            {n.metadata?.meeting_link && (
                              <div className="mt-2">
                                <a
                                  href={n.metadata.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    backgroundColor: '#00BFA6',
                                    color: '#14213D',
                                    fontWeight: 700,
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-extrabold hover:opacity-90 shadow-xs"
                                >
                                  <Video size={12} />
                                  <span>Join Google Meet</span>
                                </a>
                              </div>
                            )}
                            {n.link && (
                              <Link
                                to={n.link}
                                onClick={() => setNotifOpen(false)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-teal hover:underline mt-1.5"
                              >
                                View Details <ExternalLink size={10} />
                              </Link>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Pill */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-midnight to-midnight-light text-teal flex items-center justify-center text-sm font-extrabold font-heading shadow-sm">
                {getInitials(user?.name) || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-midnight leading-tight">{user?.name || 'Authorized User'}</p>
                <p className="text-[11px] font-semibold text-slate-400 capitalize">{user?.role || role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
