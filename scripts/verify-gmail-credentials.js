/**
 * Gmail Credentials Verification Script
 * Run this to verify your Gmail App Password is working correctly
 * 
 * Usage: node scripts/verify-gmail-credentials.js
 */

// Try to load .env.local manually if dotenv is not available
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // If dotenv is not installed, try to read .env.local manually
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

const nodemailer = require('nodemailer');

async function verifyGmailCredentials() {
  console.log('🔍 Gmail Credentials Verification\n');
  console.log('═'.repeat(60));
  
  const gmailUser = (process.env.GMAIL_USER || '').trim();
  const gmailAppPassword = (process.env.GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');
  
  // Check if credentials exist
  console.log('\n📋 Configuration Check:');
  console.log('  GMAIL_USER:', gmailUser || '❌ NOT SET');
  console.log('  GMAIL_APP_PASSWORD:', gmailAppPassword ? `SET (${gmailAppPassword.length} chars)` : '❌ NOT SET');
  
  if (!gmailUser || !gmailAppPassword) {
    console.error('\n❌ Missing credentials!');
    console.error('Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local');
    process.exit(1);
  }
  
  // Validate format
  console.log('\n✅ Format Validation:');
  const isGmail = gmailUser.includes('@gmail.com') || gmailUser.includes('@googlemail.com');
  console.log('  Email format:', isGmail ? '✅ Valid' : '⚠️ Should be @gmail.com');
  console.log('  Password length:', gmailAppPassword.length === 16 ? '✅ Correct (16 chars)' : `❌ Should be 16, got ${gmailAppPassword.length}`);
  
  if (gmailAppPassword.length !== 16) {
    console.error('\n❌ App Password must be exactly 16 characters!');
    console.error('Make sure you copied the complete App Password and removed all spaces.');
    process.exit(1);
  }
  
  // Test connection
  console.log('\n🔐 Testing Gmail SMTP Connection...');
  console.log('  User:', gmailUser);
  console.log('  Password preview:', gmailAppPassword.substring(0, 4) + '****' + gmailAppPassword.substring(12));
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
  
  try {
    // Verify connection
    console.log('\n⏳ Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Try sending a test email
    console.log('\n📧 Sending test email to yourself...');
    const info = await transporter.sendMail({
      from: `Eventally Test <${gmailUser}>`,
      to: gmailUser,
      subject: 'Gmail Credentials Test - Eventally',
      html: `
        <h2>✅ Success!</h2>
        <p>Your Gmail App Password is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p>You can now use this configuration in your Eventally app.</p>
      `,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('\n🎉 All checks passed! Your Gmail configuration is working.');
    console.log('   Check your inbox at', gmailUser, 'for the test email.');
    
  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.error('\n📋 Troubleshooting Steps:');
      console.error('1. Verify 2-Step Verification is enabled:');
      console.error('   https://myaccount.google.com/security');
      console.error('');
      console.error('2. Generate a NEW App Password:');
      console.error('   https://myaccount.google.com/apppasswords');
      console.error('   - Select "Mail"');
      console.error('   - Select "Other (Custom name)"');
      console.error('   - Name it "Eventally"');
      console.error('   - Click "Generate"');
      console.error('');
      console.error('3. Copy the App Password:');
      console.error('   - It shows as: "abcd efgh ijkl mnop"');
      console.error('   - Copy ALL 16 characters');
      console.error('   - Remove ALL spaces when pasting');
      console.error('');
      console.error('4. Update .env.local:');
      console.error('   GMAIL_USER=' + gmailUser);
      console.error('   GMAIL_APP_PASSWORD=<paste-16-char-password-here>');
      console.error('');
      console.error('5. Restart your development server');
      console.error('');
      console.error('⚠️ Important:');
      console.error('   - Use the App Password, NOT your regular Gmail password');
      console.error('   - App Passwords are 16 characters, no spaces');
      console.error('   - Make sure 2-Step Verification is enabled first');
    }
    
    process.exit(1);
  }
}

// Run the verification
verifyGmailCredentials().catch(console.error);

