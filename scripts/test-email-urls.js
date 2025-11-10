/**
 * Test Email URL Configuration
 * Run this to verify your email URLs are configured correctly
 * 
 * Usage: node scripts/test-email-urls.js
 */

console.log('🔍 Checking Email URL Configuration...\n');

// Check environment variables
const nextPublicUrl = process.env.NEXT_PUBLIC_APP_URL;
const vercelUrl = process.env.VERCEL_URL;

console.log('Environment Variables:');
console.log('├─ NEXT_PUBLIC_APP_URL:', nextPublicUrl || '❌ Not set');
console.log('└─ VERCEL_URL:', vercelUrl || '❌ Not set');

// Determine which URL will be used
let activeUrl;
let source;

if (nextPublicUrl) {
  activeUrl = nextPublicUrl;
  source = 'NEXT_PUBLIC_APP_URL';
} else if (vercelUrl) {
  activeUrl = `https://${vercelUrl}`;
  source = 'VERCEL_URL (auto-detected)';
} else {
  activeUrl = 'http://localhost:3000';
  source = 'Default (localhost)';
}

console.log('\n📧 Email URLs will use:');
console.log(`├─ Base URL: ${activeUrl}`);
console.log(`└─ Source: ${source}`);

// Show example URLs
console.log('\n📎 Example Email Links:');
console.log(`├─ Event page: ${activeUrl}/events/[id]`);
console.log(`├─ My registrations: ${activeUrl}/my-registrations`);
console.log(`├─ Browse events: ${activeUrl}/events`);
console.log(`└─ Profile settings: ${activeUrl}/settings/profile`);

// Warnings
if (!nextPublicUrl && !vercelUrl) {
  console.log('\n⚠️  WARNING: Using localhost - Email links will NOT work from external devices!');
  console.log('\n💡 To fix:');
  console.log('   For Vercel: Deploy to Vercel (VERCEL_URL auto-set)');
  console.log('   For other platforms: Set NEXT_PUBLIC_APP_URL environment variable');
  console.log('   Example: NEXT_PUBLIC_APP_URL=https://your-domain.com');
} else {
  console.log('\n✅ Configuration looks good!');
  console.log('   Email links will work on all devices.');
}

console.log('\n---');
console.log('After deploying, test by:');
console.log('1. Registering for an event');
console.log('2. Opening the confirmation email');
console.log('3. Clicking the "View Event Details" button');
console.log('4. Verifying the page loads correctly\n');
