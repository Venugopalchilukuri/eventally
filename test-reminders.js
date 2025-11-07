// Quick test script to verify event reminder system
// Run: node test-reminders.js

const http = require('http');

console.log('🧪 Testing Event Reminder System...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/send-event-reminders',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📊 Response Status:', res.statusCode);
    console.log('📧 Response Data:\n');
    
    try {
      const result = JSON.parse(data);
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('\n✅ SUCCESS!');
        console.log(`📧 Emails sent: ${result.emailsSent}`);
        console.log(`📅 Events processed: ${result.eventCount}`);
        
        if (result.eventCount === 0) {
          console.log('\n💡 TIP: Create an event for tomorrow and register for it to test reminders!');
        }
      } else {
        console.log('\n❌ ERROR:', result.error);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error connecting to server:', error.message);
  console.log('\n💡 Make sure your dev server is running: npm run dev');
});

req.end();
