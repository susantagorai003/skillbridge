import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { NAV_LINKS } from '../../utils/constants'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, getDashboardPath, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const navClasses = scrolled || !isHome
    ? 'bg-midnight/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg text-white'
    : 'bg-midnight/40 backdrop-blur-sm border-b border-white/10 text-white'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <img
              src="/logo.png"
              alt="SkillBridge Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
              Skill<span className="text-teal">Bridge</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-slate-300 hover:text-teal transition-colors tracking-wide py-1"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-teal to-teal-dark text-midnight font-heading font-bold text-xs sm:text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-teal/20 transition-all cursor-pointer"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-coral hover:bg-coral-dark text-white font-heading font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:shadow-coral/25 transition-all flex items-center gap-1.5"
                >
                  Get Started <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile / Tablet Hamburger Toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800/60 focus:outline-none transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-midnight border-b border-slate-800 px-5 pt-3 pb-6 shadow-2xl overflow-hidden"
          >
            <div className="space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    navigate(getDashboardPath())
                    setMobileOpen(false)
                  }}
                  className="w-full py-2.5 rounded-xl bg-teal text-midnight font-bold text-center flex items-center justify-center gap-2 text-sm"
                >
                  <LayoutDashboard size={16} /> Go to Dashboard ({user?.role?.toUpperCase() || 'PORTAL'})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-bold text-white bg-coral hover:bg-coral-dark rounded-xl shadow-md"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
