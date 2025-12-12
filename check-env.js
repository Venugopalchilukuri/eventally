// Quick diagnostic to check .env.local parsing
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
console.log('📁 Reading:', envPath);
console.log('📁 Exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('\n📄 File size:', content.length, 'bytes');
    console.log('\n📄 Raw content (first 500 chars):');
    console.log(content.substring(0, 500));
    console.log('\n📄 Lines:');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('GMAIL')) {
            console.log(`Line ${i + 1}: "${line}"`);
            console.log(`  Length: ${line.length}`);
            console.log(`  Trimmed: "${line.trim()}"`);
        }
    });
}
