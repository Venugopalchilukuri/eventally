// Detailed .env.local file analysis
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf8');

console.log('='.repeat(70));
console.log('.ENV.LOCAL FILE ANALYSIS');
console.log('='.repeat(70));

console.log('\n📊 File Stats:');
console.log('  Path:', envPath);
console.log('  Size:', content.length, 'bytes');
console.log('  Lines:', content.split(/\r?\n/).length);

console.log('\n📄 Line-by-Line Analysis:');
const lines = content.split(/\r?\n/);
lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    if (line.includes('GMAIL')) {
        console.log(`\nLine ${lineNum}:`);
        console.log('  Raw:', JSON.stringify(line));
        console.log('  Length:', line.length);
        console.log('  Trimmed:', JSON.stringify(line.trim()));

        // Check for issues
        const issues = [];
        if (line.includes('"')) issues.push('Contains quotes');
        if (line.includes("'")) issues.push('Contains single quotes');
        if (line.match(/\s{2,}/)) issues.push('Contains multiple spaces');
        if (line.includes('\t')) issues.push('Contains tabs');

        if (issues.length > 0) {
            console.log('  ⚠️ Issues:', issues.join(', '));
        } else {
            console.log('  ✅ No formatting issues detected');
        }

        // Extract value
        if (line.includes('=')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim();
            console.log('  Key:', key.trim());
            console.log('  Value:', value.substring(0, 20) + '...');

            if (line.includes('GMAIL_APP_PASSWORD')) {
                const cleanValue = value.replace(/\s+/g, '');
                console.log('  Value length (with spaces):', value.length);
                console.log('  Value length (without spaces):', cleanValue.length);
                if (cleanValue.length !== 16) {
                    console.log('  ❌ ERROR: Password should be exactly 16 characters!');
                }
            }
        }
    }
});

console.log('\n' + '='.repeat(70));
console.log('\n🔍 RECOMMENDATION:');
console.log('Your .env.local should look EXACTLY like this:');
console.log('');
console.log('EMAIL_SERVICE=gmail');
console.log('GMAIL_USER=venugopalchilukuri400@gmail.com');
console.log('GMAIL_APP_PASSWORD=your16charpassword');
console.log('');
console.log('NO quotes, NO spaces in the password, NO extra whitespace!');
console.log('='.repeat(70));
