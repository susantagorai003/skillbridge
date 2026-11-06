import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Plus, Trash2, CheckCircle, Save, Sparkles, Zap } from 'lucide-react'
import api from '../../services/api'
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'

export default function PostOpportunity() {
  const navigate = useNavigate()
  const [skillsList, setSkillsList] = useState([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    type: 'internship',
    description: '',
    location: 'Bangalore, Karnataka',
    work_mode: 'hybrid',
    duration: '6 months',
    salary_min: 15000,
    salary_max: 25000,
    salary_type: 'monthly',
    min_cgpa: 7.0,
    deadline: '2026-12-31T23:59:00Z',
    required_skills: [],
  })

  // Selected skill to add
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [selectedProficiency, setSelectedProficiency] = useState(2)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [aiNotice, setAiNotice] = useState('')

  useEffect(() => {
    api.get('/skills/?page_size=100')
      .then((res) => setSkillsList(res.data.items || []))
      .catch((err) => console.error(err))
  }, [])

  const handleAIGenerate = async () => {
    const titleToUse = form.title.trim() || 'Full Stack Web Developer'
    setGeneratingAI(true)
    setAiNotice('')
    try {
      const res = await api.post('/opportunities/ai-generate/', { title: titleToUse })
      if (res.data?.success) {
        const d = res.data
        const generatedSkills = (d.skills || []).map((sk, idx) => ({
          skill_id: `skill-gen-${idx}`,
          skill_name: sk.name,
          proficiency: sk.proficiency || 2,
        }))

        setForm((prev) => ({
          ...prev,
          title: d.title || prev.title,
          description: d.description || prev.description,
          type: d.type || prev.type,
          work_mode: d.work_mode || prev.work_mode,
          location: d.location || prev.location,
          duration: d.duration || prev.duration,
          salary_min: d.salary_min || prev.salary_min,
          salary_max: d.salary_max || prev.salary_max,
          required_skills: generatedSkills.length > 0 ? generatedSkills : prev.required_skills,
        }))
        setAiNotice(`⚡ Successfully generated job description & ${generatedSkills.length} required competencies for "${d.title}"!`)
        setTimeout(() => setAiNotice(''), 5000)
      }
    } catch (err) {
      alert('Failed to generate AI job description.')
    } finally {
      setGeneratingAI(false)
    }
  }

  const handleAddSkill = () => {
    if (!selectedSkillId) return
    const skillObj = skillsList.find((s) => s.id === selectedSkillId)
    if (!skillObj) return

    if (form.required_skills.some((s) => s.skill_id === selectedSkillId)) {
      alert('Skill already added')
      return
    }

    setForm({
      ...form,
      required_skills: [
        ...form.required_skills,
        {
          skill_id: selectedSkillId,
          skill_name: skillObj.name,
          proficiency: Number(selectedProficiency),
        },
      ],
    })
    setSelectedSkillId('')
  }

  const handleRemoveSkill = (skillId) => {
    setForm({
      ...form,
      required_skills: form.required_skills.filter((s) => s.skill_id !== skillId),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description) {
      alert('Please fill out the title and description')
      return
    }

    setLoading(true)
    try {
      await api.post('/opportunities/', form)
      alert('Opportunity published successfully!')
      navigate('/company')
    } catch (err) {
      alert(err.response?.data?.errors?.detail || 'Failed to post opportunity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/company' }, { label: 'Post Opportunity' }]} />

      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
          Publish New Opportunity
        </h1>
        <p className="text-sage-dark text-sm mt-1">
          Define mandatory competencies, stipend and academic eligibility for candidates.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {aiNotice && (
            <div className="p-3 bg-teal/15 border border-teal/40 text-midnight rounded-xl text-xs font-semibold flex items-center gap-2">
              <Zap size={14} className="text-teal" />
              <span>{aiNotice}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-charcoal">Opportunity Title *</label>
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={generatingAI}
                className="text-xs font-bold text-teal hover:text-teal-dark flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal/10 hover:bg-teal/20 transition-all cursor-pointer"
                title="Automatically draft job description & competencies"
              >
                <Sparkles size={13} className={generatingAI ? 'animate-spin' : ''} />
                {generatingAI ? 'Generating...' : '⚡ AI Smart Generate Description & Skills'}
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Full Stack Developer, Python Backend, React Engineer..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-warm-border rounded-lg focus:outline-none focus:border-sage"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">Opportunity Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-warm-border rounded-lg focus:outline-none focus:border-sage"
              >
                <option value="internship">Internship</option>
                <option value="full_time">Full-time Job</option>
                <option value="contract">Industry Project</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">Work Mode</label>
              <select
                value={form.work_mode}
                onChange={(e) => setForm({ ...form, work_mode: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-warm-border rounded-lg focus:outline-none focus:border-sage"
              >
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            <Input
              label="Location"
              placeholder="e.g. Bangalore, Karnataka"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Min Stipend / Salary (₹)"
              type="number"
              value={form.salary_min}
              onChange={(e) => setForm({ ...form, salary_min: Number(e.target.value) })}
            />
            <Input
              label="Max Stipend / Salary (₹)"
              type="number"
              value={form.salary_max}
              onChange={(e) => setForm({ ...form, salary_max: Number(e.target.value) })}
            />
            <Input
              label="Minimum CGPA Requirement"
              type="number"
              step="0.1"
              value={form.min_cgpa}
              onChange={(e) => setForm({ ...form, min_cgpa: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">Job Description & Responsibilities *</label>
            <textarea
              rows={4}
              required
              placeholder="Outline role responsibilities, deliverables, and team context..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 text-xs bg-white border border-warm-border rounded-lg focus:outline-none focus:border-sage resize-none"
            />
          </div>

          {/* Skill Requirements Engine */}
          <div className="p-4 bg-ivory rounded-xl border border-warm-border space-y-3">
            <label className="block text-xs font-bold text-forest uppercase tracking-wider">
              Mandatory Skill Requirements & Benchmarks
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-warm-border rounded-lg focus:outline-none"
              >
                <option value="">-- Select a skill from taxonomy --</option>
                {skillsList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                value={selectedProficiency}
                onChange={(e) => setSelectedProficiency(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-warm-border rounded-lg focus:outline-none"
              >
                <option value={1}>Level 1: Beginner</option>
                <option value={2}>Level 2: Intermediate</option>
                <option value={3}>Level 3: Advanced</option>
                <option value={4}>Level 4: Expert</option>
              </select>

              <Button type="button" size="sm" onClick={handleAddSkill} icon={Plus}>
                Add Skill
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {form.required_skills.map((s) => (
                <span
                  key={s.skill_id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-forest text-xs font-semibold rounded-lg border border-warm-border"
                >
                  {s.skill_name || 'Skill'} (Level {s.proficiency})
                  <button type="button" onClick={() => handleRemoveSkill(s.skill_id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
              {form.required_skills.length === 0 && (
                <p className="text-xs text-sage-dark italic">No skills specified yet. Add at least 1-2 skills for candidate matching.</p>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/company')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} icon={Save}>
              Publish Opportunity
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
