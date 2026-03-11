import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useTracking } from '../context/TrackingContext'

export default function Dashboard() {
  const { user, stats } = useApp()
  const { trackPageNavigation } = useTracking()

  // Track page navigation on mount
  useEffect(() => {
    trackPageNavigation('/dashboard', 'Dashboard')
  }, [])

  const formatStudyTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  }

  const sidebarVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  }

  const statsData = [
    { label: 'Study Time', value: formatStudyTime(stats.totalStudyMinutes), icon: 'schedule', trend: '+12%' },
    { label: 'Avg Quiz Score', value: `${stats.avgQuizScore}%`, icon: 'quiz', trend: '+5%' },
    { label: 'Topics Mastered', value: `${stats.topicsMastered}/${stats.totalTopics}`, icon: 'verified', trend: '+2 new' },
    { label: 'Current Streak', value: `${stats.currentStreak} Days`, icon: 'whatshot', trend: 'Keep it up!' },
  ]

  const actionsData = [
    { icon: 'smart_toy', title: 'Ask Edu Buddy', desc: 'Get instant answers to complex questions with AI.', link: '/chat' },
    { icon: 'auto_awesome', title: 'Generate Notes', desc: 'Upload a PDF or paste text to summarize instantly.', link: '/notes' },
    { icon: 'quiz', title: 'Take Quiz', desc: 'Test your knowledge on your recent study topics.', link: '/quiz' },
    { icon: 'donut_large', title: 'View Progress', desc: 'Track your study hours and improvement scores.', link: '/progress' },
  ]

  return (
    <div className="flex h-screen w-full bg-background-dark">
      {/* Sidebar */}
      <motion.aside 
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className="hidden md:flex flex-col w-72 h-full border-r border-border-dark bg-surface-dark flex-shrink-0 z-20"
      >
        <div className="p-8 pb-4">
          <Link to="/" className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-background-dark shadow-[0_0_15px_rgba(54,226,123,0.4)]"
            >
              <span className="material-symbols-outlined text-3xl">smart_toy</span>
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-white">Edu Buddy AI</span>
          </Link>
        </div>
        <nav className="px-4 py-6 flex-1 flex flex-col gap-2">
          <p className="px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Menu</p>
          {[
            { to: '/dashboard', icon: 'dashboard', label: 'Dashboard', active: true },
            { to: '/chat', icon: 'chat_bubble', label: 'Chat Assistant' },
            { to: '/schedule', icon: 'event', label: 'Schedule' },
            { to: '/notes', icon: 'description', label: 'Smart Notes' },
            { to: '/quiz', icon: 'school', label: 'Quizzes' },
            { to: '/progress', icon: 'monitoring', label: 'Progress' },
            { to: '/profile', icon: 'person', label: 'Profile' },
          ].map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <Link 
                to={item.to} 
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                  item.active 
                    ? 'bg-primary/10 border-r-4 border-primary text-primary' 
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-10 flex items-center justify-between border-b border-border-dark bg-background-dark/80 backdrop-blur-md px-6 py-4 lg:px-10"
        >
          <h2 className="text-xl font-bold tracking-tight text-white">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}
          </h2>
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:bg-white/5 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">notifications</span>
            </motion.button>
            <Link to="/profile">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 border-2 border-primary/20 cursor-pointer" 
                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDEL3hu_OTc9dAwueY4yfT7yfzcSELl6FNESZhGQijc-uXShgLuPB72nmoZiMtL-bMvRdPxYSQfWBGC70oWsiQAMGxSb7BGo-R5UoAfKq2M16YqAy3jv0zwyhfhpC2Q3kQ4YP-CSBqibcJDfD1Ozt_1daeigyXNw4tkCSOswtEhxn8Pse102F5j-jtLX4qbWoNHLDVO1rjSQWU9t9BqLRQMXbMyD7y65DZsEEpB2VIkzz-cB7Nrj_W6xHG9QCe2aA7ICi3mjkn-htU")'}}
              />
            </Link>
          </div>
        </motion.header>

        {/* Content */}
        <div className="flex-1 px-4 py-8 md:px-8 lg:px-12 xl:px-20 max-w-[1600px] mx-auto w-full">
          {/* Title Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
          >
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black tracking-tight text-white">Your Learning Journey</h1>
              <p className="text-text-secondary text-base max-w-xl">
                Track your progress, analyze your strengths, and let AI guide your next steps towards mastery.
              </p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4"
          >
            {statsData.map((stat, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative flex flex-col gap-1 rounded-2xl p-6 bg-surface-dark border border-border-dark hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                  <motion.span 
                    whileHover={{ rotate: 15 }}
                    className="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors"
                  >
                    {stat.icon}
                  </motion.span>
                </div>
                <div className="flex items-end gap-3 mt-2">
                  <motion.p 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
                    className="text-3xl font-bold text-white"
                  >
                    {stat.value}
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-md mb-1"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                    {stat.trend}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-8"
          >
            {actionsData.map((action, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link 
                  to={action.link}
                  className="group relative bg-surface-dark rounded-xl p-6 border border-border-dark hover:border-primary/50 transition-all cursor-pointer overflow-hidden block h-full"
                >
                  <motion.div 
                    className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"
                    whileHover={{ scale: 1.5, opacity: 0.3 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                    <motion.div 
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"
                    >
                      <span className="material-symbols-outlined text-2xl">{action.icon}</span>
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">{action.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
