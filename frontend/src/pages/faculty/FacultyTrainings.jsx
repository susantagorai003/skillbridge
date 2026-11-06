import { useState, useEffect } from 'react'
import { BookOpen, Plus, Sparkles, Calendar, CheckCircle2, Award } from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import Modal from '../../components/common/Modal'

export default function FacultyTrainings() {
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [recData, setRecData] = useState({
    topic: '',
    skills: 'Docker, Kubernetes, Cloud Architecture',
    department: 'Computer Science & Engineering',
    justification: 'Observed gaps in deployment workflows during semester project reviews.'
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchTrainings = () => {
    setLoading(true)
    api.get('/tpo/trainings/')
      .then((res) => {
        if (res.data?.success) setTrainings(res.data.trainings || [])
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTrainings()
  }, [])

  const handleRecommend = async (e) => {
    e.preventDefault()
    if (!recData.topic) return
    setSubmitting(true)
    try {
      const res = await api.post('/faculty/recommend-training/', recData)
      if (res.data?.success) {
        alert('Training recommendation submitted to TPO!')
        setModal(false)
        setRecData({
          topic: '',
          skills: 'Docker, Kubernetes, Cloud Architecture',
          department: 'Computer Science & Engineering',
          justification: ''
        })
      }
    } catch (err) {
      alert('Failed to submit recommendation.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Faculty Portal', href: '/faculty' }, { label: 'Department Mentoring & Trainings' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
            Department Training Programs & Mentorship Tracks
          </h1>
          <p className="text-sage-dark text-sm mt-1">
            Review active industry training bootcamps and propose remedial skill tracks to the Training & Placement Office.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setModal(true)}
          icon={Plus}
          className="bg-teal hover:bg-teal-dark text-midnight font-bold"
        >
          Propose Remedial Training to TPO
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : trainings.length === 0 ? (
        <Card className="text-center py-12 border-slate-200">
          <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
          <h4 className="font-heading font-bold text-sm text-slate-700">No training bootcamps active</h4>
          <p className="text-xs text-slate-400 mt-1">Click "Propose Remedial Training to TPO" above to request a new curriculum bootcamp.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trainings.map((t) => (
            <Card key={t.id} hover className="flex flex-col justify-between border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal/15 text-teal border border-teal/30 uppercase">
                    {t.status || 'Active'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{t.department}</span>
                </div>

                <h4 className="font-heading font-bold text-sm text-slate-900 leading-snug">{t.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {t.skills_covered?.map((s) => (
                    <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>Trainer: <strong className="text-slate-800">{t.trainer_name}</strong></span>
                <span>{t.start_date}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Propose Modal */}
      {modal && (
        <Modal isOpen={modal} onClose={() => setModal(false)} title="Propose Remedial Training to TPO">
          <form onSubmit={handleRecommend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bootcamp Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Databases & Microservice Architectures"
                value={recData.topic}
                onChange={(e) => setRecData({ ...recData, topic: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Skills (comma separated)</label>
              <input
                type="text"
                value={recData.skills}
                onChange={(e) => setRecData({ ...recData, skills: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={recData.department}
                onChange={(e) => setRecData({ ...recData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Justification based on Student Gaps *</label>
              <textarea
                rows={3}
                required
                placeholder="Observed during semester lab evaluations that students lack experience in cloud container orchestration..."
                value={recData.justification}
                onChange={(e) => setRecData({ ...recData, justification: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setModal(false)} type="button">
                Cancel
              </Button>
              <Button size="sm" type="submit" loading={submitting} className="bg-teal hover:bg-teal-dark text-midnight font-bold">
                Submit Recommendation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
