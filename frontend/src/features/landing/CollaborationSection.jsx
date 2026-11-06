import { Building2, GraduationCap, Users, BookOpen, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

const steps = [
  { icon: Building2, label: 'Company', desc: 'Proposes project or placement drive', badge: 'Step 1', color: 'bg-coral/15 text-coral' },
  { icon: GraduationCap, label: 'University', desc: 'Aligns course syllabus & credits', badge: 'Step 2', color: 'bg-teal/15 text-teal' },
  { icon: BookOpen, label: 'Faculty', desc: 'Mentors cohort during technical phase', badge: 'Step 3', color: 'bg-golden/20 text-golden-dark' },
  { icon: Users, label: 'Students', desc: 'Build production-ready solutions', badge: 'Step 4', color: 'bg-teal/15 text-teal' },
  { icon: CheckCircle, label: 'Placement', desc: 'Direct hiring & full-time conversion', badge: 'Result', color: 'bg-coral/15 text-coral' },
]

export default function CollaborationSection() {
  return (
    <section className="py-24 bg-offwhite border-t border-slate-200" id="collaboration">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/15 border border-teal/30 text-teal text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={13} className="text-golden" /> Industry–Academia Bridge
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-midnight tracking-tight mb-3">
            How Industry & Academia Collaborate
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            A continuous loop from campus coursework to enterprise engineering requirements.
          </p>
        </div>

        {/* 5 Connected Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-center relative group"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-block mb-3">
                  {step.badge}
                </span>

                <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                  <step.icon size={22} />
                </div>

                <h3 className="font-heading font-bold text-sm text-midnight mb-1">
                  {step.label}
                </h3>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {step.desc}
                </p>
              </div>

              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
