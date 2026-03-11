import { Link } from 'react-router-dom'

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: 'upload_file',
      title: 'Upload Your Materials',
      description: 'Simply upload your lecture notes, textbooks, or any study material in PDF, DOCX, or TXT format. Our AI will analyze and understand the content instantly.'
    },
    {
      number: '02',
      icon: 'auto_awesome',
      title: 'AI Processes & Learns',
      description: 'Our advanced AI reads through your materials, identifies key concepts, important formulas, and creates a knowledge map tailored to your curriculum.'
    },
    {
      number: '03',
      icon: 'summarize',
      title: 'Get Smart Summaries',
      description: 'Receive concise, easy-to-understand summaries that highlight the most important points. No more reading 100 pages when 5 will do.'
    },
    {
      number: '04',
      icon: 'quiz',
      title: 'Practice with Quizzes',
      description: 'Test your knowledge with AI-generated quizzes based on your materials. Get instant feedback and explanations for every answer.'
    },
    {
      number: '05',
      icon: 'chat',
      title: 'Ask Questions Anytime',
      description: 'Stuck on a concept? Ask our AI tutor 24/7. Get step-by-step explanations, examples, and clarifications whenever you need them.'
    },
    {
      number: '06',
      icon: 'trending_up',
      title: 'Track Your Progress',
      description: 'Monitor your learning journey with detailed analytics. See your strengths, identify weak areas, and get personalized recommendations.'
    }
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
              <Link to="/how-it-works" className="text-primary text-sm font-medium">How it works</Link>
              <Link to="/about" className="text-text-secondary hover:text-primary text-sm font-medium transition-colors">About</Link>
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
            <span className="material-symbols-outlined text-sm">lightbulb</span>
            Simple & Effective
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white mb-6">
            How <span className="text-primary">Edu Buddy AI</span> Works
          </h1>
          <p className="text-text-secondary text-lg sm:text-xl max-w-[700px] mx-auto">
            Transform your study routine in 6 simple steps. Our AI-powered platform makes learning faster, smarter, and more effective.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-[960px] mx-auto">
          <div className="grid gap-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex flex-col md:flex-row gap-6 md:gap-12 items-start ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-shrink-0 w-full md:w-1/3">
                  <div className="relative">
                    <div className="absolute -top-4 -left-4 text-8xl font-black text-primary/10">{step.number}</div>
                    <div className="relative bg-surface-dark border border-border-dark rounded-2xl p-8 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-4xl">{step.icon}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-text-secondary text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-[960px] mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-primary px-8 py-16 md:px-20 md:py-20 text-center">
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className="text-3xl sm:text-4xl font-black text-background-dark leading-tight max-w-[500px]">
                Ready to transform your learning?
              </h2>
              <p className="text-background-dark/80 text-lg max-w-[400px]">
                Start using Edu Buddy AI today and see the difference.
              </p>
              <Link to="/dashboard" className="flex items-center justify-center rounded-full h-12 px-8 bg-background-dark text-white text-base font-bold hover:scale-105 transition-transform">
                Get Started Free
              </Link>
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
