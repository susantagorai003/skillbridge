import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Users, GraduationCap, Building2, Briefcase } from 'lucide-react'
import api from '../../services/api'

gsap.registerPlugin(ScrollTrigger)

export default function StatsSection() {
  const sectionRef = useRef(null)
  const [statsData, setStatsData] = useState([
    { icon: Users, value: 120, suffix: '+', label: 'Students Connected', key: 'total_students' },
    { icon: Building2, value: 18, suffix: '+', label: 'Industry Partners', key: 'total_companies' },
    { icon: GraduationCap, value: 8, suffix: '+', label: 'Partner Universities', key: 'total_universities' },
    { icon: Briefcase, value: 24, suffix: '+', label: 'Active Opportunities', key: 'total_opportunities' },
  ])

  const counterRefs = useRef([])

  useEffect(() => {
    // Fetch live platform metrics from backend
    api.get('/analytics/platform/')
      .then((res) => {
        if (res.data?.success && res.data?.stats) {
          const s = res.data.stats
          setStatsData([
            { icon: Users, value: s.total_students || 120, suffix: '+', label: 'Students Connected', key: 'total_students' },
            { icon: Building2, value: s.total_companies || 18, suffix: '+', label: 'Industry Partners', key: 'total_companies' },
            { icon: GraduationCap, value: s.total_universities || 8, suffix: '+', label: 'Partner Universities', key: 'total_universities' },
            { icon: Briefcase, value: s.total_opportunities || 24, suffix: '+', label: 'Active Opportunities', key: 'total_opportunities' },
          ])
        }
      })
      .catch((err) => {
        console.error('Failed to load platform stats:', err)
      })
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      counterRefs.current.forEach((el, i) => {
        if (!el) return
        const target = statsData[i].value
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString('en-IN') + statsData[i].suffix
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [statsData])

  return (
    <section ref={sectionRef} className="py-16 bg-offwhite border-b border-offwhite-border relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {statsData.map((stat, i) => (
            <div
              key={stat.key}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 text-center group"
            >
              <div className="w-14 h-14 bg-mint/40 rounded-2xl border border-teal/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-teal group-hover:text-midnight transition-all duration-300">
                <stat.icon size={26} className="text-teal group-hover:text-midnight transition-colors" />
              </div>
              <p
                ref={(el) => (counterRefs.current[i] = el)}
                className="font-heading font-extrabold text-3xl sm:text-4xl text-midnight mb-1 tracking-tight"
              >
                0
              </p>
              <p className="text-xs sm:text-sm font-semibold text-charcoal-muted uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
