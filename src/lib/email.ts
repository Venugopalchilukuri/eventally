// Email service - supports both Gmail (FREE) and Resend
// Gmail: 100% FREE, no domain needed, 500 emails/day
// Resend: Requires domain verification for production

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

// Gmail SMTP option (FREE - no domain needed!)
async function sendViaGmail({ to, subject, html }: EmailParams) {
  const nodemailer = require('nodemailer');
  
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  const info = await transporter.sendMail({
    from: `Eventally <${gmailUser}>`,
    to: to,
    subject: subject,
    html: html,
  });

  return { success: true, messageId: info.messageId };
}

// Resend option (requires domain verification)
async function sendViaResend({ to, subject, html }: EmailParams) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'Eventally <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send email');
  }

  const data = await response.json();
  return { success: true, data };
}

// Main email function - automatically chooses Gmail or Resend
export async function sendEmail({ to, subject, html }: EmailParams) {
  console.log('📧 Sending email to:', to);
  
  // Check which service to use
  const useGmail = process.env.EMAIL_SERVICE === 'gmail';
  const gmailConfigured = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
  const resendConfigured = process.env.RESEND_API_KEY;
  
  try {
    // Use Gmail if configured or explicitly set
    if (useGmail || (gmailConfigured && !resendConfigured)) {
      if (!gmailConfigured) {
        console.warn('⚠️ Gmail not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to .env.local');
        return { success: false, error: 'Gmail not configured' };
      }
      
      console.log('✅ Using Gmail SMTP (FREE)');
      return await sendViaGmail({ to, subject, html });
    }
    
    // Use Resend
    if (!resendConfigured) {
      console.warn('⚠️ No email service configured.');
      console.log('Email would be sent to:', to);
      return { success: true, message: 'Email logged (no service configured)' };
    }
    
    console.log('✅ Using Resend');
    return await sendViaResend({ to, subject, html });
    
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

// Registration confirmation email template
export function getRegistrationConfirmationEmail(
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  eventLocation: string,
  eventId: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .success-badge {
          display: inline-block;
          background-color: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          margin: 20px 0;
        }
        .event-details {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          min-width: 100px;
          color: #6b7280;
        }
        .detail-value {
          color: #111827;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
          color: white;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Eventally</div>
          <div class="success-badge">✓ Registration Confirmed</div>
        </div>
        
        <h2>You're All Set, ${userName}!</h2>
        <p>Great news! You've successfully registered for:</p>
        
        <h3 style="color: #9333ea; font-size: 24px; margin: 20px 0;">${eventTitle}</h3>
        
        <div class="event-details">
          <div class="detail-row">
            <span class="detail-label">📅 Date:</span>
            <span class="detail-value">${eventDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">🕐 Time:</span>
            <span class="detail-value">${eventTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">📍 Location:</span>
            <span class="detail-value">${eventLocation}</span>
          </div>
        </div>
        
        <p style="margin: 25px 0;">
          We're excited to see you there! You can view full event details, unregister, or manage your registrations anytime.
        </p>
        
        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-registrations" class="button">
            View Event Details
          </a>
        </center>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
          <strong>💡 Pro Tip:</strong> Add this event to your calendar so you don't forget!
        </div>
        
        <div class="footer">
          <p>You received this email because you registered for an event on Eventally.</p>
          <p>Need to make changes? <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-registrations" style="color: #9333ea;">Manage your registrations</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Event reminder email template
export function getEventReminderEmail(
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  eventLocation: string,
  eventDescription: string,
  eventId: string,
  hoursUntil: number
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .reminder-badge {
          display: inline-block;
          background-color: #f59e0b;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          margin: 20px 0;
        }
        .countdown {
          background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          text-align: center;
          margin: 25px 0;
        }
        .countdown-number {
          font-size: 48px;
          font-weight: bold;
        }
        .event-details {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          min-width: 100px;
          color: #6b7280;
        }
        .detail-value {
          color: #111827;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
          color: white;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Eventally</div>
          <div class="reminder-badge">⏰ Event Reminder</div>
        </div>
        
        <h2>Hi ${userName}!</h2>
        <p>This is a friendly reminder about your upcoming event:</p>
        
        <h3 style="color: #9333ea; font-size: 24px; margin: 20px 0;">${eventTitle}</h3>
        
        <div class="countdown">
          <div class="countdown-number">${hoursUntil}</div>
          <div style="font-size: 18px;">hours until your event</div>
        </div>
        
        <div class="event-details">
          <div class="detail-row">
            <span class="detail-label">📅 Date:</span>
            <span class="detail-value">${eventDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">🕐 Time:</span>
            <span class="detail-value">${eventTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">📍 Location:</span>
            <span class="detail-value">${eventLocation}</span>
          </div>
        </div>
        
        ${eventDescription ? `
          <div style="margin: 20px 0;">
            <h4 style="color: #374151;">About the Event:</h4>
            <p style="color: #6b7280;">${eventDescription}</p>
          </div>
        ` : ''}
        
        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${eventId}" class="button">
            View Full Details
          </a>
        </center>
        
        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0; border-radius: 4px;">
          <strong>📝 Quick Checklist:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Check the location and plan your route</li>
            <li>Mark your calendar</li>
            <li>Prepare any materials you might need</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>See you there! 🎉</p>
          <p>Need to cancel? <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-registrations" style="color: #9333ea;">Manage your registrations</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Event cancellation email template
export function getEventCancellationEmail(
  userName: string,
  eventTitle: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Registration Cancelled</h2>
        <p>Hi ${userName},</p>
        <p>You've successfully unregistered from <strong>${eventTitle}</strong>.</p>
        <p>You can always browse and register for other events on Eventally.</p>
        <p style="margin-top: 30px; color: #6b7280;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events" style="color: #9333ea;">Browse Events</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

// New event created email template
export function getNewEventCreatedEmail(
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  eventLocation: string,
  eventDescription: string,
  eventCategory: string,
  eventId: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .new-badge {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          margin: 20px 0;
        }
        .category-badge {
          display: inline-block;
          background-color: #f3f4f6;
          color: #6b7280;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .event-details {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          min-width: 100px;
          color: #6b7280;
        }
        .detail-value {
          color: #111827;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%);
          color: white;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Eventally</div>
          <div class="new-badge">🎉 New Event Available</div>
        </div>
        
        <h2>Hi ${userName}!</h2>
        <p>We're excited to let you know about a new event that's just been added to Eventally:</p>
        
        <div style="text-align: center;">
          <span class="category-badge">${eventCategory}</span>
        </div>
        <h3 style="color: #9333ea; font-size: 24px; margin: 20px 0; text-align: center;">${eventTitle}</h3>
        
        <div class="event-details">
          <div class="detail-row">
            <span class="detail-label">📅 Date:</span>
            <span class="detail-value">${eventDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">🕐 Time:</span>
            <span class="detail-value">${eventTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">📍 Location:</span>
            <span class="detail-value">${eventLocation}</span>
          </div>
        </div>
        
        ${eventDescription ? `
          <div style="margin: 20px 0;">
            <h4 style="color: #374151; margin-bottom: 10px;">About the Event:</h4>
            <p style="color: #6b7280; line-height: 1.6;">${eventDescription}</p>
          </div>
        ` : ''}
        
        <p style="margin: 25px 0;">
          Don't miss out! Register now to secure your spot at this event.
        </p>
        
        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${eventId}" class="button">
            View Event & Register
          </a>
        </center>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
          <strong>💡 Quick Tip:</strong> Popular events fill up fast! Register early to guarantee your spot.
        </div>
        
        <div class="footer">
          <p>You received this email because you're a registered member of Eventally.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events" style="color: #9333ea;">Browse All Events</a> | <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/profile" style="color: #9333ea;">Manage Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
