import { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import * as db from '../lib/database'

const AppContext = createContext()

export function AppProvider({ children }) {
  const { user: clerkUser, isLoaded } = useUser()

  // Transform Clerk user to our app format
  const user = clerkUser ? {
    id: clerkUser.id,
    full_name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
    email: clerkUser.primaryEmailAddress?.emailAddress,
    avatar_url: clerkUser.imageUrl
  } : null

  const [subjects, setSubjects] = useState([])
  const [stats, setStats] = useState({
    totalStudyMinutes: 1250,
    totalStudyHours: 20,
    avgQuizScore: 85,
    topicsMastered: 12,
    totalTopics: 20,
    currentStreak: 7,
    quizzesCompleted: 24,
    notesGenerated: 18,
    chatSessions: 45
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      // Try to load subjects from Supabase
      try {
        const subjectsData = await db.getSubjects()
        if (subjectsData?.length) {
          setSubjects(subjectsData)
        }
      } catch (e) {
        console.log('Using default subjects (Supabase not connected)')
        setSubjects([
          { id: '1', name: 'Mathematics', icon: 'calculate', color: '#36e27b' },
          { id: '2', name: 'Physics', icon: 'science', color: '#3b82f6' },
          { id: '3', name: 'Chemistry', icon: 'biotech', color: '#f59e0b' },
          { id: '4', name: 'Biology', icon: 'eco', color: '#10b981' },
          { id: '5', name: 'History', icon: 'history_edu', color: '#8b5cf6' },
          { id: '6', name: 'Literature', icon: 'book', color: '#ec4899' },
          { id: '7', name: 'Computer Science', icon: 'code', color: '#06b6d4' },
          { id: '8', name: 'Languages', icon: 'translate', color: '#f97316' }
        ])
      }

      // Try to load stats
      try {
        const statsData = await db.getDashboardStats(user.id)
        if (statsData) {
          setStats(statsData)
        }
      } catch (e) {
        console.log('Using default stats (Supabase not connected)')
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const [recentActivity, setRecentActivity] = useState([
    { icon: 'calculate', title: 'Calculus II: Derivatives', time: 'Today, 10:45 AM', score: '92%', status: 'Passed' },
    { icon: 'science', title: 'Physics: Forces & Motion', time: 'Yesterday, 4:20 PM', score: '78%', status: 'Review' },
    { icon: 'book', title: 'Literature: Shakespeare', time: 'Yesterday, 2:00 PM', score: '100%', status: 'Perfect' },
  ])

  // ... existing loadInitialData ...

  // Helper to add activity
  const addActivity = (activity) => {
    setRecentActivity(prev => [activity, ...prev].slice(0, 10))
  }

  // Study session functions
  const startStudySession = async (subjectId, title) => {
    try {
      const session = await db.createStudySession({
        user_id: user.id,
        subject_id: subjectId,
        title,
        started_at: new Date().toISOString()
      })
      return session
    } catch (err) {
      console.error('Error starting study session:', err)
      return null
    }
  }

  const endStudySession = async (sessionId, durationMinutes, notes = '') => {
    try {
      const session = await db.updateStudySession(sessionId, {
        duration_minutes: durationMinutes,
        ended_at: new Date().toISOString(),
        notes
      })
      setStats(prev => ({
        ...prev,
        totalStudyMinutes: prev.totalStudyMinutes + durationMinutes,
        totalStudyHours: Math.floor((prev.totalStudyMinutes + durationMinutes) / 60)
      }))
      return session
    } catch (err) {
      console.error('Error ending study session:', err)
      return null
    }
  }

  // Quiz functions
  const submitQuiz = async (quizId, answers, score, totalPoints, timeTaken) => {
    try {
      const percentage = (score / totalPoints) * 100
      const attempt = await db.submitQuizAttempt({
        user_id: user.id,
        quiz_id: quizId,
        score,
        total_points: totalPoints,
        percentage,
        time_taken_seconds: timeTaken,
        answers
      })

      setStats(prev => ({
        ...prev,
        quizzesCompleted: prev.quizzesCompleted + 1,
        avgQuizScore: Math.round((prev.avgQuizScore * prev.quizzesCompleted + percentage) / (prev.quizzesCompleted + 1))
      }))

      addActivity({
        icon: 'quiz',
        title: `Quiz: ${quizId || 'General Knowledge'}`,
        time: 'Just now',
        score: `${Math.round(percentage)}%`,
        status: percentage >= 80 ? 'Perfect' : percentage >= 60 ? 'Passed' : 'Review'
      })

      return attempt
    } catch (err) {
      console.error('Error submitting quiz:', err)
      return null
    }
  }

  // Chat functions
  const createChat = async (title, subjectId = null) => {
    try {
      const chat = await db.createConversation({
        user_id: user.id,
        title,
        subject_id: subjectId
      })
      setStats(prev => ({ ...prev, chatSessions: prev.chatSessions + 1 }))
      return chat
    } catch (err) {
      console.error('Error creating chat:', err)
      return null
    }
  }

  const sendMessage = async (conversationId, content, role = 'user') => {
    try {
      return await db.addChatMessage({
        conversation_id: conversationId,
        role,
        content
      })
    } catch (err) {
      console.error('Error sending message:', err)
      return null
    }
  }

  // Notes functions
  const saveNote = async (note) => {
    try {
      const savedNote = await db.createSmartNote({
        user_id: user.id,
        ...note
      })

      setStats(prev => ({ ...prev, notesGenerated: prev.notesGenerated + 1 }))

      addActivity({
        icon: 'description',
        title: note.title || 'Smart Notes',
        time: 'Just now',
        score: 'N/A',
        status: 'Generated'
      })

      return savedNote
    } catch (err) {
      console.error('Error saving note:', err)
      return null
    }
  }

  const value = {
    user,
    subjects,
    stats,
    recentActivity,
    loading,
    error,
    // Functions
    loadInitialData,
    startStudySession,
    endStudySession,
    submitQuiz,
    createChat,
    sendMessage,
    saveNote,
    // Direct database access
    db
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export default AppContext
