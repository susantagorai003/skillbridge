import { Link } from 'react-router-dom'
import { Zap, Target, Compass, TrendingUp, Briefcase, Award, ArrowRight } from 'lucide-react'

const features = [
  { icon: Zap, title: 'AI Profile Building', desc: 'Upload your CV to automatically extract and standardize your technical competencies.' },
  { icon: Target, title: 'Precision Skill Gap Analysis', desc: 'Identify exact missing libraries, tools, and practices for your target career role.' },
  { icon: Compass, title: 'Personalized Roadmaps', desc: 'Follow structured weekly milestones with real-world hands-on project assignments.' },
  { icon: Briefcase, title: '1-Click Matching', desc: 'Discover high-relevance internships calibrated directly against your verified skills.' },
  { icon: TrendingUp, title: 'Role Readiness Index', desc: 'Track your employability percentage (0–100%) as you learn and level up.' },
  { icon: Award, title: 'Verified Skill Badges', desc: 'Pass skill assessments and project reviews to earn recruiter-trusted credentials.' },
]

export default function ForStudentsSection() {
  return (
    <section className="py-24 bg-offwhite border-t border-slate-200" id="for-students">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/15 border border-teal/30 text-teal text-xs font-bold uppercase tracking-wider mb-4">
              For Students & Candidates
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-midnight tracking-tight mb-5 leading-tight">
              Your Skills, Your Career, Your Bridge to Industry
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed">
              Stop guessing what recruiters want. Extract your current competencies from your resume, see exact skill gaps, and follow tailored roadmaps to land competitive internships.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/register?role=student"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-coral to-coral-dark text-white font-heading font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-coral/25 transition-all"
              >
                Start as Student <ArrowRight size={16} />
              </Link>
              <Link
                to="/student/skill-gap"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-100 text-midnight font-heading font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors"
              >
                Try Skill Gap Engine
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                data-animate
                className="bg-offwhite rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-mint/50 text-midnight flex items-center justify-center mb-3">
                  <f.icon size={20} />
                </div>
                <h4 className="font-heading font-bold text-sm text-midnight mb-1.5">{f.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
