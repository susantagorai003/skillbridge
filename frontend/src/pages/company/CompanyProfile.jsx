import { useState, useEffect } from 'react'
import {
  Building2, Globe, MapPin, Users, ShieldCheck, Sparkles, Save, CheckCircle2,
  ExternalLink, Briefcase, Award
} from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'

export default function CompanyProfile() {
  const [profile, setProfile] = useState({
    name: '',
    industry: '',
    website: '',
    domain: '',
    logo: '',
    size: '',
    location: '',
    description: '',
    is_verified: true,
    verification_status: 'verified',
    active_postings_count: 3,
    total_candidates_screened: 45
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    api.get('/companies/profile/')
      .then((res) => {
        if (res.data?.company) {
          setProfile(res.data.company)
        }
      })
      .catch((err) => console.error('Failed to load profile:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleEnrich = async () => {
    const domainToQuery = profile.domain || profile.website?.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
    if (!domainToQuery) {
      alert('Please enter a website domain (e.g. razorpay.com, swiggy.in) to auto-fill brand metadata.')
      return
    }

    setEnriching(true)
    try {
      const res = await api.get(`/companies/enrich/?domain=${encodeURIComponent(domainToQuery)}`)
      if (res.data?.success && res.data.company) {
        const enriched = res.data.company
        setProfile((prev) => ({
          ...prev,
          name: enriched.name || prev.name,
          industry: enriched.industry || prev.industry,
          website: enriched.website || prev.website,
          logo: enriched.logo || prev.logo,
          size: enriched.size || prev.size,
          location: enriched.city || prev.location,
          description: enriched.description || prev.description,
        }))
      }
    } catch (err) {
      alert('Could not auto-fetch domain data. You can fill the fields manually.')
    } finally {
      setEnriching(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)
    try {
      await api.put('/companies/profile/', profile)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch (err) {
      alert('Failed to save company profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: 'Recruiter Dashboard', href: '/company' }, { label: 'Company Profile' }]} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-midnight via-midnight/95 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg overflow-hidden border border-white/20 flex-shrink-0">
              {profile.logo ? (
                <img src={profile.logo} alt={profile.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none' }} />
              ) : (
                <Building2 size={32} className="text-teal" />
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/20 text-teal text-xs font-bold mb-2 border border-teal/40">
                <ShieldCheck size={13} /> Verified Corporate Partner
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                {profile.name || 'Company Profile'}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                {profile.industry || 'Technology & Engineering Services'} • {profile.location || 'India'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-xl text-center">
              <p className="text-[11px] text-slate-300">Active Postings</p>
              <p className="text-lg font-extrabold text-teal">{profile.active_postings_count || 3}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-xl text-center">
              <p className="text-[11px] text-slate-300">Candidates Screened</p>
              <p className="text-lg font-extrabold text-white">{profile.total_candidates_screened || 45}</p>
            </div>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 size={18} className="text-emerald-600" />
          Company profile updated successfully! Changes are live across all candidate opportunity listings.
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-warm-border mb-5">
              <div>
                <h3 className="font-heading font-bold text-lg text-charcoal">Corporate Identity & Info</h3>
                <p className="text-xs text-sage-dark mt-0.5">Edit public company details visible to students and universities.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEnrich}
                loading={enriching}
                icon={Sparkles}
                className="text-xs font-bold"
              >
                Auto-Fill from Domain
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-ivory border border-warm-border rounded-lg focus:outline-none focus:border-sage"
                    placeholder="e.g. Razorpay Software Pvt. Ltd."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Official Website</label>
                  <input
                    type="text"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-ivory border border-warm-border rounded-lg focus:outline-none focus:border-sage"
                    placeholder="e.g. https://razorpay.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={profile.industry}
                    onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-ivory border border-warm-border rounded-lg focus:outline-none focus:border-sage"
                    placeholder="e.g. Fintech, SaaS, E-Commerce"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Company Size</label>
                  <input
                    type="text"
                    value={profile.size}
                    onChange={(e) => setProfile({ ...profile, size: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-ivory border border-warm-border rounded-lg focus:outline-none focus:border-sage"
                    placeholder="e.g. 1,000-5,000 employees"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Headquarters Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-ivory border border-warm-border rounded-lg focus:outline-none focus:border-sage"
                    placeholder="e.g. Bangalore, Karnataka"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Brand Logo URL</label>
                  <input
                    type="text"
                    value={profile.logo}
                    onChange={(e) => setProfile({ ...profile, logo: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-ivory border border-warm-border rounded-lg focus:outline-none focus:border-sage"
                    placeholder="https://logo.clearbit.com/yourdomain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">About Company & Work Culture</label>
                <textarea
                  rows={4}
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  className="w-full p-3 text-xs sm:text-sm bg-ivory border border-warm-border rounded-lg focus:outline-none focus:border-sage resize-none"
                  placeholder="Describe your company mission, tech stack, and what makes engineering here exciting..."
                />
              </div>

              <div className="pt-3 flex justify-end">
                <Button type="submit" loading={saving} icon={Save}>
                  Save Profile Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Live Candidate Preview Card */}
        <div className="space-y-6">
          <Card>
            <h4 className="font-heading font-bold text-sm text-charcoal mb-3 flex items-center gap-1.5">
              <Building2 size={16} className="text-teal" /> Public Candidate View
            </h4>
            <p className="text-xs text-sage-dark mb-4">
              This is how your brand appears on student job cards and recruiter listings.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1.5 border border-slate-200 flex items-center justify-center overflow-hidden">
                  {profile.logo ? (
                    <img src={profile.logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 size={24} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <h5 className="font-heading font-bold text-sm text-slate-800 line-clamp-1">
                    {profile.name || 'Your Company Name'}
                  </h5>
                  <p className="text-[11px] text-slate-500">{profile.industry || 'Tech Firm'}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-terracotta" />
                  <span>{profile.location || 'Bangalore'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-slate-400" />
                  <span>{profile.size || '500+ employees'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 italic pt-2 border-t border-slate-200">
                "{profile.description || 'Pioneering innovative digital software solutions for enterprise scale.'}"
              </p>
            </div>
          </Card>
        </div>
      </form>
    </div>
  )
}
