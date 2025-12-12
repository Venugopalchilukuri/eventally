import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const gmailUser = (process.env.GMAIL_USER || '').trim();
    const gmailAppPassword = (process.env.GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');
    
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      configuration: {
        gmailUser: gmailUser ? `${gmailUser.substring(0, 3)}***@gmail.com` : '❌ NOT SET',
        gmailAppPasswordLength: gmailAppPassword ? gmailAppPassword.length : 0,
        gmailAppPasswordSet: !!gmailAppPassword,
        emailService: process.env.EMAIL_SERVICE || 'auto-detect',
      },
      validation: {
        userFormatValid: gmailUser.includes('@gmail.com') || gmailUser.includes('@googlemail.com'),
        appPasswordLengthValid: gmailAppPassword.length === 16,
        credentialsPresent: !!gmailUser && !!gmailAppPassword,
      },
      testResult: null,
      error: null,
    };

    // If credentials are missing, return early
    if (!gmailUser || !gmailAppPassword) {
      return NextResponse.json({
        success: false,
        diagnostics,
        message: 'Gmail credentials are missing. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local',
        instructions: [
          '1. Create a .env.local file in your project root (same folder as package.json)',
          '2. Add the following lines:',
          '   GMAIL_USER=your-email@gmail.com',
          '   GMAIL_APP_PASSWORD=your-16-char-app-password',
          '   EMAIL_SERVICE=gmail',
          '3. Restart your development server',
        ],
      });
    }

    // Validate format
    if (gmailAppPassword.length !== 16) {
      diagnostics.error = `App Password should be exactly 16 characters, but got ${gmailAppPassword.length}`;
      return NextResponse.json({
        success: false,
        diagnostics,
        message: 'App Password format is invalid',
        instructions: [
          '1. Go to https://myaccount.google.com/apppasswords',
          '2. Generate a new App Password',
          '3. Copy all 16 characters (remove spaces)',
          '4. Update GMAIL_APP_PASSWORD in .env.local',
          '5. Restart your server',
        ],
      });
    }

    // Try to send a test email
    try {
      const testResult = await sendEmail({
        to: gmailUser, // Send test email to yourself
        subject: 'Gmail Configuration Test - Eventally',
        html: `
          <h2>✅ Gmail Configuration Test Successful!</h2>
          <p>If you received this email, your Gmail SMTP configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        `,
      });

      diagnostics.testResult = {
        success: testResult.success,
        messageId: (testResult as any).messageId,
      };

      if (testResult.success) {
        return NextResponse.json({
          success: true,
          diagnostics,
          message: '✅ Gmail configuration is working! Test email sent successfully.',
          note: `Check your inbox at ${gmailUser} for the test email.`,
        });
      } else {
        return NextResponse.json({
          success: false,
          diagnostics,
          message: '❌ Gmail test failed',
          error: (testResult as any).error,
        });
      }
    } catch (testError: any) {
      diagnostics.testResult = {
        success: false,
        error: testError.message,
      };
      
      return NextResponse.json({
        success: false,
        diagnostics,
        message: 'Gmail test failed',
        error: testError.message,
        troubleshooting: [
          '1. Verify 2-Step Verification is enabled: https://myaccount.google.com/security',
          '2. Generate a new App Password: https://myaccount.google.com/apppasswords',
          '3. Make sure you copied all 16 characters (no spaces)',
          '4. Check that .env.local is in the project root',
          '5. Restart your development server after updating .env.local',
          '6. Make sure there are no quotes around values in .env.local',
        ],
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Failed to test Gmail configuration',
      },
      { status: 500 }
    );
  }
}


