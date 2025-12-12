// Compare: What does Next.js see vs what's in the file?
const fs = require('fs');
const path = require('path');

console.log('='.repeat(70));
console.log('CREDENTIAL COMPARISON TEST');
console.log('='.repeat(70));

// Method 1: Read file directly (what our test scripts see)
const envPath = path.join(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split(/\r?\n/);

let fileUser = '';
let filePass = '';

lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('GMAIL_USER=')) {
        fileUser = trimmed.substring('GMAIL_USER='.length).trim();
    }
    if (trimmed.startsWith('GMAIL_APP_PASSWORD=')) {
        filePass = trimmed.substring('GMAIL_APP_PASSWORD='.length).trim().replace(/\s+/g, '');
    }
});

console.log('\n📄 FROM FILE (.env.local):');
console.log('  GMAIL_USER:', fileUser);
console.log('  GMAIL_APP_PASSWORD length:', filePass.length);
console.log('  Password preview:', filePass.substring(0, 4) + '****' + filePass.substring(12));

// Method 2: What process.env sees (what Next.js would see)
console.log('\n🔧 FROM process.env:');
console.log('  GMAIL_USER:', process.env.GMAIL_USER || 'NOT SET');
console.log('  GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ?
    `SET (${process.env.GMAIL_APP_PASSWORD.length} chars)` : 'NOT SET');

if (process.env.GMAIL_APP_PASSWORD) {
    console.log('  Password preview:',
        process.env.GMAIL_APP_PASSWORD.substring(0, 4) + '****' +
        process.env.GMAIL_APP_PASSWORD.substring(Math.max(0, process.env.GMAIL_APP_PASSWORD.length - 4)));
}

// Method 3: Try loading with dotenv
try {
    require('dotenv').config({ path: '.env.local' });
    console.log('\n📦 AFTER dotenv.config():');
    console.log('  GMAIL_USER:', process.env.GMAIL_USER || 'NOT SET');
    console.log('  GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ?
        `SET (${process.env.GMAIL_APP_PASSWORD.length} chars)` : 'NOT SET');

    if (process.env.GMAIL_APP_PASSWORD) {
        console.log('  Password preview:',
            process.env.GMAIL_APP_PASSWORD.substring(0, 4) + '****' +
            process.env.GMAIL_APP_PASSWORD.substring(Math.max(0, process.env.GMAIL_APP_PASSWORD.length - 4)));
    }
} catch (e) {
    console.log('\n⚠️ dotenv not available');
}

console.log('\n' + '='.repeat(70));

// Now test SMTP with file credentials
const nodemailer = require('nodemailer');

async function testWithFileCredentials() {
    console.log('\n🧪 TESTING SMTP WITH FILE CREDENTIALS...');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: fileUser,
            pass: filePass,
        },
    });

    try {
        await transporter.verify();
        console.log('✅ File credentials: WORK');
    } catch (error) {
        console.log('❌ File credentials: FAIL');
        console.log('   Error:', error.message);
    }
}

testWithFileCredentials();
