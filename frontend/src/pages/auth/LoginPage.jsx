import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { loginSchema } from '../../utils/validators'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, getDashboardPath } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setError('')
    setLoading(true)
    try {
      await login(data.email, data.password)
      navigate(getDashboardPath())
    } catch (err) {
      setError(err.response?.data?.errors?.email || err.message || 'Login failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-offwhite">
      {/* Left Feature Hero Panel (visible on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-midnight text-white flex-col justify-between p-12 lg:p-16 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-coral/15 blur-3xl pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal to-mint flex items-center justify-center text-midnight font-heading font-black text-xl shadow-md">
              S
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
              Skill<span className="text-teal">Bridge</span>
            </span>
          </Link>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 max-w-md my-auto py-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/20 text-teal text-xs font-bold mb-4 border border-teal/40">
            <Sparkles size={13} className="text-golden" /> AI-Powered Career Ecosystem
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight mb-4">
            Connect Your Skills Directly to Industry Opportunities
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Access your personalized skill gap analysis, track multi-phase learning milestones, and explore matched internships with top technology companies.
          </p>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-teal flex-shrink-0" />
              <span>Multi-layer resume parsing with PyMuPDF</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-teal flex-shrink-0" />
              <span>Real-time competency radar & learning roadmaps</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-teal flex-shrink-0" />
              <span>1-click application tracking with recruiter pipeline</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} SkillBridge. All rights reserved.
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div style={{ backgroundColor: '#F8F9F6' }} className="flex-1 flex items-center justify-center p-8 sm:p-14 lg:p-20">
        <div
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgba(20, 33, 61, 0.08), 0 8px 10px -6px rgba(20, 33, 61, 0.04)' }}
          className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-card"
        >
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-midnight font-heading font-bold text-lg">
              S
            </div>
            <span className="font-heading font-extrabold text-2xl text-midnight">
              Skill<span className="text-teal">Bridge</span>
            </span>
          </Link>

          <div className="text-center sm:text-left mb-6">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-midnight tracking-tight mb-1">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Sign in to access your portal and personalized dashboard.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              {...register('email')}
              error={errors.email?.message}
            />

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={Lock}
                  {...register('password')}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-[34px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link to="/forgot-password" className="text-xs font-semibold text-coral hover:text-coral-dark hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-coral to-coral-dark text-white font-heading font-bold text-sm shadow-md hover:shadow-lg hover:shadow-coral/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-teal hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
