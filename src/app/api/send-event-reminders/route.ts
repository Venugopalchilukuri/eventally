import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, getEventReminderEmail } from '@/lib/email';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔔 Checking for events requiring reminders...');

    // Calculate time window: 23-25 hours from now
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(tomorrow.getHours() + 23); // 23 hours from now
    const dayAfter = new Date(now);
    dayAfter.setHours(dayAfter.getHours() + 25); // 25 hours from now

    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    console.log(`📅 Looking for events between ${tomorrowStr} and ${dayAfterStr}`);

    // Get events happening in ~24 hours
    const { data: upcomingEvents, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('date', tomorrowStr)
      .lte('date', dayAfterStr);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    if (!upcomingEvents || upcomingEvents.length === 0) {
      console.log('✅ No events requiring reminders at this time');
      return NextResponse.json({ 
        success: true, 
        message: 'No events requiring reminders',
        eventCount: 0,
        emailsSent: 0
      });
    }

    console.log(`📧 Found ${upcomingEvents.length} event(s) requiring reminders`);

    let totalEmailsSent = 0;
    const results = [];

    // Process each event
    for (const event of upcomingEvents) {
      console.log(`\n📌 Processing event: ${event.title}`);

      // Get all registrations for this event
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('user_email, user_id')
        .eq('event_id', event.id);

      if (regError) {
        console.error(`Error fetching registrations for ${event.title}:`, regError);
        continue;
      }

      if (!registrations || registrations.length === 0) {
        console.log(`  ℹ️  No registrations for ${event.title}`);
        results.push({
          eventId: event.id,
          eventTitle: event.title,
          emailsSent: 0,
          message: 'No registrations'
        });
        continue;
      }

      console.log(`  👥 Found ${registrations.length} registered user(s)`);

      // Format event details
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const [hours, minutes] = event.time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const formattedTime = `${displayHour}:${minutes} ${ampm}`;

      // Calculate hours until event
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const hoursUntil = Math.round((eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60));

      // Send reminder to each registered user
      let emailsSentForEvent = 0;
      for (const registration of registrations) {
        
        const userName = registration.user_email.split('@')[0];
        
        const emailHtml = getEventReminderEmail(
          userName,
          event.title,
          formattedDate,
          formattedTime,
          event.location,
          event.description,
          event.id,
          hoursUntil
        );

        const result = await sendEmail({
          to: registration.user_email,
          subject: `Reminder: ${event.title} is Tomorrow!`,
          html: emailHtml,
        });

        if (result.success) {
          emailsSentForEvent++;
          totalEmailsSent++;
          console.log(`    ✅ Sent reminder to ${registration.user_email}`);
        } else {
          console.error(`    ❌ Failed to send to ${registration.user_email}:`, (result as any).error);
        }

        // Delay to avoid rate limits (600ms for 2 emails/sec)
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      results.push({
        eventId: event.id,
        eventTitle: event.title,
        emailsSent: emailsSentForEvent,
        totalRegistrations: registrations.length
      });

      console.log(`  ✉️  Sent ${emailsSentForEvent}/${registrations.length} reminder emails`);
    }

    console.log(`\n🎉 Reminder job complete! Sent ${totalEmailsSent} total emails`);

    return NextResponse.json({
      success: true,
      message: 'Event reminders sent successfully',
      eventCount: upcomingEvents.length,
      emailsSent: totalEmailsSent,
      results
    });

  } catch (error: any) {
    console.error('❌ Error in send-event-reminders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Allow POST as well for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
