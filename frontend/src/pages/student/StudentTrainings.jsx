import { useState, useEffect } from 'react'
import {
  BookOpen, CheckCircle, Clock, Calendar, Users, Award, Search,
  Sparkles, Filter, ChevronRight, UserCheck, ShieldCheck, ArrowRight
} from 'lucide-react'
import api from '../../services/api'
import useAuth from '../../hooks/useAuth'
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Spinner from '../../components/common/Spinner'
import Button from '../../components/common/Button'

export default function StudentTrainings() {
  const { user } = useAuth()
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [registeringId, setRegisteringId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState('all') // 'all' | 'enrolled' | 'recommended'
  const [stats, setStats] = useState({ total: 0, enrolled_count: 0, department: '' })

  const fetchTrainings = async () => {
    try {
      const res = await api.get('/students/trainings/')
      if (res.data?.success) {
        setTrainings(res.data.trainings || [])
        setStats({
          total: res.data.total || 0,
          enrolled_count: res.data.enrolled_count || 0,
          department: res.data.student_department || 'Computer Science & Engineering',
        })
      }
    } catch (err) {
      console.error('Failed to fetch training bootcamps:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrainings()
  }, [])

  const handleRegister = async (trainingId) => {
    setRegisteringId(trainingId)
    try {
      const res = await api.post('/students/trainings/', {
        training_id: trainingId,
        student_id: user?.id,
        student_name: user?.name,
        student_email: user?.email,
      })

      if (res.data?.success) {
        alert(res.data.message || 'Successfully registered for this bootcamp!')
        // Optimistically update local list
        setTrainings((prev) =>
          prev.map((t) =>
            t.id === trainingId
              ? {
                  ...t,
                  is_enrolled: true,
                  enrolled_students_count: (t.enrolled_students_count || 0) + 1,
                }
              : t
          )
        )
        setStats((prev) => ({ ...prev, enrolled_count: prev.enrolled_count + 1 }))
      } else {
        alert(res.data?.message || 'Failed to register.')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll in training program.')
    } finally {
      setRegisteringId(null)
    }
  }

  // Filtering
  const filteredTrainings = trainings.filter((t) => {
    const matchesSearch =
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.trainer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.skills_covered || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (filterTab === 'enrolled') {
      return Boolean(t.is_enrolled)
    }
    if (filterTab === 'recommended') {
      return Boolean(t.is_recommended)
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/student' }, { label: 'TPO Training Bootcamps' }]} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-midnight via-midnight-light to-midnight p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/20 text-teal-light text-xs font-bold mb-3 border border-teal/30">
            <Sparkles size={13} />
            Institutional Industry Readiness Tracks
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
            TPO Upskilling & Certification Bootcamps
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Hands-on technical workshops and certification programs announced by your Training & Placement Officer (TPO) to bridge industry skill gaps before recruiter hiring rounds.
          </p>

          <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold">
            <div className="bg-white/10 backdrop-blur px-3.5 py-2 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px]">Total Bootcamps</span>
              <strong className="text-white text-base font-black">{stats.total}</strong>
            </div>
            <div className="bg-white/10 backdrop-blur px-3.5 py-2 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px]">My Enrolled Tracks</span>
              <strong className="text-teal text-base font-black">{stats.enrolled_count}</strong>
            </div>
            <div className="bg-white/10 backdrop-blur px-3.5 py-2 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px]">My Department</span>
              <strong className="text-slate-200 text-xs font-bold truncate max-w-[200px]">{stats.department}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Tabs Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all' ? 'bg-white text-midnight shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tracks ({trainings.length})
          </button>
          <button
            onClick={() => setFilterTab('enrolled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'enrolled' ? 'bg-white text-midnight shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Enrolled ({stats.enrolled_count})
          </button>
          <button
            onClick={() => setFilterTab('recommended')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'recommended' ? 'bg-white text-midnight shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recommended for My Dept
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search bootcamps or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal"
          />
        </div>
      </div>

      {/* Bootcamps Grid */}
      {filteredTrainings.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal/10 flex items-center justify-center text-teal mb-3">
            <BookOpen size={26} />
          </div>
          <h4 className="font-heading font-bold text-sm text-slate-800">No training bootcamps found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {filterTab === 'enrolled'
              ? 'You have not registered for any training bootcamps yet. Explore available programs under "All Tracks" to enroll.'
              : 'The TPO has not announced any programs matching this filter yet. Check back soon for scheduled skill sessions.'}
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredTrainings.map((t) => {
            const isEnrolled = Boolean(t.is_enrolled)
            const isRegistering = registeringId === t.id

            return (
              <Card
                key={t.id}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${
                  isEnrolled ? 'border-teal/50 bg-teal/5 ring-1 ring-teal/20' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {t.department || 'All Departments'}
                        </span>
                        {t.is_recommended && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Recommended
                          </span>
                        )}
                        {isEnrolled && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle size={11} /> Enrolled
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading font-black text-base text-slate-900">{t.title}</h3>
                      <p className="text-xs text-slate-500 font-medium">Instructor: {t.trainer_name || 'Industry Expert'}</p>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center text-teal shrink-0">
                      <Award size={20} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {t.description || 'Hands-on training session covering industry demanded frameworks and tools.'}
                  </p>

                  {/* Skills Covered Badges */}
                  {t.skills_covered?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {t.skills_covered.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Program Metadata */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>Starts: {t.start_date || 'Upcoming'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      <span>Ends: {t.end_date || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Users size={13} className="text-slate-400" />
                      <span>{t.enrolled_students_count || (t.registered_students || []).length} Students Enrolled</span>
                    </div>
                  </div>
                </div>

                {/* Registration Action */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  {isEnrolled ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <CheckCircle size={16} className="text-emerald-600" />
                      <span>You are registered for this track</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">Free campus sponsored program</span>
                  )}

                  {isEnrolled ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} /> Registered
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isRegistering}
                      onClick={() => handleRegister(t.id)}
                      style={{
                        backgroundColor: '#00BFA6',
                        color: '#14213D',
                        fontWeight: 700,
                        boxShadow: '0 4px 14px rgba(0, 191, 166, 0.35)',
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold font-heading cursor-pointer hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
                    >
                      {isRegistering ? (
                        <>
                          <Spinner size="xs" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <BookOpen size={14} />
                          <span>Register for Bootcamp</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
