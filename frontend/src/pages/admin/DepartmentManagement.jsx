import { useState, useEffect } from 'react'
import {
  Building2, Plus, Users, BookOpen, CheckCircle2, GraduationCap, Award
} from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import Modal from '../../components/common/Modal'

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newDept, setNewDept] = useState({
    name: '',
    code: '',
    hod_name: '',
    academic_batches: '2023-2027, 2024-2028'
  })

  const fetchDepartments = () => {
    setLoading(true)
    api.get('/admin/departments/')
      .then((res) => {
        if (res.data?.success) setDepartments(res.data.departments || [])
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newDept.name || !newDept.code) return
    setCreating(true)
    try {
      const batches = newDept.academic_batches.split(',').map((b) => b.trim()).filter(Boolean)
      const res = await api.post('/admin/departments/', {
        ...newDept,
        academic_batches: batches
      })
      if (res.data?.success) {
        setDepartments([...departments, res.data.department])
        setModal(false)
        setNewDept({ name: '', code: '', hod_name: '', academic_batches: '2023-2027, 2024-2028' })
      }
    } catch (err) {
      alert('Failed to create department.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Admin Portal', href: '/admin' }, { label: 'Departments & Academic Batches' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-midnight tracking-tight">
            Academic Departments & Batches
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage institutional faculties, academic branches, graduating cohorts, and HOD assignments.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setModal(true)}
          icon={Plus}
          className="bg-teal hover:bg-teal-dark text-midnight font-bold"
        >
          Add Academic Department
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : departments.length === 0 ? (
        <Card className="text-center py-12 border-slate-200">
          <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
          <h4 className="font-heading font-bold text-sm text-slate-700">No departments configured</h4>
          <p className="text-xs text-slate-400 mt-1">Click "Add Academic Department" above to add the first department.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <Card key={dept.id || dept.code} hover className="flex flex-col justify-between border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-midnight text-teal">
                    {dept.code}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {dept.enrolled_students || 0} Students
                  </span>
                </div>

                <h4 className="font-heading font-bold text-base text-slate-900 leading-snug">{dept.name}</h4>
                <p className="text-xs text-slate-500 mt-1">HOD: {dept.hod_name || 'Department Chair'}</p>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Active Batches:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.academic_batches?.map((b) => (
                      <span key={b} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        Batch {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal isOpen={modal} onClose={() => setModal(false)} title="Configure New Academic Department">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Data Science & Artificial Intelligence"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DSAI"
                  value={newDept.code}
                  onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Head of Department (HOD)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. K. Venkataraman"
                  value={newDept.hod_name}
                  onChange={(e) => setNewDept({ ...newDept, hod_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Batches (comma separated)</label>
              <input
                type="text"
                value={newDept.academic_batches}
                onChange={(e) => setNewDept({ ...newDept, academic_batches: e.target.value })}
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
                {creating ? 'Creating...' : 'Create Department'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
