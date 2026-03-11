import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import Spline from '@splinetool/react-spline'

export default function Landing() {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const features = [
    { icon: 'summarize', title: 'Instant Summaries', desc: 'Turn 100 pages of dense reading into 1 concise page of key points in seconds.' },
    { icon: 'forum', title: '24/7 AI Tutor', desc: 'Stuck on a problem at 2 AM? Ask our AI and get step-by-step explanations instantly.' },
    { icon: 'quiz', title: 'Smart Quizzes', desc: 'Test your knowledge before the real exam with auto-generated tests from your materials.' },
  ]

  return (
    <div className="bg-background-dark min-h-screen relative">
      {/* Snowfall removed */}
      
      {/* Navigation */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="flex justify-center w-full pt-4 px-4">
          <div className="flex w-full max-w-[960px] bg-surface-dark/80 backdrop-blur-md border border-border-dark rounded-full px-6 py-3 items-center justify-between shadow-lg">
            <Link to="/" className="flex items-center gap-3 text-white group">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="size-8 flex items-center justify-center rounded-full bg-primary/20 text-primary transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">school</span>
              </motion.div>
              <h2 className="text-lg font-bold leading-tight tracking-tight">Edu Buddy AI</h2>
            </Link>
            <nav className="hidden md:flex flex-1 justify-center gap-8">
              <a href="#features" className="text-text-secondary hover:text-primary text-sm font-medium transition-colors">Features</a>
              <Link to="/how-it-works" className="text-text-secondary hover:text-primary text-sm font-medium transition-colors">How it works</Link>
              <Link to="/about" className="text-text-secondary hover:text-primary text-sm font-medium transition-colors">About</Link>
            </nav>
            <div className="flex items-center gap-3">
              <SignedOut>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <SignInButton mode="modal">
                    <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 px-5 bg-primary hover:bg-primary-hover text-background-dark text-sm font-bold transition-all">
                      Get Started
                    </button>
                  </SignInButton>
                </motion.div>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard" className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 px-5 bg-surface-dark hover:bg-border-dark text-white text-sm font-bold transition-all mr-2">
                  Dashboard
                </Link>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 pt-32 pb-20">
        <div className="max-w-[1100px] mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col flex-1 gap-8 text-center lg:text-left items-center lg:items-start z-10"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              v2.0 is live
            </motion.div>
            <div className="flex flex-col gap-4">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white"
              >
                Master Any Subject with <span className="text-primary">Edu Buddy AI</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-[600px]"
              >
                Your personal AI tutor. Upload your syllabus and get instant summaries, interactive quizzes, and 24/7 personalized explanations.
              </motion.p>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 w-full"
            >
              <SignedOut>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <SignInButton mode="modal">
                    <button className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-primary hover:bg-primary-hover text-background-dark text-base font-bold transition-all shadow-[0_0_20px_rgba(54,226,123,0.3)]">
                      Get Started Free
                    </button>
                  </SignInButton>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/chat" className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-surface-dark hover:bg-border-dark text-white border border-border-dark text-base font-bold transition-all">
                    Try AI Chat
                  </Link>
                </motion.div>
              </SignedOut>
              <SignedIn>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/dashboard" className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-primary hover:bg-primary-hover text-background-dark text-base font-bold transition-all shadow-[0_0_20px_rgba(54,226,123,0.3)]">
                    Go to Dashboard
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/chat" className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-surface-dark hover:bg-border-dark text-white border border-border-dark text-base font-bold transition-all">
                    AI Chat
                  </Link>
                </motion.div>
              </SignedIn>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Spline 3D */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 w-full max-w-[700px] relative"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none"
            />
            <div className="relative w-full h-[500px] md:h-[550px] lg:h-[600px]">
              <Spline scene="https://prod.spline.design/SaP4Fkytgc6PiEsd/scene.splinecode" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-8">
        <div className="max-w-[960px] mx-auto flex flex-col gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-[700px] mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Study Smarter, Not Harder</h2>
            <p className="text-text-secondary text-lg">Unlock your full potential with our AI-driven features designed to save you time and boost your GPA.</p>
          </motion.div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group flex flex-col p-6 rounded-2xl border border-border-dark bg-surface-dark hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
              >
                <motion.div 
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 transition-transform"
                >
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-8"
      >
        <div className="max-w-[960px] mx-auto">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="relative rounded-[2.5rem] overflow-hidden bg-primary px-8 py-16 md:px-20 md:py-24 text-center"
          >
            <div className="relative z-10 flex flex-col items-center gap-6">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black text-background-dark leading-tight max-w-[600px]"
              >
                Ready to ace your next exam?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-background-dark/80 text-lg md:text-xl font-medium max-w-[500px]"
              >
                Join thousands of students studying smarter with AI.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/dashboard" className="flex items-center justify-center rounded-full h-12 px-8 bg-background-dark text-white text-base font-bold transition-transform">
                    Start Learning
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/quiz" className="flex items-center justify-center rounded-full h-12 px-8 bg-white/20 backdrop-blur-sm border-2 border-background-dark/10 text-background-dark text-base font-bold hover:bg-white/30 transition-colors">
                    Take a Quiz
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-surface-dark border-t border-border-dark py-12 px-4 sm:px-8"
      >
        <div className="max-w-[960px] mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="flex flex-col gap-4 max-w-[300px]">
            <div className="flex items-center gap-2 text-white">
              <motion.span 
                whileHover={{ rotate: 15 }}
                className="material-symbols-outlined text-primary"
              >
                school
              </motion.span>
              <h2 className="text-lg font-bold">Edu Buddy AI</h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Empowering students worldwide with cutting-edge AI technology for better learning outcomes.
            </p>
          </div>
          <div className="flex flex-wrap gap-12 md:gap-24">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Product</h3>
              <a href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">Features</a>
              <a href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">Pricing</a>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Company</h3>
              <a href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">About Us</a>
              <a href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
        <div className="max-w-[960px] mx-auto mt-12 pt-8 border-t border-border-dark text-center">
          <p className="text-xs text-text-secondary/50">© 2024 Edu Buddy AI. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  )
}