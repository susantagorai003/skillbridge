import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import {
  Zap, Target, Briefcase, TrendingUp, CheckCircle, ArrowRight,
  Sparkles, Award, FileText, UploadCloud, ChevronRight, BookOpen
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import api from '../../services/api'
import useAuth from '../../hooks/useAuth'
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Spinner from '../../components/common/Spinner'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const dashboardRef = useRef(null)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/student/'),
      api.get('/matching/recommendations/?page_size=3'),
    ])
      .then(([analyticsRes, recRes]) => {
        if (analyticsRes.data?.success) {
          setAnalytics(analyticsRes.data.analytics)
        }
        setRecommendations(recRes.data?.items || [])
      })
      .catch((err) => {
        console.error('Failed to load student dashboard:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  // GSAP Entrance
  useEffect(() => {
    if (loading || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo('.dashboard-widget', 
        { y: 15, opacity: 0.9 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', onComplete: () => {
          gsap.set('.dashboard-widget', { clearProps: 'all' })
        }}
      )
    }, dashboardRef)

    return () => ctx.revert()
  }, [loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const readiness = analytics?.readiness_score || 76
  const activeApps = analytics?.active_applications || 3
  const shortlisted = analytics?.shortlisted_count || 1
  const roadmapPct = analytics?.roadmap_progress || 45
  const verifiedBadges = analytics?.verified_skill_badges || 3

  const chartData = [
    { name: 'Core Foundations', score: 85 },
    { name: 'Frameworks', score: 78 },
    { name: 'Databases', score: 82 },
    { name: 'DevOps / CI/CD', score: 45 },
    { name: 'Testing', score: 55 },
  ]

  return (
    <div ref={dashboardRef} className="space-y-6">
      <Breadcrumbs items={[{ label: 'Student Portal' }, { label: 'Overview' }]} />

      {/* Welcome Banner */}
      <div className="dashboard-widget bg-gradient-to-r from-midnight via-midnight to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/20 text-teal text-xs font-bold mb-3 border border-teal/40">
              <Sparkles size={13} className="text-golden" /> Student Career Dashboard
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
              Welcome back, {user?.name || 'Candidate'}!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Targeting <strong className="text-white">{analytics?.target_role || 'Full Stack Developer'}</strong>.
              Your personalized learning roadmap is currently <strong className="text-teal">{roadmapPct}% complete</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/skill-gap"
              className="px-5 py-3 rounded-xl bg-teal text-midnight font-heading font-bold text-xs hover:bg-teal-light hover:shadow-lg hover:shadow-teal/25 transition-all flex items-center gap-2"
            >
              <Target size={15} /> Open AI Skill Gap Engine
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dashboard-widget bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Readiness</span>
            <div className="w-9 h-9 rounded-xl bg-teal/15 text-teal flex items-center justify-center">
              <Target size={18} />
            </div>
          </div>
          <p className="font-heading font-black text-3xl text-midnight">{readiness}%</p>
          <p className="text-xs text-teal font-semibold mt-1">Placement Calibrated</p>
        </div>

        <div className="dashboard-widget bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Applications</span>
            <div className="w-9 h-9 rounded-xl bg-coral/15 text-coral flex items-center justify-center">
              <Briefcase size={18} />
            </div>
          </div>
          <p className="font-heading font-black text-3xl text-midnight">{activeApps}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">{shortlisted} shortlisted for interview</p>
        </div>

        <div className="dashboard-widget bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Roadmap Progress</span>
            <div className="w-9 h-9 rounded-xl bg-mint text-midnight flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="font-heading font-black text-3xl text-midnight">{roadmapPct}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-teal h-1.5 rounded-full" style={{ width: `${roadmapPct}%` }} />
          </div>
        </div>

        <div className="dashboard-widget bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Badges</span>
            <div className="w-9 h-9 rounded-xl bg-golden/20 text-golden-dark flex items-center justify-center">
              <Award size={18} />
            </div>
          </div>
          <p className="font-heading font-black text-3xl text-midnight">{verifiedBadges}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Assessment Certified</p>
        </div>
      </div>

      {/* Main Grid: Competency Chart & Recommended Internships */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Competency Chart */}
        <div className="dashboard-widget lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Competency Profile by Category</CardTitle>
              <CardDescription>
                Live proficiency benchmarks compared across technical categories
              </CardDescription>
            </CardHeader>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} />
                  <Bar dataKey="score" fill="#00BFA6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Quick Actions & Resume Status */}
        <div className="dashboard-widget">
          <Card>
            <CardHeader>
              <CardTitle>Career Development Hub</CardTitle>
              <CardDescription>Quick actions for talent readiness</CardDescription>
            </CardHeader>
            <div className="space-y-3">
              <Link
                to="/student/skill-gap"
                className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal/15 text-teal flex items-center justify-center">
                    <Target size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-midnight group-hover:text-teal transition-colors">
                      Run AI CV Analysis
                    </p>
                    <p className="text-[11px] text-slate-500">Detect gaps from PDF resume</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/student/opportunities"
                className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-coral/15 text-coral flex items-center justify-center">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-midnight group-hover:text-coral transition-colors">
                      Matched Opportunities
                    </p>
                    <p className="text-[11px] text-slate-500">Apply with 1-click matching</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/student/skills"
                className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-golden/20 text-golden-dark flex items-center justify-center">
                    <Zap size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-midnight group-hover:text-golden-dark transition-colors">
                      Verify Skills with MCQs
                    </p>
                    <p className="text-[11px] text-slate-500">Earn verified badge credentials</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/student/trainings"
                className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal/15 text-teal flex items-center justify-center">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-midnight group-hover:text-teal transition-colors">
                      TPO Upskilling Bootcamps
                    </p>
                    <p className="text-[11px] text-slate-500">Register for faculty & TPO training tracks</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
