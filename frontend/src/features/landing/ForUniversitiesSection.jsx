import { Link } from 'react-router-dom'
import { BookOpen, BarChart3, TrendingUp, Users, Award, Handshake, ArrowRight, Sparkles } from 'lucide-react'

const features = [
  { icon: BookOpen, title: 'Curriculum Benchmarking', desc: 'Map department course syllabi directly against live industry job market demands.' },
  { icon: BarChart3, title: 'Department Skill Gaps', desc: 'Identify which technology domains require guest lectures, labs, or bootcamps.' },
  { icon: TrendingUp, title: 'Placement Analytics', desc: 'Track department placement rates, package distributions, and recruiter conversion.' },
  { icon: Users, title: 'Cohort Mentorship', desc: 'Enable professors and TPOs to guide at-risk students with targeted upskilling roadmaps.' },
  { icon: Award, title: 'Sponsored Capstones', desc: 'Connect engineering students with verified corporate projects and real data.' },
  { icon: Handshake, title: 'Institutional MoUs', desc: 'Formalize joint innovation centers and strategic campus recruitment partnerships.' },
]

export default function ForUniversitiesSection() {
  return (
    <section className="pt-24 pb-28 bg-offwhite border-t border-slate-200" id="for-universities">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/15 border border-teal/30 text-teal text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={13} className="text-golden" /> Higher Education Excellence
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-midnight tracking-tight mb-3">
            For Universities & Placement Cells
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Empower faculty and training placement officers with transparent competency analytics and real-time recruiter demand intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-mint/50 rounded-xl flex items-center justify-center mb-4 text-midnight group-hover:bg-teal group-hover:text-midnight transition-colors">
                <f.icon size={22} />
              </div>
              <h4 className="font-heading font-bold text-base text-midnight mb-2 group-hover:text-teal transition-colors">
                {f.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/register?role=faculty"
            style={{ backgroundColor: '#00BFA6', color: '#14213D', fontWeight: 800 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal text-midnight font-heading font-extrabold text-sm rounded-xl hover:bg-teal-light transition-all shadow-lg shadow-teal/25 hover:scale-105"
          >
            Partner as an Institution <ArrowRight size={16} className="text-midnight stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </section>
  )
}
