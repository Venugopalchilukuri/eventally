// Test SMTP with exact credentials from .env.local
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function testSMTP() {
    // Read .env.local directly
    const envPath = path.join(__dirname, '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split(/\r?\n/);

    let gmailUser = '';
    let gmailPass = '';

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('GMAIL_USER=')) {
            gmailUser = trimmed.substring('GMAIL_USER='.length).trim();
            // Remove quotes if present
            if ((gmailUser.startsWith('"') && gmailUser.endsWith('"')) ||
                (gmailUser.startsWith("'") && gmailUser.endsWith("'"))) {
                gmailUser = gmailUser.slice(1, -1);
            }
        }
        if (trimmed.startsWith('GMAIL_APP_PASSWORD=')) {
            gmailPass = trimmed.substring('GMAIL_APP_PASSWORD='.length).trim();
            // Remove quotes if present
            if ((gmailPass.startsWith('"') && gmailPass.endsWith('"')) ||
                (gmailPass.startsWith("'") && gmailPass.endsWith("'"))) {
                gmailPass = gmailPass.slice(1, -1);
            }
            // Remove all spaces
            gmailPass = gmailPass.replace(/\s+/g, '');
        }
    });

    console.log('🔍 Testing SMTP Connection');
    console.log('  User:', gmailUser);
    console.log('  Password length:', gmailPass.length);
    console.log('  Password preview:', gmailPass.substring(0, 4) + '****' + gmailPass.substring(12));

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: gmailUser,
            pass: gmailPass,
        },
    });

    try {
        console.log('\n⏳ Verifying connection...');
        await transporter.verify();
        console.log('✅ SUCCESS! SMTP connection verified.');
        console.log('\n✅ Your credentials are CORRECT!');
        return true;
    } catch (error) {
        console.error('\n❌ FAILED! SMTP connection failed.');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        if (error.code === 'EAUTH' || error.responseCode === 535) {
            console.error('\n🚨 AUTHENTICATION FAILED');
            console.error('This means the App Password in .env.local is INCORRECT or REVOKED.');
            console.error('\n📋 You need to generate a NEW App Password:');
            console.error('1. Go to: https://myaccount.google.com/apppasswords');
            console.error('2. Delete any old "Eventally" passwords');
            console.error('3. Create a new one');
            console.error('4. Copy the 16-character password (remove spaces)');
            console.error('5. Update .env.local');
            console.error('6. Restart your dev server');
        }
        return false;
    }
}

testSMTP().catch(console.error);
