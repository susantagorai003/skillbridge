import { useState, useEffect } from 'react'
import {
  ShieldCheck, Search, Filter, Clock, Activity, AlertCircle, CheckCircle2
} from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Spinner from '../../components/common/Spinner'

export default function SystemAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')

  const fetchLogs = () => {
    setLoading(true)
    const params = {}
    if (roleFilter) params.role = roleFilter

    api.get('/admin/logs/', { params })
      .then((res) => {
        if (res.data?.success) setLogs(res.data.logs || [])
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLogs()
  }, [roleFilter])

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Admin Portal', href: '/admin' }, { label: 'System Audit Logs' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-midnight tracking-tight">
            Platform System Audit Logs
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Immutable, real-time audit trail of role actions, drive announcements, stage transitions, and account status modifications.
          </p>
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal font-semibold text-slate-700 shadow-sm"
          >
            <option value="">All Actor Roles</option>
            <option value="student">Student Events</option>
            <option value="tpo">TPO Operations</option>
            <option value="company">Corporate Recruiter</option>
            <option value="faculty">Faculty Interventions</option>
            <option value="admin">SuperAdmin Events</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : logs.length === 0 ? (
        <Card className="text-center py-12 border-slate-200">
          <Activity size={32} className="mx-auto text-slate-300 mb-2" />
          <h4 className="font-heading font-bold text-sm text-slate-700">No audit logs recorded yet</h4>
          <p className="text-xs text-slate-400 mt-1">Actions performed by recruiters, TPO, faculty, and students will log here.</p>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-4">Action Event</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Role</th>
                <th className="p-4">Resource Target</th>
                <th className="p-4">Details</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-bold text-slate-900">
                    {log.action}
                  </td>
                  <td className="p-4">
                    {log.actor_name || 'System'}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-800">
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-500">
                    {log.resource_type} • {log.resource_id ? log.resource_id.slice(0, 14) : 'global'}
                  </td>
                  <td className="p-4 max-w-xs truncate text-slate-600">
                    {log.details || '—'}
                  </td>
                  <td className="p-4 text-right text-[11px] text-slate-400 whitespace-nowrap">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
