import { useState, useEffect } from 'react'
import {
  FileText, CheckCircle2, Clock, Calendar, Mail,
  ExternalLink, User, MessageSquare, ChevronRight, Star,
  Send, Sparkles, Filter, Search, Award
} from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import Modal from '../../components/common/Modal'

const PIPELINE_STAGES = [
  { id: 'applied', label: 'Applied', color: 'border-slate-300 bg-slate-50 text-slate-700' },
  { id: 'under_review', label: 'Under Review', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'border-amber-300 bg-amber-50 text-amber-700' },
  { id: 'assessment', label: 'Assessment', color: 'border-purple-300 bg-purple-50 text-purple-700' },
  { id: 'interview_scheduled', label: 'Interview', color: 'border-teal/40 bg-teal/10 text-teal-dark' },
  { id: 'selected', label: 'Selected', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  { id: 'offer_released', label: 'Offer Released', color: 'border-golden/40 bg-golden/10 text-golden-dark' },
  { id: 'offer_accepted', label: 'Offer Accepted 🎉', color: 'border-emerald-400 bg-emerald-100 text-emerald-900' },
]

export default function ApplicationsReview() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState(null)
  const [statusNote, setStatusNote] = useState('')
  const [targetStage, setTargetStage] = useState('')
  const [interviewDate, setInterviewDate] = useState('2026-11-18')
  const [ctcLpa, setCtcLpa] = useState(12.0)
  const [updating, setUpdating] = useState(false)
  const [search, setSearch] = useState('')

  const fetchApplications = () => {
    setLoading(true)
    api.get('/applications/')
      .then((res) => setApplications(res.data.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleStageMove = async (app, newStatus) => {
    setSelectedApp(app)
    setTargetStage(newStatus)
    setStatusNote(app.status_notes || '')
    if (app.ctc_lpa) setCtcLpa(app.ctc_lpa)
  }

  const confirmStageUpdate = async () => {
    if (!selectedApp || !targetStage) return
    setUpdating(true)
    try {
      await api.put(`/applications/${selectedApp.id}/status/`, {
        status: targetStage,
        status_notes: statusNote,
        interview_date: targetStage === 'interview_scheduled' ? interviewDate : undefined,
        ctc_lpa: targetStage === 'offer_released' ? ctcLpa : undefined,
      })

      // If moving to offer_released, trigger offer creation
      if (targetStage === 'offer_released') {
        await api.post('/companies/offers/issue/', {
          candidate_id: selectedApp.student_id,
          candidate_name: selectedApp.student_name,
          role_title: selectedApp.opportunity_title,
          company_name: selectedApp.company_name,
          ctc_lpa: ctcLpa
        }).catch(() => {})
      }

      setApplications((prev) =>
        prev.map((a) =>
          a.id === selectedApp.id
            ? { ...a, status: targetStage, status_notes: statusNote, ctc_lpa: ctcLpa }
            : a
        )
      )
      setSelectedApp(null)
    } catch (err) {
      alert('Failed to update stage.')
    } finally {
      setUpdating(false)
    }
  }

  const filteredApps = applications.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.student_name?.toLowerCase().includes(q) ||
      a.opportunity_title?.toLowerCase().includes(q) ||
      a.company_name?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Recruiter Dashboard', href: '/company' }, { label: 'Recruitment Pipeline' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
            Recruitment Kanban Pipeline
          </h1>
          <p className="text-sage-dark text-sm mt-1">
            Move candidates across the 8-stage hiring pipeline, review match scores, schedule interviews, and issue official job offers.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : applications.length === 0 ? (
        <Card className="text-center py-16 border-slate-200">
          <FileText size={36} className="mx-auto text-slate-300 mb-2" />
          <h4 className="font-heading font-bold text-sm text-slate-700">No applications in pipeline</h4>
          <p className="text-xs text-slate-400 mt-1">Candidates who apply for your job postings will appear across these stages.</p>
        </Card>
      ) : (
        /* Horizontal Kanban Columns */
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
          {PIPELINE_STAGES.map((stage) => {
            const stageApps = filteredApps.filter((a) => a.status === stage.id)

            return (
              <div
                key={stage.id}
                className="w-72 flex-shrink-0 bg-slate-100/70 rounded-2xl p-3 border border-slate-200 flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/80 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal" />
                    <h4 className="font-heading font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                      {stage.label}
                    </h4>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-xs">
                    {stageApps.length}
                  </span>
                </div>

                {/* Candidate Cards in this Stage */}
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {stageApps.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                      Empty stage
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-midnight text-teal font-heading font-black text-xs flex items-center justify-center">
                              {app.student_name ? app.student_name[0] : 'C'}
                            </div>
                            <div>
                              <h5 className="font-heading font-bold text-xs text-slate-900 line-clamp-1">
                                {app.student_name}
                              </h5>
                              <p className="text-[10px] text-slate-400 line-clamp-1">{app.student_email}</p>
                            </div>
                          </div>
                          {app.match_score && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {app.match_score}%
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-semibold text-slate-700 mb-2 line-clamp-1">
                          {app.opportunity_title}
                        </div>

                        {app.status_notes && (
                          <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg mb-2 italic line-clamp-2">
                            "{app.status_notes}"
                          </p>
                        )}

                        {app.ctc_lpa && (
                          <div className="mb-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 p-1.5 rounded">
                            Offered: ₹{app.ctc_lpa} LPA
                          </div>
                        )}

                        {/* Move Stage Selector */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Advance:</span>
                          <select
                            value={app.status}
                            onChange={(e) => handleStageMove(app, e.target.value)}
                            className="text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-teal cursor-pointer"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Advance Stage Modal */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={`Move ${selectedApp.student_name} to "${targetStage.replace('_', ' ').toUpperCase()}"`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-900">{selectedApp.student_name}</strong>
                <p className="text-slate-500">{selectedApp.opportunity_title} • {selectedApp.student_email}</p>
              </div>
              <span className="px-2 py-0.5 rounded font-black text-xs bg-teal/15 text-teal-dark">
                Match: {selectedApp.match_score || 85}%
              </span>
            </div>

            {targetStage === 'interview_scheduled' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Interview Date *
                </label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>
            )}

            {targetStage === 'offer_released' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Offered Package (CTC in LPA) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="3"
                  value={ctcLpa}
                  onChange={(e) => setCtcLpa(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal font-extrabold text-emerald-700"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Recruiter Evaluation Note (Visible in Audit & Notification)
              </label>
              <textarea
                rows={3}
                placeholder="Candidate cleared technical screening with high marks in system design and React state performance..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)} type="button">
                Cancel
              </Button>
              <button
                type="button"
                disabled={updating}
                onClick={confirmStageUpdate}
                style={{
                  backgroundColor: '#00BFA6',
                  color: '#14213D',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0, 191, 166, 0.35)',
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold font-heading cursor-pointer hover:opacity-95 transition-all disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Confirm Stage Transition'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
