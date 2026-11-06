import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Target, CheckCircle, AlertTriangle, XCircle, ArrowUpRight,
  BookOpen, Compass, Sparkles, Filter, UploadCloud, FileText,
  Cpu, CheckSquare, Square, RefreshCw, ExternalLink, HelpCircle,
  Briefcase, ChevronRight, Award, UserCheck, Play, PlayCircle,
  Tv, Eye, Clock, X, Film, Video
} from 'lucide-react'
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import api from '../../services/api'
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'

const SAMPLE_RESUMES = {
  fullstack: `Rahul Sharma
rahul.sharma@example.com | +91 98765 43210 | Bangalore, India
GitHub: https://github.com/rahul-dev | LinkedIn: https://linkedin.com/in/rahulsharma

EDUCATION
Bachelor of Technology in Computer Science & Engineering
Apex Institute of Technology, 2021 - 2025 | CGPA: 8.6/10

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, HTML5, CSS3, SQL
Frameworks: React.js, Node.js, Express.js, Tailwind CSS
Databases & Cloud: MongoDB, PostgreSQL, Git, GitHub, REST APIs

PROJECTS
• DevPortal: Full-stack collaboration hub built with React, Node.js, Express, and MongoDB.
• E-Commerce API: RESTful backend service with JWT authentication and payment integration.
• TaskFlow: Real-time task manager with WebSockets, Tailwind CSS, and Redis caching.`,

  datascience: `Ananya Verma
ananya.verma@example.com | +91 91234 56789 | Hyderabad, India
GitHub: https://github.com/ananya-ds | LinkedIn: https://linkedin.com/in/ananya-verma

EDUCATION
B.Tech in Information Technology & Data Science
National Institute of Technology, 2021 - 2025 | CGPA: 9.1/10

TECHNICAL SKILLS
Languages: Python, SQL, R, Bash
Data & AI: Pandas, NumPy, Scikit-learn, Matplotlib, Seaborn, Machine Learning
Tools: Jupyter, Git, MySQL, Tableau, REST APIs

PROJECTS
• Customer Churn Prediction: Built Random Forest and XGBoost classifiers achieving 89% accuracy.
• Sales Analytics Dashboard: Interactive SQL queries and exploratory data analysis on 500k rows.`,

  devops: `Arjun Patel
arjun.patel@example.com | +91 99887 76655 | Pune, India
GitHub: https://github.com/arjun-cloud

EDUCATION
B.Tech in Computer Science & Engineering, 2020 - 2024

TECHNICAL SKILLS
Cloud & DevOps: Docker, Linux, Git, GitHub Actions, AWS (EC2, S3), CI/CD, Nginx, Bash
Languages: Python, Bash, Shell, SQL

PROJECTS
• Automated Microservices CI/CD: Automated multi-stage Docker builds and automated test deployment.
• High Availability Web Server: Configured reverse proxy with Nginx, SSL termination, and AWS S3.`
}

const CAREER_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'AI / ML Engineer',
  'DevOps Engineer',
  'Data Analyst',
  'Cybersecurity Analyst'
]

export default function SkillGapPage() {
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer')
  const [inputMode, setInputMode] = useState('upload') // 'upload' | 'paste' | 'profile'
  const [resumeText, setResumeText] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [customJD, setCustomJD] = useState('')
  const [showCustomJD, setShowCustomJD] = useState(false)

  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [roadmap, setRoadmap] = useState([])
  const [extractedProfile, setExtractedProfile] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')

  // YouTube RapidAPI Learning Accelerator States
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [activeVideoSkill, setActiveVideoSkill] = useState('')
  const [acceleratorVideos, setAcceleratorVideos] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(false)

  const fetchSkillVideos = async (skillName) => {
    if (!skillName) return
    setActiveVideoSkill(skillName)
    setLoadingVideos(true)
    try {
      const res = await api.get(`/tutorials/?skill=${encodeURIComponent(skillName)}&limit=4`)
      if (res.data?.success) {
        setAcceleratorVideos(res.data.videos || [])
      }
    } catch (err) {
      console.error('Failed to fetch YouTube tutorials:', err)
    } finally {
      setLoadingVideos(false)
    }
  }

  // Auto-fetch tutorials for the first missing skill when analysis completes
  useEffect(() => {
    if (analysis?.missing_skills?.length > 0) {
      fetchSkillVideos(analysis.missing_skills[0])
    }
  }, [analysis])

  const fileInputRef = useRef(null)

  // Initialize from sessionStorage or student's saved uploaded resume in DB
  useEffect(() => {
    const cachedSkills = sessionStorage.getItem('skillbridge_quick_skills')
    const cachedRole = sessionStorage.getItem('skillbridge_quick_role')
    if (cachedSkills) {
      setResumeText(`Extracted Skills:\n${cachedSkills}`)
      if (cachedRole) setSelectedRole(cachedRole)
      setInputMode('paste')
      sessionStorage.removeItem('skillbridge_quick_skills')
      sessionStorage.removeItem('skillbridge_quick_role')
      // Auto analyze from visitor hero quick preview
      triggerAnalysis({ skillsText: cachedSkills, role: cachedRole || 'Full Stack Developer' })
    } else {
      // Check if logged-in student has already uploaded a CV in their profile
      loadSavedResume()
    }
  }, [])

  const loadSavedResume = async () => {
    try {
      const res = await api.get('/resumes/')
      if (res.data?.success && res.data.resumes?.length > 0) {
        const latest = res.data.resumes[0]
        setUploadedFileName(latest.filename)
        if (latest.parsed_data && latest.parsed_data.skills?.length > 0) {
          setExtractedProfile(latest.parsed_data)
          setResumeText(latest.parsed_data.skills?.join(', ') || '')
          // Run analysis with student's own verified skills
          triggerAnalysis({
            skillsList: latest.parsed_data.skills,
            role: selectedRole,
            skillsText: latest.parsed_data.skills?.join(', ')
          })
          return
        }
      }
    } catch (err) {
      console.warn('No saved resume found:', err)
    }
    // If no resume uploaded yet, do NOT auto-run dummy Rahul Sharma sample!
    // Keep analysis null so user is clearly prompted to upload or paste their CV.
  }

  const triggerAnalysis = async ({ skillsText, role, customJobDesc, skillsList }) => {
    const textToCheck = skillsText !== undefined ? skillsText : resumeText
    const listToCheck = skillsList || extractedProfile?.skills || []

    // Do not trigger analysis if neither text nor extracted skills are present
    if (!textToCheck && listToCheck.length === 0) {
      setAnalysis(null)
      return
    }

    setAnalyzing(true)
    setStatusMessage('Parsing competencies and evaluating against industry benchmarks...')

    try {
      const activeRole = role || selectedRole
      const payload = {
        target_role: activeRole,
        resume_text: textToCheck,
        custom_job_description: customJobDesc || customJD,
      }
      if (listToCheck.length > 0) {
        payload.skills = listToCheck
      }

      const res = await api.post('/skill-gap/analyze/', payload)

      if (res.data?.success) {
        setAnalysis(res.data.analysis)
        setRoadmap(res.data.roadmap || res.data.analysis?.roadmap || [])
        setStatusMessage('')
      }
    } catch (err) {
      console.error('Error running skill gap analysis:', err)
      setStatusMessage('Analysis completed using local competency fallback.')
    } finally {
      setAnalyzing(false)
    }
  }

  // Handle PDF file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    setAnalyzing(true)
    setStatusMessage(`Extracting text and technical competencies from ${file.name}...`)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const uploadRes = await api.post('/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (uploadRes.data?.success && uploadRes.data?.parsed_data) {
        const parsed = uploadRes.data.parsed_data
        setExtractedProfile(parsed)
        setResumeText(parsed.skills?.join(', ') || '')

        // Now run deep gap analysis against selected role
        const gapRes = await api.post('/skill-gap/analyze/', {
          target_role: selectedRole,
          resume_id: uploadRes.data.resume_id,
          skills: parsed.skills,
          resume_text: parsed.skills?.join(', '),
          custom_job_description: customJD,
        })

        if (gapRes.data?.success) {
          setAnalysis(gapRes.data.analysis)
          setRoadmap(gapRes.data.roadmap || gapRes.data.analysis?.roadmap || [])
          setStatusMessage('')
        }
      }
    } catch (err) {
      console.error('File parsing failed:', err)
      setStatusMessage('File parsing encountered an issue. Try loading a sample or pasting CV text.')
    } finally {
      setAnalyzing(false)
    }
  }

  // Toggle milestone completion in DB
  const toggleMilestone = async (phaseId, currentCompleted) => {
    const newStatus = !currentCompleted
    // Optimistic UI update
    setRoadmap((prev) =>
      prev.map((p) => (p.id === phaseId ? { ...p, completed: newStatus } : p))
    )

    try {
      await api.patch('/roadmaps/progress/', {
        phase_id: phaseId,
        completed: newStatus,
      })
    } catch (err) {
      console.error('Failed to persist milestone progress:', err)
    }
  }

  // Load a pre-defined sample resume
  const loadSample = (type) => {
    const text = SAMPLE_RESUMES[type]
    setResumeText(text)
    setInputMode('paste')
    const roleMap = {
      fullstack: 'Full Stack Developer',
      datascience: 'Data Scientist',
      devops: 'DevOps Engineer',
    }
    const target = roleMap[type] || 'Full Stack Developer'
    setSelectedRole(target)
    triggerAnalysis({ skillsText: text, role: target })
  }

  // Format Recharts Radar Data
  const radarData = analysis
    ? [
        ...(analysis.matched_skills || []).map((s) => ({
          subject: s,
          student: 85,
          required: 90,
        })),
        ...(analysis.missing_skills || []).map((s) => ({
          subject: s,
          student: 20,
          required: 85,
        })),
      ].slice(0, 8)
    : []

  return (
    <div className="space-y-8 pb-12">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/student' }, { label: 'AI Skill Gap Engine' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/15 border border-teal/30 text-teal text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} /> Multi-Layer AI Competency Matching
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-midnight tracking-tight">
            Intelligent CV & Skill Gap Analyzer
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Upload your resume or paste CV text to identify exact competency gaps, calculate role readiness, and generate an actionable learning roadmap.
          </p>
        </div>

        {/* Career Role Selector */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <label className="text-xs font-bold text-midnight whitespace-nowrap pl-2">Target Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value)
              triggerAnalysis({ role: e.target.value })
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-midnight focus:outline-none focus:border-teal"
          >
            {CAREER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic CV Input Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputMode('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                inputMode === 'upload'
                  ? 'bg-midnight text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UploadCloud size={15} /> Upload Resume PDF
            </button>
            <button
              onClick={() => setInputMode('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                inputMode === 'paste'
                  ? 'bg-midnight text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText size={15} /> Paste CV Text
            </button>
          </div>

          {/* Quick Sample Resume Loaders */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold hidden sm:inline">Load Sample:</span>
            <button
              onClick={() => loadSample('fullstack')}
              className="px-2.5 py-1 rounded-lg bg-teal/10 text-teal hover:bg-teal hover:text-midnight font-bold transition-colors"
            >
              Full Stack CV
            </button>
            <button
              onClick={() => loadSample('datascience')}
              className="px-2.5 py-1 rounded-lg bg-golden/15 text-golden-dark hover:bg-golden hover:text-midnight font-bold transition-colors"
            >
              Data Science CV
            </button>
            <button
              onClick={() => loadSample('devops')}
              className="px-2.5 py-1 rounded-lg bg-coral/15 text-coral-dark hover:bg-coral hover:text-white font-bold transition-colors"
            >
              DevOps CV
            </button>
          </div>
        </div>

        {/* Input Mode: File Upload */}
        {inputMode === 'upload' ? (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-teal/40 bg-mint/20 hover:bg-mint/40 rounded-2xl p-8 text-center cursor-pointer transition-colors"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-teal/20 text-teal flex items-center justify-center mx-auto mb-3">
                <UploadCloud size={28} />
              </div>
              <p className="font-heading font-bold text-midnight text-base">
                {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Click to Browse or Drag & Drop Resume (PDF / DOCX)'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports standard resumes up to 10MB. PyMuPDF automatically extracts technical skills, education, and projects.
              </p>
            </div>

            {/* Extracted Profile Summary if File Uploaded */}
            {extractedProfile?.skills?.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-midnight">
                    <CheckCircle size={14} className="text-teal" />
                    <span>Extracted Competencies from Resume ({extractedProfile.skills.length}):</span>
                  </div>
                  <button
                    onClick={() => triggerAnalysis({ skillsList: extractedProfile.skills, role: selectedRole })}
                    disabled={analyzing}
                    className="px-3 py-1 bg-midnight text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} className={analyzing ? 'animate-spin' : ''} /> Re-run Gap Analysis
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {extractedProfile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Input Mode: Text Area */
          <div className="space-y-3">
            <textarea
              rows={5}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your CV text, skills, or projects here..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-charcoal font-mono placeholder-slate-400 focus:outline-none focus:border-teal transition-colors"
            />
            <div className="flex justify-end">
              <button
                onClick={() => triggerAnalysis({ skillsText: resumeText, role: selectedRole })}
                disabled={analyzing}
                className="px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-midnight font-heading font-bold text-xs rounded-xl hover:shadow-md transition-all flex items-center gap-1.5"
              >
                {analyzing ? <Spinner size="sm" /> : <Sparkles size={14} />} Run Skill Gap Analysis
              </button>
            </div>
          </div>
        )}

        {/* Optional Custom Job Description Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowCustomJD(!showCustomJD)}
            className="text-teal font-bold hover:underline flex items-center gap-1"
          >
            {showCustomJD ? '- Hide Custom Job Description' : '+ Compare Against a Specific Company Job Description'}
          </button>
        </div>

        {showCustomJD && (
          <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-midnight block">Paste Target Job Description (Optional):</label>
            <textarea
              rows={3}
              value={customJD}
              onChange={(e) => setCustomJD(e.target.value)}
              placeholder="Paste the job posting requirements from LinkedIn, Indeed, etc..."
              className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-charcoal focus:outline-none focus:border-teal"
            />
            <div className="flex justify-end">
              <button
                onClick={() => triggerAnalysis({ customJobDesc: customJD })}
                className="px-4 py-1.5 bg-midnight text-white text-xs font-bold rounded-lg hover:bg-slate-800"
              >
                Analyze Against This Job
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {analyzing && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Spinner size="lg" />
          <p className="font-heading font-bold text-midnight text-lg">AI Competency Engine in Action</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {statusMessage || 'Extracting skills, computing role readiness percentage, and building a personalized multi-phase learning roadmap...'}
          </p>
        </div>
      )}

      {/* Analysis Results Display */}
      {!analyzing && analysis && (
        <>
          {/* Readiness Score Banner */}
          <div className="bg-gradient-to-r from-midnight via-midnight to-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-teal/10 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/20 text-teal text-xs font-bold mb-3 border border-teal/40">
                <Sparkles size={12} className="text-golden" /> AI Analyzed Competency Profile
              </div>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                {analysis.readiness_score}% Role Readiness
              </h2>
              <p className="text-slate-300 text-sm mt-2 max-w-xl leading-relaxed">
                Evaluated for <strong className="text-white">{analysis.target_role}</strong>.
                You have acquired <strong className="text-teal">{analysis.matched_skills?.length || 0}</strong> competencies,
                with <strong className="text-coral">{analysis.missing_skills?.length || 0}</strong> priority skills recommended to achieve optimal placement readiness.
              </p>
            </div>

            {/* Radial Gauge Visual */}
            <div className="flex flex-col items-center flex-shrink-0 relative z-10">
              <div className="w-28 h-28 rounded-full border-4 border-teal flex flex-col items-center justify-center bg-midnight-light/90 shadow-lg shadow-teal/20">
                <span className="font-heading font-black text-3xl text-white">
                  {analysis.readiness_score}%
                </span>
                <span className="text-[10px] font-bold text-teal uppercase tracking-wider">Ready</span>
              </div>
              <span className="text-xs text-slate-300 font-semibold mt-2">
                {analysis.readiness_score >= 75 ? 'Placement Ready' : 'Targeted Upskilling Required'}
              </span>
            </div>
          </div>

          {/* Visualization Grid: Radar & Competency Matrix */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Competency Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Role Competency Radar</CardTitle>
                <CardDescription>
                  Comparing candidate skill proficiency against industry benchmarks
                </CardDescription>
              </CardHeader>
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="#CBD5E1" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#14213D', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis domain={[0, 100]} stroke="#00BFA6" />
                    <Radar name="Candidate Proficiency" dataKey="student" stroke="#00BFA6" fill="#00BFA6" fillOpacity={0.4} />
                    <Radar name="Required Level" dataKey="required" stroke="#FF6B5E" fill="#FF6B5E" fillOpacity={0.15} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 text-xs mt-3 pb-2">
                <span className="text-teal font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal" /> Your Matched Skills
                </span>
                <span className="text-coral font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-coral" /> Target Industry Requirements
                </span>
              </div>
            </Card>

            {/* Categorized Skills Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Competency Breakdown</CardTitle>
                <CardDescription>Categorized by market priority</CardDescription>
              </CardHeader>

              <div className="space-y-4">
                {/* Matched Strong Skills */}
                <div>
                  <h4 className="text-xs font-bold text-midnight uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle size={15} className="text-teal" /> Matched Skills ({analysis.matched_skills?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(analysis.matched_skills || []).map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-mint text-midnight font-bold text-xs rounded-xl border border-teal/20">
                        {skill}
                      </span>
                    ))}
                    {(analysis.matched_skills || []).length === 0 && (
                      <span className="text-xs text-slate-400">No verified skills yet</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills with Priority & Instant YouTube Accelerator Link */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-xs font-bold text-coral uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle size={15} className="text-coral" /> Missing Critical Gaps ({analysis.missing_skills?.length || 0})
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">Click any skill to load video lessons</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.missing_skills || []).map((skill, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          fetchSkillVideos(skill)
                          document.getElementById('youtube-accelerator-section')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className={`px-3 py-1 font-bold text-xs rounded-xl border flex items-center gap-1.5 transition-all group cursor-pointer ${
                          activeVideoSkill === skill
                            ? 'bg-red-600 text-white border-red-600 shadow-sm'
                            : 'bg-coral/10 hover:bg-coral/20 text-coral-dark border-coral/30'
                        }`}
                        title={`Click to watch live YouTube tutorials for ${skill}`}
                      >
                        <span>{skill}</span>
                        <span className={`text-[10px] uppercase font-black px-1.5 py-0.2 rounded ${
                          activeVideoSkill === skill ? 'bg-white text-red-600' : 'bg-coral text-white'
                        }`}>
                          High
                        </span>
                        <Play size={10} className={`${activeVideoSkill === skill ? 'text-white' : 'text-coral'} group-hover:scale-125 transition-transform`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extracted Profile Details if available */}
                {extractedProfile && (
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <p><strong>Candidate:</strong> {extractedProfile.name || 'Student Candidate'}</p>
                    <p><strong>Education:</strong> {extractedProfile.education?.[0] || 'Technical Degree'}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Actionable Personalized Multi-Phase Learning Roadmap */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personalized Multi-Phase Learning Roadmap</CardTitle>
                  <CardDescription>
                    Step-by-step milestones to close identified gaps for {analysis.target_role}. Check off milestones as you complete them to update your progress in the database.
                  </CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-teal bg-mint/50 px-3 py-1 rounded-full border border-teal/20">
                  <CheckSquare size={14} /> Progress Synced to MongoDB
                </div>
              </div>
            </CardHeader>

            <div className="space-y-4">
              {roadmap.map((phase, idx) => {
                const isCompleted = phase.completed
                return (
                  <div
                    key={phase.id || idx}
                    className={`p-5 rounded-2xl border transition-all duration-200 ${
                      isCompleted
                        ? 'bg-mint/30 border-teal/40'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleMilestone(phase.id || `phase-${idx + 1}`, isCompleted)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isCompleted ? 'bg-teal text-midnight' : 'border-2 border-slate-300 hover:border-teal'
                          }`}
                          aria-label="Toggle Milestone"
                        >
                          {isCompleted ? <CheckCircle size={18} /> : null}
                        </button>
                        <div>
                          <h4 className={`text-sm sm:text-base font-bold ${isCompleted ? 'text-midnight line-through' : 'text-midnight'}`}>
                            {phase.title}
                          </h4>
                          <span className="text-xs text-slate-500 font-semibold">{phase.duration}</span>
                        </div>
                      </div>

                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                        isCompleted ? 'bg-teal text-midnight' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {isCompleted ? 'Completed' : 'Action Required'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3">{phase.description}</p>

                    {/* Topics Checklist */}
                    {phase.topics && (
                      <div className="mb-3 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Key Focus Areas:</p>
                        {phase.topics.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Practical Assignments & Resources */}
                    {phase.assignments && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                        <p className="font-bold text-midnight">Practical Assignment:</p>
                        <p className="text-slate-600">{phase.assignments[0]}</p>
                      </div>
                    )}

                    {/* YouTube Video Masterclasses for this phase */}
                    {phase.videos && phase.videos.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-bold text-midnight uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-4 h-3 bg-red-600 rounded-xs flex items-center justify-center text-white text-[8px] font-black">▶</span>
                            <span>Phase Masterclasses</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">Live from YouTube</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2.5">
                          {phase.videos.map((vid, vIdx) => (
                            <div
                              key={vid.video_id || vIdx}
                              onClick={() => setSelectedVideo(vid)}
                              className="flex gap-2.5 p-2 bg-white rounded-xl border border-slate-200 hover:border-red-400/50 hover:shadow-xs transition-all cursor-pointer group"
                            >
                              <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900">
                                <img
                                  src={vid.thumbnail}
                                  alt={vid.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-midnight/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <PlayCircle size={22} className="text-white drop-shadow" />
                                </div>
                                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-white text-[9px] font-bold">
                                  {vid.duration_text}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <p className="text-xs font-bold text-midnight line-clamp-2 group-hover:text-red-600 transition-colors">
                                  {vid.title}
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                  <span className="truncate max-w-[100px]">{vid.author}</span>
                                  <span>{vid.views}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Dynamic YouTube Skill Accelerator Section */}
          <div id="youtube-accelerator-section">
            <Card className="border-red-200/80 bg-gradient-to-b from-white via-white to-red-50/25 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider mb-1.5 border border-red-200">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      RapidAPI YouTube Learning Engine
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      <Tv size={20} className="text-red-600" />
                      Live Skill Acceleration Masterclasses
                    </CardTitle>
                    <CardDescription>
                      Real-time video tutorials and full crash courses dynamically fetched for your identified skill gaps.
                    </CardDescription>
                  </div>

                  {/* Skill Gap Switcher */}
                  {analysis.missing_skills?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 mr-1 hidden lg:inline">Focus Gap:</span>
                      {analysis.missing_skills.map((s) => (
                        <button
                          key={s}
                          onClick={() => fetchSkillVideos(s)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeVideoSkill === s
                              ? 'bg-red-600 text-white shadow-sm shadow-red-200'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-red-300'
                          }`}
                        >
                          <Play size={10} className={activeVideoSkill === s ? 'text-white' : 'text-red-500'} />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>

              <div className="p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-midnight">Current Topic:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-red-100 text-red-700 font-extrabold text-xs">
                      {activeVideoSkill || 'General Tech'}
                    </span>
                  </div>
                  <button
                    onClick={() => fetchSkillVideos(activeVideoSkill)}
                    disabled={loadingVideos}
                    className="text-xs text-slate-500 hover:text-red-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={12} className={loadingVideos ? 'animate-spin' : ''} /> Refresh Lessons
                  </button>
                </div>

                {loadingVideos ? (
                  <div className="py-12 text-center space-y-2">
                    <Spinner size="md" />
                    <p className="text-xs text-slate-500 font-semibold">
                      Querying YouTube Data API for top {activeVideoSkill} masterclasses...
                    </p>
                  </div>
                ) : acceleratorVideos?.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {acceleratorVideos.map((vid, idx) => (
                      <div
                        key={vid.video_id || idx}
                        onClick={() => setSelectedVideo(vid)}
                        className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-red-300 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer group"
                      >
                        <div className="relative aspect-video bg-slate-900 overflow-hidden">
                          <img
                            src={vid.thumbnail}
                            alt={vid.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-midnight/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play size={18} className="ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold">
                            {vid.duration_text}
                          </span>
                        </div>

                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="font-bold text-xs sm:text-sm text-midnight line-clamp-2 group-hover:text-red-600 transition-colors mb-1.5">
                              {vid.title}
                            </h5>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              {vid.author}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Eye size={12} className="text-slate-400" /> {vid.views}
                            </span>
                            <span className="text-red-600 font-bold group-hover:underline flex items-center gap-0.5">
                              Watch Now <ChevronRight size={12} />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Select a skill gap above to load live video masterclasses.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Role-Specific AI Interview Prep Hub */}
          {analysis.interview_prep && (
            <Card>
              <CardHeader>
                <CardTitle>Role-Specific AI Interview Preparation</CardTitle>
                <CardDescription>
                  Tailored technical questions and interview tips for {analysis.target_role} candidates
                </CardDescription>
              </CardHeader>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-midnight uppercase tracking-wider mb-3">
                    High-Frequency Technical Questions:
                  </h4>
                  <div className="space-y-2.5">
                    {analysis.interview_prep.technical_questions?.map((q, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <p className="font-semibold text-midnight">{idx + 1}. {q}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-midnight uppercase tracking-wider mb-3">
                    Strategic AI Tips for Your Interview:
                  </h4>
                  <div className="space-y-2.5">
                    {analysis.interview_prep.ai_tips?.map((tip, idx) => (
                      <div key={idx} className="p-3 bg-mint/30 rounded-xl border border-teal/20 text-xs flex items-start gap-2">
                        <Sparkles size={14} className="text-teal flex-shrink-0 mt-0.5" />
                        <p className="text-midnight font-medium">{tip}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-midnight text-white rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-heading font-bold text-sm">Ready to Apply?</p>
                      <p className="text-xs text-slate-300">Discover active internships matching your skills.</p>
                    </div>
                    <Link
                      to="/student/opportunities"
                      className="px-4 py-2 bg-coral hover:bg-coral-dark text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
                    >
                      Browse Jobs <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Empty State: Shown when no resume has been uploaded yet */}
      {!analyzing && !analysis && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-coral/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl mx-auto space-y-5 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-mint/60 border border-teal/20 text-teal flex items-center justify-center mx-auto shadow-sm">
              <UploadCloud size={32} />
            </div>

            <div>
              <h3 className="font-heading font-extrabold text-2xl text-midnight tracking-tight">
                No Resume Analyzed Yet
              </h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Upload your CV above or paste technical skills to calculate your real role readiness score, identify exact competency gaps, and unlock live YouTube learning masterclasses.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid sm:grid-cols-3 gap-3 pt-2 text-left">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <CheckCircle size={16} className="text-teal flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs text-midnight">Real Competencies</p>
                  <p className="text-[11px] text-slate-500">Extracts 30+ tools and languages.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Sparkles size={16} className="text-golden flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs text-midnight">Skill Equivalence</p>
                  <p className="text-[11px] text-slate-500">Auto-maps MySQL, Node, REST.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <PlayCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs text-midnight">Live Video Roadmaps</p>
                  <p className="text-[11px] text-slate-500">RapidAPI YouTube integration.</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-midnight font-heading font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud size={16} /> Upload Resume (PDF / DOCX)
              </button>
              <button
                onClick={() => loadSample('fullstack')}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={15} /> Try Full-Stack Sample Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive YouTube Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-midnight/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight rounded-3xl border border-slate-700 max-w-4xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 text-white">
              <div className="flex items-center gap-3 pr-4 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white flex-shrink-0">
                  <Play size={16} className="ml-0.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-white truncate">
                    {selectedVideo.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium truncate">
                    {selectedVideo.author} • {selectedVideo.duration_text} • {selectedVideo.views}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={selectedVideo.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink size={13} /> Open on YouTube
                </a>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Responsive 16:9 Video Embed */}
            <div className="relative aspect-video w-full bg-black">
              {selectedVideo.embed_url ? (
                <iframe
                  src={`${selectedVideo.embed_url}?autoplay=1&rel=0`}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-white space-y-4">
                  <p className="text-sm text-slate-300">Click below to watch this masterclass directly on YouTube:</p>
                  <a
                    href={selectedVideo.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-sm text-white shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
                  >
                    <Play size={16} /> Watch on YouTube
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
