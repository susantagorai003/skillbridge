import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { resetPasswordSchema } from '../../utils/validators'
import authService from '../../services/authService'
import Input from '../../components/common/Input'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      await authService.resetPassword({ token, new_password: data.new_password })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.errors?.token || 'Password reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
        <p className="text-slate-600 text-sm mb-4">Invalid or missing reset token.</p>
        <Link to="/forgot-password" className="text-coral font-bold text-sm hover:underline">
          Request a new recovery link
        </Link>
      </div>
    </div>
  )

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

        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-mint/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-midnight mb-2">Password Updated!</h1>
            <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
              Your password has been changed successfully. You can now sign in with your new credentials.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-coral text-white text-xs sm:text-sm font-bold shadow-md hover:bg-coral-dark transition-colors"
            >
              Sign In Now <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center sm:text-left mb-6">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-midnight tracking-tight mb-1">
                Set New Password
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Enter your new password below to secure your account.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                {...register('new_password')}
                error={errors.new_password?.message}
              />
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
                {loading ? 'Updating...' : 'Update Password'} <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
