import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useTracking } from '../context/TrackingContext'
import { useState } from 'react'

export default function Profile() {
  const { user, stats } = useApp()
  const { trackPageNavigation } = useTracking()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Track page navigation on mount
  useEffect(() => {
    trackPageNavigation('/profile', 'User Profile')
  }, [])
  
  console.log('Profile rendering', { user, stats })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  }

  const achievements = [
    { icon: 'local_fire_department', title: '7 Day Streak', desc: 'Study for 7 days in a row', unlocked: true },
    { icon: 'quiz', title: 'Quiz Master', desc: 'Score 90%+ on 5 quizzes', unlocked: true },
    { icon: 'school', title: 'Fast Learner', desc: 'Complete 10 topics', unlocked: false },
    { icon: 'emoji_events', title: 'Champion', desc: 'Reach top 10 leaderboard', unlocked: false },
  ]

  const recentActivity = [
    { icon: 'chat', action: 'Asked about Quantum Physics', time: '2 hours ago' },
    { icon: 'quiz', action: 'Completed Math Quiz - 85%', time: '5 hours ago' },
    { icon: 'description', action: 'Generated notes on Biology', time: '1 day ago' },
    { icon: 'school', action: 'Mastered Chemistry basics', time: '2 days ago' },
  ]

  return (
    <div className="flex h-screen w-full bg-background-dark">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex flex-col w-72 h-full border-r border-border-dark bg-surface-dark flex-shrink-0 z-20"
      >
        <div className="p-8 pb-4">
          <Link to="/" className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
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
            { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
            { to: '/chat', icon: 'chat_bubble', label: 'Chat Assistant' },
            { to: '/notes', icon: 'description', label: 'Smart Notes' },
            { to: '/quiz', icon: 'school', label: 'Quizzes' },
            { to: '/progress', icon: 'monitoring', label: 'Progress' },
            { to: '/profile', icon: 'person', label: 'Profile', active: true },
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
          className="sticky top-0 z-10 flex items-center justify-between border-b border-border-dark bg-background-dark/80 backdrop-blur-md px-6 py-4 lg:px-10"
        >
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-text-secondary hover:text-white transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h2 className="text-xl font-bold tracking-tight text-white">Profile</h2>
          </div>
          <Link to="/profile/edit" className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Profile
          </Link>
        </motion.header>

        {/* Content */}
        <div className="flex-1 px-4 py-8 md:px-8 lg:px-12 xl:px-20 max-w-[1200px] mx-auto w-full">
          {/* Profile Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 bg-surface-dark rounded-2xl border border-border-dark"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 rounded-full border-4 border-primary/30 bg-center bg-cover"
              style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDEL3hu_OTc9dAwueY4yfT7yfzcSELl6FNESZhGQijc-uXShgLuPB72nmoZiMtL-bMvRdPxYSQfWBGC70oWsiQAMGxSb7BGo-R5UoAfKq2M16YqAy3jv0zwyhfhpC2Q3kQ4YP-CSBqibcJDfD1Ozt_1daeigyXNw4tkCSOswtEhxn8Pse102F5j-jtLX4qbWoNHLDVO1rjSQWU9t9BqLRQMXbMyD7y65DZsEEpB2VIkzz-cB7Nrj_W6xHG9QCe2aA7ICi3mjkn-htU")'}}
            />
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold text-white">{user?.full_name || 'Demo Student'}</h1>
              <p className="text-text-secondary">{user?.email || 'student@edubuddy.ai'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Level 5</span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full">Science Track</span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm rounded-full">Premium</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{stats?.currentStreak || 7}</p>
                <p className="text-xs text-text-secondary">Day Streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.topicsMastered || 12}</p>
                <p className="text-xs text-text-secondary">Topics</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.avgQuizScore || 85}%</p>
                <p className="text-xs text-text-secondary">Avg Score</p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['overview', 'achievements', 'activity'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-primary text-background-dark font-semibold' 
                    : 'bg-surface-dark text-text-secondary hover:text-white'
                }`}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="bg-surface-dark rounded-2xl p-6 border border-border-dark">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    Personal Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Name</span>
                      <span className="text-white">{user?.full_name || 'Demo Student'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Email</span>
                      <span className="text-white">{user?.email || 'student@edubuddy.ai'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Member Since</span>
                      <span className="text-white">Dec 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Study Track</span>
                      <span className="text-white">Science & Math</span>
                    </div>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-surface-dark rounded-2xl p-6 border border-border-dark">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">insights</span>
                    Study Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Total Study Time</span>
                      <span className="text-white">{Math.floor((stats?.totalStudyMinutes || 1250) / 60)}h {(stats?.totalStudyMinutes || 1250) % 60}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Quizzes Completed</span>
                      <span className="text-white">{stats?.quizzesCompleted || 24}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Notes Generated</span>
                      <span className="text-white">{stats?.notesGenerated || 18}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">AI Chats</span>
                      <span className="text-white">{stats?.chatSessions || 45}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl border ${
                      achievement.unlocked 
                        ? 'bg-surface-dark border-primary/30' 
                        : 'bg-surface-dark/50 border-border-dark opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.unlocked ? 'bg-primary/20 text-primary' : 'bg-gray-700 text-gray-500'
                      }`}>
                        <span className="material-symbols-outlined">{achievement.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{achievement.title}</h4>
                        <p className="text-sm text-text-secondary">{achievement.desc}</p>
                      </div>
                      {achievement.unlocked && (
                        <span className="material-symbols-outlined text-primary ml-auto">verified</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-surface-dark rounded-2xl border border-border-dark">
                {recentActivity.map((activity, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className={`flex items-center gap-4 p-4 ${i !== recentActivity.length - 1 ? 'border-b border-border-dark' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-sm">{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{activity.action}</p>
                      <p className="text-sm text-text-secondary">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
