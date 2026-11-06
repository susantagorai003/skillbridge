import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, BookOpen, Award, TrendingUp, CheckCircle, BarChart2,
  AlertTriangle, Plus, Target, Sparkles, Filter, ChevronRight, Check, Zap, MessageSquare, Download
} from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Spinner from '../../components/common/Spinner'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'

export default function FacultyDashboard() {
  const [overview, setOverview] = useState(null)
  const [courses, setCourses] = useState([])
  const [deptAlignment, setDeptAlignment] = useState(78.5)
  const [loading, setLoading] = useState(true)
  const [actionNotice, setActionNotice] = useState('')

  // Mentoring modal
  const [mentorModal, setMentorModal] = useState(false)
  const [mentorData, setMentorData] = useState({
    student_id: '',
    student_name: '',
    session_topic: 'Technical DSA & System Design Review',
    mock_score: 8.5,
    feedback: ''
  })
  const [savingMentor, setSavingMentor] = useState(false)

  // Recommend Training modal
  const [trainingModal, setTrainingModal] = useState(false)
  const [recData, setRecData] = useState({
    topic: '',
    skills: 'Docker, CI/CD, TypeScript',
    justification: 'Observed gaps during recent technical screening.'
  })
  const [submittingRec, setSubmittingRec] = useState(false)

  const fetchFacultyData = async () => {
    try {
      const [facRes, curRes] = await Promise.all([
        api.get('/faculty/overview/').catch(() => ({ data: { stats: null } })),
        api.get('/faculty/curriculum/').catch(() => ({ data: { courses: [], department_alignment_score: 78.5 } })),
      ])

      if (facRes.data?.success) setOverview(facRes.data.stats)
      if (curRes.data?.success) {
        setCourses(curRes.data.courses || [])
        setDeptAlignment(curRes.data.department_alignment_score || 78.5)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacultyData()
  }, [])

  const handleAddSkillToCourse = async (courseCode, skillName) => {
    try {
      const res = await api.post('/faculty/curriculum/add-skill/', {
        course_code: courseCode,
        skill_name: skillName,
      })

      if (res.data?.success) {
        setActionNotice(res.data.message)
        setDeptAlignment(res.data.new_department_alignment)
        setCourses((prev) =>
          prev.map((c) => {
            if (c.course_code === courseCode) {
              return {
                ...c,
                alignment_score: res.data.new_alignment_score,
                syllabus_topics: [...c.syllabus_topics, skillName],
                missing_industry_skills: (c.missing_industry_skills || []).filter((s) => s !== skillName),
              }
            }
            return c
          })
        )
        setTimeout(() => setActionNotice(''), 5000)
      }
    } catch (err) {
      alert('Failed to update course syllabus.')
    }
  }

  const handleSaveMentoring = async (e) => {
    e.preventDefault()
    if (!mentorData.feedback) return
    setSavingMentor(true)
    try {
      const res = await api.post('/faculty/mentoring/', mentorData)
      if (res.data?.success) {
        setActionNotice('Mentoring session logged and student notified successfully!')
        setMentorModal(false)
        setMentorData({
          student_id: '',
          student_name: '',
          session_topic: 'Technical DSA & System Design Review',
          mock_score: 8.5,
          feedback: ''
        })
        setTimeout(() => setActionNotice(''), 5000)
      }
    } catch (err) {
      alert('Failed to log mentoring session.')
    } finally {
      setSavingMentor(false)
    }
  }

  const handleRecommendTraining = async (e) => {
    e.preventDefault()
    if (!recData.topic) return
    setSubmittingRec(true)
    try {
      const res = await api.post('/faculty/recommend-training/', recData)
      if (res.data?.success) {
        setActionNotice('Training program recommendation submitted to TPO!')
        setTrainingModal(false)
        setRecData({ topic: '', skills: 'Docker, CI/CD, TypeScript', justification: '' })
        setTimeout(() => setActionNotice(''), 5000)
      }
    } catch (err) {
      alert('Failed to submit recommendation.')
    } finally {
      setSubmittingRec(false)
    }
  }

  const handleExportCSV = () => {
    window.open('http://localhost:8000/api/v1/faculty/export-report/?format=csv', '_blank')
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
      <Breadcrumbs items={[{ label: 'Faculty Portal' }, { label: 'Department Overview & Curriculum Alignment' }]} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-midnight via-midnight/95 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/20 text-teal text-xs font-bold mb-3 border border-teal/40">
              <Sparkles size={13} className="text-teal" /> Department Placement Coordinator
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Curriculum Competency & Student Monitoring
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Inspect course syllabus alignment with live corporate recruiter requirements, bridge technical competencies, and conduct student mock mentoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setMentorModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal text-midnight font-heading font-bold text-xs hover:bg-teal-light shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare size={16} /> Log Mentoring Session
            </button>
            <button
              onClick={() => setTrainingModal(true)}
              className="px-4 py-2.5 rounded-xl bg-midnight-light border border-slate-700 text-white font-heading font-semibold text-xs hover:border-teal transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} /> Recommend Training
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-heading font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={15} /> Export Department Report
            </button>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-teal/10 border border-teal/40 rounded-xl text-teal-dark font-bold text-xs sm:text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle size={18} className="text-teal flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Dynamic Statistics Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dept Students</p>
            <h3 className="font-heading font-black text-2xl text-slate-900 mt-1">{overview.total_students}</h3>
            <div className="mt-2 text-[11px] text-slate-500">
              Placed: <strong className="text-emerald-700">{overview.total_placed}</strong> • Unplaced: <strong className="text-slate-700">{overview.total_unplaced}</strong>
            </div>
          </Card>

          <Card className="border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Rate</p>
            <h3 className="font-heading font-black text-2xl text-emerald-700 mt-1">{overview.placement_percentage}%</h3>
            <div className="mt-2 text-[11px] text-slate-500">
              Upcoming Drives: <strong className="text-teal font-extrabold">{overview.upcoming_placement_drives}</strong>
            </div>
          </Card>

          <Card className="border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cohort Readiness</p>
            <h3 className="font-heading font-black text-2xl text-teal mt-1">{overview.average_readiness_score}%</h3>
            <div className="mt-2 text-[11px] text-slate-500">
              Requiring Training: <strong className="text-coral font-extrabold">{overview.students_requiring_training}</strong>
            </div>
          </Card>

          <Card className="border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syllabus Alignment</p>
            <h3 className="font-heading font-black text-2xl text-golden-dark mt-1">{deptAlignment}%</h3>
            <div className="mt-2 text-[11px] text-slate-500">
              Industry Demanded Skills
            </div>
          </Card>
        </div>
      )}

      {/* Course Competency Alignment & Syllabus Editor */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-charcoal">
              Department Curriculum Competency Mapping
            </h3>
            <p className="text-xs text-sage-dark">
              Inspect course syllabi, compare against visiting corporate job descriptions, and add modern competencies.
            </p>
          </div>
          <span className="text-xs font-bold text-teal bg-teal/10 px-3 py-1 rounded-full border border-teal/20">
            Dept Alignment: {deptAlignment}%
          </span>
        </div>

        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.course_code} className="border-slate-200">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-black bg-midnight text-teal">
                      {course.course_code}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Semester {course.semester}</span>
                    <span className="text-xs text-slate-500 font-semibold">• {course.instructor}</span>
                  </div>

                  <h4 className="font-heading font-bold text-base text-slate-900">{course.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 italic">{course.recommendation}</p>

                  {/* Existing Syllabus Topics */}
                  <div className="mt-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Current Syllabus Topics:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {course.syllabus_topics?.map((topic) => (
                        <span key={topic} className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-700 font-medium">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Industry Demanded Skills */}
                  {course.missing_industry_skills?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-coral uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <AlertTriangle size={12} /> Missing Industry Competencies (Click to Integrate):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {course.missing_industry_skills.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => handleAddSkillToCourse(course.course_code, skill)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-coral/10 hover:bg-teal hover:text-midnight text-coral-dark border border-coral/30 hover:border-teal transition-all cursor-pointer"
                          >
                            <Plus size={12} /> Add "{skill}" to Syllabus
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right min-w-[120px]">
                  <div className="text-2xl font-black font-heading text-slate-900">
                    {course.alignment_score}%
                  </div>
                  <span className="text-[11px] font-bold text-teal">Industry Alignment</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Log Mentoring Modal */}
      {mentorModal && (
        <Modal isOpen={mentorModal} onClose={() => setMentorModal(false)} title="Log Student Mock Mentoring Session">
          <form onSubmit={handleSaveMentoring} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Candidate ID or Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Susanta Gorai or Rahul Sharma"
                value={mentorData.student_name}
                onChange={(e) => setMentorData({ ...mentorData, student_name: e.target.value, student_id: e.target.value.toLowerCase().replace(' ', '-') })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Topic</label>
                <input
                  type="text"
                  value={mentorData.session_topic}
                  onChange={(e) => setMentorData({ ...mentorData, session_topic: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mock Interview Score (/10)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={mentorData.mock_score}
                  onChange={(e) => setMentorData({ ...mentorData, mock_score: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mentor Feedback & Recommendations *</label>
              <textarea
                rows={4}
                required
                placeholder="Observed strong conceptual foundations in database querying; advised practicing recursive tree traversals and Docker deployment before recruiter rounds..."
                value={mentorData.feedback}
                onChange={(e) => setMentorData({ ...mentorData, feedback: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setMentorModal(false)} type="button">
                Cancel
              </Button>
              <button
                type="submit"
                disabled={savingMentor}
                style={{
                  backgroundColor: '#00BFA6',
                  color: '#14213D',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0, 191, 166, 0.35)',
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold font-heading cursor-pointer hover:opacity-95 transition-all disabled:opacity-50"
              >
                {savingMentor ? 'Saving...' : 'Log Session & Notify Student'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Recommend Training Modal */}
      {trainingModal && (
        <Modal isOpen={trainingModal} onClose={() => setTrainingModal(false)} title="Recommend Remedial Training to TPO">
          <form onSubmit={handleRecommendTraining} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Training Program Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Microservices & Distributed System Design Bootcamp"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Justification *</label>
              <textarea
                rows={3}
                required
                placeholder="Over 60% of graduating candidates struggled with containerized deployment during mock assessments..."
                value={recData.justification}
                onChange={(e) => setRecData({ ...recData, justification: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setTrainingModal(false)} type="button">
                Cancel
              </Button>
              <button
                type="submit"
                disabled={submittingRec}
                style={{
                  backgroundColor: '#00BFA6',
                  color: '#14213D',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0, 191, 166, 0.35)',
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold font-heading cursor-pointer hover:opacity-95 transition-all disabled:opacity-50"
              >
                {submittingRec ? 'Submitting...' : 'Submit Recommendation'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
