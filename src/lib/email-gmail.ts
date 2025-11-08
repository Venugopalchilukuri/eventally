// FREE Gmail SMTP Email Service - No domain needed!
// Works for unlimited users - 500 emails/day limit

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmailViaGmail({ to, subject, html }: EmailParams) {
  console.log('📧 Sending email via Gmail SMTP:', { to, subject });
  
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  
  if (!gmailUser || !gmailAppPassword) {
    console.warn('⚠️ Gmail credentials not configured');
    console.log('Add GMAIL_USER and GMAIL_APP_PASSWORD to .env.local');
    return { success: false, error: 'Gmail not configured' };
  }

  try {
    // Use nodemailer to send via Gmail SMTP
    const nodemailer = require('nodemailer');
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `Eventally <${gmailUser}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log('✅ Email sent successfully via Gmail:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Gmail email failed:', error);
    return { success: false, error: error.message };
  }
}
