import { useState, useEffect } from 'react'
import {
  Users, GraduationCap, Award, Search, Download, ExternalLink,
  MessageSquare, CheckCircle2, Check
} from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Spinner from '../../components/common/Spinner'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'

export default function StudentsOverview() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [mentorModal, setMentorModal] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [mockScore, setMockScore] = useState(8.5)
  const [savingFeedback, setSavingFeedback] = useState(false)

  const fetchStudents = () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search

    api.get('/faculty/students/', { params })
      .then((res) => setStudents(res.data.students || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleOpenMentor = (st) => {
    setSelectedStudent(st)
    setFeedback('')
    setMockScore(8.5)
    setMentorModal(true)
  }

  const handleSaveMentoring = async (e) => {
    e.preventDefault()
    if (!feedback || !selectedStudent) return
    setSavingFeedback(true)
    try {
      await api.post('/faculty/mentoring/', {
        student_id: selectedStudent.id,
        student_name: selectedStudent.full_name,
        session_topic: 'Department Mock Technical Evaluation',
        mock_score: mockScore,
        feedback: feedback
      })
      alert(`Mentoring evaluation logged and sent to ${selectedStudent.full_name}!`)
      setMentorModal(false)
      setSelectedStudent(null)
    } catch (err) {
      alert('Failed to log session.')
    } finally {
      setSavingFeedback(false)
    }
  }

  const handleExportCSV = () => {
    window.open('http://localhost:8000/api/v1/faculty/export-report/?format=csv', '_blank')
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Faculty Portal', href: '/faculty' }, { label: 'Assigned Department Students' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
            Department Student Cohort
          </h1>
          <p className="text-sage-dark text-sm mt-1">
            Detailed academic histories, verified competencies, and faculty mentoring intervention records.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleExportCSV}
          icon={Download}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
        >
          Export Cohort Report (CSV)
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border-slate-200">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by name, email, or skill (e.g. Python, React)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
          />
        </div>
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : students.length === 0 ? (
        <Card className="text-center py-12 border-slate-200">
          <Users size={32} className="mx-auto text-slate-300 mb-2" />
          <h4 className="font-heading font-bold text-sm text-slate-700">No students found</h4>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Student Candidate</th>
                <th className="p-4">Degree & Semester</th>
                <th className="p-4">CGPA</th>
                <th className="p-4">Verified Skills</th>
                <th className="p-4">Readiness</th>
                <th className="p-4 text-right">Faculty Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-midnight text-teal font-heading font-black text-xs flex items-center justify-center">
                        {st.full_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{st.full_name}</div>
                        <div className="text-[11px] text-slate-400">{st.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{st.degree}</div>
                    <div className="text-[11px] text-slate-500">Semester {st.semester}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded font-extrabold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {st.cgpa} CGPA
                    </span>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {st.skills?.slice(0, 3).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                          {s}
                        </span>
                      ))}
                      {st.skills?.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-semibold self-center">
                          +{st.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-extrabold text-teal">
                      {st.readiness_score || 80}%
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenMentor(st)}
                      className="px-3 py-1.5 rounded-lg bg-midnight text-teal hover:bg-midnight-light font-bold text-xs transition-colors cursor-pointer"
                    >
                      Log Mentoring
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mentoring Modal */}
      {mentorModal && selectedStudent && (
        <Modal
          isOpen={mentorModal}
          onClose={() => setMentorModal(false)}
          title={`Log Mentoring Intervention: ${selectedStudent.full_name}`}
        >
          <form onSubmit={handleSaveMentoring} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-900">{selectedStudent.full_name}</strong>
                <p className="text-slate-500">{selectedStudent.degree} • {selectedStudent.email}</p>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                {selectedStudent.cgpa} CGPA
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mock Interview Performance Score (/10)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={mockScore}
                onChange={(e) => setMockScore(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mentor Feedback & Academic Guidance *</label>
              <textarea
                rows={4}
                required
                placeholder="Review student's coding assessment performance, suggest project improvements, or advise on missing competencies..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setMentorModal(false)} type="button">
                Cancel
              </Button>
              <Button size="sm" type="submit" loading={savingFeedback} className="bg-teal hover:bg-teal-dark text-midnight font-bold">
                Save & Notify Student
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
