import { useState, useEffect } from 'react'
import {
  BookOpen, Plus, Users, Calendar, Award, CheckCircle2,
  Clock, ShieldCheck, Sparkles, Send
} from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import Modal from '../../components/common/Modal'

export default function TPOTrainings() {
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [selectedRoster, setSelectedRoster] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newProgram, setNewProgram] = useState({
    title: '',
    trainer_name: '',
    department: 'Computer Science & Engineering',
    skills_covered: 'Docker, CI/CD, TypeScript',
    description: '',
    start_date: '2026-11-20',
    end_date: '2026-12-15'
  })

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

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newProgram.title) return
    setCreating(true)
    try {
      const skillsArray = newProgram.skills_covered.split(',').map((s) => s.strip ? s.strip() : s.trim()).filter(Boolean)
      const res = await api.post('/tpo/trainings/', {
        ...newProgram,
        skills_covered: skillsArray
      })
      if (res.data?.success) {
        setTrainings([res.data.training, ...trainings])
        setModal(false)
        setNewProgram({
          title: '',
          trainer_name: '',
          department: 'Computer Science & Engineering',
          skills_covered: 'Docker, CI/CD, TypeScript',
          description: '',
          start_date: '2026-11-20',
          end_date: '2026-12-15'
        })
      }
    } catch (err) {
      alert('Failed to announce training program.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'TPO Portal', href: '/tpo' }, { label: 'Campus Upskilling & Training Programs' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
            Campus Training & Bootcamp Operations
          </h1>
          <p className="text-sage-dark text-sm mt-1">
            Design industry upskilling bootcamps based on identified recruiter skill gaps, assign trainers, and track cohort attendance.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setModal(true)}
          icon={Plus}
          className="bg-teal hover:bg-teal-dark text-midnight font-bold"
        >
          Announce Upskilling Bootcamp
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      ) : trainings.length === 0 ? (
        <Card className="text-center py-12 border-slate-200">
          <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
          <h4 className="font-heading font-bold text-sm text-slate-700">No training bootcamps announced yet</h4>
          <p className="text-xs text-slate-400 mt-1">Click "Announce Upskilling Bootcamp" above to schedule a new industry training track.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trainings.map((t) => (
            <Card key={t.id} hover className="flex flex-col justify-between border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal/15 text-teal border border-teal/30 uppercase">
                    {t.status || 'Active'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {t.department}
                  </span>
                </div>

                <h4 className="font-heading font-bold text-base text-slate-900 leading-snug">{t.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {t.skills_covered?.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Instructor / Trainer:</span>
                  <strong className="text-slate-800">{t.trainer_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Schedule Duration:</span>
                  <strong className="text-slate-800">{t.start_date} to {t.end_date}</strong>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <span className="text-slate-500 font-semibold">Enrolled Students:</span>
                  <button
                    onClick={() => setSelectedRoster(t)}
                    className="text-xs font-bold text-teal hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Users size={13} />
                    <span>{t.enrolled_students_count || (t.registered_students || []).length} Registered</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Program Modal */}
      {modal && (
        <Modal isOpen={modal} onClose={() => setModal(false)} title="Announce Industry Training Program">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bootcamp Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Full Stack Cloud & DevOps Accelerator"
                value={newProgram.title}
                onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trainer / Industry Expert</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Rao / AWS Solution Architect"
                  value={newProgram.trainer_name}
                  onChange={(e) => setNewProgram({ ...newProgram, trainer_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Department</label>
                <select
                  value={newProgram.department}
                  onChange={(e) => setNewProgram({ ...newProgram, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="All Departments">All Departments</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Skills Covered (comma separated)</label>
              <input
                type="text"
                value={newProgram.skills_covered}
                onChange={(e) => setNewProgram({ ...newProgram, skills_covered: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newProgram.start_date}
                  onChange={(e) => setNewProgram({ ...newProgram, start_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newProgram.end_date}
                  onChange={(e) => setNewProgram({ ...newProgram, end_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bootcamp Description & Deliverables</label>
              <textarea
                rows={3}
                placeholder="Hands-on training covering Docker containerization, CI/CD with GitHub Actions, and container deployment on cloud VMs..."
                value={newProgram.description}
                onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setModal(false)} type="button">
                Cancel
              </Button>
              <button
                type="submit"
                disabled={creating}
                style={{
                  backgroundColor: '#00BFA6',
                  color: '#14213D',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0, 191, 166, 0.35)',
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold font-heading cursor-pointer hover:opacity-95 transition-all disabled:opacity-50"
              >
                {creating ? 'Announcing...' : 'Announce Bootcamp'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Enrolled Students Roster Modal */}
      {selectedRoster && (
        <Modal
          isOpen={Boolean(selectedRoster)}
          onClose={() => setSelectedRoster(null)}
          title={`Enrolled Students: ${selectedRoster.title}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <strong className="text-slate-900">{selectedRoster.title}</strong>
                <p className="text-slate-500">Trainer: {selectedRoster.trainer_name} • {selectedRoster.department}</p>
              </div>
              <span className="font-extrabold text-teal bg-teal/10 px-2.5 py-1 rounded-full border border-teal/20">
                {(selectedRoster.registered_students || []).length} Enrolled
              </span>
            </div>

            {(!selectedRoster.registered_students || selectedRoster.registered_students.length === 0) ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No students have enrolled in this bootcamp yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedRoster.registered_students.map((st, idx) => (
                  <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-900">{st.student_name || 'Student Candidate'}</strong>
                      <p className="text-[11px] text-slate-500">{st.student_email || 'No email'} {st.phone ? `• ${st.phone}` : ''}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {st.registered_at ? new Date(st.registered_at).toLocaleDateString() : 'Enrolled'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedRoster(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
