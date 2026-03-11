-- Edu Buddy AI - Simplified Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO subjects (name, description, icon, color) VALUES
    ('Mathematics', 'Algebra, Calculus, Geometry, Statistics', 'calculate', '#36e27b'),
    ('Physics', 'Mechanics, Thermodynamics, Electromagnetism', 'science', '#3b82f6'),
    ('Chemistry', 'Organic, Inorganic, Physical Chemistry', 'biotech', '#f59e0b'),
    ('Biology', 'Cell Biology, Genetics, Ecology', 'eco', '#10b981'),
    ('History', 'World History, Ancient Civilizations', 'history_edu', '#8b5cf6'),
    ('Literature', 'Poetry, Prose, Drama, Essays', 'book', '#ec4899'),
    ('Computer Science', 'Programming, Algorithms, Data Structures', 'code', '#06b6d4'),
    ('Languages', 'English, Spanish, French, German', 'translate', '#f97316');

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STUDY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUIZZES TABLE
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium',
    total_questions INTEGER DEFAULT 0,
    time_limit_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice',
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 10,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    percentage DECIMAL(5,2),
    time_taken_seconds INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answers JSONB
);

-- CHAT CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMART NOTES TABLE
CREATE TABLE IF NOT EXISTS smart_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    original_content TEXT,
    generated_summary TEXT,
    key_points JSONB,
    formulas JSONB,
    file_url TEXT,
    note_type VARCHAR(20) DEFAULT 'summary',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER PROGRESS TABLE
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0,
    total_study_time_minutes INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    average_quiz_score DECIMAL(5,2) DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject_id)
);

-- ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    points INTEGER DEFAULT 0,
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Allow public read access to subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subjects are viewable by everyone" ON subjects FOR SELECT USING (true);
