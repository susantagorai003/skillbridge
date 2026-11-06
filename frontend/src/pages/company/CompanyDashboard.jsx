import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, Users, FileText, CheckCircle2, Plus, ShieldCheck,
  TrendingUp, Clock, ChevronRight, UserCheck, ArrowRight, Sparkles
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import api from '../../services/api'
import useAuth from '../../hooks/useAuth'
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Spinner from '../../components/common/Spinner'

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/recruiter/')
      .then((res) => {
        if (res.data?.success) setAnalytics(res.data.analytics)
      })
      .catch((err) => console.error('Failed to load recruiter analytics:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const pipeline = analytics?.recruitment_pipeline || [
    { stage: 'Applied', count: 22 },
    { stage: 'Review', count: 16 },
    { stage: 'Shortlisted', count: 7 },
    { stage: 'Interview', count: 4 },
    { stage: 'Offers', count: 2 },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Recruiter Portal' }, { label: 'Overview' }]} />

      {/* Recruiter Header */}
      <div className="bg-gradient-to-r from-midnight via-midnight to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/20 text-teal text-xs font-bold mb-3 border border-teal/40">
              <ShieldCheck size={13} className="text-teal" /> Verified Industry Hiring Partner
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Recruitment & Candidate Talent Matcher
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Post opportunities with skill benchmarks, discover students with verified competencies, and move candidates through the hiring pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/company/post"
              className="px-5 py-3 rounded-xl bg-coral hover:bg-coral-dark text-white font-heading font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Post Opportunity
            </Link>
            <Link
              to="/company/candidates"
              className="px-4 py-3 rounded-xl bg-midnight-light border border-slate-700 text-white font-heading font-semibold text-xs hover:border-teal transition-colors flex items-center gap-1.5"
            >
              <Users size={16} /> Discover Candidates
            </Link>
          </div>
        </div>
      </div>

      {/* Key Hiring Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Active Postings</span>
          <p className="font-heading font-black text-3xl text-midnight">{analytics?.active_postings || 3}</p>
          <p className="text-xs text-teal font-semibold mt-1">Live internships & jobs</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Total Applicants</span>
          <p className="font-heading font-black text-3xl text-midnight">{analytics?.total_applicants || 22}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Student submissions</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Shortlisted</span>
          <p className="font-heading font-black text-3xl text-teal">{analytics?.shortlisted_candidates || 7}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Met competency threshold</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Interviews Scheduled</span>
          <p className="font-heading font-black text-3xl text-coral">{analytics?.interviews_scheduled || 4}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Upcoming technical rounds</p>
        </div>
      </div>

      {/* Recruitment Pipeline Funnel & Candidate Management */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recruitment Pipeline Funnel</CardTitle>
              <CardDescription>Visualizing candidate stage progression from submission to offer</CardDescription>
            </CardHeader>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="stage" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF6B5E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Quick Candidate Matcher Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Talent Acquisition Hub</CardTitle>
              <CardDescription>Direct recruitment workflows</CardDescription>
            </CardHeader>
            <div className="space-y-3">
              <Link
                to="/company/applications"
                className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal/15 text-teal flex items-center justify-center">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-midnight group-hover:text-teal transition-colors">
                      Review Applicant Pipeline
                    </p>
                    <p className="text-[11px] text-slate-500">Update status: Shortlist, Interview, Hire</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/company/candidates"
                className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-coral/15 text-coral flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-midnight group-hover:text-coral transition-colors">
                      AI Candidate Search
                    </p>
                    <p className="text-[11px] text-slate-500">Filter students by skills & match score</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/company/post"
                className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-golden/20 text-golden-dark flex items-center justify-center">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-midnight group-hover:text-golden-dark transition-colors">
                      Post New Opportunity
                    </p>
                    <p className="text-[11px] text-slate-500">Define required & preferred tech stack</p>
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
