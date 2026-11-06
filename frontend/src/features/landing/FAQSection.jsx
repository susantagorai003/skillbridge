import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

const faqs = [
  {
    q: 'How does the AI Skill Gap Engine parse and extract resume skills?',
    a: 'SkillBridge utilizes PyMuPDF and semantic natural language processing to extract technical skills, tools, frameworks, and programming languages from uploaded PDF/DOCX resumes. The extracted competencies are normalized against our industry-standard skills taxonomy.'
  },
  {
    q: 'Can I analyze my CV against custom or specific job descriptions?',
    a: 'Yes. In addition to our 12+ pre-configured industry career benchmarks (such as Full Stack, AI/ML, DevOps, and Data Science), you can paste any custom job description from LinkedIn or Indeed to calculate a direct role match percentage and prioritized missing skills.'
  },
  {
    q: 'How does the personalized learning roadmap work?',
    a: 'Based on the identified critical gaps, the engine structures an actionable multi-phase learning roadmap with estimated durations, hands-on project assignments, and documentation links. Students can mark off topics as they progress, synchronizing their achievements with the persistent MongoDB database.'
  },
  {
    q: 'How do recruiters and companies verify candidate skills?',
    a: 'Recruiters can evaluate candidate skill profiles backed by automated MCQ technical assessments, project capstone submissions, and academic endorsements from university faculty members.'
  },
  {
    q: 'How can universities and faculty benefit from the portal?',
    a: 'Faculty members and Training & Placement Officers (TPOs) gain department-wide visibility into cohort readiness, identify syllabus gaps against live recruiter demand, and organize targeted skill bootcamps before placement drives commence.'
  }
]

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <section className="py-24 bg-white border-t border-slate-200" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/15 border border-teal/30 text-teal text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle size={13} /> Common Inquiries
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-midnight tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Everything you need to know about AI skill mapping, resume parsing, and our collaboration workflows.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={idx}
                className="bg-offwhite rounded-2xl border border-slate-200/90 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-heading font-bold text-sm sm:text-base text-midnight">
                    {faq.q}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
