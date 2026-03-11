// User Tracking Service
// Handles all user activity tracking and analytics

import { supabase } from './supabase'

// =============================================
// SESSION MANAGEMENT
// =============================================

export const createUserSession = async (userId) => {
  try {
    const sessionToken = generateSessionToken()
    const deviceInfo = getDeviceInfo()

    const { data, error } = await supabase
      .from('user_sessions')
      .insert([{
        user_id: userId,
        session_token: sessionToken,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
      }])
      .select()
      .single()

    if (error) throw error
    
    // Store session ID in sessionStorage
    sessionStorage.setItem('session_id', data.id)
    sessionStorage.setItem('session_token', sessionToken)
    
    return data
  } catch (error) {
    console.error('Error creating user session:', error)
    return null
  }
}

export const endUserSession = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        ended_at: new Date().toISOString(),
        duration_seconds: Math.floor((Date.now() - sessionStorage.getItem('session_start_time')) / 1000)
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error ending session:', error)
    return null
  }
}

export const updateSessionHeartbeat = async (sessionId) => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', sessionId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating session heartbeat:', error)
  }
}

// =============================================
// ACTIVITY LOGGING
// =============================================

export const logActivity = async (userId, activityType, activityData = {}) => {
  try {
    const sessionId = sessionStorage.getItem('session_id')

    const { data, error } = await supabase
      .from('user_activity_logs')
      .insert([{
        user_id: userId,
        session_id: sessionId,
        activity_type: activityType,
        action: activityData.action || '',
        page_route: activityData.pageRoute || window.location.pathname,
        resource_id: activityData.resourceId || null,
        resource_type: activityData.resourceType || null,
        metadata: activityData.metadata || {},
        duration_seconds: activityData.duration || 0,
        device_type: getDeviceInfo().deviceType,
        ip_address: await getClientIP()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error logging activity:', error)
    return null
  }
}

export const trackPageView = async (userId, pageRoute, pageTitle = '') => {
  try {
    const sessionId = sessionStorage.getItem('session_id')

    await supabase
      .from('page_views')
      .insert([{
        user_id: userId,
        session_id: sessionId,
        page_route: pageRoute,
        page_title: pageTitle || document.title,
        referrer: document.referrer,
        device_type: getDeviceInfo().deviceType,
        created_at: new Date().toISOString()
      }])
  } catch (error) {
    console.error('Error tracking page view:', error)
  }
}

export const trackTimeOnPage = async (userId, pageRoute, timeInSeconds, scrollDepth = 0) => {
  try {
    const sessionId = sessionStorage.getItem('session_id')

    await supabase
      .from('page_views')
      .update({
        time_on_page_seconds: timeInSeconds,
        scroll_depth: scrollDepth
      })
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .eq('page_route', pageRoute)
  } catch (error) {
    console.error('Error tracking time on page:', error)
  }
}

// =============================================
// EVENT TRACKING
// =============================================

export const trackEvent = async (userId, eventType, eventData = {}) => {
  try {
    const { data, error } = await supabase
      .from('user_events')
      .insert([{
        user_id: userId,
        event_type: eventType,
        event_name: eventData.eventName || eventType,
        event_value: eventData.value || null,
        event_properties: eventData.properties || {},
        timestamp: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error tracking event:', error)
    return null
  }
}

// Specific event tracking functions
export const trackQuizStarted = async (userId, quizId, subject) => {
  return trackEvent(userId, 'quiz_start', {
    eventName: 'Quiz Started',
    properties: { quiz_id: quizId, subject }
  })
}

export const trackQuizCompleted = async (userId, quizId, score, totalPoints) => {
  const percentage = (score / totalPoints) * 100
  return trackEvent(userId, 'quiz_end', {
    eventName: 'Quiz Completed',
    value: percentage,
    properties: { quiz_id: quizId, score, total_points: totalPoints, percentage }
  })
}

export const trackNoteGenerated = async (userId, noteType, noteLength) => {
  return trackEvent(userId, 'note_create', {
    eventName: 'Note Generated',
    value: noteLength,
    properties: { note_type: noteType, content_length: noteLength }
  })
}

export const trackChatMessage = async (userId, conversationId, messageLength, sentiment = 'neutral') => {
  return trackEvent(userId, 'chat_message', {
    eventName: 'Chat Message',
    value: messageLength,
    properties: { conversation_id: conversationId, message_length: messageLength, sentiment }
  })
}

export const trackLogin = async (userId) => {
  return trackEvent(userId, 'login', {
    eventName: 'User Login',
    properties: { timestamp: new Date().toISOString() }
  })
}

export const trackLogout = async (userId) => {
  return trackEvent(userId, 'logout', {
    eventName: 'User Logout',
    properties: { timestamp: new Date().toISOString() }
  })
}

// =============================================
// ENGAGEMENT METRICS
// =============================================

export const updateEngagementMetrics = async (userId) => {
  try {
    // Get user's current stats
    const { data: activities } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)

    const { data: quizzes } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', userId)
      .eq('event_type', 'quiz_end')

    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds')
      .eq('user_id', userId)
      .not('ended_at', 'is', null)

    const totalStudyTime = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0
    const avgSessionDuration = sessions?.length ? (totalStudyTime / sessions.length) / 60 : 0
    const avgQuizScore = quizzes?.length ? 
      quizzes.reduce((sum, q) => sum + (q.event_value || 0), 0) / quizzes.length : 0

    // Determine engagement level
    const engagementLevel = getEngagementLevel(sessions?.length || 0, totalStudyTime)

    const { data, error } = await supabase
      .from('user_engagement_metrics')
      .upsert({
        user_id: userId,
        total_sessions: sessions?.length || 0,
        total_study_time_minutes: Math.floor(totalStudyTime / 60),
        total_quizzes_taken: quizzes?.length || 0,
        average_session_duration_minutes: parseFloat(avgSessionDuration.toFixed(2)),
        last_activity_at: new Date().toISOString(),
        average_quiz_score: parseFloat(avgQuizScore.toFixed(2)),
        engagement_level: engagementLevel,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating engagement metrics:', error)
    return null
  }
}

export const getDailyStatistics = async (userId, date = new Date()) => {
  try {
    const dateStr = date.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('daily_user_statistics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting daily statistics:', error)
    return null
  }
}

export const updateDailyStatistics = async (userId, stats = {}) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data: existing } = await supabase
      .from('daily_user_statistics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from('daily_user_statistics')
        .update({
          study_time_minutes: (existing.study_time_minutes || 0) + (stats.studyTime || 0),
          sessions_count: (existing.sessions_count || 0) + (stats.sessions || 0),
          quizzes_taken: (existing.quizzes_taken || 0) + (stats.quizzes || 0),
          notes_created: (existing.notes_created || 0) + (stats.notes || 0),
          chat_messages: (existing.chat_messages || 0) + (stats.messages || 0),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('date', today)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('daily_user_statistics')
        .insert([{
          user_id: userId,
          date: today,
          study_time_minutes: stats.studyTime || 0,
          sessions_count: stats.sessions || 1,
          quizzes_taken: stats.quizzes || 0,
          notes_created: stats.notes || 0,
          chat_messages: stats.messages || 0
        }])
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Error updating daily statistics:', error)
    return null
  }
}

// =============================================
// ONLINE USERS TRACKING
// =============================================

export const updateOnlineUsers = async (userId, sessionId, currentPage = '') => {
  try {
    const { data: existing } = await supabase
      .from('online_users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('online_users')
        .update({
          last_heartbeat: new Date().toISOString(),
          current_page: currentPage
        })
        .eq('user_id', userId)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('online_users')
        .insert([{
          user_id: userId,
          session_id: sessionId,
          current_page: currentPage
        }])

      if (error) throw error
    }
  } catch (error) {
    console.error('Error updating online users:', error)
  }
}

export const getOnlineUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('online_users')
      .select('*')
      .gt('last_heartbeat', new Date(Date.now() - 5 * 60 * 1000).toISOString())

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting online users:', error)
    return []
  }
}

// =============================================
// RETENTION & COHORT ANALYSIS
// =============================================

export const updateUserRetention = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data: existing } = await supabase
      .from('user_retention')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existing) {
      const daysSinceSignup = Math.floor(
        (new Date(today) - new Date(existing.first_visit_date)) / (1000 * 60 * 60 * 24)
      )
      const retentionCohort = getRetentionCohort(daysSinceSignup)

      const { error } = await supabase
        .from('user_retention')
        .update({
          last_visit_date: today,
          retention_cohort: retentionCohort,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('user_retention')
        .insert([{
          user_id: userId,
          first_visit_date: today,
          last_visit_date: today,
          retention_cohort: 'day_0'
        }])

      if (error) throw error
    }
  } catch (error) {
    console.error('Error updating user retention:', error)
  }
}

// =============================================
// FUNNEL TRACKING
// =============================================

export const trackFunnelStep = async (userId, funnelName, stepNumber, stepName) => {
  try {
    const { error } = await supabase
      .from('funnel_events')
      .insert([{
        user_id: userId,
        funnel_name: funnelName,
        step_number: stepNumber,
        step_name: stepName,
        completed: true
      }])

    if (error) throw error
  } catch (error) {
    console.error('Error tracking funnel step:', error)
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

function generateSessionToken() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getDeviceInfo() {
  const ua = navigator.userAgent
  let deviceType = 'desktop'
  let browser = 'unknown'
  let os = 'unknown'

  if (/mobile|android|iphone/i.test(ua)) deviceType = 'mobile'
  if (/tablet|ipad/i.test(ua)) deviceType = 'tablet'

  if (/chrome/i.test(ua)) browser = 'Chrome'
  else if (/firefox/i.test(ua)) browser = 'Firefox'
  else if (/safari/i.test(ua)) browser = 'Safari'
  else if (/edge/i.test(ua)) browser = 'Edge'

  if (/windows/i.test(ua)) os = 'Windows'
  else if (/mac/i.test(ua)) os = 'macOS'
  else if (/linux/i.test(ua)) os = 'Linux'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/iphone|ipad/i.test(ua)) os = 'iOS'

  return { deviceType, browser, os }
}

async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip || 'unknown'
  } catch (error) {
    return 'unknown'
  }
}

function getEngagementLevel(sessionCount, totalStudyTime) {
  if (sessionCount >= 20 && totalStudyTime >= 600) return 'very_high'
  if (sessionCount >= 10 && totalStudyTime >= 300) return 'high'
  if (sessionCount >= 5 && totalStudyTime >= 120) return 'medium'
  return 'low'
}

function getRetentionCohort(daysSinceSignup) {
  if (daysSinceSignup === 0) return 'day_0'
  if (daysSinceSignup === 1) return 'day_1'
  if (daysSinceSignup <= 7) return 'day_7'
  if (daysSinceSignup <= 30) return 'day_30'
  if (daysSinceSignup <= 90) return 'day_90'
  return 'day_90_plus'
}
