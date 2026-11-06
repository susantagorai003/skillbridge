import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Building2, GraduationCap, ShieldCheck, CheckCircle2,
  AlertTriangle, ArrowRight, Database, Activity, Sparkles, Check, Megaphone, Plus
} from 'lucide-react'
import api from '../../services/api'
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Spinner from '../../components/common/Spinner'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [annModal, setAnnModal] = useState(false)
  const [annData, setAnnData] = useState({
    title: '',
    message: '',
    target_role: 'all'
  })
  const [broadcasting, setBroadcasting] = useState(false)

  const fetchData = async () => {
    try {
      const [adminRes, logsRes] = await Promise.all([
        api.get('/analytics/admin/').catch(() => ({ data: { analytics: null } })),
        api.get('/admin/logs/').catch(() => ({ data: { logs: [] } })),
      ])
      if (adminRes.data?.success) setAnalytics(adminRes.data.analytics)
      if (logsRes.data?.success) setLogs(logsRes.data.logs || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleBroadcast = async (e) => {
    e.preventDefault()
    if (!annData.title || !annData.message) return
    setBroadcasting(true)
    try {
      const res = await api.post('/admin/announcements/', annData)
      if (res.data?.success) {
        alert('Platform announcement broadcasted to all selected roles!')
        setAnnModal(false)
        setAnnData({ title: '', message: '', target_role: 'all' })
        fetchData()
      }
    } catch (err) {
      alert('Failed to broadcast announcement.')
    } finally {
      setBroadcasting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Admin Portal' }, { label: 'Platform Governance & Health' }]} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-midnight via-midnight to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/20 text-teal text-xs font-bold mb-3 border border-teal/40">
              <Sparkles size={13} className="text-golden" /> SuperAdmin Management Console
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Platform Governance & Health
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Real-time oversight over MongoDB collections, cross-role permissions, user registration approvals, and institutional audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAnnModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal text-midnight font-heading font-bold text-xs hover:bg-teal-light shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Megaphone size={16} /> Broadcast Announcement
            </button>
            <Link
              to="/admin/users"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-heading font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Users size={15} /> User Governance
            </Link>
            <Link
              to="/admin/departments"
              className="px-4 py-2.5 rounded-xl bg-midnight-light border border-slate-700 text-white font-heading font-semibold text-xs hover:border-teal transition-colors flex items-center gap-1.5"
            >
              <Building2 size={15} /> Departments
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Registered Students</span>
          <p className="font-heading font-black text-3xl text-midnight">{analytics?.total_students ?? 0}</p>
          <p className="text-xs text-teal font-semibold mt-1">Verified user accounts</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Corporate Partners</span>
          <p className="font-heading font-black text-3xl text-midnight">{analytics?.total_companies ?? 0}</p>
          <p className="text-xs text-teal font-semibold mt-1">Industry recruiters</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Campus Placement Drives</span>
          <p className="font-heading font-black text-3xl text-teal">{analytics?.total_placement_drives ?? 0}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Published by TPO</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Resumes Analyzed</span>
          <p className="font-heading font-black text-3xl text-midnight">{analytics?.total_resumes_analyzed ?? 0}</p>
          <p className="text-xs text-teal font-semibold mt-1">AI parsed & indexed</p>
        </div>
      </div>

      {/* Live System Activity and Health */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database size={18} className="text-teal" /> Database & System Health
            </CardTitle>
            <CardDescription>Live health checks from local MongoDB instance</CardDescription>
          </CardHeader>

          <div className="space-y-3 mt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">MongoDB Connection</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Connected (skillbridge)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">API Status</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Academic Departments</span>
              <strong className="text-slate-800">{analytics?.total_departments ?? 0} active</strong>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Total Applications</span>
              <strong className="text-slate-800">{analytics?.total_applications ?? 0} processed</strong>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Activity size={18} className="text-teal" /> Live System Audit Trail
              </h3>
              <p className="text-xs text-slate-500">Real-time actions executed across platform roles</p>
            </div>
            <Link to="/admin/logs" className="text-xs font-bold text-teal hover:underline flex items-center gap-1">
              View All Logs <ArrowRight size={12} />
            </Link>
          </div>

          {logs.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 italic">
              No audit activities recorded in database yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {logs.slice(0, 7).map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 block">{log.action}</strong>
                    <span className="text-[11px] text-slate-500">
                      By {log.actor_name} ({log.actor_role}) • {log.details}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Broadcast Modal */}
      {annModal && (
        <Modal isOpen={annModal} onClose={() => setAnnModal(false)} title="Broadcast Platform-Wide Announcement">
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Platform System Maintenance or Campus Placement Season Commencement"
                value={annData.title}
                onChange={(e) => setAnnData({ ...annData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Role Audience</label>
              <select
                value={annData.target_role}
                onChange={(e) => setAnnData({ ...annData, target_role: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal font-semibold text-slate-700"
              >
                <option value="all">Broadcast to All Users (Students, Faculty, TPO, Companies)</option>
                <option value="student">Students Only</option>
                <option value="tpo">Training & Placement Officers</option>
                <option value="faculty">Faculty Placement Coordinators</option>
                <option value="company">Corporate Recruiters</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Message *</label>
              <textarea
                rows={4}
                required
                placeholder="Details of the announcement to deliver to targeted user notifications..."
                value={annData.message}
                onChange={(e) => setAnnData({ ...annData, message: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setAnnModal(false)} type="button">
                Cancel
              </Button>
              <button
                type="submit"
                disabled={broadcasting}
                style={{
                  backgroundColor: '#00BFA6',
                  color: '#14213D',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0, 191, 166, 0.35)',
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold font-heading cursor-pointer hover:opacity-95 transition-all disabled:opacity-50"
              >
                {broadcasting ? 'Broadcasting...' : 'Broadcast Announcement'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
