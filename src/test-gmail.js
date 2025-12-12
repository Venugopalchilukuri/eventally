const nodemailer = require('nodemailer');
const fs = require('fs');

// Read .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
let gmailUser = '';
let gmailAppPassword = '';

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('GMAIL_USER=')) {
    gmailUser = trimmed.split('=')[1].trim();
  }
  if (trimmed.startsWith('GMAIL_APP_PASSWORD=')) {
    gmailAppPassword = trimmed.split('=')[1].trim().replace(/\s+/g, '');
  }
});

console.log('Testing Gmail credentials...');
console.log('User:', gmailUser);
console.log('Password length:', gmailAppPassword.length);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: gmailUser,
    pass: gmailAppPassword,
  },
});

transporter.verify()
  .then(() => {
    console.log('✅ Gmail credentials are valid!');
    return transporter.sendMail({
      from: gmailUser,
      to: gmailUser,
      subject: 'Test Email',
      html: '<p>Test successful!</p>',
    });
  })
  .then((info) => {
    console.log('✅ Test email sent! Message ID:', info.messageId);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    if (error.code === 'EAUTH') {
      console.error('\nYour App Password is invalid. Please:');
      console.error('1. Go to https://myaccount.google.com/apppasswords');
      console.error('2. Generate a new App Password');
      console.error('3. Update .env.local');
    }
  });