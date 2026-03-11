import { supabase } from './supabase'

// Sign up with email and password
export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw error
  return data
}

// Sign in with email and password
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// Get current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

// Reset password
export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
  return data
}

// Update password
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
  return data
}

// Update user profile
export const updateProfile = async (updates) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  })

  if (error) throw error
  return data
}
