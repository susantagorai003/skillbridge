import { useState, useEffect } from 'react'
import {
  User, Upload, FileText, CheckCircle, Sparkles, ExternalLink,
  GraduationCap, BookOpen, Save, Github, Linkedin, Phone, MessageSquare, Bell
} from 'lucide-react'
import api from '../../services/api'
import useAuth from '../../hooks/useAuth'
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'

export default function StudentProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    degree: 'B.Tech',
    semester: 6,
    cgpa: 8.5,
    phone: '',
    github: '',
    linkedin: '',
    career_interests: ['Full Stack Developer'],
    bio: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [resumeAnalysis, setResumeAnalysis] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    api.get('/students/profile/')
      .then((res) => {
        if (res.data.profile) {
          setProfile((prev) => ({ ...prev, ...res.data.profile }))
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)
    try {
      await api.put('/students/profile/', profile)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('resume', file)

    try {
      const res = await api.post('/students/resume/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResumeAnalysis(res.data.analysis)
      alert('Resume parsed successfully! Review the extracted skills below.')
    } catch (err) {
      alert('Failed to analyze resume')
    } finally {
      setUploading(false)
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
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/student' }, { label: 'Profile & Resume' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
            Student Profile & Portfolio
          </h1>
          <p className="text-sage-dark text-sm mt-1">
            Complete your academic information and upload your resume for automated skill extraction.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic & Personal Details</CardTitle>
              <CardDescription>Keeps placement coordinators and recruiters informed</CardDescription>
            </CardHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={user?.name || ''}
                  disabled
                  className="bg-ivory"
                />
                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  className="bg-ivory"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input
                  label="Degree Programme"
                  value={profile.degree || ''}
                  onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                  placeholder="e.g. B.Tech"
                />
                <Input
                  label="Current Semester"
                  type="number"
                  min="1"
                  max="10"
                  value={profile.semester || 1}
                  onChange={(e) => setProfile({ ...profile, semester: Number(e.target.value) })}
                />
                <Input
                  label="Cumulative CGPA"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={profile.cgpa || 0}
                  onChange={(e) => setProfile({ ...profile, cgpa: Number(e.target.value) })}
                />
              </div>

              <div>
                <Input
                  label="Contact Phone / WhatsApp Number *"
                  icon={Phone}
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91-9876543210"
                />
                <div className="mt-1.5 p-2 bg-emerald-50/70 border border-emerald-100 rounded-lg flex items-start gap-2 text-[11px] text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse"></span>
                  <p>
                    <strong>WhatsApp & SMS Alerts Active:</strong> Providing your phone number ensures you receive immediate WhatsApp alerts and email notices as soon as the TPO announces visiting campus placement drives, company interview rounds, and training bootcamps.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="GitHub URL"
                  icon={Github}
                  value={profile.github || ''}
                  onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  placeholder="https://github.com/..."
                />
                <Input
                  label="LinkedIn Profile"
                  icon={Linkedin}
                  value={profile.linkedin || ''}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Professional Bio / About</label>
                <textarea
                  rows={3}
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Share a short bio highlighting your areas of interest and accomplishments..."
                  className="w-full p-2.5 text-xs bg-white border border-warm-border rounded-lg focus:outline-none focus:border-sage resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccess ? (
                  <span className="text-xs font-bold text-forest flex items-center gap-1">
                    <CheckCircle size={14} /> Profile updated successfully!
                  </span>
                ) : <span />}
                <Button type="submit" loading={saving} icon={Save}>
                  Save Profile
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* AI Resume Upload & Extraction */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={18} className="text-terracotta" /> AI Resume Analyzer
              </CardTitle>
              <CardDescription>Upload a PDF resume to extract skills with PyMuPDF</CardDescription>
            </CardHeader>

            <div className="border-2 border-dashed border-warm-border hover:border-terracotta rounded-xl p-6 text-center transition-colors">
              <Upload size={32} className="mx-auto text-sage-dark mb-2" />
              <p className="text-xs font-bold text-charcoal mb-1">Click to upload your resume</p>
              <p className="text-[11px] text-sage-dark mb-3">Accepts .PDF (max 10MB)</p>
              <input
                type="file"
                accept=".pdf"
                id="resume-file"
                className="hidden"
                onChange={handleResumeUpload}
              />
              <label htmlFor="resume-file" className="cursor-pointer">
                <Button size="sm" type="button" loading={uploading} className="pointer-events-none">
                  Choose PDF File
                </Button>
              </label>
            </div>

            {profile.resume_url && (
              <div className="mt-4 p-3 bg-ivory rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold text-charcoal truncate">Current Resume on file</span>
                <a
                  href={`http://localhost:8000${profile.resume_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-terracotta font-bold flex items-center gap-1 hover:underline flex-shrink-0"
                >
                  View <ExternalLink size={12} />
                </a>
              </div>
            )}
          </Card>

          {/* Extracted Skills Panel */}
          {resumeAnalysis && (
            <Card className="bg-ivory border-sage/40">
              <h4 className="text-xs font-bold text-forest uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle size={14} className="text-forest" /> Extracted Skills
              </h4>
              <p className="text-[11px] text-sage-dark mb-3">
                {resumeAnalysis.note || 'Unverified skills extracted automatically:'}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(resumeAnalysis.extracted_skills || []).map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-white text-forest text-xs font-semibold rounded border border-warm-border">
                    {s}
                  </span>
                ))}
              </div>

              {resumeAnalysis.education?.length > 0 && (
                <div className="pt-2 border-t border-warm-border text-xs">
                  <span className="font-bold text-charcoal">Education Detected: </span>
                  <span className="text-sage-dark">{resumeAnalysis.education[0]}</span>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
