import { Link } from 'react-router-dom'
import { Search, Users, Briefcase, ClipboardList, BarChart3, Handshake, ArrowRight } from 'lucide-react'

const features = [
  { icon: Search, title: 'AI Talent Discovery', desc: 'Find students with precisely the skills you need through semantic competency filtering.' },
  { icon: Users, title: 'Competency-Based Matching', desc: 'Go beyond buzzwords — evaluate real candidate project experience and test scores.' },
  { icon: Briefcase, title: 'Job & Internship Builder', desc: 'Define required vs preferred technologies with transparent stipend and location terms.' },
  { icon: ClipboardList, title: 'Applicant Pipeline Kanban', desc: 'Move candidates through stages: Review, Shortlist, Technical Interview, and Offer.' },
  { icon: BarChart3, title: 'Recruitment Analytics', desc: 'Track applicant conversion funnels, hire rates, and candidate supply trends.' },
  { icon: Handshake, title: 'Campus Collaboration', desc: 'Sponsor capstone engineering projects and review departmental academic syllabi.' },
]

export default function ForCompaniesSection() {
  return (
    <section className="pt-24 pb-28 bg-white border-t border-slate-200" id="for-companies">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral/10 border border-coral/30 text-coral text-xs font-bold uppercase tracking-wider mb-3">
            For Employers & Hiring Teams
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-midnight tracking-tight mb-4">
            Discover and Hire Industry-Ready Talent
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Streamlined tools to source verified student talent, cut hiring cycle duration, and connect directly with campus cohorts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-offwhite rounded-2xl p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-mint/50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-coral group-hover:text-white transition-all text-midnight">
                <f.icon size={22} />
              </div>
              <h4 className="font-heading font-bold text-base text-midnight mb-2 group-hover:text-coral transition-colors">
                {f.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/register?role=company"
            style={{ background: 'linear-gradient(135deg, #FF6B5E, #E65345)', color: '#FFFFFF', fontWeight: 800 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-coral to-coral-dark text-white font-heading font-extrabold text-sm rounded-xl hover:scale-105 transition-all shadow-lg shadow-coral/25"
          >
            Register Your Company <ArrowRight size={16} className="text-white stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </section>
  )
}
