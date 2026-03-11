// TRACKING SYSTEM - QUICK REFERENCE

// ============================================
// IMPORT IN YOUR COMPONENT
// ============================================
import { useTracking } from '../context/TrackingContext'

// ============================================
// USE IN YOUR COMPONENT
// ============================================
export default function YourPage() {
  const {
    trackPageNavigation,      // Track page views
    trackActivity,            // Track custom activities
    trackEvent,               // Track events
    trackQuizEvent,           // Track quizzes
    trackNoteEvent,           // Track notes
    trackChatEvent,           // Track chat messages
    trackFunnelStep           // Track user funnels
  } = useTracking()

  // ============================================
  // COMMON USE CASES
  // ============================================

  // 1. TRACK PAGE LOAD
  useEffect(() => {
    trackPageNavigation('/dashboard', 'Dashboard Page')
  }, [])

  // 2. TRACK QUIZ
  const startQuiz = async (quizId) => {
    await trackQuizEvent(quizId, 'start', {
      subject: 'Mathematics',
      difficulty: 'hard'
    })
  }

  const completeQuiz = async (quizId, score, totalPoints) => {
    await trackQuizEvent(quizId, 'complete', {
      score,
      totalPoints,
      timeSpent: 1200 // seconds
    })
  }

  // 3. TRACK NOTES
  const generateNotes = async (noteType, content) => {
    await trackNoteEvent(noteType, content.length)
    // noteType: 'summary', 'bullets', 'formulas', 'quiz'
  }

  // 4. TRACK CHAT
  const sendChatMessage = async (conversationId, message) => {
    await trackChatEvent(conversationId, message.length, 'positive')
    // sentiment: 'positive', 'neutral', 'negative'
  }

  // 5. TRACK CUSTOM ACTIVITY
  const trackUserAction = async () => {
    await trackActivity('file_upload', {
      action: 'PDF Uploaded',
      resourceType: 'document',
      metadata: {
        fileName: 'notes.pdf',
        fileSize: 2048,
        pages: 50
      }
    })
  }

  // 6. TRACK FUNNEL STEP
  const trackConversionFunnel = async () => {
    // Step 1: User sees feature
    await trackFunnelStep('free_to_premium', 1, 'premium_prompt_shown')
    
    // Step 2: User clicks upgrade
    await trackFunnelStep('free_to_premium', 2, 'upgrade_clicked')
    
    // Step 3: Payment initiated
    await trackFunnelStep('free_to_premium', 3, 'payment_started')
    
    // Step 4: Payment completed
    await trackFunnelStep('free_to_premium', 4, 'payment_completed')
  }

  // 7. TRACK CUSTOM EVENT
  const trackCustomEvent = async () => {
    await trackEvent('feature_used', {
      eventName: 'AI Chat Feature',
      value: 42, // numeric value if needed
      properties: {
        feature: 'ai_chat',
        subject: 'mathematics',
        messageCount: 10
      }
    })
  }

  return (
    <div>
      {/* Your component JSX */}
    </div>
  )
}

// ============================================
// TRACKING LIBRARY DIRECT USE (if needed)
// ============================================
import * as tracking from '../lib/tracking'

// Get engagement metrics
const metrics = await tracking.updateEngagementMetrics(userId)

// Get daily statistics
const stats = await tracking.getDailyStatistics(userId, new Date())

// Get online users count
const onlineUsers = await tracking.getOnlineUsers()

// Update daily stats manually
await tracking.updateDailyStatistics(userId, {
  studyTime: 60,
  sessions: 1,
  quizzes: 2,
  notes: 3,
  messages: 15
})

// Get user retention info
await tracking.updateUserRetention(userId)

// ============================================
// AVAILABLE ACTIVITY TYPES
// ============================================
const activityTypes = [
  'page_view',
  'quiz_started',
  'quiz_completed',
  'note_generated',
  'chat_message',
  'file_upload',
  'login',
  'logout',
  'profile_updated',
  'settings_changed'
]

// ============================================
// AVAILABLE EVENT TYPES
// ============================================
const eventTypes = [
  'quiz_start',
  'quiz_end',
  'note_create',
  'chat_message',
  'login',
  'logout',
  'page_view',
  'file_upload'
]

// ============================================
// AVAILABLE ENGAGEMENT LEVELS
// ============================================
const engagementLevels = [
  'low',        // < 5 sessions, < 120 minutes
  'medium',     // 5-10 sessions, 120-300 minutes
  'high',       // 10-20 sessions, 300-600 minutes
  'very_high'   // >= 20 sessions, >= 600 minutes
]

// ============================================
// AVAILABLE RETENTION COHORTS
// ============================================
const retentionCohorts = [
  'day_0',     // Signup day
  'day_1',     // 1 day after signup
  'day_7',     // 2-7 days after signup
  'day_30',    // 8-30 days after signup
  'day_90',    // 31-90 days after signup
  'day_90_plus' // 90+ days after signup
]

// ============================================
// ANALYTICS DASHBOARD ROUTE
// ============================================
// Navigate to /analytics to see:
// - Overview metrics
// - Recent activities
// - Engagement data
// - Time analysis
// - Time range filters (7d, 30d, 90d, all)

// ============================================
// DATABASE TABLES
// ============================================
const tables = {
  user_sessions: 'Active user sessions',
  user_activity_logs: 'Detailed activity log',
  user_events: 'Real-time events',
  user_engagement_metrics: 'User engagement scores',
  daily_user_statistics: 'Daily activity breakdown',
  page_views: 'Page visit tracking',
  user_heatmap_data: 'Click/hover heatmaps',
  page_performance_metrics: 'Page load performance',
  user_retention: 'Retention cohorts',
  funnel_events: 'Funnel step tracking',
  online_users: 'Currently active users'
}

// ============================================
// SUPABASE QUERIES
// ============================================

// Get user's activities
const { data: activities } = await supabase
  .from('user_activity_logs')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// Get user's events
const { data: events } = await supabase
  .from('user_events')
  .select('*')
  .eq('user_id', userId)
  .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))

// Get engagement summary
const { data: summary } = await supabase
  .from('user_engagement_summary_view')
  .select('*')
  .eq('user_id', userId)

// Get online users
const { data: online } = await supabase
  .from('online_users')
  .select('*')
  .gt('last_heartbeat', new Date(Date.now() - 5 * 60 * 1000).toISOString())

// ============================================
// TIPS & TRICKS
// ============================================

/*
1. QUIZ TRACKING TIP:
   Always track quiz start AND completion with scores
   This helps identify learning progress

2. FUNNEL TIP:
   Use meaningful step names for better reports
   Example: 'signup_to_quiz' with steps:
   - email_entered
   - email_verified
   - subject_selected
   - first_quiz_viewed

3. ENGAGEMENT TIP:
   Monitor engagement_level trends
   Drop in engagement = opportunity to re-engage

4. RETENTION TIP:
   Check retention cohorts to identify churn points
   Focus on day_0 and day_1 cohorts

5. PERFORMANCE TIP:
   Track page load times to optimize UX
   Correlate with engagement metrics

6. CUSTOM EVENTS TIP:
   Add properties to events for segmentation
   Example: { feature: 'ai_chat', subject: 'math' }

7. ANALYTICS DASHBOARD TIP:
   Check 'time' tab to understand peak usage hours
   Schedule maintenance during off-peak times

8. REAL-TIME TIP:
   Use getOnlineUsers() to show "users online" counters
   Updates every 30 seconds via heartbeat
*/
