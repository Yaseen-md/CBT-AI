-- CBT AI Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for semantic search (Phase 6)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- USER TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    consent_to_save_memory BOOLEAN DEFAULT false,
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    crisis_count INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT false,
    google_id VARCHAR(255) UNIQUE,
    has_consented BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- ============================================
-- CONVERSATION TABLE
-- ============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) DEFAULT 'New Session',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN DEFAULT false
);

-- Index for faster user conversation lookups
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- ============================================
-- MESSAGE TABLE
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    audio_url VARCHAR(500),
    transcription TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster conversation message lookups
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================
-- MEMORY TABLE
-- ============================================
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('journal', 'summary', 'fact', 'cognitive-distortion-tag')),
    short_summary VARCHAR(500),
    full_text TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- vector VECTOR(1536) -- Uncomment for Phase 6 (pgvector)
);

-- Index for faster user memory lookups
CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_type ON memories(type);
CREATE INDEX idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX idx_memories_tags ON memories USING GIN (tags);

-- ============================================
-- SAFETY_EVENT TABLE
-- ============================================
CREATE TABLE safety_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    snippet TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT
);

-- Index for faster safety event queries
CREATE INDEX idx_safety_events_user_id ON safety_events(user_id);
CREATE INDEX idx_safety_events_severity ON safety_events(severity);
CREATE INDEX idx_safety_events_created_at ON safety_events(created_at DESC);
CREATE INDEX idx_safety_events_resolved ON safety_events(resolved);

-- ============================================
-- CLINICAL TABLES
-- ============================================

-- thought_records: Core CBT 7-column worksheet
CREATE TABLE thought_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    situation TEXT NOT NULL,
    emotion_before VARCHAR(100) NOT NULL,
    emotion_before_rating INTEGER CHECK (emotion_before_rating BETWEEN 0 AND 100),
    automatic_thought TEXT NOT NULL,
    evidence_for TEXT,
    evidence_against TEXT,
    balanced_thought TEXT,
    emotion_after VARCHAR(100),
    emotion_after_rating INTEGER CHECK (emotion_after_rating BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- phq9_responses: Depression screening (validated, public domain)
CREATE TABLE phq9_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scores INTEGER[] NOT NULL CHECK (array_length(scores, 1) = 9),
    total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 27),
    severity_label VARCHAR(30) NOT NULL,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- gad7_responses: Anxiety screening (validated, public domain)
CREATE TABLE gad7_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scores INTEGER[] NOT NULL CHECK (array_length(scores, 1) = 7),
    total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 21),
    severity_label VARCHAR(30) NOT NULL,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- safety_plans: Stanley-Brown Safety Planning (6 steps)
CREATE TABLE safety_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    warning_signs TEXT[],
    internal_coping TEXT[],
    social_distractors TEXT[],
    support_contacts JSONB DEFAULT '[]',
    professional_contacts JSONB DEFAULT '[]',
    environment_safety_steps TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- session_goals: Per-session goal tracking
CREATE TABLE session_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    goal_text TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed','deferred')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- mood_checkins: Daily mood tracking
CREATE TABLE mood_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
    emotion_tags JSONB DEFAULT '[]',
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_plans_updated_at BEFORE UPDATE ON safety_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (for development only)
-- ============================================
-- Uncomment to insert sample admin user
-- INSERT INTO users (email, password_hash, name, is_admin, consent_to_save_memory)
-- VALUES ('admin@cbt-ai.com', '$2a$10$placeholder_hash', 'Admin User', true, true);
