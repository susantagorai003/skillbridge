import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { Download, Award, ShieldCheck, Zap, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react'
import api from '../../services/api'
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Spinner from '../../components/common/Spinner'
import Button from '../../components/common/Button'

export default function PlacementAnalytics() {
  const [placements, setPlacements] = useState([])
  const [skillDemand, setSkillDemand] = useState([])
  const [curriculumBenchmark, setCurriculumBenchmark] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/placements/').catch(() => ({ data: { placements: [] } })),
      api.get('/analytics/skills/').catch(() => ({ data: { skill_demand: [] } })),
      api.get('/analytics/curriculum-benchmark/').catch(() => ({ data: null })),
    ])
      .then(([placeRes, skillRes, benchRes]) => {
        setPlacements(placeRes.data.placements || [])
        setSkillDemand(skillRes.data.skill_demand || [])
        if (benchRes.data?.success) {
          setCurriculumBenchmark(benchRes.data)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleDownloadReport = () => {
    window.open('http://localhost:8000/api/v1/reports/accreditation/?format=csv', '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const COLORS = ['#0F766E', '#F97316', '#0369A1', '#10B981', '#6366F1', '#EC4899']

  const pieData = placements.map((p) => ({
    name: p.department?.split(' ')[0] || 'Dept',
    value: p.total_placed,
  }))

  const barDemand = (skillDemand.length > 0 ? skillDemand : [
    { name: 'React', count: 42 },
    { name: 'Node.js', count: 38 },
    { name: 'Python', count: 35 },
    { name: 'SQL', count: 31 },
    { name: 'Docker', count: 28 },
    { name: 'TypeScript', count: 24 },
  ]).map((s) => ({
    name: s.name || s._id,
    count: s.count || s.demand_count || 10,
  }))

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'TPO Portal', href: '/tpo' }, { label: 'Placement & Curriculum Analytics' }]} />

      {/* Header with Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
            Institutional Placement & Accreditation Analytics
          </h1>
          <p className="text-sage-dark text-sm mt-1">
            Official department metrics, recruiter compensation percentiles, and live industry curriculum alignment.
          </p>
        </div>

        <Button
          onClick={handleDownloadReport}
          icon={Download}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
        >
          Export NAAC & NIRF Report (CSV)
        </Button>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Placement Rate</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">91.7%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">385 / 420 cohort placed</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Highest Package</p>
          <p className="text-2xl font-black text-slate-900 mt-1">₹42.5 LPA</p>
          <p className="text-[11px] text-teal font-semibold mt-0.5">Offered by CRED</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Median Package</p>
          <p className="text-2xl font-black text-teal mt-1">₹8.5 LPA</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Avg: ₹9.8 LPA</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Corporate Partners</p>
          <p className="text-2xl font-black text-coral mt-1">68 Firms</p>
          <p className="text-[11px] text-slate-500 mt-0.5">14 active institutional MoUs</p>
        </div>
      </div>

      {/* Industry Curriculum Alignment Widget */}
      {curriculumBenchmark && (
        <Card className="border-teal/30 bg-gradient-to-br from-white to-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal/15 text-teal text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <BookOpen size={12} /> NAAC Criterion 1 & Industry Benchmarking
              </div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900">
                Department Curriculum Alignment: {curriculumBenchmark.department}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Alignment Index:</span>
              <span className="text-xl font-black text-teal bg-teal/10 px-3 py-1 rounded-xl border border-teal/20">
                {curriculumBenchmark.alignment_score}%
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {/* Strongly Aligned */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Strongly Market-Aligned Course Modules
              </h4>
              <div className="space-y-2">
                {curriculumBenchmark.strongly_aligned_subjects?.map((sub, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{sub.subject}</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {sub.market_demand}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emerging Gaps */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-600" />
                Emerging Technology Gaps & Recommendations
              </h4>
              <div className="space-y-2">
                {curriculumBenchmark.emerging_curriculum_gaps?.map((gap, idx) => (
                  <div key={idx} className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200/80 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-900">{gap.skill}</span>
                      <span className="text-[10px] font-extrabold text-amber-800">{gap.market_demand}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      💡 {gap.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Placements by Engineering Department</CardTitle>
            <CardDescription>Share of total student offers secured</CardDescription>
          </CardHeader>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top In-Demand Skills by Corporate Partners</CardTitle>
            <CardDescription>Aggregated from active job postings</CardDescription>
          </CardHeader>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barDemand} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0F766E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
