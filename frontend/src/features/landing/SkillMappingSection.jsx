import { useState } from 'react'
import { ArrowRight, Sparkles, Database, Layers, Server, Code2, Cloud, ShieldCheck } from 'lucide-react'

const domainMaps = [
  {
    role: 'Full Stack Engineer',
    icon: Layers,
    connections: [
      { from: 'React.js / Next.js', to: 'State & Performance', toSub: 'Frontend Mastery', color: 'border-teal text-teal bg-mint/30' },
      { from: 'Python / Django / Node', to: 'RESTful API & JWT Auth', toSub: 'Backend Architecture', color: 'border-coral text-coral-dark bg-coral/10' },
      { from: 'MongoDB / PostgreSQL', to: 'Indexing & Aggregations', toSub: 'Database Systems', color: 'border-golden-dark text-golden-dark bg-golden/10' },
      { from: 'Docker & GitHub Actions', to: 'Cloud CI/CD Pipelines', toSub: 'DevOps Deployment', color: 'border-teal text-teal bg-mint/30' },
    ]
  },
  {
    role: 'AI & Data Science',
    icon: Database,
    connections: [
      { from: 'Python & NumPy', to: 'Vectorized Data Processing', toSub: 'Core Foundations', color: 'border-golden-dark text-golden-dark bg-golden/10' },
      { from: 'Pandas & SQL', to: 'ETL Pipelines & EDA', toSub: 'Data Analytics', color: 'border-teal text-teal bg-mint/30' },
      { from: 'PyTorch / Scikit-Learn', to: 'Model Training & Tuning', toSub: 'Machine Learning', color: 'border-coral text-coral-dark bg-coral/10' },
      { from: 'FastAPI / LangChain', to: 'LLM Agent Integration', toSub: 'Applied AI Systems', color: 'border-teal text-teal bg-mint/30' },
    ]
  },
  {
    role: 'Cloud & DevOps',
    icon: Cloud,
    connections: [
      { from: 'Linux & Bash Scripting', to: 'System Automation', toSub: 'Core Systems', color: 'border-coral text-coral-dark bg-coral/10' },
      { from: 'Docker Containerization', to: 'Microservice Packaging', toSub: 'Container Runtime', color: 'border-teal text-teal bg-mint/30' },
      { from: 'Kubernetes (K8s)', to: 'Cluster Orchestration', toSub: 'Infrastructure Scale', color: 'border-golden-dark text-golden-dark bg-golden/10' },
      { from: 'Terraform & AWS', to: 'Infrastructure as Code', toSub: 'Cloud Provisioning', color: 'border-teal text-teal bg-mint/30' },
    ]
  }
]

export default function SkillMappingSection() {
  const [selectedDomain, setSelectedDomain] = useState(0)
  const current = domainMaps[selectedDomain]

  return (
    <section
      id="skill-mapping"
      style={{ paddingTop: '5.5rem', paddingBottom: '5.5rem', backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}
      className="py-24 bg-white border-t border-slate-200"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/15 border border-teal/30 text-teal text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={13} className="text-golden" /> Semantic Graph Mapping
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-midnight tracking-tight mb-4">
            How Skills Map Directly to Career Roles
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every technical competency connects into hierarchical domain proficiencies and industry career benchmarks.
          </p>
        </div>

        {/* Role Domain Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {domainMaps.map((dm, idx) => {
            const Icon = dm.icon
            const isActive = selectedDomain === idx
            return (
              <button
                key={dm.role}
                onClick={() => setSelectedDomain(idx)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-midnight text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-teal' : 'text-slate-500'} />
                {dm.role}
              </button>
            )
          })}
        </div>

        {/* Mapped Progression Paths */}
        <div className="space-y-3.5 max-w-3xl mx-auto">
          {current.connections.map((c, i) => (
            <div
              key={i}
              className="bg-offwhite p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${c.color}`}>
                  {c.from}
                </span>
                <ArrowRight size={16} className="text-slate-400 hidden sm:block flex-shrink-0" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-midnight shadow-2xs">
                  {c.to}
                </span>
                <ArrowRight size={16} className="text-slate-400 hidden sm:block flex-shrink-0" />
              </div>

              <span className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-midnight text-white w-full sm:w-auto text-center">
                {c.toSub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
