// Test All Email APIs
require('dotenv').config();
const {
  sendFoundationRegistrationEmail,
  sendStaffRegistrationEmail,
  sendFoundationApprovedEmail,
  sendStaffApprovedEmail
} = require('./src/config/mail.js');

async function testAllEmails() {
  console.log('🧪 Testing All Email APIs...\n');
  console.log('📧 Configuration:');
  console.log(`   Email: ${process.env.MAIL_USER}`);
  console.log(`   Sender: ${process.env.MAIL_FROM}\n`);

  const testEmails = [
    {
      name: '1. Foundation Registration Email',
      fn: () => sendFoundationRegistrationEmail('test@example.com', 'Hope Foundation Bangladesh'),
    },
    {
      name: '2. Staff/Volunteer Registration Email',
      fn: () => sendStaffRegistrationEmail('volunteer@example.com', 'John'),
    },
    {
      name: '3. Foundation Approval Email',
      fn: () => sendFoundationApprovedEmail('test@example.com', 'Hope Foundation Bangladesh'),
    },
    {
      name: '4. Staff/Volunteer Approval Email',
      fn: () => sendStaffApprovedEmail('volunteer@example.com', 'John'),
    }
  ];

  let successCount = 0;
  let failureCount = 0;

  for (const email of testEmails) {
    try {
      console.log(`\n📤 Testing: ${email.name}`);
      const result = await email.fn();
      
      if (result.success) {
        console.log('   ✅ Success!');
        console.log(`   Message ID: ${result.messageId}`);
        successCount++;
      } else {
        console.log('   ❌ Failed!');
        console.log(`   Error: ${result.error}`);
        failureCount++;
      }
    } catch (error) {
      console.log('   ❌ Exception!');
      console.log(`   Error: ${error.message}`);
      failureCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log(`   ✅ Successful: ${successCount}/4`);
  console.log(`   ❌ Failed: ${failureCount}/4`);
  console.log('='.repeat(50));

  if (failureCount === 0) {
    console.log('\n🎉 All emails are working correctly!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some emails failed. Check the errors above.');
    process.exit(1);
  }
}

testAllEmails();
