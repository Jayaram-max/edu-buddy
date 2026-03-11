-- Edu Buddy AI - User Tracking & Analytics Schema
-- Run this SQL in your Supabase SQL Editor

-- =============================================
-- USER SESSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(100),
    os VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_user_sessions_users FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);

-- =============================================
-- USER ACTIVITY LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'page_view', 'quiz_started', 'quiz_completed', 'note_generated', 'chat_message', 'file_upload', etc.
    action VARCHAR(100),
    page_route VARCHAR(255),
    resource_id UUID, -- ID of the resource being interacted with (quiz_id, note_id, etc.)
    resource_type VARCHAR(50), -- 'quiz', 'note', 'chat', 'subject', etc.
    metadata JSONB, -- Additional data like scores, duration, errors
    duration_seconds INTEGER,
    ip_address VARCHAR(45),
    device_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON user_activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX idx_activity_logs_session_id ON user_activity_logs(session_id);

-- =============================================
-- USER EVENTS TABLE (for real-time events)
-- =============================================
CREATE TABLE IF NOT EXISTS user_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'quiz_start', 'quiz_end', 'note_create', 'chat_message', etc.
    event_name VARCHAR(100),
    event_value DECIMAL(10, 2), -- For numeric events like scores, duration
    event_properties JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_events_user_id ON user_events(user_id);
CREATE INDEX idx_events_type ON user_events(event_type);
CREATE INDEX idx_events_timestamp ON user_events(timestamp);

-- =============================================
-- USER ENGAGEMENT METRICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_engagement_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    total_sessions INTEGER DEFAULT 0,
    total_study_time_minutes INTEGER DEFAULT 0,
    total_quizzes_taken INTEGER DEFAULT 0,
    total_notes_created INTEGER DEFAULT 0,
    total_chat_messages INTEGER DEFAULT 0,
    average_session_duration_minutes DECIMAL(10, 2) DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    last_quiz_score DECIMAL(5, 2),
    average_quiz_score DECIMAL(5, 2),
    favorite_subject VARCHAR(100),
    engagement_level VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'very_high'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_metrics_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_metrics_user_id ON user_engagement_metrics(user_id);

-- =============================================
-- DAILY STATISTICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS daily_user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    study_time_minutes INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    quizzes_taken INTEGER DEFAULT 0,
    notes_created INTEGER DEFAULT 0,
    chat_messages INTEGER DEFAULT 0,
    pages_visited INTEGER DEFAULT 0,
    average_quiz_score DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date),
    CONSTRAINT fk_daily_stats_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_daily_stats_user_date ON daily_user_statistics(user_id, date);

-- =============================================
-- PAGE VIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    page_route VARCHAR(255) NOT NULL,
    page_title VARCHAR(255),
    referrer VARCHAR(255),
    time_on_page_seconds INTEGER,
    scroll_depth DECIMAL(5, 2), -- 0-100 percentage
    interaction_count INTEGER DEFAULT 0,
    has_error BOOLEAN DEFAULT false,
    error_message TEXT,
    device_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_pageviews_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_pageviews_user_route ON page_views(user_id, page_route);
CREATE INDEX idx_pageviews_created_at ON page_views(created_at);

-- =============================================
-- HEATMAP DATA TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_heatmap_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    page_route VARCHAR(255) NOT NULL,
    x_coordinate DECIMAL(10, 2),
    y_coordinate DECIMAL(10, 2),
    element_id VARCHAR(255),
    interaction_type VARCHAR(50), -- 'click', 'hover', 'scroll'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_heatmap_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_heatmap_user_page ON user_heatmap_data(user_id, page_route);

-- =============================================
-- PERFORMANCE METRICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS page_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    page_route VARCHAR(255),
    load_time_ms INTEGER,
    first_contentful_paint_ms INTEGER,
    largest_contentful_paint_ms INTEGER,
    time_to_interactive_ms INTEGER,
    cumulative_layout_shift DECIMAL(10, 3),
    memory_usage_mb DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_perf_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_perf_user_route ON page_performance_metrics(user_id, page_route);

-- =============================================
-- USER RETENTION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_retention (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    first_visit_date DATE,
    last_visit_date DATE,
    days_since_signup INTEGER,
    days_active INTEGER DEFAULT 0,
    retention_cohort VARCHAR(20), -- 'day_0', 'day_1', 'day_7', 'day_30', 'day_90', etc.
    is_active BOOLEAN DEFAULT true,
    churn_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_retention_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_retention_user_id ON user_retention(user_id);
CREATE INDEX idx_retention_cohort ON user_retention(retention_cohort);

-- =============================================
-- FUNNEL TRACKING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS funnel_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    funnel_name VARCHAR(100) NOT NULL, -- e.g., 'signup_to_quiz', 'upload_to_generate'
    step_number INTEGER,
    step_name VARCHAR(100),
    completed BOOLEAN DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_funnel_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_funnel_user_name ON funnel_events(user_id, funnel_name);

-- =============================================
-- REAL-TIME ONLINE USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS online_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_page VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_online_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_online_users_heartbeat ON online_users(last_heartbeat);

-- =============================================
-- VIEW: Current Active Sessions
-- =============================================
CREATE VIEW active_sessions_view AS
SELECT 
    us.id,
    us.user_id,
    us.session_token,
    us.started_at,
    us.last_activity_at,
    us.device_type,
    EXTRACT(EPOCH FROM (NOW() - us.started_at)) / 60 as session_duration_minutes
FROM user_sessions us
WHERE us.is_active = true
AND us.last_activity_at > NOW() - INTERVAL '30 minutes';

-- =============================================
-- VIEW: Daily Active Users
-- =============================================
CREATE VIEW daily_active_users_view AS
SELECT 
    DATE(dus.date) as date,
    COUNT(DISTINCT dus.user_id) as active_users,
    SUM(dus.sessions_count) as total_sessions,
    ROUND(AVG(dus.study_time_minutes), 2) as avg_study_time
FROM daily_user_statistics dus
GROUP BY DATE(dus.date)
ORDER BY date DESC;

-- =============================================
-- VIEW: User Engagement Summary
-- =============================================
CREATE VIEW user_engagement_summary_view AS
SELECT 
    uem.user_id,
    uem.total_sessions,
    uem.total_study_time_minutes,
    uem.total_quizzes_taken,
    uem.average_quiz_score,
    uem.current_streak_days,
    uem.engagement_level,
    uem.last_activity_at,
    CASE 
        WHEN uem.last_activity_at > NOW() - INTERVAL '1 hour' THEN 'online'
        WHEN uem.last_activity_at > NOW() - INTERVAL '24 hours' THEN 'active_today'
        WHEN uem.last_activity_at > NOW() - INTERVAL '7 days' THEN 'active_week'
        ELSE 'inactive'
    END as user_status
FROM user_engagement_metrics uem;
