-- Create Test Events with FUTURE dates
-- Run this in your Supabase SQL Editor

-- Get tomorrow's date
DO $$
DECLARE
  tomorrow DATE := CURRENT_DATE + INTERVAL '1 day';
  next_week DATE := CURRENT_DATE + INTERVAL '7 days';
  next_month DATE := CURRENT_DATE + INTERVAL '30 days';
BEGIN

-- Event 1: Tomorrow
INSERT INTO events (title, description, date, time, location, category, max_attendees, current_attendees, image_url)
VALUES (
  'Tech Conference 2025',
  'Join us for the biggest tech event of the year! Network with industry leaders, attend workshops, and discover the latest innovations in technology.',
  tomorrow,
  '14:00:00',
  'Convention Center, Downtown',
  'Technology',
  100,
  45,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
);

-- Event 2: Next Week
INSERT INTO events (title, description, date, time, location, category, max_attendees, current_attendees, image_url)
VALUES (
  'Music Festival 2025',
  'Experience an unforgettable night of live music featuring top artists from around the world. Food, drinks, and great vibes!',
  next_week,
  '18:00:00',
  'City Park Arena',
  'Entertainment',
  500,
  230,
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'
);

-- Event 3: Next Week
INSERT INTO events (title, description, date, time, location, category, max_attendees, current_attendees, image_url)
VALUES (
  'AI & Machine Learning Summit',
  'Deep dive into artificial intelligence and machine learning. Learn from experts, attend hands-on workshops, and network with AI professionals.',
  next_week + INTERVAL '2 days',
  '10:00:00',
  'Tech Hub, Innovation District',
  'Technology',
  150,
  78,
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800'
);

-- Event 4: Next Month
INSERT INTO events (title, description, date, time, location, category, max_attendees, current_attendees, image_url)
VALUES (
  'Startup Pitch Competition',
  'Watch innovative startups pitch their ideas to top investors. Network with entrepreneurs and VCs. Winner gets $50,000 in funding!',
  next_month,
  '16:00:00',
  'Business Center, Suite 200',
  'Business',
  200,
  156,
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800'
);

-- Event 5: Two Weeks
INSERT INTO events (title, description, date, time, location, category, max_attendees, current_attendees, image_url)
VALUES (
  'Food & Wine Festival',
  'Taste amazing dishes from 50+ local restaurants and wineries. Live cooking demos, wine tastings, and food competitions!',
  next_week + INTERVAL '7 days',
  '12:00:00',
  'Waterfront Plaza',
  'Food',
  300,
  189,
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
);

-- Event 6: This Weekend
INSERT INTO events (title, description, date, time, location, category, max_attendees, current_attendees, image_url)
VALUES (
  'Art Exhibition Opening',
  'Exclusive opening night of contemporary art exhibition featuring local and international artists. Wine, hors d''oeuvres, and live music.',
  CURRENT_DATE + INTERVAL '3 days',
  '19:00:00',
  'Modern Art Gallery',
  'Art',
  80,
  45,
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800'
);

END $$;

-- Verify events were created
SELECT 
  title, 
  date, 
  time, 
  location,
  current_attendees,
  CASE 
    WHEN date > CURRENT_DATE THEN '✅ Future Event'
    WHEN date = CURRENT_DATE AND time > CURRENT_TIME THEN '✅ Today (Upcoming)'
    ELSE '❌ Past Event'
  END as status
FROM events
ORDER BY date, time;
