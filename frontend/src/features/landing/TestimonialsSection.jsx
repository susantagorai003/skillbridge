import useScrollAnimation from '../../hooks/useScrollAnimation'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Patel', role: 'Computer Science Student', type: 'Student',
    quote: 'SkillBridge helped me understand exactly which skills I needed for my dream role. The gap analysis was eye-opening!',
    rating: 5, demo: true,
  },
  {
    name: 'Amit Kumar', role: 'HR Manager, TechCorp', type: 'Recruiter',
    quote: 'We reduced our hiring time by 40% using skill-based matching. The candidate quality has improved significantly.',
    rating: 5, demo: true,
  },
  {
    name: 'Dr. Sharma', role: 'Professor, IIT Delhi', type: 'University',
    quote: 'The curriculum-to-industry mapping gave us actionable insights to modernize our programme structure.',
    rating: 5, demo: true,
  },
]

export default function TestimonialsSection() {
  const ref = useScrollAnimation({ animation: 'fadeInUp' })

  return (
    <section className="py-24 bg-ivory">
      <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16" data-animate>
          <p className="text-terracotta font-semibold text-sm uppercase tracking-wider mb-3">Testimonials</p>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-charcoal mb-4">
            Trusted by Students, Companies & Universities
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} data-animate className="bg-white rounded-2xl p-6 border border-warm-border hover:shadow-lg transition-all">
              <Quote size={24} className="text-terracotta/30 mb-4" />
              <p className="text-sage-dark text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-terracotta fill-terracotta" />
                ))}
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-charcoal">{t.name}</p>
                <p className="text-xs text-sage-dark">{t.role}</p>
                {t.demo && <p className="text-[10px] text-sage-dark/40 mt-1">Demo testimonial</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
