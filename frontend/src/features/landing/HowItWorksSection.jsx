import { useState } from 'react'
import { GraduationCap, Cpu, Compass, Building2, CheckCircle2, Sparkles } from 'lucide-react'

const workflowSteps = [
  {
    step: '01',
    role: 'Academia',
    title: 'Curriculum & Student Profiles',
    icon: GraduationCap,
    badge: 'Step 1: Input',
    badgeColor: 'text-teal bg-mint/50 border-teal/20',
    desc: 'Universities sync academic courses while students upload CVs and record coursework competencies.',
    highlights: ['Multi-format resume parsing (PDF/DOCX)', 'Academic course mapping', 'Verified assessment badges']
  },
  {
    step: '02',
    role: 'AI Engine',
    title: 'Deep Competency Extraction',
    icon: Cpu,
    badge: 'Step 2: AI Parsing',
    badgeColor: 'text-golden-dark bg-golden/15 border-golden/30',
    desc: 'Natural language processing maps raw text into categorized skills across frontend, backend, AI, and cloud.',
    highlights: ['Multi-layer taxonomy parsing', 'Experience & project detection', 'Standardized skill proficiency']
  },
  {
    step: '03',
    role: 'Intelligence',
    title: 'Live Skill Gap & Roadmap',
    icon: Compass,
    badge: 'Step 3: Analysis',
    badgeColor: 'text-coral bg-coral/10 border-coral/30',
    desc: 'Calculates exact role readiness, flags high-priority missing skills, and constructs a customized 4-week learning roadmap.',
    highlights: ['Readiness score (0-100%)', 'Missing skill priority classification', 'Actionable weekly study checklist']
  },
  {
    step: '04',
    role: 'Industry',
    title: 'Placement & Recruiter Matching',
    icon: Building2,
    badge: 'Step 4: Hiring',
    badgeColor: 'text-teal bg-mint/50 border-teal/20',
    desc: 'Connecting verified talent to active internships and full-time hiring pipelines with zero recruitment friction.',
    highlights: ['Match percentage breakdown', 'Recruiter Kanban pipeline', 'Direct interview scheduling']
  }
]

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <section id="workflow" className="py-24 bg-offwhite border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/15 border border-teal/30 text-teal text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={13} className="text-golden" /> End-to-End Pipeline
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-midnight tracking-tight mb-3">
            The Academia–to–Industry Pipeline
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            See how SkillBridge dynamically bridges academic curricula and student competencies with real-world industry requirements.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div
          style={{ display: 'grid', opacity: 1, visibility: 'visible', marginBottom: '2.5rem' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon
            const isHovered = activeTab === idx
            return (
              <div
                key={step.step}
                onMouseEnter={() => setActiveTab(idx)}
                style={{ backgroundColor: '#FFFFFF', border: isHovered ? '1.5px solid #00BFA6' : '1px solid #E2E8F0', borderRadius: '1rem', opacity: 1, visibility: 'visible' }}
                className={`relative rounded-2xl p-6 transition-all duration-300 border flex flex-col justify-between cursor-pointer ${
                  isHovered
                    ? 'bg-white border-teal shadow-card-hover -translate-y-1'
                    : 'bg-white border-slate-200 shadow-card hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${step.badgeColor}`}>
                      {step.badge}
                    </span>
                    <span className="font-heading font-black text-2xl text-slate-300">
                      {step.step}
                    </span>
                  </div>

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    isHovered ? 'bg-teal text-midnight' : 'bg-mint/50 text-midnight'
                  }`}>
                    <Icon size={24} />
                  </div>

                  <h3 className="font-heading font-bold text-base text-midnight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {step.desc}
                  </p>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-slate-100 text-xs">
                  {step.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 size={13} className="text-teal flex-shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
