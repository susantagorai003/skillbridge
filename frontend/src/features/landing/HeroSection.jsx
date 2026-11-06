import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowRight, Sparkles, Cpu, CheckCircle2, ChevronRight } from 'lucide-react'

const HeroScene = lazy(() => import('../../three/HeroScene'))

export default function HeroSection() {
  const navigate = useNavigate()
  const headlineRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)
  const previewRef = useRef(null)

  const [quickInput, setQuickInput] = useState('React, JavaScript, Node.js, Express, MongoDB, MySQL, Tailwind CSS, Python, Git')
  const [quickRole, setQuickRole] = useState('Full Stack Developer')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    
    const ctx = gsap.context(() => {
      const targets = [headlineRef.current, subRef.current].filter(Boolean)
      if (targets.length > 0) {
        gsap.fromTo(targets, 
          { y: 15, opacity: 0.8 }, 
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', onComplete: () => {
            gsap.set(targets, { clearProps: 'all' })
          }}
        )
      }
    })

    return () => ctx.revert()
  }, [])

  const handleQuickAnalyze = (e) => {
    e.preventDefault()
    sessionStorage.setItem('skillbridge_quick_skills', quickInput)
    sessionStorage.setItem('skillbridge_quick_role', quickRole)
    navigate('/student/skill-gap')
  }

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex flex-col justify-center items-center bg-midnight text-white pt-24 pb-16 sm:pt-28 sm:pb-20 overflow-hidden">
      {/* 3D Visual Scene in Background */}
      <Suspense fallback={
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute w-72 h-72 rounded-full bg-teal/20 blur-3xl top-1/4 left-1/4 animate-pulse" />
          <div className="absolute w-60 h-60 rounded-full bg-coral/20 blur-3xl bottom-1/3 right-1/4 animate-pulse" />
        </div>
      }>
        <HeroScene />
      </Suspense>

      {/* Radiant Background Ambient Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-teal/15 via-coral/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-midnight/50 via-midnight/80 to-midnight pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center w-full">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-midnight-light/80 border border-teal/30 text-teal text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm backdrop-blur-md">
          <Sparkles size={13} className="text-golden animate-pulse" />
          Next-Gen AI Skill Mapping & Placement Engine
        </div>

        {/* Hero Headline */}
        <h1
          ref={headlineRef}
          className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15] mb-5 max-w-4xl mx-auto"
        >
          Bridging the Gap Between{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light via-teal to-mint">
            Academic Learning
          </span>{' '}
          and{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral via-coral-light to-golden">
            Industry Excellence
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subRef}
          className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-normal"
        >
          An intelligent collaboration platform connecting students, universities and industries through AI-powered skill mapping, personalized learning and smarter recruitment.
        </p>

        {/* Prominent CTA Buttons */}
        <div
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.875rem', marginBottom: '2rem', opacity: 1, visibility: 'visible' }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8"
        >
          <a
            href="#workflow"
            style={{ background: 'linear-gradient(135deg, #FF6B5E, #E65345)', color: '#FFFFFF', padding: '0.875rem 1.75rem', borderRadius: '0.75rem', fontWeight: 700 }}
            className="px-6 py-3 bg-gradient-to-r from-coral to-coral-dark text-white font-heading font-bold rounded-xl shadow-lg shadow-coral/30 hover:scale-105 transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
          >
            Explore Platform <ArrowRight size={16} />
          </a>
          <Link
            to="/register?role=student"
            style={{ backgroundColor: '#00BFA6', color: '#14213D', padding: '0.875rem 1.75rem', borderRadius: '0.75rem', fontWeight: 700 }}
            className="px-6 py-3 bg-teal text-midnight font-heading font-bold rounded-xl hover:bg-teal-light shadow-lg shadow-teal/30 hover:scale-105 transition-all text-xs sm:text-sm flex items-center gap-2"
          >
            Join as Student
          </Link>
          <Link
            to="/register?role=company"
            style={{ backgroundColor: '#1E2E4F', color: '#F8F9F6', border: '1px solid #334155', padding: '0.875rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600 }}
            className="px-5 py-3 bg-midnight-light/90 border border-slate-700 text-slate-200 font-heading font-semibold rounded-xl hover:bg-midnight-light hover:border-teal/50 transition-all text-xs sm:text-sm"
          >
            Partner with Us
          </Link>
        </div>

        {/* Compact Interactive Live AI Skill Gap Preview Widget */}
        <div
          ref={previewRef}
          className="max-w-xl mx-auto bg-midnight-light/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl text-left"
        >
          <div className="flex items-center justify-between mb-3 border-b border-slate-700/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal/20 flex items-center justify-center text-teal">
                <Cpu size={16} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Live AI Skill Gap Preview</h4>
                <p className="text-[11px] text-slate-400">Test how SkillBridge identifies missing competencies instantly</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal/15 text-teal border border-teal/30">
              Interactive
            </span>
          </div>

          <form onSubmit={handleQuickAnalyze} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Your Skills (or paste from CV):</label>
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="e.g. React, Python, SQL, Git"
                  className="w-full px-3 py-2 bg-midnight/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Role:</label>
                <select
                  value={quickRole}
                  onChange={(e) => setQuickRole(e.target.value)}
                  className="w-full px-2.5 py-2 bg-midnight/90 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-teal transition-colors"
                >
                  <option value="Full Stack Developer">Full Stack</option>
                  <option value="Frontend Developer">Frontend</option>
                  <option value="Backend Developer">Backend</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="AI / ML Engineer">AI / ML</option>
                  <option value="DevOps Engineer">DevOps</option>
                  <option value="Cybersecurity Analyst">Security</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <CheckCircle2 size={13} className="text-teal" />
                <span>Extracts match % & 4-week roadmap</span>
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-gradient-to-r from-teal to-teal-dark text-midnight text-xs font-bold rounded-lg hover:shadow-md hover:shadow-teal/20 transition-all flex items-center gap-1 cursor-pointer"
              >
                Analyze Skill Gap <ChevronRight size={13} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Fade Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-offwhite to-transparent pointer-events-none" />
    </section>
  )
}
