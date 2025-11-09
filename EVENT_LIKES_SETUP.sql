-- Event Likes System
-- Run this in your Supabase SQL Editor

-- 1. Create event_likes table
CREATE TABLE IF NOT EXISTS event_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id) -- One like per user per event
);

-- 2. Create indexes for performance
CREATE INDEX idx_event_likes_event_id ON event_likes(event_id);
CREATE INDEX idx_event_likes_user_id ON event_likes(user_id);
CREATE INDEX idx_event_likes_created_at ON event_likes(created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE event_likes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Anyone can view likes
CREATE POLICY "Anyone can view event likes"
  ON event_likes FOR SELECT
  USING (true);

-- Authenticated users can add likes
CREATE POLICY "Authenticated users can add likes"
  ON event_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
  ON event_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Function to get event stats (likes + comments count)
CREATE OR REPLACE FUNCTION get_event_stats(event_uuid UUID)
RETURNS TABLE (
  likes_count BIGINT,
  comments_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM event_likes WHERE event_id = event_uuid),
    (SELECT COUNT(*) FROM event_comments WHERE event_id = event_uuid AND parent_comment_id IS NULL);
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Function to check if user liked an event
CREATE OR REPLACE FUNCTION user_liked_event(event_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM event_likes 
    WHERE event_id = event_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Add comments count to events view (optional helper view)
CREATE OR REPLACE VIEW events_with_stats AS
SELECT 
  e.*,
  (SELECT COUNT(*) FROM event_likes WHERE event_id = e.id) AS likes_count,
  (SELECT COUNT(*) FROM event_comments WHERE event_id = e.id AND parent_comment_id IS NULL) AS comments_count
FROM events e;

-- Grant access to the view
GRANT SELECT ON events_with_stats TO authenticated, anon;
