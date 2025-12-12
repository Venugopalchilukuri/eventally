-- Event Status Feature Implementation
-- This adds Draft/Published/Cancelled status to events

-- Step 1: Add status column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled'));

-- Step 2: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Step 3: Update existing events to 'published' (assuming they were already live)
UPDATE events 
SET status = 'published' 
WHERE status IS NULL OR status = 'draft';

-- Step 4: Add published_at timestamp for tracking when events go live
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Step 5: Set published_at for existing published events
UPDATE events 
SET published_at = created_at 
WHERE status = 'published' AND published_at IS NULL;

-- Step 6: Create a function to auto-set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to automatically set published_at
DROP TRIGGER IF EXISTS trigger_set_published_at ON events;
CREATE TRIGGER trigger_set_published_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

-- Step 8: Add RLS policies for status-based access control

-- Policy: Users can only see published events (unless they own the event)
DROP POLICY IF EXISTS "Users can view published events or their own events" ON events;
CREATE POLICY "Users can view published events or their own events"
  ON events FOR SELECT
  USING (
    status = 'published' 
    OR user_id = auth.uid()
  );

-- Policy: Users can update their own events
DROP POLICY IF EXISTS "Users can update their own events" ON events;
CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can insert their own events (default to draft)
DROP POLICY IF EXISTS "Users can insert their own events" ON events;
CREATE POLICY "Users can insert their own events"
  ON events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own events
DROP POLICY IF EXISTS "Users can delete their own events" ON events;
CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (user_id = auth.uid());

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'events' 
  AND column_name IN ('status', 'published_at')
ORDER BY ordinal_position;

-- Show event counts by status
SELECT 
  status,
  COUNT(*) as count
FROM events
GROUP BY status
ORDER BY status;
