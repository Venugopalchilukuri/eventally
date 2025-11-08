import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getNewEventCreatedEmail } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    console.log('🔍 DEBUG - API Route /api/send-new-event-notification called');
    
    const body = await request.json();
    console.log('🔍 DEBUG - Request body:', JSON.stringify(body, null, 2));
    
    const { eventTitle, eventDate, eventTime, eventLocation, eventDescription, eventCategory, eventId } = body;

    // Validate required fields
    if (!eventTitle || !eventDate || !eventTime || !eventLocation || !eventId) {
      console.log('❌ DEBUG - Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('🔍 DEBUG - Fetching profiles from database...');
    
    // Fetch all registered users from the profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email');
    
    console.log('🔍 DEBUG - Profiles query result:', { 
      profileCount: profiles?.length, 
      error: profilesError?.message 
    });

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch user profiles', details: profilesError.message },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️ DEBUG - No users found in profiles table');
      return NextResponse.json(
        { success: true, message: 'No users to notify', emailsSent: 0 },
        { status: 200 }
      );
    }
    
    console.log(`✅ DEBUG - Found ${profiles.length} users to notify`);

    // Format date for email
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Format time for email
    const [hours, minutes] = eventTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const formattedTime = `${displayHour}:${minutes} ${ampm}`;

    // Helper function to add delay (rate limiting)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Send emails to all users with rate limiting
    const results = [];
    
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      
      if (!profile.email) {
        results.push({ success: false, email: 'N/A' });
        continue;
      }

      // Extract username from email or use a default greeting
      const userName = profile.email.split('@')[0] || 'there';

      // Generate email HTML
      const emailHtml = getNewEventCreatedEmail(
        userName,
        eventTitle,
        formattedDate,
        formattedTime,
        eventLocation,
        eventDescription || '',
        eventCategory || 'Event',
        eventId
      );

      // Send email
      const emailSubject = `New Event: ${eventTitle}`;
      
      try {
        const result = await sendEmail({
          to: profile.email,
          subject: emailSubject,
          html: emailHtml,
        });
        
        results.push({ success: result.success, email: profile.email });
        console.log(`✅ Email sent to ${profile.email}`);
      } catch (error) {
        console.error(`❌ Failed to send email to ${profile.email}:`, error);
        results.push({ success: false, email: profile.email });
      }
      
      // Add 600ms delay between emails to respect rate limit (2 per second)
      if (i < profiles.length - 1) {
        await delay(600);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`📧 New event notification sent: ${successCount} successful, ${failCount} failed`);

    return NextResponse.json({
      success: true,
      message: 'Email notifications sent',
      emailsSent: successCount,
      emailsFailed: failCount,
      totalUsers: profiles.length
    });
  } catch (error: any) {
    console.error('Error in send-new-event-notification:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
