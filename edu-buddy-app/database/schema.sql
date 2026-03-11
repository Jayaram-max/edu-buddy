-- Edu Buddy AI Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SUBJECTS TABLE
-- =============================================
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
    ('Languages', 'English, Spanish, French, German', 'translate', '#f97316')
ON CONFLICT DO NOTHING;

-- =============================================
-- STUDY SESSIONS TABLE
-- =============================================
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

-- =============================================
-- QUIZZES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    total_questions INTEGER DEFAULT 0,
    time_limit_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- QUIZ QUESTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    options JSONB, -- For multiple choice: ["Option A", "Option B", "Option C", "Option D"]
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 10,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- QUIZ ATTEMPTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    percentage DECIMAL(5,2),
    time_taken_seconds INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answers JSONB -- Store user answers: {"question_id": "user_answer", ...}
);

-- =============================================
-- CHAT CONVERSATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CHAT MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SMART NOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS smart_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    original_content TEXT,
    generated_summary TEXT,
    key_points JSONB, -- Array of key points
    formulas JSONB, -- Array of formulas if applicable
    file_url TEXT,
    note_type VARCHAR(20) DEFAULT 'summary' CHECK (note_type IN ('summary', 'bullets', 'formulas', 'quiz')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
    total_study_time_minutes INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    average_quiz_score DECIMAL(5,2) DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject_id)
);

-- =============================================
-- USER ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    points INTEGER DEFAULT 0,
    requirement_type VARCHAR(50), -- 'study_time', 'quiz_score', 'streak', etc.
    requirement_value INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, points, requirement_type, requirement_value) VALUES
    ('First Steps', 'Complete your first study session', 'directions_walk', 10, 'study_sessions', 1),
    ('Quiz Master', 'Score 100% on any quiz', 'emoji_events', 50, 'perfect_quiz', 1),
    ('Week Warrior', 'Maintain a 7-day study streak', 'local_fire_department', 100, 'streak', 7),
    ('Knowledge Seeker', 'Complete 10 study sessions', 'school', 75, 'study_sessions', 10),
    ('Speed Learner', 'Complete a quiz in under 5 minutes', 'speed', 30, 'quick_quiz', 1),
    ('Dedicated Student', 'Study for 10 hours total', 'timer', 150, 'study_time', 600)
ON CONFLICT DO NOTHING;

-- =============================================
-- USER ACHIEVEMENTS JUNCTION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject ON study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_smart_notes_user ON smart_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Allow public read access to subjects, quizzes, questions, and achievements
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subjects are viewable by everyone" ON subjects FOR SELECT USING (true);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quizzes are viewable by everyone" ON quizzes FOR SELECT USING (true);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quiz questions are viewable by everyone" ON quiz_questions FOR SELECT USING (true);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);

-- =============================================
-- SAMPLE QUIZ DATA
-- =============================================
INSERT INTO quizzes (id, subject_id, title, description, difficulty, total_questions, time_limit_minutes)
SELECT 
    uuid_generate_v4(),
    s.id,
    'React Hooks Fundamentals',
    'Test your knowledge of React Hooks including useState, useEffect, and custom hooks',
    'medium',
    5,
    10
FROM subjects s WHERE s.name = 'Computer Science'
ON CONFLICT DO NOTHING;

-- Insert sample questions for the React quiz
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points, order_index)
SELECT 
    q.id,
    'Which hook serves as the equivalent to componentDidMount, componentDidUpdate, and componentWillUnmount combined?',
    'multiple_choice',
    '["useState", "useEffect", "useContext", "useReducer"]'::jsonb,
    'useEffect',
    'useEffect is the powerhouse hook for handling side effects. By configuring its dependency array, you can control whether it runs on every render, only on mount, or when specific props change.',
    20,
    1
FROM quizzes q WHERE q.title = 'React Hooks Fundamentals'
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points, order_index)
SELECT 
    q.id,
    'What is the correct way to update state based on the previous state value?',
    'multiple_choice',
    '["setCount(count + 1)", "setCount(prev => prev + 1)", "count++", "this.setState({count: count + 1})"]'::jsonb,
    'setCount(prev => prev + 1)',
    'Using the functional update form ensures you always have the latest state value, especially important in async operations.',
    20,
    2
FROM quizzes q WHERE q.title = 'React Hooks Fundamentals'
ON CONFLICT DO NOTHING;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update user progress after quiz completion
CREATE OR REPLACE FUNCTION update_user_progress_after_quiz()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_progress (user_id, subject_id, quizzes_completed, average_quiz_score, last_activity_at)
    SELECT 
        NEW.user_id,
        q.subject_id,
        1,
        NEW.percentage,
        NOW()
    FROM quizzes q WHERE q.id = NEW.quiz_id
    ON CONFLICT (user_id, subject_id) 
    DO UPDATE SET
        quizzes_completed = user_progress.quizzes_completed + 1,
        average_quiz_score = (user_progress.average_quiz_score * user_progress.quizzes_completed + NEW.percentage) / (user_progress.quizzes_completed + 1),
        last_activity_at = NOW(),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for quiz completion
DROP TRIGGER IF EXISTS on_quiz_completed ON quiz_attempts;
CREATE TRIGGER on_quiz_completed
    AFTER INSERT ON quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress_after_quiz();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON chat_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_smart_notes_updated_at BEFORE UPDATE ON smart_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS FOR DASHBOARD
-- =============================================

-- View for user dashboard stats
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
    u.id as user_id,
    u.full_name,
    COALESCE(SUM(ss.duration_minutes), 0) as total_study_minutes,
    COALESCE(COUNT(DISTINCT qa.id), 0) as total_quizzes,
    COALESCE(AVG(qa.percentage), 0) as avg_quiz_score,
    COALESCE(MAX(up.streak_days), 0) as current_streak,
    COUNT(DISTINCT ua.achievement_id) as achievements_earned
FROM users u
LEFT JOIN study_sessions ss ON u.id = ss.user_id
LEFT JOIN quiz_attempts qa ON u.id = qa.user_id
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, u.full_name;

COMMENT ON TABLE users IS 'Stores user profile information';
COMMENT ON TABLE subjects IS 'Available study subjects/topics';
COMMENT ON TABLE study_sessions IS 'Records of user study sessions';
COMMENT ON TABLE quizzes IS 'Quiz definitions with metadata';
COMMENT ON TABLE quiz_questions IS 'Individual questions for each quiz';
COMMENT ON TABLE quiz_attempts IS 'User quiz attempt records and scores';
COMMENT ON TABLE chat_conversations IS 'AI chat conversation threads';
COMMENT ON TABLE chat_messages IS 'Individual messages in chat conversations';
COMMENT ON TABLE smart_notes IS 'AI-generated study notes';
COMMENT ON TABLE user_progress IS 'User progress tracking per subject';
COMMENT ON TABLE achievements IS 'Available achievements/badges';
COMMENT ON TABLE user_achievements IS 'Achievements earned by users';
