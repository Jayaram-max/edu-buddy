import { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import * as tracking from '../lib/tracking'

const TrackingContext = createContext()

export function TrackingProvider({ children }) {
  const { user } = useUser()
  const [sessionId, setSessionId] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState(null)

  // Initialize tracking session
  useEffect(() => {
    if (user?.id && !sessionId) {
      initializeTracking()
    }

    return () => {
      if (sessionId) {
        endTracking()
      }
    }
  }, [user?.id])

  // Heartbeat for session
  useEffect(() => {
    let heartbeatInterval
    if (sessionId && isTracking) {
      heartbeatInterval = setInterval(() => {
        tracking.updateSessionHeartbeat(sessionId)
        tracking.updateOnlineUsers(user.id, sessionId, window.location.pathname)
      }, 30000) // Every 30 seconds
    }

    return () => clearInterval(heartbeatInterval)
  }, [sessionId, isTracking, user?.id])

  const initializeTracking = async () => {
    try {
      const session = await tracking.createUserSession(user.id)
      if (session) {
        setSessionId(session.id)
        setSessionStartTime(Date.now())
        setIsTracking(true)

        // Track login
        await tracking.trackLogin(user.id)

        // Track initial page view
        await tracking.trackPageView(user.id, window.location.pathname, document.title)

        // Update retention
        await tracking.updateUserRetention(user.id)

        // Update engagement metrics
        await tracking.updateEngagementMetrics(user.id)

        // Update online users
        await tracking.updateOnlineUsers(user.id, session.id, window.location.pathname)
      }
    } catch (error) {
      console.error('Error initializing tracking:', error)
    }
  }

  const endTracking = async () => {
    try {
      if (sessionId) {
        const sessionDuration = Math.floor((Date.now() - (sessionStartTime || Date.now())) / 1000)
        await tracking.endUserSession(sessionId)
        await tracking.trackLogout(user.id)
        await tracking.updateDailyStatistics(user.id, { sessions: 1 })
        setIsTracking(false)
      }
    } catch (error) {
      console.error('Error ending tracking:', error)
    }
  }

  const trackPageNavigation = async (pageRoute, pageTitle = '') => {
    try {
      if (sessionId && user?.id) {
        await tracking.trackPageView(user.id, pageRoute, pageTitle)
        await tracking.updateOnlineUsers(user.id, sessionId, pageRoute)
      }
    } catch (error) {
      console.error('Error tracking page navigation:', error)
    }
  }

  const trackActivity = async (activityType, activityData) => {
    try {
      if (user?.id) {
        await tracking.logActivity(user.id, activityType, {
          ...activityData,
          pageRoute: window.location.pathname
        })
      }
    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  }

  const trackEvent = async (eventType, eventData = {}) => {
    try {
      if (user?.id) {
        await tracking.trackEvent(user.id, eventType, eventData)
      }
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  const trackQuizEvent = async (quizId, action, data = {}) => {
    try {
      if (user?.id) {
        if (action === 'start') {
          await tracking.trackQuizStarted(user.id, quizId, data.subject)
        } else if (action === 'complete') {
          await tracking.trackQuizCompleted(user.id, quizId, data.score, data.totalPoints)
          await tracking.updateDailyStatistics(user.id, { quizzes: 1 })
        }
      }
    } catch (error) {
      console.error('Error tracking quiz event:', error)
    }
  }

  const trackNoteEvent = async (noteType, contentLength) => {
    try {
      if (user?.id) {
        await tracking.trackNoteGenerated(user.id, noteType, contentLength)
        await tracking.updateDailyStatistics(user.id, { notes: 1 })
      }
    } catch (error) {
      console.error('Error tracking note event:', error)
    }
  }

  const trackChatEvent = async (conversationId, messageLength, sentiment = 'neutral') => {
    try {
      if (user?.id) {
        await tracking.trackChatMessage(user.id, conversationId, messageLength, sentiment)
        await tracking.updateDailyStatistics(user.id, { messages: 1 })
      }
    } catch (error) {
      console.error('Error tracking chat event:', error)
    }
  }

  const trackFunnelStep = async (funnelName, stepNumber, stepName) => {
    try {
      if (user?.id) {
        await tracking.trackFunnelStep(user.id, funnelName, stepNumber, stepName)
      }
    } catch (error) {
      console.error('Error tracking funnel step:', error)
    }
  }

  const value = {
    sessionId,
    isTracking,
    trackPageNavigation,
    trackActivity,
    trackEvent,
    trackQuizEvent,
    trackNoteEvent,
    trackChatEvent,
    trackFunnelStep
  }

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  )
}

export function useTracking() {
  const context = useContext(TrackingContext)
  if (!context) {
    throw new Error('useTracking must be used within TrackingProvider')
  }
  return context
}
