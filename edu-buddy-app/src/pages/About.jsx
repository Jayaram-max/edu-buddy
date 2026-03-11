import { Link } from 'react-router-dom'

export default function About() {
  const team = [
    { name: 'Sarah Chen', role: 'CEO & Co-Founder', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
    { name: 'Michael Park', role: 'CTO & Co-Founder', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
    { name: 'Emily Rodriguez', role: 'Head of AI', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
    { name: 'David Kim', role: 'Lead Engineer', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' }
  ]

  const stats = [
    { value: '50K+', label: 'Active Students' },
    { value: '1M+', label: 'Study Sessions' },
    { value: '95%', label: 'Satisfaction Rate' },
    { value: '200+', label: 'Universities' }
  ]

  return (
    <div className="bg-background-dark min-h-screen">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-center w-full pt-4 px-4">
          <div className="flex w-full max-w-[960px] bg-surface-dark/80 backdrop-blur-md border border-border-dark rounded-full px-6 py-3 items-center justify-between shadow-lg">
            <Link to="/" className="flex items-center gap-3 text-white group">
              <div className="size-8 flex items-center justify-center rounded-full bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-tight">Edu Buddy AI</h2>
            </Link>
            <nav className="hidden md:flex flex-1 justify-center gap-8">
              <Link to="/#features" className="text-text-secondary hover:text-primary text-sm font-medium transition-colors">Features</Link>
              <Link to="/how-it-works" className="text-text-secondary hover:text-primary text-sm font-medium transition-colors">How it works</Link>
              <Link to="/about" className="text-primary text-sm font-medium">About</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 px-5 bg-primary hover:bg-primary-hover text-background-dark text-sm font-bold transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-8">
        <div className="max-w-[960px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase mb-6">
            <span className="material-symbols-outlined text-sm">groups</span>
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white mb-6">
            About <span className="text-primary">Edu Buddy AI</span>
          </h1>
          <p className="text-text-secondary text-lg sm:text-xl max-w-[700px] mx-auto">
            We're on a mission to democratize education and make quality learning accessible to everyone through the power of artificial intelligence.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-[960px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-4">
                Education shouldn't be limited by access to expensive tutors or resources. We believe every student deserves a personal AI tutor that understands their unique learning style and helps them achieve their full potential.
              </p>
              <p className="text-text-secondary text-lg leading-relaxed">
                Founded in 2023, Edu Buddy AI combines cutting-edge artificial intelligence with proven educational methodologies to create a learning experience that's personalized, engaging, and effective.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
              <div className="relative bg-surface-dark border border-border-dark rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <p className="text-3xl font-black text-primary mb-1">{stat.value}</p>
                      <p className="text-text-secondary text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-8 bg-surface-dark/50">
        <div className="max-w-[960px] mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'diversity_3', title: 'Accessibility', desc: 'Making quality education available to everyone, regardless of background or location.' },
              { icon: 'psychology', title: 'Innovation', desc: 'Continuously pushing the boundaries of what AI can do for education.' },
              { icon: 'favorite', title: 'Student-First', desc: 'Every decision we make is guided by what\'s best for our students.' }
            ].map((value, index) => (
              <div key={index} className="bg-surface-dark border border-border-dark rounded-2xl p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl">{value.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                <p className="text-text-secondary">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-[960px] mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Meet Our Team</h2>
          <p className="text-text-secondary text-center mb-12 max-w-[500px] mx-auto">
            A passionate group of educators, engineers, and AI researchers dedicated to transforming education.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-border-dark group-hover:border-primary transition-colors">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-white font-bold">{member.name}</h3>
                <p className="text-text-secondary text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-[960px] mx-auto">
          <div className="bg-surface-dark border border-border-dark rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-text-secondary mb-6 max-w-[400px] mx-auto">
              Have questions or feedback? We'd love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:hello@edubuddy.ai" className="flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/30 rounded-full text-primary hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined">mail</span>
                hello@edubuddy.ai
              </a>
              <a href="#" className="flex items-center gap-2 px-6 py-3 bg-surface-dark border border-border-dark rounded-full text-text-secondary hover:text-white hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined">chat</span>
                Live Chat
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-dark border-t border-border-dark py-8 px-4 sm:px-8">
        <div className="max-w-[960px] mx-auto text-center">
          <p className="text-xs text-text-secondary/50">© 2024 Edu Buddy AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
