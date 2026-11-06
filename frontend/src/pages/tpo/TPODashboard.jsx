import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, Users, Building2, TrendingUp, Calendar, Download,
  CheckCircle2, Clock, Plus, BarChart2, Sparkles, Filter, FileSpreadsheet, ShieldCheck,
  Megaphone, AlertCircle, Check, Pause, Play, MessageCircle
} from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Spinner from '../../components/common/Spinner'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'

export default function TPODashboard() {
  const [stats, setStats] = useState(null)
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  // Drive Creation Modal
  const [driveModal, setDriveModal] = useState(false)
  const [creatingDrive, setCreatingDrive] = useState(false)
  const [newDrive, setNewDrive] = useState({
    company_name: '',
    role_title: '',
    ctc_lpa: 8.5,
    min_cgpa: 7.5,
    eligible_branches: ['CSE', 'IT'],
    drive_date: '2026-11-28',
    deadline: '2026-11-20',
    rounds: 'Online Assessment + Technical Round'
  })

  // Eligibility Engine Modal
  const [selectedDriveForEngine, setSelectedDriveForEngine] = useState(null)
  const [eligibilityData, setEligibilityData] = useState(null)
  const [loadingEngine, setLoadingEngine] = useState(false)

  // Announcement Modal
  const [announcementModal, setAnnouncementModal] = useState(false)
  const [announcementData, setAnnouncementData] = useState({
    title: '',
    message: '',
    department: ''
  })
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false)

  const fetchData = async () => {
    try {
      const [overviewRes, drivesRes] = await Promise.all([
        api.get('/tpo/overview/').catch(() => ({ data: { stats: null } })),
        api.get('/tpo/drives/').catch(() => ({ data: { drives: [] } })),
      ])
      if (overviewRes.data?.success) setStats(overviewRes.data.stats)
      setDrives(drivesRes.data?.drives || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenEligibilityEngine = async (drive) => {
    setSelectedDriveForEngine(drive)
    setLoadingEngine(true)
    try {
      const res = await api.get(`/tpo/drives/${drive.id}/eligibility/`)
      if (res.data?.success) {
        setEligibilityData(res.data)
      }
    } catch (err) {
      alert('Failed to evaluate eligibility.')
    } finally {
      setLoadingEngine(false)
    }
  }

  const handleToggleDriveStatus = async (driveId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Paused' : 'Active'
    try {
      await api.put(`/tpo/drives/${driveId}/status/`, { status: nextStatus })
      setDrives((prev) =>
        prev.map((d) => d.id === driveId ? { ...d, status: nextStatus } : d)
      )
    } catch (err) {
      alert('Failed to update drive status.')
    }
  }

  const handleCreateDrive = async (e) => {
    e.preventDefault()
    if (!newDrive.company_name || !newDrive.role_title) {
      alert('Please fill company name and role title.')
      return
    }

    setCreatingDrive(true)
    try {
      const res = await api.post('/tpo/drives/', newDrive)
      if (res.data?.success) {
        setDrives([res.data.drive, ...drives])
        setDriveModal(false)
        setNewDrive({
          company_name: '',
          role_title: '',
          ctc_lpa: 8.5,
          min_cgpa: 7.5,
          eligible_branches: ['CSE', 'IT'],
          drive_date: '2026-11-28',
          deadline: '2026-11-20',
          rounds: 'Online Assessment + Technical Round'
        })
        fetchData()
      }
    } catch (err) {
      alert('Failed to announce drive.')
    } finally {
      setCreatingDrive(false)
    }
  }

  const handleSendAnnouncement = async (e) => {
    e.preventDefault()
    if (!announcementData.title || !announcementData.message) return
    setSendingAnnouncement(true)
    try {
      const res = await api.post('/tpo/announcements/', announcementData)
      if (res.data?.success) {
        alert('Announcement broadcasted successfully!')
        setAnnouncementModal(false)
        setAnnouncementData({ title: '', message: '', department: '' })
      }
    } catch (err) {
      alert('Failed to send announcement.')
    } finally {
      setSendingAnnouncement(false)
    }
  }

  const handleExportAccreditation = () => {
    setDownloading(true)
    window.open('http://127.0.0.1:8000/api/v1/reports/accreditation/?format=csv', '_blank')
    setTimeout(() => setDownloading(false), 1500)
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
      <Breadcrumbs items={[{ label: 'TPO Portal' }, { label: 'Placement Operations & Drives' }]} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-midnight via-midnight/95 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/20 text-teal text-xs font-bold mb-3 border border-teal/40">
              <Sparkles size={13} className="text-teal" /> University Training & Placement Office
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Placement Command & Operations Center
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Announce visiting campus recruitment drives, run automated eligibility evaluations across graduating cohorts, and monitor institutional placement percentages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setDriveModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal text-midnight font-heading font-bold text-xs hover:bg-teal-light shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} /> Announce Campus Drive
            </button>
            <button
              onClick={() => setAnnouncementModal(true)}
              className="px-4 py-2.5 rounded-xl bg-midnight-light border border-slate-700 text-white font-heading font-semibold text-xs hover:border-teal transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Megaphone size={15} /> Send Announcement
            </button>
            <button
              onClick={handleExportAccreditation}
              disabled={downloading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-heading font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={15} /> {downloading ? 'Downloading...' : 'Export NIRF Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Batch</p>
                <h3 className="font-heading font-black text-2xl text-slate-900 mt-1">{stats.total_students}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
              <span>Placed: <strong className="text-emerald-700">{stats.total_placed}</strong></span>
              <span>Unplaced: <strong className="text-slate-700">{stats.total_unplaced}</strong></span>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Rate</p>
                <h3 className="font-heading font-black text-2xl text-emerald-700 mt-1">
                  {stats.placement_percentage}%
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Institutional benchmark
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highest Package</p>
                <h3 className="font-heading font-black text-2xl text-slate-900 mt-1">
                  ₹{stats.highest_package_lpa} <span className="text-xs font-semibold text-slate-500">LPA</span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-golden/20 text-golden-dark flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Average CTC: <strong className="text-slate-800">₹{stats.avg_package_lpa} LPA</strong>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Drives</p>
                <h3 className="font-heading font-black text-2xl text-teal mt-1">{stats.active_drives}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-midnight text-teal flex items-center justify-center font-bold">
                <Briefcase size={20} />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Visiting Recruiters: <strong className="text-slate-800">{stats.total_companies}</strong>
            </div>
          </Card>
        </div>
      )}

      {/* Placement Drives Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-charcoal">Active Campus Recruitment Drives</h3>
            <p className="text-xs text-sage-dark">Official drives scheduled for current graduating batch</p>
          </div>
          <span className="text-xs font-bold text-teal bg-teal/10 px-2.5 py-1 rounded-full border border-teal/20">
            {drives.length} Drives in Database
          </span>
        </div>

        {drives.length === 0 ? (
          <Card className="text-center py-10 border-slate-200">
            <Briefcase size={32} className="mx-auto text-slate-300 mb-2" />
            <h4 className="font-heading font-bold text-sm text-slate-700">No recruitment drives scheduled</h4>
            <p className="text-xs text-slate-400 mt-1">Click "Announce Campus Drive" to publish the first corporate recruitment drive.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {drives.map((drive) => (
              <Card key={drive.id} hover className="flex flex-col justify-between border-slate-200">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-midnight text-teal font-heading font-black text-sm flex items-center justify-center">
                        {drive.company_name[0]}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-slate-900 line-clamp-1">{drive.company_name}</h4>
                        <p className="text-[11px] text-teal font-bold">₹{drive.ctc_lpa} LPA CTC</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Min CGPA {drive.min_cgpa}
                    </span>
                  </div>

                  <h5 className="font-heading font-bold text-xs text-slate-800 mb-2">{drive.role_title}</h5>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Drive Date:</span>
                      <span className="font-semibold text-slate-800">{drive.drive_date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Apply Deadline:</span>
                      <span className="font-semibold text-slate-800">{drive.deadline}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Eligible Depts:</span>
                      <span className="font-semibold text-slate-800">{drive.eligible_branches?.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Registered: <strong className="text-slate-800">{drive.registered_count || 0} students</strong>
                    </span>
                    <button
                      onClick={() => handleToggleDriveStatus(drive.id, drive.status)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                        drive.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      {drive.status || 'Active'} (Toggle)
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenEligibilityEngine(drive)}
                      icon={Filter}
                      className="flex-1 bg-midnight hover:bg-midnight-light text-teal font-bold text-xs"
                    >
                      Evaluate Eligibility
                    </Button>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `🚀 *Official Campus Placement Drive Announced!*\n\n🏢 *Company:* ${drive.company_name}\n💼 *Role:* ${drive.role_title}\n💰 *Package (CTC):* ₹${drive.ctc_lpa} LPA\n🎓 *Cutoff:* ${drive.min_cgpa} CGPA\n📚 *Eligible Branches:* ${drive.eligible_branches?.join(', ')}\n📅 *Drive Date:* ${drive.drive_date}\n⏳ *Deadline:* ${drive.deadline}\n\n👉 *Login to SkillBridge to check eligibility & apply:* ${window.location.origin}/student/opportunities`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Broadcast to Cohort via WhatsApp"
                      className="px-3 py-1.5 rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <MessageCircle size={15} className="text-emerald-600" />
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Automated Eligibility Engine Modal */}
      {selectedDriveForEngine && (
        <Modal
          isOpen={Boolean(selectedDriveForEngine)}
          onClose={() => setSelectedDriveForEngine(null)}
          title={`Automatic Eligibility Evaluation: ${selectedDriveForEngine.company_name} - ${selectedDriveForEngine.role_title}`}
        >
          {loadingEngine ? (
            <div className="py-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : eligibilityData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Eligible Students</span>
                  <strong className="text-emerald-700 text-lg font-black">{eligibilityData.eligible_count}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Ineligible Students</span>
                  <strong className="text-red-600 text-lg font-black">{eligibilityData.ineligible_count}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cohort Eligibility</span>
                  <strong className="text-teal text-lg font-black">{eligibilityData.eligibility_rate}%</strong>
                </div>
              </div>

              {/* Eligible List */}
              <div>
                <h5 className="font-heading font-bold text-xs text-emerald-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Eligible Candidates ({eligibilityData.eligible_count})
                </h5>
                {eligibilityData.eligible_students.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No candidates satisfy the cutoff requirements.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {eligibilityData.eligible_students.map((st) => (
                      <div key={st.id} className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-slate-900">{st.full_name}</strong>
                          <div className="text-[11px] text-slate-500">{st.department} • {st.email}</div>
                        </div>
                        <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          {st.cgpa} CGPA
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ineligible List with Specific Reasons */}
              {eligibilityData.ineligible_students?.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h5 className="font-heading font-bold text-xs text-red-800 mb-2 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-red-500" /> Ineligible Candidates & Exclusion Criteria
                  </h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {eligibilityData.ineligible_students.map((st) => (
                      <div key={st.id} className="p-2.5 bg-red-50/40 rounded-lg border border-red-100 text-xs">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>{st.full_name} ({st.department})</span>
                          <span className="text-red-600 font-bold">{st.cgpa} CGPA</span>
                        </div>
                        <div className="mt-1 text-[11px] text-red-700 space-y-0.5">
                          {st.reasons?.map((r, i) => (
                            <div key={i}>• {r}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </Modal>
      )}

      {/* Targeted Announcement Modal */}
      {announcementModal && (
        <Modal
          isOpen={announcementModal}
          onClose={() => setAnnouncementModal(false)}
          title="Broadcast Placement Announcement"
        >
          <form onSubmit={handleSendAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mandatory Pre-Placement Talk by Google Cloud"
                value={announcementData.title}
                onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Department</label>
              <select
                value={announcementData.department}
                onChange={(e) => setAnnouncementData({ ...announcementData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              >
                <option value="">All Departments (Broadcast)</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Body *</label>
              <textarea
                rows={4}
                required
                placeholder="Important instructions, schedules, dress codes, or registration deadlines..."
                value={announcementData.message}
                onChange={(e) => setAnnouncementData({ ...announcementData, message: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setAnnouncementModal(false)} type="button">
                Cancel
              </Button>
              <button
                type="submit"
                disabled={sendingAnnouncement}
                style={{
                  backgroundColor: '#00BFA6',
                  color: '#14213D',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0, 191, 166, 0.35)',
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold font-heading cursor-pointer hover:opacity-95 transition-all disabled:opacity-50"
              >
                {sendingAnnouncement ? 'Broadcasting...' : (
                  <>
                    <Megaphone size={14} />
                    <span>Broadcast Announcement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Announce Drive Modal */}
      {driveModal && (
        <Modal isOpen={driveModal} onClose={() => setDriveModal(false)} title="Announce New Campus Placement Drive">
          <form onSubmit={handleCreateDrive} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Microsoft, Google, Atlassian"
                value={newDrive.company_name}
                onChange={(e) => setNewDrive({ ...newDrive, company_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Associate Software Engineer / Full Stack"
                value={newDrive.role_title}
                onChange={(e) => setNewDrive({ ...newDrive, role_title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Package (CTC in LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newDrive.ctc_lpa}
                  onChange={(e) => setNewDrive({ ...newDrive, ctc_lpa: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Minimum CGPA Cutoff</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={newDrive.min_cgpa}
                  onChange={(e) => setNewDrive({ ...newDrive, min_cgpa: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Drive Date</label>
                <input
                  type="date"
                  value={newDrive.drive_date}
                  onChange={(e) => setNewDrive({ ...newDrive, drive_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registration Deadline</label>
                <input
                  type="date"
                  value={newDrive.deadline}
                  onChange={(e) => setNewDrive({ ...newDrive, deadline: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end items-center gap-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDriveModal(false)}
                type="button"
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 font-bold"
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={creatingDrive}
                style={{
                  backgroundColor: '#00BFA6',
                  color: '#14213D',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0, 191, 166, 0.35)',
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold font-heading cursor-pointer hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingDrive ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-midnight" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Publishing Drive...</span>
                  </>
                ) : (
                  <>
                    <Briefcase size={15} />
                    <span>Publish Placement Drive</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
