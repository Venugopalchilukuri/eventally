// Compare what verification script sees vs what we can read
const fs = require('fs');
const path = require('path');

console.log('='.repeat(70));
console.log('ENVIRONMENT VARIABLE DIAGNOSTIC');
console.log('='.repeat(70));

// Method 1: Read file directly
const envPath = path.join(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split(/\r?\n/);

console.log('\n📄 Method 1: Direct file read');
console.log('Total lines:', lines.length);

let gmailUser = '';
let gmailPass = '';

lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        if (trimmed.startsWith('GMAIL_USER=')) {
            gmailUser = trimmed.substring('GMAIL_USER='.length).trim();
            console.log(`\nLine ${idx + 1}: GMAIL_USER`);
            console.log('  Raw value:', JSON.stringify(gmailUser));
            console.log('  Length:', gmailUser.length);
            console.log('  Has quotes:', gmailUser.startsWith('"') || gmailUser.startsWith("'"));
        }
        if (trimmed.startsWith('GMAIL_APP_PASSWORD=')) {
            gmailPass = trimmed.substring('GMAIL_APP_PASSWORD='.length).trim();
            console.log(`\nLine ${idx + 1}: GMAIL_APP_PASSWORD`);
            console.log('  Length:', gmailPass.length);
            console.log('  Has quotes:', gmailPass.startsWith('"') || gmailPass.startsWith("'"));
            console.log('  Has spaces:', gmailPass.includes(' '));
            console.log('  Preview:', gmailPass.substring(0, 4) + '****' + gmailPass.substring(Math.max(0, gmailPass.length - 4)));
        }
    }
});

// Remove quotes if present
if (gmailUser.startsWith('"') && gmailUser.endsWith('"')) {
    gmailUser = gmailUser.slice(1, -1);
}
if (gmailUser.startsWith("'") && gmailUser.endsWith("'")) {
    gmailUser = gmailUser.slice(1, -1);
}
if (gmailPass.startsWith('"') && gmailPass.endsWith('"')) {
    gmailPass = gmailPass.slice(1, -1);
}
if (gmailPass.startsWith("'") && gmailPass.endsWith("'")) {
    gmailPass = gmailPass.slice(1, -1);
}

// Remove spaces from password
gmailPass = gmailPass.replace(/\s+/g, '');

console.log('\n📊 FINAL VALUES (after cleanup):');
console.log('  GMAIL_USER:', gmailUser);
console.log('  GMAIL_APP_PASSWORD length:', gmailPass.length);
console.log('  Password should be 16 chars:', gmailPass.length === 16 ? '✅ YES' : '❌ NO');

console.log('\n' + '='.repeat(70));
