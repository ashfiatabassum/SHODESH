// Test Mail API
require('dotenv').config();
const { sendMail } = require('./src/config/mail.js');

async function testMailAPI() {
  console.log('🧪 Testing Mail API...\n');
  
  console.log('📧 Configuration:');
  console.log(`   Email: ${process.env.MAIL_USER}`);
  console.log(`   Password: ${process.env.MAIL_PASSWORD ? '✓ Set' : '✗ Not Set'}\n`);
  
  const testEmail = 'test@example.com';
  const testSubject = 'SHODESH Mail API Test';
  const testHtml = `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Mail API Test</h2>
        <p>If you received this email, the mail API is working correctly! ✓</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `;
  
  console.log(`📤 Sending test email to: ${testEmail}`);
  const result = await sendMail(testEmail, testSubject, testHtml);
  
  console.log('\n📊 Result:');
  if (result.success) {
    console.log('✅ Mail API is working correctly!');
    console.log(`   Message ID: ${result.messageId}`);
  } else {
    console.log('❌ Mail API failed:');
    console.log(`   Error: ${result.error}`);
  }
}

testMailAPI();
