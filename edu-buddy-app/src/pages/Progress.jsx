import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useTracking } from '../context/TrackingContext'
import { useUser } from '@clerk/clerk-react'

export default function Progress() {
  const { stats, subjects } = useApp()
  const { trackPageNavigation, trackActivity } = useTracking()
  const { user } = useUser()
  const [realTimeStats, setRealTimeStats] = useState({
    todayStudyTime: 0,
    weeklyGoal: 300, // minutes
    currentStreak: 2,
    totalSessions: 0,
    averageSessionTime: 0,
    completedQuizzes: 0,
    averageQuizScore: 0,
    strongestSubject: null,
    weakestSubject: null,
    recentActivity: []
  })
  const [timeSpent, setTimeSpent] = useState(0)
  const [isStudying, setIsStudying] = useState(false)
  const [currentSession, setCurrentSession] = useState(null)

  // Track page navigation on mount
  useEffect(() => {
    trackPageNavigation('/progress', 'Learning Progress')
  }, [])

  // Real-time session tracking
  useEffect(() => {
    let interval = null
    if (isStudying) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1)
        setRealTimeStats(prev => ({
          ...prev,
          todayStudyTime: prev.todayStudyTime + (1/60) // Convert seconds to minutes
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStudying])

  // Load user progress data
  useEffect(() => {
    loadProgressData()
  }, [user])

  const loadProgressData = async () => {
    try {
      // Simulate loading real user data
      const mockData = {
        todayStudyTime: 45,
        weeklyGoal: 300,
        currentStreak: 7,
        totalSessions: 23,
        averageSessionTime: 28,
        completedQuizzes: 15,
        averageQuizScore: 87,
        strongestSubject: subjects.find(s => s.name === 'Mathematics'),
        weakestSubject: subjects.find(s => s.name === 'Physics'),
        recentActivity: [
          { id: 1, type: 'quiz', subject: 'Mathematics', score: 95, time: '2 hours ago', icon: 'quiz' },
          { id: 2, type: 'study', subject: 'Physics', duration: 25, time: '4 hours ago', icon: 'book' },
          { id: 3, type: 'chat', subject: 'Chemistry', messages: 12, time: '1 day ago', icon: 'chat' },
          { id: 4, type: 'quiz', subject: 'Biology', score: 78, time: '2 days ago', icon: 'quiz' },
          { id: 5, type: 'study', subject: 'History', duration: 35, time: '3 days ago', icon: 'book' }
        ]
      }
      setRealTimeStats(prev => ({ ...prev, ...mockData }))
    } catch (error) {
      console.error('Error loading progress data:', error)
    }
  }

  const startStudySession = (subject) => {
    setIsStudying(true)
    setTimeSpent(0)
    setCurrentSession({
      subject,
      startTime: new Date(),
      id: Date.now()
    })
    
    // Track study session started
    trackActivity('study_session_started', 'progress', {
      subject: subject.name
    })
  }

  const endStudySession = () => {
    if (currentSession) {
      const sessionDuration = Math.floor(timeSpent / 60) // Convert to minutes
      
      // Track study session ended
      trackActivity('study_session_ended', 'progress', {
        subject: currentSession.subject.name,
        duration_minutes: sessionDuration
      })
      
      setRealTimeStats(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        averageSessionTime: Math.round((prev.averageSessionTime * prev.totalSessions + sessionDuration) / (prev.totalSessions + 1)),
        recentActivity: [
          {
            id: Date.now(),
            type: 'study',
            subject: currentSession.subject.name,
            duration: sessionDuration,
            time: 'Just now',
            icon: 'book'
          },
          ...prev.recentActivity.slice(0, 4)
        ]
      }))
    }
    setIsStudying(false)
    setTimeSpent(0)
    setCurrentSession(null)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatStudyTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const weeklyProgress = (realTimeStats.todayStudyTime / realTimeStats.weeklyGoal) * 100

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

  return (
    <div className="bg-background-dark min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 flex items-center justify-between border-b border-border-dark bg-background-dark/80 backdrop-blur-md px-6 py-4 lg:px-10"
      >
        <Link to="/" className="flex items-center gap-4 text-white">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-background-dark shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-2xl font-bold">school</span>
          </motion.div>
          <h2 className="text-xl font-bold tracking-tight">Edu Buddy AI</h2>
        </Link>
        <nav className="hidden md:flex flex-1 justify-center gap-8">
          <Link to="/dashboard" className="text-text-secondary hover:text-white text-sm font-medium transition-colors">Dashboard</Link>
          <Link to="/chat" className="text-text-secondary hover:text-white text-sm font-medium transition-colors">Chat</Link>
          <Link to="/quiz" className="text-text-secondary hover:text-white text-sm font-medium transition-colors">Quiz</Link>
          <span className="text-white text-sm font-medium border-b-2 border-primary pb-0.5">Progress</span>
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium">{user?.fullName}</p>
            <p className="text-text-secondary text-xs">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <div 
            className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 border-2 border-primary/20"
            style={{ backgroundImage: `url("${user?.imageUrl}")` }}
          />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 md:px-8 lg:px-12 xl:px-20 max-w-[1600px] mx-auto w-full">
        {/* Title & Real-time Session */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black tracking-tight text-white">Your Learning Journey</h1>
            <p className="text-text-secondary text-base max-w-xl">Real-time progress tracking with AI-powered insights to optimize your learning.</p>
          </div>
          
          {/* Study Session Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!isStudying ? (
              <div className="flex gap-2">
                {subjects.slice(0, 3).map((subject) => (
                  <motion.button
                    key={subject.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startStudySession(subject)}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-white hover:border-primary/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ color: subject.color }}>
                      {subject.icon}
                    </span>
                    <span className="text-sm font-medium">Study {subject.name}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-4 px-6 py-3 bg-primary/10 border border-primary/30 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">Studying {currentSession?.subject.name}</span>
                </div>
                <div className="text-primary font-mono text-lg font-bold">
                  {formatTime(timeSpent)}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={endStudySession}
                  className="px-4 py-1 bg-primary hover:bg-primary-hover text-background-dark text-sm font-bold rounded-lg transition-colors"
                >
                  End Session
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Real-time Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group relative flex flex-col gap-1 rounded-2xl p-6 bg-surface-dark border border-border-dark hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Today's Study Time</p>
              <span className="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors">schedule</span>
            </div>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-3xl font-bold text-white">{formatStudyTime(realTimeStats.todayStudyTime)}</p>
              <div className="flex items-center text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-md mb-1">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                Live
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group relative flex flex-col gap-1 rounded-2xl p-6 bg-surface-dark border border-border-dark hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Weekly Goal</p>
              <span className="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors">flag</span>
            </div>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-3xl font-bold text-white">{Math.round(weeklyProgress)}%</p>
              <div className="flex items-center text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-md mb-1">
                {formatStudyTime(realTimeStats.todayStudyTime)} / {formatStudyTime(realTimeStats.weeklyGoal)}
              </div>
            </div>
            <div className="w-full h-2 bg-border-dark rounded-full mt-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group relative flex flex-col gap-1 rounded-2xl p-6 bg-surface-dark border border-border-dark hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Study Streak</p>
              <span className="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors">local_fire_department</span>
            </div>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-3xl font-bold text-white">{realTimeStats.currentStreak}</p>
              <div className="flex items-center text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-md mb-1">
                Days
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group relative flex flex-col gap-1 rounded-2xl p-6 bg-surface-dark border border-border-dark hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Avg Quiz Score</p>
              <span className="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors">quiz</span>
            </div>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-3xl font-bold text-white">{realTimeStats.averageQuizScore}%</p>
              <div className="flex items-center text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-md mb-1">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                +5%
              </div>
            </div>
          </motion.div>
        </motion.div>
        {/* Performance Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Study Pattern Chart */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="lg:col-span-2 rounded-2xl bg-surface-dark border border-border-dark p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Study Pattern</h3>
                <p className="text-sm text-text-secondary">Your learning activity over the past week</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-xs text-text-secondary">Study Time</span>
                </div>
              </div>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between h-40 gap-2">
              {[65, 45, 80, 30, 95, 70, realTimeStats.todayStudyTime].map((value, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / 100) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={`w-full rounded-t-lg ${index === 6 ? 'bg-primary animate-pulse' : 'bg-primary/60'} min-h-[4px]`}
                  />
                  <span className="text-xs text-text-secondary mt-2 font-medium">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'][index]}
                  </span>
                  <span className="text-xs text-white font-bold">{Math.round(value)}m</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Subject Performance */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="rounded-2xl bg-surface-dark border border-border-dark p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6">Subject Performance</h3>
            <div className="space-y-4">
              {subjects.slice(0, 5).map((subject, index) => {
                const performance = Math.floor(Math.random() * 40) + 60 // Random performance 60-100%
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                      >
                        <span className="material-symbols-outlined text-sm">{subject.icon}</span>
                      </div>
                      <span className="text-white text-sm font-medium">{subject.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-border-dark rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${performance}%` }}
                          transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white w-8">{performance}%</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Real-time Activity Feed */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-surface-dark border border-border-dark p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Recent Activity</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-xs text-primary font-medium">Live</span>
              </div>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {realTimeStats.recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className="flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">
                      {activity.type === 'quiz' && `Quiz completed in ${activity.subject}`}
                      {activity.type === 'study' && `Studied ${activity.subject} for ${activity.duration} minutes`}
                      {activity.type === 'chat' && `AI chat session in ${activity.subject}`}
                    </p>
                    <p className="text-text-secondary text-xs mt-0.5">{activity.time}</p>
                  </div>
                  <div className="text-right">
                    {activity.type === 'quiz' && (
                      <div className="flex flex-col items-end">
                        <span className="text-white font-bold text-sm">{activity.score}%</span>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          activity.score >= 80 ? 'bg-green-400/10 text-green-400' :
                          activity.score >= 60 ? 'bg-yellow-400/10 text-yellow-400' :
                          'bg-red-400/10 text-red-400'
                        }`}>
                          {activity.score >= 80 ? 'Excellent' : activity.score >= 60 ? 'Good' : 'Needs Work'}
                        </span>
                      </div>
                    )}
                    {activity.type === 'study' && (
                      <span className="text-primary font-bold text-sm">{activity.duration}m</span>
                    )}
                    {activity.type === 'chat' && (
                      <span className="text-primary font-bold text-sm">{activity.messages} msgs</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Insights & Recommendations */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="material-symbols-outlined text-primary"
              >
                auto_awesome
              </motion.span>
              <h3 className="text-lg font-bold text-white">AI Insights</h3>
            </div>
            
            <div className="space-y-4">
              {/* Performance Insight */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="p-4 bg-surface-dark/50 rounded-xl border border-border-dark"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-400 text-sm">trending_up</span>
                  <span className="text-green-400 text-sm font-bold">Performance Boost</span>
                </div>
                <p className="text-white text-sm">
                  Your {realTimeStats.strongestSubject?.name || 'Mathematics'} scores improved by 15% this week! 
                  Keep up the consistent practice.
                </p>
              </motion.div>

              {/* Study Recommendation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="p-4 bg-surface-dark/50 rounded-xl border border-border-dark"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-yellow-400 text-sm">lightbulb</span>
                  <span className="text-yellow-400 text-sm font-bold">Study Tip</span>
                </div>
                <p className="text-white text-sm mb-3">
                  You learn best during {isStudying ? 'active sessions' : 'morning hours'}. 
                  Try scheduling more {realTimeStats.weakestSubject?.name || 'Physics'} practice then.
                </p>
                <Link
                  to="/schedule"
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-background-dark text-sm font-bold rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  Schedule Study Session
                </Link>
              </motion.div>

              {/* Goal Progress */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="p-4 bg-surface-dark/50 rounded-xl border border-border-dark"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-blue-400 text-sm">flag</span>
                  <span className="text-blue-400 text-sm font-bold">Weekly Goal</span>
                </div>
                <p className="text-white text-sm">
                  {weeklyProgress >= 100 ? 
                    "🎉 Congratulations! You've exceeded your weekly goal!" :
                    `You're ${Math.round(100 - weeklyProgress)}% away from your weekly goal. ${
                      weeklyProgress > 50 ? "You're doing great!" : "Let's pick up the pace!"
                    }`
                  }
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}