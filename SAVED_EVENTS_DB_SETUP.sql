-- ============================================
-- SAVED EVENTS FEATURE - DATABASE SETUP
-- ============================================
-- This creates the infrastructure for users to bookmark/save events
-- Run this in your Supabase SQL Editor

-- 1. Create saved_events table
CREATE TABLE IF NOT EXISTS saved_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)  -- Prevents duplicate saves
);

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_events_user_id ON saved_events(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_events_event_id ON saved_events(event_id);
CREATE INDEX IF NOT EXISTS idx_saved_events_saved_at ON saved_events(saved_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view own saved events" ON saved_events;
DROP POLICY IF EXISTS "Users can save events" ON saved_events;
DROP POLICY IF EXISTS "Users can unsave events" ON saved_events;
DROP POLICY IF EXISTS "Anyone can view saved count" ON saved_events;

-- 5. Create RLS Policies

-- Policy: Users can only see their own saved events
CREATE POLICY "Users can view own saved events"
  ON saved_events FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can save events (must be authenticated)
CREATE POLICY "Users can save events"
  ON saved_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can unsave their own events
CREATE POLICY "Users can unsave events"
  ON saved_events FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create a function to get saved count for an event (public)
CREATE OR REPLACE FUNCTION get_event_saved_count(event_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM saved_events WHERE event_id = event_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create a function to check if user saved an event
CREATE OR REPLACE FUNCTION is_event_saved(event_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM saved_events 
    WHERE event_id = event_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ============================================

-- Check if table was created
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'saved_events'
) AS table_exists;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'saved_events';

-- Check RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'saved_events';

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert test data
-- INSERT INTO saved_events (user_id, event_id) 
-- VALUES 
--   ((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM events LIMIT 1));

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Saved Events feature database setup completed successfully!';
  RAISE NOTICE '📌 Users can now bookmark events';
  RAISE NOTICE '🔒 Row Level Security is enabled';
  RAISE NOTICE '⚡ Indexes created for optimal performance';
END $$;
