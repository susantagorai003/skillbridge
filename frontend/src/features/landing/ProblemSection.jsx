import { useRef } from 'react'
import { GraduationCap, Users, Building2, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react'

export default function ProblemSection() {
  const challenges = [
    {
      icon: GraduationCap,
      badge: 'Academic Challenge',
      badgeColor: 'text-teal bg-mint/50 border-teal/20',
      iconBg: 'bg-teal/10 text-teal',
      title: 'Curriculum Disconnect',
      desc: 'Academic curricula often lag 3–5 years behind cutting-edge industry tools, modern dev stacks, and cloud-native practices.',
      metric: '72% of engineering syllabi miss modern cloud & AI frameworks.'
    },
    {
      icon: Users,
      badge: 'Student Struggle',
      badgeColor: 'text-coral bg-coral/10 border-coral/20',
      iconBg: 'bg-coral/10 text-coral',
      title: 'Ambiguous Skill Gaps',
      desc: 'Students struggle without personalized roadmaps, unsure which exact competencies and portfolio projects recruiters require.',
      metric: 'Over 65% of job applicants fail initial technical screenings.'
    },
    {
      icon: Building2,
      badge: 'Industry Bottleneck',
      badgeColor: 'text-golden bg-golden/10 border-golden/20',
      iconBg: 'bg-golden/10 text-golden-dark',
      title: 'Recruitment Friction',
      desc: 'Recruiters spend months sifting through generic resumes with zero verified signal on practical engineering capabilities.',
      metric: 'Average 45+ days spent filling a single entry-level tech position.'
    },
  ]

  return (
    <section id="problem" className="py-20 sm:py-24 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral/10 border border-coral/30 text-coral text-xs font-bold uppercase tracking-wider mb-3">
            The Industry Challenge
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-midnight tracking-tight mb-4">
            Why Traditional Placement Models Fall Short
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Students graduate without verified technical readiness, while tech companies struggle to discover qualified entry-level talent. SkillBridge resolves this dilemma with precision AI.
          </p>
        </div>

        {/* 3 Challenge Cards Grid - Guaranteed 100% visible */}
        <div
          style={{ display: 'grid', opacity: 1, visibility: 'visible' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {challenges.map((item, i) => (
            <div
              key={i}
              style={{ backgroundColor: '#F8F9F6', border: '1px solid #E2E8F0', borderRadius: '1rem', opacity: 1, visibility: 'visible' }}
              className="bg-offwhite rounded-2xl p-7 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                    <item.icon size={22} />
                  </div>
                </div>

                <h3 className="font-heading font-bold text-xl text-midnight mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80">
                <div className="flex items-start gap-2 text-xs font-medium text-slate-700 bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm">
                  <TrendingUp size={15} className="text-coral flex-shrink-0 mt-0.5" />
                  <span>{item.metric}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
