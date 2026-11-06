import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Building2, Calendar, Clock, CheckCircle2,
  AlertCircle, ChevronRight, Briefcase, ExternalLink, Award, Check, X
} from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [respondingOffer, setRespondingOffer] = useState(false)

  const fetchApplications = () => {
    api.get('/applications/')
      .then((res) => setApplications(res.data.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleOfferResponse = async (app, action) => {
    setRespondingOffer(true)
    try {
      const offerId = app.offer_id || app.id
      await api.post(`/students/offers/${offerId}/respond/`, { action })
      alert(`Offer ${action === 'accept' ? 'accepted' : 'declined'} successfully!`)
      fetchApplications()
    } catch (err) {
      alert('Failed to respond to offer.')
    } finally {
      setRespondingOffer(false)
    }
  }

  const statusConfig = {
    applied: { label: 'Applied', color: 'default', step: 1 },
    under_review: { label: 'Under Review', color: 'info', step: 2 },
    shortlisted: { label: 'Shortlisted', color: 'warning', step: 3 },
    interview_scheduled: { label: 'Interview Scheduled', color: 'warning', step: 4 },
    selected: { label: 'Selected', color: 'success', step: 5 },
    offer_released: { label: 'Offer Released', color: 'success', step: 5 },
    offer_accepted: { label: 'Offer Accepted 🎉', color: 'success', step: 5 },
    offer_declined: { label: 'Offer Declined', color: 'danger', step: 5 },
    rejected: { label: 'Rejected', color: 'danger', step: 5 },
  }

  const steps = ['Applied', 'Review', 'Shortlist', 'Interview', 'Decision']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/student' }, { label: 'My Applications' }]} />

      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
          Application Tracking & Hiring Pipeline
        </h1>
        <p className="text-sage-dark text-sm mt-1">
          Monitor your recruitment journey, upcoming corporate interview rounds, and official placement offers.
        </p>
      </div>

      {applications.length === 0 ? (
        <Card className="text-center py-16 border-slate-200">
          <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-heading font-bold text-base text-slate-800">No active applications yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Explore verified corporate internships and on-campus placement drives announced by your TPO.
          </p>
          <div className="mt-5">
            <Link to="/student/opportunities">
              <Button size="sm" className="bg-teal hover:bg-teal-dark text-midnight font-bold">
                Browse Campus Opportunities
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const cfg = statusConfig[app.status] || statusConfig.applied
            return (
              <Card key={app.id} hover className="p-5 border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-bold text-lg text-charcoal">
                        {app.opportunity_title}
                      </h3>
                      <Badge color={cfg.color}>{cfg.label}</Badge>
                    </div>
                    <p className="text-xs font-semibold text-sage-dark flex items-center gap-1.5">
                      <Building2 size={13} /> {app.company_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-sage-dark">
                    {app.match_score && (
                      <span className="font-bold text-teal bg-teal/10 px-2.5 py-1 rounded-full border border-teal/20">
                        {app.match_score}% competency match
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar size={13} /> Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>

                {/* Status Note or Feedback */}
                {app.status_notes && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                    <strong className="text-slate-800 block text-[11px] mb-0.5">Recruiter Update:</strong>
                    {app.status_notes}
                  </div>
                )}

                {/* Interview Alert Box */}
                {app.status === 'interview_scheduled' && (
                  <div className="mb-4 p-3.5 bg-teal/10 border border-teal/30 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-teal-dark flex items-center gap-1.5">
                        <Clock size={14} className="text-teal" /> Interview Scheduled
                      </span>
                      <p className="text-xs text-slate-700 mt-0.5">
                        Date: <strong>{app.interview_date || 'Upcoming'}</strong>
                      </p>
                    </div>
                    {app.interview_link && (
                      <a
                        href={app.interview_link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-midnight text-teal font-bold text-xs hover:bg-midnight-light flex items-center gap-1"
                      >
                        Join Meeting <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}

                {/* Formal Offer Released Box */}
                {app.status === 'offer_released' && (
                  <div className="mb-4 p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                        <Award size={15} className="text-emerald-700" /> Formal Placement Offer Released!
                      </span>
                      <p className="text-xs text-slate-700 mt-1">
                        Package: <strong className="text-emerald-800 text-sm">₹{app.ctc_lpa || 12} LPA CTC</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        loading={respondingOffer}
                        onClick={() => handleOfferResponse(app, 'accept')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                      >
                        <Check size={14} /> Accept Offer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        loading={respondingOffer}
                        onClick={() => handleOfferResponse(app, 'decline')}
                        className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                )}

                {/* Progress Steps Indicator */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {steps.map((st, i) => {
                      const active = i + 1 <= cfg.step
                      const isCurrent = i + 1 === cfg.step
                      const isRejected = (app.status === 'rejected' || app.status === 'offer_declined') && i === 4
                      return (
                        <div key={i} className="flex flex-col items-center">
                          <div
                            className={`w-full h-1.5 rounded-full mb-1.5 transition-colors ${
                              isRejected
                                ? 'bg-red-500'
                                : active
                                ? 'bg-teal'
                                : 'bg-slate-200'
                            }`}
                          />
                          <span
                            className={`text-[10px] font-heading font-semibold ${
                              isCurrent
                                ? 'text-teal font-extrabold'
                                : active
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {st}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
