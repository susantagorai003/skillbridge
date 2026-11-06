export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="font-heading font-extrabold text-4xl text-charcoal mb-6">About SkillBridge</h1>
        <div className="prose max-w-none text-sage-dark leading-relaxed space-y-6">
          <p className="text-lg">
            SkillBridge is an Academia–Industry Collaboration Portal that connects students, universities,
            faculty, training and placement officers (TPOs), and companies through intelligent skill mapping,
            skill gap analysis, internships, placements, industry projects and career recommendations.
          </p>
          <h2 className="font-heading font-bold text-2xl text-charcoal mt-10">Our Mission</h2>
          <p>To bridge the growing gap between academic education and industry requirements by providing
            data-driven insights, intelligent matching, and collaborative tools that benefit all stakeholders.</p>
          <h2 className="font-heading font-bold text-2xl text-charcoal mt-10">What Makes Us Different</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Comprehensive skill taxonomy with proficiency levels</li>
            <li>Explainable skill gap analysis with actionable recommendations</li>
            <li>Weighted, transparent job matching scores</li>
            <li>Industry–academia collaboration marketplace</li>
            <li>Real-time employability readiness analytics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
