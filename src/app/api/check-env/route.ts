import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Show what environment variables Next.js can see
  const envCheck = {
    GMAIL_USER: process.env.GMAIL_USER ? `${process.env.GMAIL_USER.substring(0, 3)}*** (${process.env.GMAIL_USER.length} chars)` : '❌ NOT SET',
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? `SET (${process.env.GMAIL_APP_PASSWORD.length} chars)` : '❌ NOT SET',
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'not set',
    // Show first/last chars of password for verification (without exposing it)
    PASSWORD_PREVIEW: process.env.GMAIL_APP_PASSWORD 
      ? `${process.env.GMAIL_APP_PASSWORD.substring(0, 4)}...${process.env.GMAIL_APP_PASSWORD.substring(process.env.GMAIL_APP_PASSWORD.length - 4)}`
      : 'N/A',
  };

  return NextResponse.json({
    message: 'Environment Variables Check',
    environment: envCheck,
    timestamp: new Date().toISOString(),
    note: 'If GMAIL_APP_PASSWORD shows "NOT SET", Next.js is not reading .env.local properly',
  });
}


