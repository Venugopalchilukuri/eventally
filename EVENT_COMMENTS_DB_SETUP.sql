-- Event Comments & Q&A Feature Database Setup
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Event Comments Table
-- ============================================
CREATE TABLE IF NOT EXISTS event_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  parent_comment_id UUID REFERENCES event_comments(id) ON DELETE CASCADE,
  is_organizer BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_answer BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Comment Likes Table
-- ============================================
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES event_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id) -- One like per user per comment
);

-- ============================================
-- 3. Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_event_comments_event_id ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_parent ON event_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_created ON event_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_comments_pinned ON event_comments(is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes(user_id);

-- ============================================
-- 4. Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Comments: Anyone can view
CREATE POLICY "Anyone can view comments"
  ON event_comments FOR SELECT
  TO public
  USING (true);

-- Comments: Authenticated users can create
CREATE POLICY "Authenticated users can create comments"
  ON event_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Comments: Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON event_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comments: Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON event_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Likes: Anyone can view
CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  TO public
  USING (true);

-- Likes: Authenticated users can create
CREATE POLICY "Authenticated users can like comments"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Likes: Users can delete their own likes
CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 5. Functions for Counter Updates
-- ============================================

-- Update likes count when like is added/removed
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE event_comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE event_comments 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update replies count when reply is added/removed
CREATE OR REPLACE FUNCTION update_comment_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL THEN
    UPDATE event_comments 
    SET replies_count = replies_count + 1 
    WHERE id = NEW.parent_comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NOT NULL THEN
    UPDATE event_comments 
    SET replies_count = replies_count - 1 
    WHERE id = OLD.parent_comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Triggers
-- ============================================

-- Trigger for likes count
DROP TRIGGER IF EXISTS trigger_update_likes_count ON comment_likes;
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

-- Trigger for replies count
DROP TRIGGER IF EXISTS trigger_update_replies_count ON event_comments;
CREATE TRIGGER trigger_update_replies_count
  AFTER INSERT OR DELETE ON event_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_replies_count();

-- ============================================
-- 7. Updated_at Trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comment_timestamp ON event_comments;
CREATE TRIGGER trigger_update_comment_timestamp
  BEFORE UPDATE ON event_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. Verification Queries
-- ============================================

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('event_comments', 'comment_likes');

-- Check policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('event_comments', 'comment_likes');

-- ============================================
-- SETUP COMPLETE! ✅
-- ============================================
