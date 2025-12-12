import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getEventCancellationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, userName, eventTitle } = body;

    if (!userEmail || !eventTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailHtml = getEventCancellationEmail(userName || 'there', eventTitle);
    const emailSubject = `Unregistered: ${eventTitle}`;

    const result = await sendEmail({ to: userEmail, subject: emailSubject, html: emailHtml });

    if (!result.success) {
      return NextResponse.json({ success: true, message: 'Unregistration successful (email failed)', emailSent: false });
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully', emailSent: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
