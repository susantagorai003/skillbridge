import { useState, useEffect } from 'react'
import { Plus, Trash2, Award, Zap, CheckCircle2, Search } from 'lucide-react'
import api from '../../services/api'
import Card from '../../components/common/Card'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'

export default function SkillsPage() {
  const [skills, setSkills] = useState([])
  const [allSkills, setAllSkills] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [assessModalOpen, setAssessModalOpen] = useState(false)
  const [selectedAssessSkill, setSelectedAssessSkill] = useState(null)
  const [assessResult, setAssessResult] = useState(null)
  const [assessStep, setAssessStep] = useState('quiz') // 'quiz' or 'result'
  const [answers, setAnswers] = useState({})

  // Form state
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [selectedProficiency, setSelectedProficiency] = useState(2)
  const [submitting, setSubmitting] = useState(false)
  const [searchTaxonomy, setSearchTaxonomy] = useState('')

  const fetchSkills = () => {
    Promise.all([
      api.get('/students/skills/'),
      api.get('/skills/?page_size=100'),
      api.get('/skills/categories/'),
    ])
      .then(([studentSkillsRes, allSkillsRes, catsRes]) => {
        setSkills(studentSkillsRes.data.skills || [])
        setAllSkills(allSkillsRes.data.items || [])
        setCategories(catsRes.data.categories || [])
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!selectedSkillId) return
    setSubmitting(true)
    try {
      await api.post('/students/skills/', {
        skill_id: selectedSkillId,
        proficiency_level: Number(selectedProficiency),
      })
      setModalOpen(false)
      setSelectedSkillId('')
      fetchSkills()
    } catch (err) {
      alert(err.response?.data?.errors?.detail || 'Failed to add skill')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to remove this skill?')) return
    try {
      await api.delete(`/students/skills/${skillId}/`)
      setSkills(skills.filter((s) => s.skill_id !== skillId))
    } catch (err) {
      console.error(err)
    }
  }

  const startAssessment = (skill) => {
    setSelectedAssessSkill(skill)
    setAssessStep('quiz')
    setAssessResult(null)
    setAnswers({})
    setAssessModalOpen(true)
  }

  const submitAssessment = async () => {
    try {
      const res = await api.post(`/assessments/demo_assess_1/submit/`, {
        skill_id: selectedAssessSkill?.skill_id,
        answers,
      })
      setAssessResult(res.data)
      setAssessStep('result')
      fetchSkills()
    } catch (err) {
      console.error(err)
    }
  }

  const proficiencyLabels = {
    1: { label: 'Beginner', color: 'info' },
    2: { label: 'Intermediate', color: 'default' },
    3: { label: 'Advanced', color: 'warning' },
    4: { label: 'Expert', color: 'success' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const filteredAllSkills = allSkills.filter((s) =>
    s.name.toLowerCase().includes(searchTaxonomy.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/student' }, { label: 'My Skills' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal">
            My Skills & Competencies
          </h1>
          <p className="text-sage-dark text-sm mt-1">
            Add your technical and domain proficiencies, complete verification assessments, and boost your job match score.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={Plus}>
          Add Skill
        </Button>
      </div>

      {/* Skills Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((item) => {
          const prof = proficiencyLabels[item.proficiency_level] || proficiencyLabels[1]
          return (
            <Card key={item.id || item.skill_id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-ivory flex items-center justify-center text-forest">
                      <Zap size={18} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-charcoal">
                        {item.skill_name || 'Skill'}
                      </h3>
                      <span className="text-[11px] text-sage-dark capitalize">
                        {item.source === 'assessment_verified' ? 'Verified by test' : 'Self-reported'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(item.skill_id)}
                    className="p-1.5 text-sage-dark hover:text-red-500 rounded transition-colors"
                    title="Remove skill"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-4 mb-2">
                  <Badge color={prof.color}>
                    Level {item.proficiency_level} - {prof.label}
                  </Badge>
                  {item.is_verified ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-forest bg-sage/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : (
                    <span className="text-[11px] text-sage-dark">Unverified</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-warm-border mt-4 flex items-center justify-between">
                <span className="text-xs text-sage-dark">
                  {item.is_verified ? 'Skill Certified' : 'Pass MCQ to verify'}
                </span>
                {!item.is_verified && (
                  <Button size="sm" variant="outline" onClick={() => startAssessment(item)}>
                    Verify Skill
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {skills.length === 0 && (
        <Card className="text-center py-12">
          <Zap size={36} className="mx-auto text-sage-dark mb-3" />
          <h3 className="font-heading font-bold text-lg text-charcoal mb-1">No skills added yet</h3>
          <p className="text-sm text-sage-dark max-w-sm mx-auto mb-4">
            Start building your profile by adding technical skills such as Python, JavaScript, React, or MongoDB.
          </p>
          <Button onClick={() => setModalOpen(true)} icon={Plus}>
            Add Your First Skill
          </Button>
        </Card>
      )}

      {/* Add Skill Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add a New Skill">
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Search & Select Skill
            </label>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-dark" />
              <input
                type="text"
                placeholder="Filter skill taxonomy..."
                value={searchTaxonomy}
                onChange={(e) => setSearchTaxonomy(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-ivory border border-warm-border rounded-lg focus:outline-none focus:border-sage"
              />
            </div>
            <select
              required
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-warm-border rounded-lg text-sm focus:outline-none focus:border-sage"
            >
              <option value="">-- Choose a skill --</option>
              {filteredAllSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Proficiency Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { level: 1, name: 'Beginner', desc: 'Basic knowledge & syntax' },
                { level: 2, name: 'Intermediate', desc: 'Can build real features' },
                { level: 3, name: 'Advanced', desc: 'Production-ready depth' },
                { level: 4, name: 'Expert', desc: 'Architecture & optimization' },
              ].map((p) => (
                <button
                  key={p.level}
                  type="button"
                  onClick={() => setSelectedProficiency(p.level)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedProficiency === p.level
                      ? 'border-terracotta bg-terracotta/5 text-charcoal font-semibold'
                      : 'border-warm-border hover:border-sage text-sage-dark'
                  }`}
                >
                  <p className="text-xs font-bold">Level {p.level}: {p.name}</p>
                  <p className="text-[10px] mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Add to Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assessment Modal */}
      <Modal
        isOpen={assessModalOpen}
        onClose={() => setAssessModalOpen(false)}
        title={`Verify Skill: ${selectedAssessSkill?.skill_name || 'Skill'}`}
      >
        {assessStep === 'quiz' ? (
          <div className="space-y-4">
            <p className="text-xs text-sage-dark">
              Answer the following technical MCQ assessment questions to earn a Verified badge on your profile.
            </p>

            <div className="space-y-3 bg-ivory p-4 rounded-xl border border-warm-border">
              <p className="text-sm font-semibold text-charcoal">
                1. Which HTTP method in RESTful design is idempotent and replaces a full document resource?
              </p>
              <div className="space-y-1.5 text-xs">
                {['PUT', 'POST', 'PATCH', 'CONNECT'].map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-warm-border cursor-pointer hover:bg-sage/10">
                    <input
                      type="radio"
                      name="q4"
                      checked={answers['4'] === i}
                      onChange={() => setAnswers({ ...answers, '4': i })}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 bg-ivory p-4 rounded-xl border border-warm-border">
              <p className="text-sm font-semibold text-charcoal">
                2. In MongoDB, which data structure format is used natively for document storage?
              </p>
              <div className="space-y-1.5 text-xs">
                {['BSON (Binary JSON)', 'XML Document Trees', 'Fixed SQL Tuple Records', 'Plain YAML'].map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-warm-border cursor-pointer hover:bg-sage/10">
                    <input
                      type="radio"
                      name="q1"
                      checked={answers['1'] === i}
                      onChange={() => setAnswers({ ...answers, '1': i })}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAssessModalOpen(false)}>Cancel</Button>
              <Button onClick={submitAssessment}>Submit Assessment</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-forest text-white flex items-center justify-center mx-auto text-2xl font-bold">
              {assessResult?.result?.score || 80}%
            </div>
            <h3 className="font-heading font-bold text-lg text-charcoal">
              {assessResult?.result?.passed ? 'Assessment Passed! 🎉' : 'Assessment Completed'}
            </h3>
            <p className="text-sm text-sage-dark max-w-sm mx-auto">
              {assessResult?.message || 'Your score has been recorded and your verified credential updated.'}
            </p>
            <Button onClick={() => setAssessModalOpen(false)}>Done</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
