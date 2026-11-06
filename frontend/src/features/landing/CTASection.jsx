import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Building2, UserPlus } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="pt-20 pb-32 bg-offwhite border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-tr from-midnight via-slate-900 to-midnight rounded-3xl p-8 sm:p-14 text-center text-white relative shadow-2xl overflow-hidden border border-slate-800">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-teal/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-coral/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal/20 text-teal text-xs font-bold uppercase tracking-wider mb-6 border border-teal/40">
              <Sparkles size={13} className="text-golden" /> Transform Your Career & Recruitment
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight mb-6">
              Your Future Is Built on the Skills You Develop{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral to-golden">
                Today
              </span>
            </h2>

            <p className="text-slate-300 text-base sm:text-lg mb-10 leading-relaxed font-normal">
              Join thousands of students and leading technology firms collaborating to close the academia–industry skill gap with verified AI intelligence.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register?role=student"
                style={{ background: 'linear-gradient(135deg, #FF6B5E, #E65345)', color: '#FFFFFF' }}
                className="px-8 py-3.5 bg-gradient-to-r from-coral to-coral-dark text-white font-heading font-bold rounded-xl shadow-lg hover:shadow-coral/30 hover:scale-105 transition-all text-sm sm:text-base flex items-center gap-2"
              >
                <UserPlus size={18} /> Join as Student
              </Link>
              <Link
                to="/register?role=company"
                style={{ backgroundColor: '#1E2E4F', color: '#FFFFFF', border: '1px solid #334155' }}
                className="px-8 py-3.5 bg-midnight-light border border-slate-700 text-white font-heading font-bold rounded-xl hover:border-teal/50 hover:bg-slate-800 transition-all text-sm sm:text-base flex items-center gap-2"
              >
                <Building2 size={18} className="text-teal" /> Partner as Recruiter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
