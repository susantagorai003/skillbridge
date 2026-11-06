import { useState, useEffect } from 'react'
import {
  Search, Filter, GraduationCap, Award, CheckCircle, Mail, ExternalLink,
  Zap, Calendar, Check, Send, Building2
} from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import Modal from '../../components/common/Modal'

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [minCgpa, setMinCgpa] = useState(0)
  const [skillSearch, setSkillSearch] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [inviteModal, setInviteModal] = useState(false)
  const [interviewRole, setInterviewRole] = useState('Full Stack Developer Intern')
  const [interviewDate, setInterviewDate] = useState('2026-11-12')
  const [interviewTime, setInterviewTime] = useState('10:00 AM IST')
  const [roundName, setRoundName] = useState('Technical Screening & Competency Assessment')
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/skb-tech-intv')
  const [invitedSet, setInvitedSet] = useState(new Set())

  const fetchCandidates = () => {
    setLoading(true)
    const params = {}
    if (minCgpa > 0) params.min_cgpa = minCgpa
    if (skillSearch) params.skills = skillSearch

    api.get('/companies/candidates/', { params })
      .then((res) => setCandidates(res.data.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCandidates()
  }, [minCgpa])

  const handleSendInvite = async () => {
    if (!selectedCandidate) return
    try {
      const generatedLink = meetingLink || `https://meet.google.com/skb-${Math.random().toString(36).slice(-3)}-${Math.random().toString(36).slice(-4)}`
      await api.post('/companies/interviews/schedule/', {
        candidate_id: selectedCandidate.id,
        candidate_name: selectedCandidate.full_name,
        role_title: interviewRole,
        interview_date: interviewDate,
        interview_time: interviewTime,
        round_name: roundName,
        meeting_link: generatedLink
      })
      setInvitedSet(new Set([...invitedSet, selectedCandidate.id]))
      alert(`Interview invitation for "${interviewRole}" on ${interviewDate} at ${interviewTime} scheduled! Google Meet link has been delivered to ${selectedCandidate.full_name || 'Candidate'}.`)
      setInviteModal(false)
    } catch (err) {
      alert('Failed to schedule interview invitation.')
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Recruiter Dashboard', href: '/company' }, { label: 'Candidate Discovery' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
            Verified Talent Discovery
          </h1>
          <p className="text-sage-dark text-sm mt-1">
            Search, filter, and recruit engineering students with verified resume competencies and PyMuPDF-certified skills.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-warm-border flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by technical skill (e.g. React, Python, Docker, Node.js)..."
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCandidates()}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <label className="text-xs font-bold text-charcoal whitespace-nowrap">
            Min CGPA: <strong className="text-teal font-extrabold">{minCgpa.toFixed(1)}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={minCgpa}
            onChange={(e) => setMinCgpa(Number(e.target.value))}
            className="w-28 accent-teal"
          />
          <Button size="sm" onClick={fetchCandidates}>Search</Button>
        </div>
      </div>

      {/* Candidates List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((cand) => {
            const hasInvited = invitedSet.has(cand.id)
            const initials = cand.full_name ? cand.full_name.split(' ').map((n) => n[0]).join('') : 'ST'
            return (
              <Card key={cand.id} hover className="flex flex-col justify-between border-slate-200/90 hover:border-teal/50 transition-all">
                <div>
                  {/* Top Candidate Bar */}
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal to-teal-dark text-midnight font-heading font-black text-sm flex items-center justify-center shadow-sm">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-sm text-slate-900">
                          {cand.full_name || 'Engineering Student'}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {cand.institution || 'University'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-teal/15 text-teal border border-teal/30">
                        CGPA {cand.cgpa ? cand.cgpa.toFixed(2) : '8.50'}
                      </span>
                      {cand.readiness_score && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                          {cand.readiness_score}% Readiness
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 mb-2.5">
                    {cand.degree || 'B.Tech - Computer Science'} • Sem {cand.semester || 7}
                  </p>

                  {/* Verified Badges */}
                  {cand.verified_badges?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {cand.verified_badges.map((b, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 flex items-center gap-1">
                          <Check size={10} className="text-emerald-600" /> {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Skills Pills */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Verified Competencies ({cand.skills?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(cand.skills || ['JavaScript', 'React', 'Python', 'SQL']).slice(0, 6).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-medium rounded border border-emerald-200/80">
                          {s}
                        </span>
                      ))}
                      {(cand.skills?.length || 0) > 6 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                          +{cand.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {cand.github_url && (
                    <a
                      href={cand.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-600 hover:text-teal flex items-center gap-1"
                    >
                      <span>GitHub</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    {hasInvited ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg flex items-center gap-1">
                        <Check size={13} /> Invited
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => { setSelectedCandidate(cand); setInviteModal(true); }}
                      >
                        Invite to Interview
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}

          {candidates.length === 0 && (
            <Card className="col-span-3 text-center py-12">
              <p className="text-sm text-sage-dark">No candidates found matching the criteria. Try adjusting the search or CGPA filter.</p>
            </Card>
          )}
        </div>
      )}

      {/* Interview Scheduling Modal */}
      <Modal
        isOpen={inviteModal}
        onClose={() => setInviteModal(false)}
        title={selectedCandidate ? `Schedule Interview: ${selectedCandidate.full_name}` : 'Schedule Interview'}
      >
        {selectedCandidate && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800">{selectedCandidate.full_name}</p>
              <p className="text-xs text-slate-500">{selectedCandidate.institution} • CGPA {selectedCandidate.cgpa}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Job Role</label>
              <input
                type="text"
                value={interviewRole}
                onChange={(e) => setInterviewRole(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Interview Round</label>
              <input
                type="text"
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                placeholder="e.g. Technical Screening & Competency Assessment"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Interview Date</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Interview Time</label>
                <input
                  type="text"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  placeholder="e.g. 10:00 AM IST"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Google Meet / Video Interview Link</label>
                <button
                  type="button"
                  onClick={() => window.open('https://meet.google.com/new', '_blank')}
                  className="text-[11px] font-bold text-teal hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink size={11} /> Open Google Meet
                </button>
              </div>
              <input
                type="text"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/xxx-yyyy-zzz"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal font-mono text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Candidate will receive this Google Meet link in their bell notifications, applications dashboard, and WhatsApp alert.
              </p>
            </div>

            <div className="pt-2 flex justify-end items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setInviteModal(false)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleSendInvite}
                style={{
                  backgroundColor: '#00BFA6',
                  color: '#14213D',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0, 191, 166, 0.35)',
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-heading cursor-pointer hover:opacity-95 transition-all"
              >
                <Send size={14} />
                <span>Send Interview Invitation</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
