const nodemailer = require('nodemailer');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let u = '', p = '';
env.split('\n').forEach(l => {
  const t = l.trim();
  if (t.startsWith('GMAIL_USER=')) u = t.split('=')[1].trim();
  if (t.startsWith('GMAIL_APP_PASSWORD=')) p = t.split('=')[1].trim().replace(/\s+/g, '');
});
console.log('User:', u);
console.log('Password length:', p.length);
const t = nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user:u,pass:p}});
t.verify().then(() => console.log('✅ Valid!')).catch(e => console.error('❌ Invalid:', e.message));