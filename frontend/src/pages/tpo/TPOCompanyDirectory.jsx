import { useState, useEffect } from 'react'
import {
  Building2, Plus, ShieldCheck, CheckCircle2, XCircle, FileText,
  Calendar, Award, ExternalLink, Briefcase, ChevronRight
} from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import Modal from '../../components/common/Modal'

export default function TPOCompanyDirectory() {
  const [companies, setCompanies] = useState([])
  const [mous, setMous] = useState([])
  const [loading, setLoading] = useState(true)
  const [mouModal, setMouModal] = useState(false)
  const [newMou, setNewMou] = useState({
    company_name: '',
    tier: 'Tier 1 Strategic Hiring Partner',
    annual_intern_quota: 15,
    valid_till: '2028-12-31'
  })
  const [creatingMou, setCreatingMou] = useState(false)

  const fetchData = () => {
    setLoading(true)
    api.get('/tpo/companies/')
      .then((res) => {
        if (res.data?.success) {
          setCompanies(res.data.companies || [])
          setMous(res.data.mous || [])
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleVerifyCompany = async (companyId, action) => {
    try {
      await api.put(`/tpo/companies/${companyId}/verify/`, { action })
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId
            ? { ...c, is_verified: action === 'approve', verification_status: action === 'approve' ? 'verified' : 'rejected' }
            : c
        )
      )
    } catch (err) {
      alert('Failed to update company verification.')
    }
  }

  const handleCreateMou = async (e) => {
    e.preventDefault()
    if (!newMou.company_name) return
    setCreatingMou(true)
    try {
      const res = await api.post('/tpo/companies/', newMou)
      if (res.data?.success) {
        setMous([res.data.mou, ...mous])
        setMouModal(false)
        setNewMou({ company_name: '', tier: 'Tier 1 Strategic Hiring Partner', annual_intern_quota: 15, valid_till: '2028-12-31' })
      }
    } catch (err) {
      alert('Failed to add MoU.')
    } finally {
      setCreatingMou(false)
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'TPO Portal', href: '/tpo' }, { label: 'Companies & Corporate MoUs' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
            Corporate Partners & MoUs
          </h1>
          <p className="text-sage-dark text-sm mt-1">
            Oversee corporate campus recruitment accreditation, verify visiting recruiters, and manage bilateral MoUs.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setMouModal(true)}
          icon={Plus}
          className="bg-teal hover:bg-teal-dark text-midnight font-bold"
        >
          Execute New Corporate MoU
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Corporate MoUs Section */}
          <div>
            <h3 className="font-heading font-extrabold text-lg text-charcoal mb-3">
              Institutional Corporate MoUs & Hiring Quotas
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {mous.map((m) => (
                <Card key={m.id} hover className="border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-midnight text-teal font-heading font-black text-sm flex items-center justify-center">
                      {m.company_name[0]}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Active MoU
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-sm text-slate-900">{m.company_name}</h4>
                  <p className="text-xs text-teal font-semibold mt-0.5">{m.tier}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Annual Intern Quota:</span>
                      <strong className="text-slate-800">{m.annual_intern_quota} candidates</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valid Till:</span>
                      <strong className="text-slate-800">{m.valid_till}</strong>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Registered Visiting Companies */}
          <div>
            <h3 className="font-heading font-extrabold text-lg text-charcoal mb-3">
              Visiting Corporate Recruiters & Verification
            </h3>
            {companies.length === 0 ? (
              <Card className="text-center py-8 border-slate-200">
                <Building2 size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">No external companies registered yet</p>
              </Card>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-4">Company Name</th>
                      <th className="p-4">Industry Sector</th>
                      <th className="p-4">Website</th>
                      <th className="p-4">Accreditation Status</th>
                      <th className="p-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {companies.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{c.name}</span>
                          <div className="text-[11px] text-slate-400">{c.location || 'India'}</div>
                        </td>
                        <td className="p-4">{c.industry || 'Technology Services'}</td>
                        <td className="p-4">
                          <a href={c.website} target="_blank" rel="noreferrer" className="text-teal hover:underline flex items-center gap-1 font-semibold">
                            {c.domain || 'Visit Site'} <ExternalLink size={10} />
                          </a>
                        </td>
                        <td className="p-4">
                          {c.is_verified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={12} /> Accredited Partner
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {c.is_verified ? (
                            <button
                              onClick={() => handleVerifyCompany(c.id, 'reject')}
                              className="px-2.5 py-1 rounded-md text-red-600 hover:bg-red-50 text-xs font-bold border border-red-200 cursor-pointer"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerifyCompany(c.id, 'approve')}
                              className="px-3 py-1 rounded-md bg-teal hover:bg-teal-dark text-midnight font-bold text-xs cursor-pointer shadow-sm"
                            >
                              Approve Partner
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New MoU Modal */}
      {mouModal && (
        <Modal isOpen={mouModal} onClose={() => setMouModal(false)} title="Execute Bilateral Corporate MoU">
          <form onSubmit={handleCreateMou} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Partner Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Google Cloud, Atlassian, Infosys"
                value={newMou.company_name}
                onChange={(e) => setNewMou({ ...newMou, company_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">MoU Tier Classification</label>
              <select
                value={newMou.tier}
                onChange={(e) => setNewMou({ ...newMou, tier: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
              >
                <option value="Tier 1 Strategic Hiring Partner">Tier 1 Strategic Hiring Partner</option>
                <option value="Cloud & Center of Excellence Partner">Cloud & Center of Excellence Partner</option>
                <option value="Annual Hackathon & Internship Partner">Annual Hackathon & Internship Partner</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Annual Intern Quota</label>
                <input
                  type="number"
                  min="1"
                  value={newMou.annual_intern_quota}
                  onChange={(e) => setNewMou({ ...newMou, annual_intern_quota: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">MoU Valid Until</label>
                <input
                  type="date"
                  value={newMou.valid_till}
                  onChange={(e) => setNewMou({ ...newMou, valid_till: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setMouModal(false)} type="button">
                Cancel
              </Button>
              <Button size="sm" type="submit" loading={creatingMou} className="bg-teal hover:bg-teal-dark text-midnight font-bold">
                Register MoU
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
