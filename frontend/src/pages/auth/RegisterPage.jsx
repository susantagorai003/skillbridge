import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Building2, BookOpen, ClipboardList, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { registerSchema } from '../../utils/validators'
import Input from '../../components/common/Input'

const roles = [
  { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Analyze CV, build skills & land internships' },
  { value: 'company', label: 'Company', icon: Building2, desc: 'Discover talent & manage recruitment' },
  { value: 'faculty', label: 'Faculty', icon: BookOpen, desc: 'Track cohort skills & assign curricula' },
  { value: 'tpo', label: 'TPO Officer', icon: ClipboardList, desc: 'Drive placements & monitor readiness' },
]

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') || 'student'

  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register: registerUser, getDashboardPath } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: initialRole },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data) => {
    setError('')
    setLoading(true)
    try {
      await registerUser(data)
      navigate(getDashboardPath())
    } catch (err) {
      setError(err.response?.data?.errors?.email || err.message || 'Registration failed. Please check your details.')
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
            <img
              src="/logo.png"
              alt="SkillBridge Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-md"
            />
            <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
              Skill<span className="text-teal">Bridge</span>
            </span>
          </Link>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 max-w-md my-auto py-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/20 text-teal text-xs font-bold mb-4 border border-teal/40">
            <Sparkles size={13} className="text-golden" /> Join the Platform
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight mb-4">
            One Unified Platform for Academia & Industry
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Create an account to begin mapping real-time competencies, accessing personalized learning pathways, or sourcing pre-screened campus talent.
          </p>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-teal flex-shrink-0" />
              <span>Free AI skill gap evaluation and multi-phase roadmap</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-teal flex-shrink-0" />
              <span>Direct connection to curated internship opportunities</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-teal flex-shrink-0" />
              <span>Full MongoDB persistence for profile & progress tracking</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} SkillBridge. All rights reserved.
        </div>
      </div>

      {/* Right Registration Form Panel */}
      <div style={{ backgroundColor: '#F8F9F6' }} className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 overflow-y-auto">
        <div
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgba(20, 33, 61, 0.08), 0 8px 10px -6px rgba(20, 33, 61, 0.04)' }}
          className="w-full max-w-xl bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl my-auto"
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
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Select your role and start your collaborative journey.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3 mb-5">
              {error}
            </div>
          )}

          {/* Role selector grid */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {roles.map((r) => {
                const isSelected = selectedRole === r.value
                const Icon = r.icon
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setValue('role', r.value)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal bg-mint/30 shadow-sm ring-1 ring-teal'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-teal text-midnight' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon size={15} />
                      </div>
                      <span className="font-heading font-bold text-xs text-midnight">{r.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{r.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('role')} />

            <Input
              label="Full Name"
              placeholder="e.g. Alex Johnson"
              icon={User}
              {...register('name')}
              error={errors.name?.message}
            />

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
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              {...register('confirm_password')}
              error={errors.confirm_password?.message}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-coral to-coral-dark text-white font-heading font-bold text-sm shadow-md hover:shadow-lg hover:shadow-coral/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? 'Creating Account...' : 'Get Started Now'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-teal hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
