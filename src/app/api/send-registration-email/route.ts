import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getRegistrationConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, userName, eventTitle, eventDate, eventTime, eventLocation, eventId } = body;

    // Validate required fields
    if (!userEmail || !eventTitle || !eventDate || !eventTime || !eventLocation || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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

    // Generate email HTML
    const emailHtml = getRegistrationConfirmationEmail(
      userName || 'there',
      eventTitle,
      formattedDate,
      formattedTime,
      eventLocation,
      eventId
    );

    // Send email
    const emailSubject = `Registration Confirmed: ${eventTitle}`;
    console.log('📧 Sending email:', { to: userEmail, subject: emailSubject });
    
    const result = await sendEmail({
      to: userEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    if (!result.success) {
      console.error('Failed to send email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Error in send-registration-email:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
