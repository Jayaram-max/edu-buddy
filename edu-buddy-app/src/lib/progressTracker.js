// Real-time Progress Tracking System
const STORAGE_KEY = 'edu_buddy_progress'

// Initialize or get progress data
export const getProgressData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading progress:', error)
  }
  
  // Default progress data
  return {
    totalStudyMinutes: 0,
    todayStudyMinutes: 0,
    weeklyStudyMinutes: 0,
    lastStudyDate: null,
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    averageSessionTime: 0,
    completedQuizzes: 0,
    averageQuizScore: 0,
    totalChatSessions: 0,
    totalMessages: 0,
    subjectStats: {},
    weeklyData: [0, 0, 0, 0, 0, 0, 0], // Last 7 days
    recentActivity: [],
    achievements: [],
    lastUpdated: new Date().toISOString()
  }
}

// Save progress data
export const saveProgressData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString()
    }))
  } catch (error) {
    console.error('Error saving progress:', error)
  }
}

// Track study session
export const trackStudySession = (subject, durationMinutes) => {
  const progress = getProgressData()
  const today = new Date().toDateString()
  
  // Update totals
  progress.totalStudyMinutes += durationMinutes
  progress.totalSessions += 1
  
  // Calculate average session time
  progress.averageSessionTime = Math.round(
    progress.totalStudyMinutes / progress.totalSessions
  )
  
  // Update today's minutes
  if (progress.lastStudyDate === today) {
    progress.todayStudyMinutes += durationMinutes
  } else {
    progress.todayStudyMinutes = durationMinutes
    progress.lastStudyDate = today
    
    // Update streak
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (progress.lastStudyDate === yesterday.toDateString()) {
      progress.currentStreak += 1
    } else {
      progress.currentStreak = 1
    }
    
    if (progress.currentStreak > progress.longestStreak) {
      progress.longestStreak = progress.currentStreak
    }
  }
  
  // Update weekly data
  const dayOfWeek = new Date().getDay()
  progress.weeklyData[dayOfWeek] += durationMinutes
  progress.weeklyStudyMinutes += durationMinutes
  
  // Update subject stats
  if (!progress.subjectStats[subject]) {
    progress.subjectStats[subject] = {
      studyTime: 0,
      quizzesTaken: 0,
      averageScore: 0,
      lastStudied: null
    }
  }
  progress.subjectStats[subject].studyTime += durationMinutes
  progress.subjectStats[subject].lastStudied = new Date().toISOString()
  
  // Add to recent activity
  progress.recentActivity.unshift({
    id: Date.now(),
    type: 'study',
    subject: subject,
    duration: durationMinutes,
    time: new Date().toISOString(),
    icon: 'book'
  })
  
  // Keep only last 20 activities
  progress.recentActivity = progress.recentActivity.slice(0, 20)
  
  saveProgressData(progress)
  return progress
}

// Track quiz completion
export const trackQuizCompletion = (subject, score, totalPoints, timeTaken) => {
  const progress = getProgressData()
  const percentage = Math.round((score / totalPoints) * 100)
  
  progress.completedQuizzes += 1
  
  // Calculate new average score
  progress.averageQuizScore = Math.round(
    (progress.averageQuizScore * (progress.completedQuizzes - 1) + percentage) / 
    progress.completedQuizzes
  )
  
  // Update subject stats
  if (!progress.subjectStats[subject]) {
    progress.subjectStats[subject] = {
      studyTime: 0,
      quizzesTaken: 0,
      averageScore: 0,
      lastStudied: null
    }
  }
  
  const subjectStat = progress.subjectStats[subject]
  subjectStat.quizzesTaken += 1
  subjectStat.averageScore = Math.round(
    (subjectStat.averageScore * (subjectStat.quizzesTaken - 1) + percentage) / 
    subjectStat.quizzesTaken
  )
  
  // Add to recent activity
  progress.recentActivity.unshift({
    id: Date.now(),
    type: 'quiz',
    subject: subject,
    score: percentage,
    time: new Date().toISOString(),
    icon: 'quiz',
    status: percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Needs Work'
  })
  
  progress.recentActivity = progress.recentActivity.slice(0, 20)
  
  // Check for achievements
  checkAchievements(progress)
  
  saveProgressData(progress)
  return progress
}

// Track chat session
export const trackChatMessage = (subject) => {
  const progress = getProgressData()
  
  progress.totalMessages += 1
  
  // Track unique chat session (new session if > 30 min since last message)
  const lastActivity = progress.recentActivity.find(a => a.type === 'chat')
  const now = new Date()
  
  if (!lastActivity || 
      (now - new Date(lastActivity.time)) > 30 * 60 * 1000) {
    progress.totalChatSessions += 1
    
    progress.recentActivity.unshift({
      id: Date.now(),
      type: 'chat',
      subject: subject || 'General',
      messages: 1,
      time: now.toISOString(),
      icon: 'chat'
    })
  } else {
    // Update existing chat activity
    const chatActivity = progress.recentActivity.find(a => a.type === 'chat')
    if (chatActivity) {
      chatActivity.messages = (chatActivity.messages || 1) + 1
      chatActivity.time = now.toISOString()
    }
  }
  
  progress.recentActivity = progress.recentActivity.slice(0, 20)
  
  saveProgressData(progress)
  return progress
}

// Check and award achievements
const checkAchievements = (progress) => {
  const achievements = []
  
  if (progress.currentStreak >= 7 && !progress.achievements.includes('week_streak')) {
    achievements.push({
      id: 'week_streak',
      title: '7 Day Streak',
      description: 'Studied for 7 days in a row!',
      icon: 'local_fire_department',
      date: new Date().toISOString()
    })
    progress.achievements.push('week_streak')
  }
  
  if (progress.completedQuizzes >= 10 && !progress.achievements.includes('quiz_master')) {
    achievements.push({
      id: 'quiz_master',
      title: 'Quiz Master',
      description: 'Completed 10 quizzes!',
      icon: 'emoji_events',
      date: new Date().toISOString()
    })
    progress.achievements.push('quiz_master')
  }
  
  if (progress.totalStudyMinutes >= 300 && !progress.achievements.includes('dedicated_learner')) {
    achievements.push({
      id: 'dedicated_learner',
      title: 'Dedicated Learner',
      description: 'Studied for 5+ hours!',
      icon: 'school',
      date: new Date().toISOString()
    })
    progress.achievements.push('dedicated_learner')
  }
  
  return achievements
}

// Get weekly goal progress
export const getWeeklyGoalProgress = (goalMinutes = 300) => {
  const progress = getProgressData()
  return {
    current: progress.weeklyStudyMinutes,
    goal: goalMinutes,
    percentage: Math.round((progress.weeklyStudyMinutes / goalMinutes) * 100)
  }
}

// Reset weekly data (call this on Sunday night or Monday morning)
export const resetWeeklyData = () => {
  const progress = getProgressData()
  progress.weeklyData = [0, 0, 0, 0, 0, 0, 0]
  progress.weeklyStudyMinutes = 0
  saveProgressData(progress)
}

// Get top subjects
export const getTopSubjects = () => {
  const progress = getProgressData()
  const subjects = Object.entries(progress.subjectStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.studyTime - a.studyTime)
  
  return {
    strongest: subjects[0] || null,
    weakest: subjects[subjects.length - 1] || null,
    all: subjects
  }
}
