import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useTracking } from '../context/TrackingContext'
import { supabase } from '../lib/supabase'

export default function Analytics() {
  const { user, stats } = useApp()
  const { trackPageNavigation } = useTracking()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, 90d, all
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trackPageNavigation('/analytics', 'Analytics & Insights')
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)

      // Get engagement metrics
      const { data: metricsData } = await supabase
        .from('user_engagement_metrics')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Get recent activities
      const { data: activitiesData } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      // Get daily statistics
      const { data: dailyStatsData } = await supabase
        .from('daily_user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(getDayLimit())

      // Get events
      const { data: eventsData } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(100)

      setAnalyticsData({
        metrics: metricsData,
        activities: activitiesData || [],
        dailyStats: dailyStatsData || [],
        events: eventsData || []
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDayLimit = () => {
    const ranges = { '7d': 7, '30d': 30, '90d': 90, 'all': 365 }
    return ranges[timeRange]
  }

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
          </div>
          <p className="text-text-secondary">Loading analytics...</p>
        </div>
      </div>
    )
  }

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
            { to: '/analytics', icon: 'analytics', label: 'Analytics', active: true },
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
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Analytics & Insights</h2>
            <p className="text-sm text-text-secondary">Your learning journey in data</p>
          </div>
          <div className="flex items-center gap-2">
            {['7d', '30d', '90d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-primary text-background-dark'
                    : 'text-text-secondary hover:bg-white/5'
                }`}
              >
                {range === '7d' ? '7D' : range === '30d' ? '30D' : range === '90d' ? '90D' : 'All'}
              </button>
            ))}
          </div>
        </motion.header>

        {/* Content */}
        <div className="flex-1 px-4 py-8 md:px-8 lg:px-12 xl:px-20 max-w-[1600px] mx-auto w-full">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-border-dark">
            {['overview', 'activity', 'engagement', 'time'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {[
                {
                  label: 'Total Sessions',
                  value: analyticsData.metrics?.total_sessions || 0,
                  icon: 'schedule',
                  color: '#36e27b'
                },
                {
                  label: 'Study Time',
                  value: `${analyticsData.metrics?.total_study_time_minutes || 0}m`,
                  icon: 'timer',
                  color: '#3b82f6'
                },
                {
                  label: 'Quizzes Taken',
                  value: analyticsData.metrics?.total_quizzes_taken || 0,
                  icon: 'quiz',
                  color: '#f59e0b'
                },
                {
                  label: 'Engagement',
                  value: analyticsData.metrics?.engagement_level || 'low',
                  icon: 'trending_up',
                  color: '#10b981'
                }
              ].map((metric, index) => (
                <motion.div key={index} variants={itemVariants} className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-text-secondary text-sm font-medium mb-2">{metric.label}</p>
                      <p className="text-3xl font-bold text-white capitalize">{metric.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl" style={{ color: metric.color }}>
                        {metric.icon}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Recent Activities</h3>
                <div className="space-y-4">
                  {analyticsData.activities.slice(0, 20).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      variants={itemVariants}
                      className="flex items-center gap-4 pb-4 border-b border-border-dark last:border-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">
                          {getActivityIcon(activity.activity_type)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium capitalize">{activity.activity_type.replace('_', ' ')}</p>
                        <p className="text-text-secondary text-sm">{activity.action || activity.page_route}</p>
                      </div>
                      <p className="text-text-secondary text-sm">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Engagement Tab */}
          {activeTab === 'engagement' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Engagement Metrics</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Average Session Duration', value: `${analyticsData.metrics?.average_session_duration_minutes || 0}m` },
                      { label: 'Average Quiz Score', value: `${analyticsData.metrics?.average_quiz_score || 0}%` },
                      { label: 'Current Streak', value: `${analyticsData.metrics?.current_streak_days || 0} days` },
                      { label: 'Notes Generated', value: analyticsData.metrics?.total_notes_created || 0 }
                    ].map((item, index) => (
                      <motion.div key={index} variants={itemVariants} className="flex justify-between items-center">
                        <span className="text-text-secondary">{item.label}</span>
                        <span className="text-white font-bold">{item.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Daily Breakdown</h3>
                  <div className="space-y-4">
                    {analyticsData.dailyStats.slice(0, 7).map((day, index) => (
                      <motion.div
                        key={day.date}
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <span className="text-text-secondary text-sm">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-white text-sm font-medium">{day.study_time_minutes}m</span>
                          <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min((day.study_time_minutes / 120) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Time Analysis Tab */}
          {activeTab === 'time' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Most Active Day</h3>
                  {analyticsData.dailyStats.length > 0 && (
                    <div>
                      <p className="text-4xl font-bold text-primary mb-2">
                        {Math.max(...analyticsData.dailyStats.map(d => d.study_time_minutes)) || 0}m
                      </p>
                      <p className="text-text-secondary">Total study time on your most productive day</p>
                    </div>
                  )}
                </div>

                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Activity by Type</h3>
                  <div className="space-y-3">
                    {['quiz_start', 'note_create', 'chat_message', 'page_view'].map((type) => {
                      const count = analyticsData.events.filter(e => e.event_type === type).length
                      return (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-text-secondary capitalize">{type.replace('_', ' ')}</span>
                          <span className="text-white font-bold">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

function getActivityIcon(activityType) {
  const icons = {
    quiz_started: 'quiz',
    quiz_completed: 'check_circle',
    note_generated: 'description',
    chat_message: 'chat',
    page_view: 'visibility',
    file_upload: 'upload_file',
    login: 'login',
    logout: 'logout'
  }
  return icons[activityType] || 'info'
}
