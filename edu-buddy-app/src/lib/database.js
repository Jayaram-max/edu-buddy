import { supabase } from './supabase'

// =============================================
// SUBJECTS
// =============================================
export const getSubjects = async () => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

// =============================================
// STUDY SESSIONS
// =============================================
export const createStudySession = async (session) => {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert([session])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getStudySessions = async (userId, limit = 10) => {
  const { data, error } = await supabase
    .from('study_sessions')
    .select(`
      *,
      subjects (name, icon, color)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export const updateStudySession = async (sessionId, updates) => {
  const { data, error } = await supabase
    .from('study_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =============================================
// QUIZZES
// =============================================
export const getQuizzes = async (subjectId = null) => {
  let query = supabase
    .from('quizzes')
    .select(`
      *,
      subjects (name, icon, color)
    `)
    .order('created_at', { ascending: false })
  
  if (subjectId) {
    query = query.eq('subject_id', subjectId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export const getQuizWithQuestions = async (quizId) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      subjects (name, icon, color),
      quiz_questions (*)
    `)
    .eq('id', quizId)
    .single()
  
  if (error) throw error
  return data
}

export const submitQuizAttempt = async (attempt) => {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([attempt])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getQuizAttempts = async (userId, limit = 10) => {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quizzes (title, subjects (name, icon))
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

// =============================================
// CHAT CONVERSATIONS
// =============================================
export const createConversation = async (conversation) => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .insert([conversation])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getConversations = async (userId) => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select(`
      *,
      subjects (name, icon)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getConversationMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export const addChatMessage = async (message) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([message])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =============================================
// SMART NOTES
// =============================================
export const createSmartNote = async (note) => {
  const { data, error } = await supabase
    .from('smart_notes')
    .insert([note])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getSmartNotes = async (userId, limit = 20) => {
  const { data, error } = await supabase
    .from('smart_notes')
    .select(`
      *,
      subjects (name, icon, color)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export const updateSmartNote = async (noteId, updates) => {
  const { data, error } = await supabase
    .from('smart_notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteSmartNote = async (noteId) => {
  const { error } = await supabase
    .from('smart_notes')
    .delete()
    .eq('id', noteId)
  
  if (error) throw error
  return true
}

// =============================================
// USER PROGRESS
// =============================================
export const getUserProgress = async (userId) => {
  const { data, error } = await supabase
    .from('user_progress')
    .select(`
      *,
      subjects (name, icon, color)
    `)
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

export const updateUserProgress = async (userId, subjectId, updates) => {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      subject_id: subjectId,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =============================================
// ACHIEVEMENTS
// =============================================
export const getAchievements = async () => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('points')
  
  if (error) throw error
  return data
}

export const getUserAchievements = async (userId) => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (*)
    `)
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

export const awardAchievement = async (userId, achievementId) => {
  const { data, error } = await supabase
    .from('user_achievements')
    .insert([{ user_id: userId, achievement_id: achievementId }])
    .select()
    .single()
  
  if (error && error.code !== '23505') throw error // Ignore duplicate key error
  return data
}

// =============================================
// DASHBOARD STATS
// =============================================
export const getDashboardStats = async (userId) => {
  // Get total study time
  const { data: studyData } = await supabase
    .from('study_sessions')
    .select('duration_minutes')
    .eq('user_id', userId)
  
  const totalStudyMinutes = studyData?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0

  // Get quiz stats
  const { data: quizData } = await supabase
    .from('quiz_attempts')
    .select('percentage')
    .eq('user_id', userId)
  
  const avgQuizScore = quizData?.length 
    ? quizData.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizData.length 
    : 0

  // Get progress data
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('mastery_level, streak_days')
    .eq('user_id', userId)
  
  const topicsMastered = progressData?.filter(p => p.mastery_level >= 80).length || 0
  const currentStreak = Math.max(...(progressData?.map(p => p.streak_days) || [0]))

  return {
    totalStudyMinutes,
    totalStudyHours: Math.floor(totalStudyMinutes / 60),
    avgQuizScore: Math.round(avgQuizScore),
    topicsMastered,
    totalTopics: 20,
    currentStreak,
    quizzesCompleted: quizData?.length || 0
  }
}
