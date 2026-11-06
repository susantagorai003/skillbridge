import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { forgotPasswordSchema } from '../../utils/validators'
import authService from '../../services/authService'
import Input from '../../components/common/Input'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authService.forgotPassword(data)
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center text-midnight font-heading font-black text-xl shadow-md">
            S
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-midnight">
            Skill<span className="text-teal">Bridge</span>
          </span>
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-mint/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-midnight mb-2">Check Your Email</h1>
            <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
              If an account with that email exists, we've sent password reset instructions.
            </p>
            <Link
              to="/login"
              style={{ backgroundColor: '#14213D', color: '#FFFFFF' }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-midnight text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center sm:text-left mb-6">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-midnight tracking-tight mb-1">
                Forgot Password
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Enter your registered email address to receive a secure recovery link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                {...register('email')}
                error={errors.email?.message}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-coral to-coral-dark text-white font-heading font-bold text-sm shadow-md hover:shadow-lg hover:shadow-coral/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'} <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal transition-colors">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
