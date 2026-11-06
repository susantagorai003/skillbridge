import { useState, useEffect } from 'react'
import {
  Search, MapPin, IndianRupee, Clock, Briefcase, Zap, CheckCircle2,
  AlertCircle, Filter, Send, ExternalLink, Sparkles, Building2, Check,
  MessageCircle, Share2, BookOpen
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'

const ROLE_PILLS = [
  { label: 'All Roles', query: '*' },
  { label: 'Full Stack', query: 'full stack' },
  { label: 'React Frontend', query: 'react' },
  { label: 'Python Backend', query: 'python' },
  { label: 'AI & ML', query: 'machine learning' },
  { label: 'Data Science', query: 'data science' },
  { label: 'DevOps & Cloud', query: 'devops' },
]

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOpp, setSelectedOpp] = useState(null)
  const [matchData, setMatchData] = useState(null)
  const [calculatingMatch, setCalculatingMatch] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [appliedOpps, setAppliedOpps] = useState(new Set())
  const [activeRolePill, setActiveRolePill] = useState('*')
  const [hasVerifiedSkills, setHasVerifiedSkills] = useState(false)

  // Campus Placement Drives (TPO Additive Integration)
  const [activePortalTab, setActivePortalTab] = useState('internships')
  const [campusDrives, setCampusDrives] = useState([])
  const [loadingDrives, setLoadingDrives] = useState(false)

  const fetchCampusDrives = async () => {
    setLoadingDrives(true)
    try {
      const res = await api.get('/students/drives/')
      setCampusDrives(res.data?.drives || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDrives(false)
    }
  }

  const handleApplyCampusDrive = async (drive) => {
    if (!drive.is_eligible) {
      alert(`Ineligible for this drive:\n${drive.ineligibility_reasons.join('\n')}`)
      return
    }
    try {
      await api.post('/applications/', {
        drive_id: drive.id,
        opportunity_id: drive.id,
        title: drive.role_title,
        company_name: drive.company_name,
        company_id: drive.company_user_id || 'tpo_partner'
      })
      alert(`Applied to campus drive at ${drive.company_name}! Track it in My Applications.`)
      fetchCampusDrives()
    } catch (err) {
      alert(err.response?.data?.errors?.detail || 'Failed to apply.')
    }
  }

  // Filters
  const [search, setSearch] = useState('')
  const [wfhOnly, setWfhOnly] = useState(false)
  const [locationFilter, setLocationFilter] = useState('')
  const [stipendFilter, setStipendFilter] = useState('')

  const fetchOpps = async (customQuery = null) => {
    setLoading(true)
    try {
      const q = customQuery !== null ? customQuery : (search.trim() || activeRolePill || '*')
      const params = { queries: q }
      if (wfhOnly) params.work_from_home = 'true'
      if (locationFilter) params.location = locationFilter
      if (stipendFilter) params.stipend = stipendFilter

      const [directRes, ishalaRes, appsRes] = await Promise.all([
        api.get('/opportunities/', { params }).catch(() => ({ data: { items: [] } })),
        api.get('/opportunities/internshala/', { params }).catch(() => ({ data: { internships: [] } })),
        api.get('/applications/').catch(() => ({ data: { items: [] } })),
      ])

      const directItems = (directRes.data?.items || []).map((d) => ({
        ...d,
        internship_id: d.id,
        is_direct_employer: true,
        source: 'skillbridge',
        match_percentage: 92,
        stipend: d.stipend || (d.salary_min && d.salary_max
          ? `₹${(d.salary_min/1000).toFixed(0)}k - ₹${(d.salary_max/1000).toFixed(0)}k/mo`
          : d.salary_min ? `₹${d.salary_min}` : 'Competitive'),
        duration: d.duration || '6 months',
        skills: Array.isArray(d.required_skills)
          ? d.required_skills.map((s) => typeof s === 'string' ? s : s.name || s.skill_name || 'Technical Skill')
          : []
      }))

      const ishalaItems = (ishalaRes.data?.internships || []).map((i) => ({
        ...i,
        is_direct_employer: false,
        source: 'internshala'
      }))

      const combined = [...directItems, ...ishalaItems]
      setOpportunities(combined)
      setHasVerifiedSkills(Boolean(ishalaRes.data?.has_student_skills || (ishalaRes.data?.student_skills && ishalaRes.data.student_skills.length > 0)))

      const appliedSet = new Set((appsRes.data?.items || []).map((a) => a.opportunity_id))
      setAppliedOpps(appliedSet)
    } catch (err) {
      console.error('Failed to fetch opportunities:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOpps()
  }, [wfhOnly, locationFilter, stipendFilter])

  const handleRolePillClick = (query) => {
    setActiveRolePill(query)
    setSearch('')
    fetchOpps(query)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchOpps(search.trim() || '*')
  }

  const openDetails = async (opp) => {
    setSelectedOpp(opp)
    setMatchData(null)
    setCalculatingMatch(true)
    const oppId = opp.internship_id || opp.id
    try {
      const res = await api.get(`/matching/?opportunity_id=${oppId}`)
      setMatchData(res.data.match)
    } catch {
      // Fallback to embedded match data from search
      if (opp.match_percentage) {
        setMatchData({
          match_score: opp.match_percentage,
          eligible: true,
          matching_skills: (opp.matched_skills || []).map((s) => ({ skill_name: s })),
          missing_skills: (opp.missing_skills || []).map((s) => ({ skill_name: s })),
          recommendation: `Verified compatibility with ${opp.company}.`,
        })
      }
    } finally {
      setCalculatingMatch(false)
    }
  }

  const handleApply = async () => {
    if (!selectedOpp) return
    const oppId = selectedOpp.internship_id || selectedOpp.id
    setApplying(true)
    try {
      await api.post('/applications/', {
        opportunity_id: oppId,
        cover_letter: coverLetter,
      })
      alert('Application submitted successfully! Track it in your Applications page.')
      setAppliedOpps(new Set([...appliedOpps, oppId]))
      setSelectedOpp(null)
      setCoverLetter('')
    } catch (err) {
      alert(err.response?.data?.errors?.detail || 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/student' }, { label: 'Internships & Jobs' }]} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-midnight via-midnight/95 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/20 border border-teal/40 text-teal text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              Internshala Live Opportunity Feed
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Discover Industry Internships & Jobs
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Explore active tech opportunities matched directly against your verified resume competencies.
              Apply with 1-click tracking or visit direct employer listings.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center text-teal">
              <Sparkles size={20} />
            </div>
            <div className="text-left">
              <p className="text-[11px] text-slate-300 font-medium">Competency Engine</p>
              <p className="text-xs font-bold text-white">
                {hasVerifiedSkills ? 'Candidate Skills Synced' : 'Semantic Match Active'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Role Category Pills */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/10">
          {ROLE_PILLS.map((pill) => {
            const isActive = activeRolePill === pill.query
            return (
              <button
                key={pill.label}
                onClick={() => handleRolePillClick(pill.query)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal text-midnight shadow-md shadow-teal/30 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                {pill.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Scope Switch: Internships vs Campus Drives */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActivePortalTab('internships')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
            activePortalTab === 'internships'
              ? 'bg-midnight text-teal shadow-md'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          Corporate Internships & Remote Roles
        </button>
        <button
          onClick={() => { setActivePortalTab('campus_drives'); fetchCampusDrives(); }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activePortalTab === 'campus_drives'
              ? 'bg-teal text-midnight shadow-md shadow-teal/20'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Building2 size={15} /> Campus Placement Drives (TPO)
        </button>
        <Link
          to="/student/trainings"
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all flex items-center gap-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <BookOpen size={15} /> Training Bootcamps (TPO)
        </Link>
      </div>

      {activePortalTab === 'campus_drives' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-charcoal">Official Campus Placement Drives</h3>
              <p className="text-xs text-slate-500">Scheduled corporate on-campus hiring drives announced by your TPO</p>
            </div>
            <span className="text-xs font-bold text-teal bg-teal/10 px-2.5 py-1 rounded-full border border-teal/20">
              {campusDrives.length} Active Drives
            </span>
          </div>

          {loadingDrives ? (
            <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
          ) : campusDrives.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Briefcase size={36} className="mx-auto text-slate-300" />
              <h3 className="font-heading font-bold text-base text-slate-800">No active campus drives</h3>
              <p className="text-xs text-slate-500">Check back soon for new corporate visits announced by the TPO.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {campusDrives.map((drive) => (
                <Card key={drive.id} hover className="flex flex-col justify-between border-slate-200/90">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-midnight text-teal font-heading font-black text-sm flex items-center justify-center">
                          {drive.company_name[0]}
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-sm text-slate-900">{drive.company_name}</h4>
                          <p className="text-[11px] text-teal font-bold">₹{drive.ctc_lpa} LPA CTC</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Cutoff: {drive.min_cgpa} CGPA
                      </span>
                    </div>

                    <h5 className="font-heading font-bold text-xs text-slate-800 mb-2">{drive.role_title}</h5>

                    <div className="space-y-1 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Drive Date:</span>
                        <strong className="text-slate-800">{drive.drive_date}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Apply Deadline:</span>
                        <strong className="text-slate-800">{drive.deadline}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Eligible:</span>
                        <strong className="text-slate-800">{drive.eligible_branches?.join(', ')}</strong>
                      </div>
                    </div>

                    {/* Eligibility Badge */}
                    <div className="mb-3">
                      {drive.is_eligible ? (
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-600" /> Eligible to Apply (Cutoff Met)
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                          <div className="font-bold flex items-center gap-1 text-amber-700">
                            <AlertCircle size={13} /> Ineligible Criteria:
                          </div>
                          <div className="mt-0.5 space-y-0.5">
                            {drive.ineligibility_reasons?.map((r, i) => (
                              <div key={i}>• {r}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {drive.has_applied ? (
                      <button disabled className="w-full py-2 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs cursor-not-allowed">
                        Applied ✓
                      </button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={!drive.is_eligible}
                        onClick={() => handleApplyCampusDrive(drive)}
                        className={`w-full font-bold text-xs ${
                          drive.is_eligible
                            ? 'bg-teal hover:bg-teal-dark text-midnight shadow-md'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {drive.is_eligible ? 'Apply to Campus Drive' : 'Ineligible'}
                      </Button>
                    )}

                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `🚀 *Campus Placement Drive Alert: ${drive.company_name}*\nRole: ${drive.role_title}\nPackage: ₹${drive.ctc_lpa} LPA\nCutoff: ${drive.min_cgpa} CGPA\nEligible: ${drive.eligible_branches?.join(', ')}\nDeadline: ${drive.deadline}\nApply now on SkillBridge: ${window.location.origin}/student/opportunities`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 rounded-lg text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle size={13} className="text-emerald-600" />
                      <span>Share on WhatsApp</span>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-warm-border shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by role, company, or keyword (e.g. React, Python, Full Stack)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-24 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-teal hover:bg-teal-dark text-midnight text-xs font-bold rounded-md transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Work From Home Toggle */}
          <button
            type="button"
            onClick={() => setWfhOnly(!wfhOnly)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              wfhOnly
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${wfhOnly ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            Work From Home
          </button>

          {/* Location Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal font-medium text-slate-700"
          >
            <option value="">All Locations</option>
            <option value="Work from home">Work from Home</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Mumbai">Mumbai</option>
          </select>

          {/* Min Stipend Filter */}
          <select
            value={stipendFilter}
            onChange={(e) => setStipendFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal font-medium text-slate-700"
          >
            <option value="">Any Stipend</option>
            <option value="20000">₹20,000+ / mo</option>
            <option value="25000">₹25,000+ / mo</option>
            <option value="30000">₹30,000+ / mo</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{opportunities.length}</strong> opportunities
        </span>
        <span className="flex items-center gap-1 text-teal font-semibold">
          <Zap size={13} /> Real-time compatibility scores evaluated
        </span>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">Fetching active internships from Internshala feed...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Briefcase size={36} className="mx-auto text-slate-300" />
          <h3 className="font-heading font-bold text-base text-slate-800">No matching internships found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or removing location filters to see more listings.
          </p>
          <Button size="sm" onClick={() => { setSearch(''); setActiveRolePill('*'); setWfhOnly(false); setLocationFilter(''); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.map((opp) => {
            const oppId = opp.internship_id || opp.id
            const hasApplied = appliedOpps.has(oppId)
            const matchScore = opp.match_percentage || opp.match_score || 85
            const compName = opp.company || opp.company_name || 'Hiring Partner'
            const skillsList = opp.skills || opp.required_skills || []
            const matchedSkills = new Set(opp.matched_skills || [])
            const isWfh = opp.work_from_home || (opp.location && opp.location.toLowerCase().includes('home'))

            return (
              <Card key={oppId} hover className="flex flex-col justify-between border-slate-200/90 hover:border-teal/40 transition-all duration-300">
                <div>
                  {/* Top Bar: Company & Match Badge */}
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal to-mint text-midnight font-heading font-black text-base flex items-center justify-center shadow-sm">
                        {compName ? compName[0] : 'S'}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-xs text-slate-800 line-clamp-1">
                          {compName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <MapPin size={11} className="text-terracotta" />
                          <span className="line-clamp-1">{opp.location || 'Multiple Locations'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Compatibility Score */}
                    <div className={`px-2.5 py-1 rounded-full border text-[11px] font-extrabold flex items-center gap-1 ${
                      matchScore >= 80
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : matchScore >= 60
                        ? 'bg-teal/15 border-teal/30 text-teal-dark'
                        : 'bg-amber-50 border-amber-300 text-amber-700'
                    }`}>
                      <Zap size={11} />
                      <span>{matchScore}% Match</span>
                    </div>
                  </div>

                  {/* Title & Status */}
                  <h3 className="font-heading font-bold text-base text-slate-900 mb-1.5 hover:text-teal transition-colors line-clamp-1">
                    {opp.title}
                  </h3>

                  {opp.is_direct_employer && (
                    <div className="mb-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal/20 text-midnight border border-teal/40 text-[10px] font-extrabold tracking-wide">
                        <Building2 size={11} className="text-teal" /> Direct Campus Recruiter
                      </span>
                    </div>
                  )}

                  {/* Pills row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
                      <IndianRupee size={11} className="text-emerald-600" />
                      {opp.stipend || 'Competitive'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium flex items-center gap-1">
                      <Clock size={11} />
                      {opp.duration || '3-6 Months'}
                    </span>
                    {isWfh && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 font-semibold">
                        Work from home
                      </span>
                    )}
                  </div>

                  {/* Job description snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {opp.job_description || opp.description || 'Gain hands-on engineering experience working on high-impact customer-facing systems.'}
                  </p>

                  {/* Skills badges */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Required Competencies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {skillsList.slice(0, 5).map((skill, idx) => {
                        const sName = typeof skill === 'string' ? skill : skill.skill_name || skill.name
                        const isMatched = matchedSkills.has(sName)
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 ${
                              isMatched
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isMatched && <Check size={10} className="text-emerald-600" />}
                            {sName}
                          </span>
                        )
                      })}
                      {skillsList.length > 5 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                          +{skillsList.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {hasApplied ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                      <CheckCircle2 size={13} /> Applied
                    </span>
                  ) : (
                    <Button size="sm" onClick={() => openDetails(opp)} className="flex-1">
                      View & Apply
                    </Button>
                  )}

                  {opp.apply_url && (
                    <a
                      href={opp.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-teal hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                      title="Open listing on Internshala"
                    >
                      <span>Internshala</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
      </>
      )}

      {/* Detail & 1-Click Apply Modal */}
      <Modal
        isOpen={!!selectedOpp}
        onClose={() => setSelectedOpp(null)}
        title={selectedOpp?.title || 'Opportunity Details'}
        size="lg"
      >
        {selectedOpp && (
          <div className="space-y-5">
            {/* Top metadata */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900">
                    {selectedOpp.title}
                  </h3>
                  <p className="text-xs font-bold text-teal flex items-center gap-1.5 mt-0.5">
                    <Building2 size={13} /> {selectedOpp.company || selectedOpp.company_name}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                  {selectedOpp.match_percentage || 85}% Compatible
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-terracotta" />
                  {selectedOpp.location}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <IndianRupee size={12} className="text-emerald-600" />
                  {selectedOpp.stipend || 'Competitive Stipend'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {selectedOpp.duration || '3-6 Months'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Role Description & Scope
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-200">
                {selectedOpp.job_description || selectedOpp.description || 'Collaborate with the cross-functional engineering team to build scalable full-stack features, write clean testable code, and optimize application performance.'}
              </p>
            </div>

            {/* Skill Compatibility Breakdown */}
            <div className="p-4 bg-slate-900 text-white rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal flex items-center gap-1.5">
                  <Zap size={14} /> AI Skill Compatibility Analysis
                </h4>
                {calculatingMatch && <Spinner size="sm" />}
              </div>

              {matchData ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-slate-300">Profile Readiness:</span>
                    <span className="font-extrabold text-teal text-sm">{matchData.match_score}%</span>
                  </div>

                  {matchData.matching_skills?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-[11px] mb-1 font-semibold">Matched Competencies ({matchData.matching_skills.length}):</p>
                      <div className="flex flex-wrap gap-1">
                        {matchData.matching_skills.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1">
                            <Check size={10} /> {s.skill_name || s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchData.missing_skills?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-[11px] mb-1 font-semibold">Missing Recommended Skills ({matchData.missing_skills.length}):</p>
                      <div className="flex flex-wrap gap-1">
                        {matchData.missing_skills.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-semibold">
                            {s.skill_name || s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchData.recommendation && (
                    <p className="text-slate-400 text-[11px] italic pt-1">
                      "{matchData.recommendation}"
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-300">Evaluating compatibility with your verified skills...</p>
              )}
            </div>

            {/* Application Section */}
            {!appliedOpps.has(selectedOpp.internship_id || selectedOpp.id) ? (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Cover Note / Why are you a good candidate for this role? (Optional)
                </label>
                <textarea
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Highlight your relevant hands-on projects, GitHub repositories, or technical achievements..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal resize-none text-slate-800"
                />

                <div className="flex items-center justify-between gap-3 pt-2">
                  {selectedOpp.apply_url && (
                    <a
                      href={selectedOpp.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-teal hover:underline flex items-center gap-1"
                    >
                      <span>Apply directly on Internshala</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOpp(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleApply} loading={applying} icon={Send}>
                      Submit to SkillBridge Pipeline
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                You have already applied for this role. Track your submission in your Applications tab.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
