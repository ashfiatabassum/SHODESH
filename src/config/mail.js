// Mail utility for sending emails
const nodemailer = require('nodemailer');

// Configure transporter with environment variables or defaults
// For production, set these in your .env file
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER || 'your-email@gmail.com',
    pass: process.env.MAIL_PASSWORD || 'your-app-password'
  }
});

/**
 * Send email helper function
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise}
 */
async function sendMail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@shodesh.com',
      to: to,
      subject: subject,
      html: html
    });
    console.log('📧 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send registration confirmation email to NGO/Foundation
 */
async function sendFoundationRegistrationEmail(email, foundationName) {
  const subject = 'Thank You for Registering with SHODESH';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #176b3a; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
        .content h2 { color: #176b3a; margin-top: 0; }
        .highlight { background: #fff; padding: 20px; border-left: 4px solid #176b3a; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; background: #176b3a; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to SHODESH</h1>
        </div>
        
        <div class="content">
          <h2>Thank You for Registering!</h2>
          
          <p>Dear <strong>${foundationName}</strong>,</p>
          
          <p>Thank you for registering your organization with SHODESH. We are excited to have you join our community of dedicated organizations making a positive impact across Bangladesh.</p>
          
          <div class="highlight">
            <strong>📋 What Happens Next?</strong>
            <p>Your account is currently being verified by our admin team. We conduct a thorough review of all submissions to maintain the integrity and trust of our platform. This process typically takes <strong>2-5 business days</strong>.</p>
            <p>Once the verification is complete, you will receive a notification email with further instructions on how to access your dashboard and manage your campaigns.</p>
          </div>
          
          <p><strong>What to Expect:</strong></p>
          <ul>
            <li>Your organization information will be reviewed</li>
            <li>Your documents will be verified for authenticity</li>
            <li>Our team will contact you if any additional information is needed</li>
            <li>You'll be notified of the verification decision via email</li>
          </ul>
          
          <p>If you have any questions or concerns in the meantime, please don't hesitate to reach out to our support team at <strong>support@shodesh.com</strong>.</p>
          
          <p>Thank you for your patience and commitment to making a difference!</p>
          
          <p>Best regards,<br><strong>The SHODESH Team</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 SHODESH. All rights reserved.</p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendMail(email, subject, html);
}

/**
 * Send registration confirmation email to Staff/Volunteer
 */
async function sendStaffRegistrationEmail(email, firstName) {
  const subject = 'Thank You for Registering as a Volunteer - SHODESH';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #176b3a; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
        .content h2 { color: #176b3a; margin-top: 0; }
        .highlight { background: #fff; padding: 20px; border-left: 4px solid #176b3a; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; background: #176b3a; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌟 Welcome to SHODESH</h1>
        </div>
        
        <div class="content">
          <h2>Thank You for Registering as a Volunteer!</h2>
          
          <p>Dear <strong>${firstName}</strong>,</p>
          
          <p>Thank you for registering as a volunteer with SHODESH. Your commitment to making a positive impact is truly appreciated. We are excited to have you join our team of dedicated volunteers across Bangladesh.</p>
          
          <div class="highlight">
            <strong>✅ What Happens Next?</strong>
            <p>Your volunteer account is currently being verified by our admin team. We conduct a thorough review of all applications to ensure quality and compatibility with our mission. This process typically takes <strong>2-5 business days</strong>.</p>
            <p>Once your verification is complete, you will receive a notification email with information about volunteer opportunities, orientation details, and how to access your volunteer dashboard.</p>
          </div>
          
          <p><strong>What to Expect:</strong></p>
          <ul>
            <li>Your personal details will be verified for security</li>
            <li>Your qualifications and background will be reviewed</li>
            <li>Our team will contact you if additional information is needed</li>
            <li>You'll be notified of the verification decision via email</li>
          </ul>
          
          <p>In the meantime, feel free to explore our website to learn more about the campaigns and opportunities available. If you have any questions, please reach out to <strong>volunteers@shodesh.com</strong>.</p>
          
          <p>Thank you for your dedication and support!</p>
          
          <p>Best regards,<br><strong>The SHODESH Team</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 SHODESH. All rights reserved.</p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendMail(email, subject, html);
}

/**
 * Send account approval email to Foundation
 */
async function sendFoundationApprovedEmail(email, foundationName) {
  const subject = 'Your Account Has Been Approved - SHODESH';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #176b3a; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
        .button { display: inline-block; background: #176b3a; color: white; padding: 10px 25px; border-radius: 6px; text-decoration: none; margin: 10px 0; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Your Account Is Approved!</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${foundationName}</strong>,</p>
          
          <p>Your account has been verified and is now active. You can log in and start creating campaigns.</p>
          
          <p><strong>Log in at:</strong> <a href="https://shodesh.com" style="color: #176b3a;">https://shodesh.com</a></p>
          <p><strong>Email:</strong> ${email}</p>
          
          <p style="margin: 20px 0;">
            <a href="https://shodesh.com/login" class="button">Log In Now</a>
          </p>
          
          <p>For support, contact <strong>support@shodesh.com</strong></p>
          
          <p>Best regards,<br>The SHODESH Team</p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 SHODESH. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendMail(email, subject, html);
}

/**
 * Send account approval email to Volunteer/Staff
 */
async function sendStaffApprovedEmail(email, firstName) {
  const subject = '✅ Your Volunteer Account Has Been Approved - SHODESH';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #176b3a; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
        .button { display: inline-block; background: #176b3a; color: white; padding: 10px 25px; border-radius: 6px; text-decoration: none; margin: 10px 0; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to SHODESH Volunteers!</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${firstName}</strong>,</p>
          
          <p>Congratulations! Your volunteer application has been approved. You can now log in and start helping organizations with their campaigns.</p>
          
          <p><strong>Log in at:</strong> <a href="https://shodesh.com" style="color: #176b3a;">https://shodesh.com</a></p>
          <p><strong>Email:</strong> ${email}</p>
          
          <p style="margin: 20px 0;">
            <a href="https://shodesh.com/login" class="button">Log In Now</a>
          </p>
          
          <p>Browse volunteer opportunities and start contributing to causes you care about.</p>
          
          <p>Need help? Contact <strong>volunteers@shodesh.com</strong></p>
          
          <p>Thank you for joining us!<br>The SHODESH Team</p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 SHODESH. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendMail(email, subject, html);
}

module.exports = {
  sendMail,
  sendFoundationRegistrationEmail,
  sendStaffRegistrationEmail,
  sendFoundationApprovedEmail,
  sendStaffApprovedEmail
};
