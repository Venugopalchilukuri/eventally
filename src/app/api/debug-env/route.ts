import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    return NextResponse.json({
        GMAIL_USER: process.env.GMAIL_USER || 'NOT SET',
        GMAIL_APP_PASSWORD_LENGTH: process.env.GMAIL_APP_PASSWORD?.length || 0,
        GMAIL_APP_PASSWORD_PREVIEW: process.env.GMAIL_APP_PASSWORD
            ? process.env.GMAIL_APP_PASSWORD.substring(0, 4) + '****' + process.env.GMAIL_APP_PASSWORD.substring(12)
            : 'NOT SET',
        EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'NOT SET',
        ALL_ENV_KEYS: Object.keys(process.env).filter(k => k.includes('GMAIL')),
    });
}
