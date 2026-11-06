import { Link } from 'react-router-dom'
import { Github, Linkedin, Twitter, Mail, MapPin, Sparkles } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'How It Works', href: '/#workflow' },
    { label: 'Skill Gap Engine', href: '/student/skill-gap' },
    { label: 'Active Opportunities', href: '/#opportunities' },
    { label: 'About Us', href: '/about' },
  ],
  Students: [
    { label: 'AI CV Analyzer', href: '/student/skill-gap' },
    { label: 'Learning Roadmaps', href: '/student/skill-gap' },
    { label: 'Browse Internships', href: '/student/opportunities' },
    { label: 'Skill Verification', href: '/student/skills' },
  ],
  Recruiters: [
    { label: 'Post Internship / Job', href: '/company/post' },
    { label: 'Candidate Matcher', href: '/company/candidates' },
    { label: 'Hiring Pipeline', href: '/company/applications' },
    { label: 'Recruitment Analytics', href: '/company' },
  ],
  Universities: [
    { label: 'Curriculum Alignment', href: '/faculty' },
    { label: 'Placement Drives', href: '/tpo' },
    { label: 'Cohort Competencies', href: '/faculty/students' },
    { label: 'Placement Reports', href: '/tpo/analytics' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-midnight text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal to-mint flex items-center justify-center text-midnight font-heading font-black text-lg">
                S
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                Skill<span className="text-teal">Bridge</span>
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              Connecting academic talent, universities, and industry hiring teams through AI-powered skill mapping, personalized learning roadmaps, and intelligent recruitment.
            </p>

            <div className="flex gap-2">
              {[
                { icon: Github, href: 'https://github.com' },
                { icon: Linkedin, href: 'https://linkedin.com' },
                { icon: Twitter, href: 'https://twitter.com' },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-midnight-light border border-slate-800 flex items-center justify-center text-slate-300 hover:text-teal hover:border-teal/50 transition-colors"
                >
                  <item.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-bold text-sm text-white mb-4 uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-slate-400 hover:text-teal transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Powered by PyMongo & Django REST</span>
            <span className="flex items-center gap-1 text-teal">
              <Sparkles size={12} /> AI Competency Engine
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
