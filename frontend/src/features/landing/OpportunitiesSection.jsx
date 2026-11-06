import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MapPin, Clock, IndianRupee, Zap, ArrowRight, Building2, Briefcase } from 'lucide-react'
import api from '../../services/api'

gsap.registerPlugin(ScrollTrigger)

export default function OpportunitiesSection() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef(null)

  useEffect(() => {
    api.get('/opportunities/featured/')
      .then((res) => {
        const items = res.data?.items || res.data?.opportunities || []
        if (items.length > 0) {
          setOpportunities(items.slice(0, 3))
        } else {
          // Dynamic fallback items if DB has no opportunities yet
          setOpportunities([
            {
              id: 'opp-1',
              title: 'Full Stack Engineering Intern',
              company_name: 'TechCorp Solutions',
              location: 'Bangalore / Remote',
              type: 'Internship',
              stipend: '₹25,000 / month',
              skills: ['React', 'Node.js', 'MongoDB', 'REST API'],
              match_score: 92,
              deadline: '15 Days Left'
            },
            {
              id: 'opp-2',
              title: 'AI / Data Science Associate',
              company_name: 'Cognitive Analytics',
              location: 'Hyderabad / Hybrid',
              type: 'Internship',
              stipend: '₹30,000 / month',
              skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL'],
              match_score: 88,
              deadline: '20 Days Left'
            },
            {
              id: 'opp-3',
              title: 'Cloud & DevOps Engineer',
              company_name: 'InnoCloud Networks',
              location: 'Pune',
              type: 'Full-time',
              stipend: '₹8.5 LPA',
              skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux'],
              match_score: 85,
              deadline: '25 Days Left'
            }
          ])
        }
      })
      .catch(() => {
        setOpportunities([
          {
            id: 'opp-1',
            title: 'Full Stack Engineering Intern',
            company_name: 'TechCorp Solutions',
            location: 'Bangalore / Remote',
            type: 'Internship',
            stipend: '₹25,000 / month',
            skills: ['React', 'Node.js', 'MongoDB', 'REST API'],
            match_score: 92,
            deadline: '15 Days Left'
          },
          {
            id: 'opp-2',
            title: 'AI / Data Science Associate',
            company_name: 'Cognitive Analytics',
            location: 'Hyderabad / Hybrid',
            type: 'Internship',
            stipend: '₹30,000 / month',
            skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL'],
            match_score: 88,
            deadline: '20 Days Left'
          },
          {
            id: 'opp-3',
            title: 'Cloud & DevOps Engineer',
            company_name: 'InnoCloud Networks',
            location: 'Pune',
            type: 'Full-time',
            stipend: '₹8.5 LPA',
            skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux'],
            match_score: 85,
            deadline: '25 Days Left'
          }
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section ref={sectionRef} className="pt-24 pb-28 bg-white border-t border-slate-200" id="opportunities">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/15 border border-teal/30 text-teal text-xs font-bold uppercase tracking-wider mb-3">
              Curated Opportunities
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-midnight tracking-tight">
              Featured Internships & Placements
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Opportunities dynamically matched to student competency levels and verified skill badges.
            </p>
          </div>

          <Link
            to="/student/opportunities"
            className="inline-flex items-center gap-2 text-sm font-bold text-coral hover:text-coral-dark transition-colors self-start md:self-auto"
          >
            Browse All Opportunities <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => {
            const skillsList = opp.skills || opp.required_skills || ['Full Stack']
            const match = opp.match_percentage || opp.match_score || 88
            const compName = opp.company_name || opp.company || 'Hiring Partner'
            const oppId = opp.id || opp.internship_id || opp.title
            return (
              <div
                key={oppId}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-heading font-black text-xl shadow-md ${
                      opp.type === 'Internship'
                        ? 'bg-gradient-to-tr from-teal to-mint text-midnight'
                        : 'bg-gradient-to-tr from-coral to-golden text-white'
                    }`}>
                      {compName ? compName[0] : 'S'}
                    </div>
                    <div className="flex items-center gap-1.5 bg-mint/50 border border-teal/20 px-2.5 py-1 rounded-full">
                      <Zap size={13} className="text-teal" />
                      <span className="text-xs font-extrabold text-midnight">{match}% Match</span>
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-midnight mb-1 hover:text-teal transition-colors">
                    {opp.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-4 flex items-center gap-1.5">
                    <Building2 size={13} /> {compName}
                  </p>

                  <div className="space-y-2 text-xs text-slate-600 mb-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-slate-400" />
                      <span>{opp.location || 'Multiple Locations'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee size={13} className="text-slate-400" />
                      <span className="font-semibold text-midnight">{opp.stipend || opp.salary || 'Competitive Stipend'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-slate-400" />
                      <span>{opp.deadline || 'Apply Soon'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {skillsList.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {typeof s === 'string' ? s : s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    opp.type === 'Internship' ? 'bg-mint text-midnight' : 'bg-coral/15 text-coral-dark'
                  }`}>
                    {opp.type || 'Internship'}
                  </span>
                  <Link
                    to="/student/opportunities"
                    className="text-xs font-bold text-teal hover:text-teal-dark flex items-center gap-1 transition-colors"
                  >
                    View Details <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
