-- Transformations Table
-- Tracks all AI image transformations for cost monitoring and analytics
--
-- Created: 2026-01-18
-- Purpose: Store transformation records for Nano Banana and Replicate AI

-- Create enum for AI providers
CREATE TYPE ai_provider AS ENUM ('nano-banana', 'replicate');

-- Create enum for transformation status
CREATE TYPE transformation_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Create transformations table
CREATE TABLE IF NOT EXISTS transformations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Image references (R2 keys)
    original_image_key TEXT NOT NULL,
    transformed_image_key TEXT,

    -- Transformation details
    style TEXT NOT NULL,
    provider ai_provider NOT NULL DEFAULT 'nano-banana',
    status transformation_status NOT NULL DEFAULT 'pending',

    -- Cost tracking
    tokens_used INTEGER,
    estimated_cost DECIMAL(10, 6),  -- In USD, e.g., 0.039000

    -- Performance metrics
    processing_time_ms INTEGER,

    -- Error handling
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    -- Indexes for common queries
    CONSTRAINT valid_style CHECK (style IN (
        'pop_art', 'watercolor', 'line_art', 'oil_painting',
        'romantic', 'comic_book', 'vintage', 'original_enhanced'
    ))
);

-- Index for user lookups
CREATE INDEX idx_transformations_user_id ON transformations(user_id);

-- Index for status filtering
CREATE INDEX idx_transformations_status ON transformations(status);

-- Index for date range queries
CREATE INDEX idx_transformations_created_at ON transformations(created_at);

-- Index for caching lookups (original + style)
CREATE INDEX idx_transformations_cache ON transformations(original_image_key, style)
    WHERE status = 'completed';

-- Index for provider analytics
CREATE INDEX idx_transformations_provider ON transformations(provider);

-- Enable Row Level Security
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own transformations
CREATE POLICY "Users can view own transformations"
    ON transformations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create transformations for themselves
CREATE POLICY "Users can create own transformations"
    ON transformations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can do anything (for backend)
CREATE POLICY "Service role has full access"
    ON transformations
    FOR ALL
    USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE transformations IS 'AI image transformation records for cost tracking and analytics';
