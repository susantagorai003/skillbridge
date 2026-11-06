import { useState, useEffect } from 'react'
import {
  Users, Search, Filter, ShieldCheck, CheckCircle2, XCircle, FileSpreadsheet,
  Award, ExternalLink, Mail, GraduationCap, ChevronRight, Download, Check
} from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import Modal from '../../components/common/Modal'

export default function TPOStudentDirectory() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [minCgpa, setMinCgpa] = useState(0)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const fetchStudents = () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (department) params.department = department
    if (minCgpa > 0) params.min_cgpa = minCgpa

    api.get('/tpo/students/', { params })
      .then((res) => {
        if (res.data?.success) setStudents(res.data.students || [])
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStudents()
  }, [department, minCgpa])

  const handleToggleVerification = async (student, shouldVerify) => {
    setVerifying(true)
    try {
      await api.put(`/tpo/students/${student.id}/verify/`, {
        is_verified: shouldVerify,
        status_note: shouldVerify ? 'Credentials verified by TPO Office' : 'Verification revoked'
      })
      setStudents((prev) =>
        prev.map((s) => s.id === student.id ? { ...s, is_verified: shouldVerify } : s)
      )
      if (selectedStudent && selectedStudent.id === student.id) {
        setSelectedStudent({ ...selectedStudent, is_verified: shouldVerify })
      }
    } catch (err) {
      alert('Failed to update verification status.')
    } finally {
      setVerifying(false)
    }
  }

  const handleExportCSV = async () => {
    setDownloading(true)
    try {
      const res = await api.get('/tpo/export-eligible/?format=csv', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `SkillBridge_Student_Directory_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      alert('Export failed.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'TPO Portal', href: '/tpo' }, { label: 'Student Placement Directory' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
            Student Placement Directory
          </h1>
          <p className="text-sage-dark text-sm mt-1">
            Search, verify, and inspect graduating cohort profiles, extracted CV competencies, and placement readiness.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleExportCSV}
          loading={downloading}
          icon={FileSpreadsheet}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
        >
          Export Student Batch (CSV)
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
            />
          </div>

          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal font-semibold text-slate-700"
            >
              <option value="">All Academic Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Data Science & AI">Data Science & AI</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Min CGPA: <strong className="text-teal font-extrabold">{minCgpa.toFixed(1)}</strong>
            </label>
            <input
              type="range"
              min="0"
              max="9.5"
              step="0.5"
              value={minCgpa}
              onChange={(e) => setMinCgpa(Number(e.target.value))}
              className="flex-1 accent-teal cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Students Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <Card className="text-center py-12 border-slate-200">
          <Users size={32} className="mx-auto text-slate-300 mb-2" />
          <h4 className="font-heading font-bold text-sm text-slate-700">No students match current filter criteria</h4>
          <p className="text-xs text-slate-400 mt-1">Try resetting the CGPA slider or search keywords.</p>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Department & Degree</th>
                  <th className="p-4">CGPA</th>
                  <th className="p-4">Verified Skills</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-midnight text-teal font-heading font-black text-xs flex items-center justify-center">
                          {s.full_name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">{s.full_name}</div>
                          <div className="text-[11px] text-slate-400">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800">{s.department}</span>
                      <div className="text-[11px] text-slate-500">{s.degree} • Sem {s.semester}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-extrabold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {s.cgpa} CGPA
                      </span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {s.skills?.slice(0, 4).map((sk) => (
                          <span key={sk} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                            {sk}
                          </span>
                        ))}
                        {s.skills?.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-semibold self-center">
                            +{s.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {s.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Pending TPO
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="px-3 py-1.5 rounded-lg bg-midnight text-teal hover:bg-midnight-light font-bold text-xs transition-colors cursor-pointer"
                      >
                        Inspect Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profile Inspection Modal */}
      {selectedStudent && (
        <Modal
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          title={`Student Placement Credentials: ${selectedStudent.full_name}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-heading font-extrabold text-sm text-slate-900">{selectedStudent.full_name}</h4>
                <p className="text-xs text-slate-500">{selectedStudent.email} • {selectedStudent.degree}</p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                  {selectedStudent.cgpa} CGPA
                </span>
              </div>
            </div>

            <div>
              <h5 className="font-heading font-bold text-xs text-slate-800 mb-1.5">Technical Competencies & Skills</h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.skills?.map((sk) => (
                  <span key={sk} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-teal/10 text-teal-dark border border-teal/20">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Target Career Track</span>
                <strong className="text-slate-800">{selectedStudent.role_target}</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Placement Readiness</span>
                <strong className="text-teal font-extrabold">{selectedStudent.readiness_score || 80}% Ready</strong>
              </div>
            </div>

            {selectedStudent.github_url && (
              <a
                href={selectedStudent.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-teal font-bold hover:underline"
              >
                Inspect GitHub Codebase <ExternalLink size={12} />
              </a>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600">Verification Status: </span>
                <strong className={selectedStudent.is_verified ? 'text-emerald-700' : 'text-amber-600'}>
                  {selectedStudent.is_verified ? 'Verified' : 'Unverified'}
                </strong>
              </div>

              <div className="flex gap-2">
                {selectedStudent.is_verified ? (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={verifying}
                    onClick={() => handleToggleVerification(selectedStudent, false)}
                    className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                  >
                    Revoke Verification
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    loading={verifying}
                    onClick={() => handleToggleVerification(selectedStudent, true)}
                    className="bg-teal hover:bg-teal-dark text-midnight font-bold text-xs"
                  >
                    Approve & Verify Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
