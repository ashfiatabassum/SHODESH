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
  const subject = 'Thank You for Registering - SHODESH';
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
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to SHODESH</h1>
        </div>
        
        <div class="content">
          <h2>Thank You for Registering</h2>
          
          <p>Dear <strong>${foundationName}</strong>,</p>
          
          <p>We have received your registration. Your account is now under review by our verification team.</p>
          
          <p><strong>What happens next:</strong></p>
          <p>We are validating your organization details and documents. The verification process typically takes 2-5 business days.</p>
          
          <p>Once your account is verified, we will notify you via email with full access instructions.</p>
          
          <p>Thank you for your patience.</p>
          
          <p>Best regards,<br><strong>The SHODESH Team</strong></p>
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
 * Send registration confirmation email to Staff/Volunteer
 */
async function sendStaffRegistrationEmail(email, firstName) {
  const subject = 'Thank You for Registering - SHODESH';
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
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to SHODESH</h1>
        </div>
        
        <div class="content">
          <h2>Thank You for Registering</h2>
          
          <p>Dear <strong>${firstName}</strong>,</p>
          
          <p>We have received your application to join SHODESH as a volunteer.</p>
          
          <p><strong>What happens next:</strong></p>
          <p>We are reviewing your application and verifying your information. The verification process typically takes 2-5 business days.</p>
          
          <p>Once your account is verified, we will notify you via email with details on how to get started.</p>
          
          <p>Thank you for your interest in making a difference.</p>
          
          <p>Best regards,<br><strong>The SHODESH Team</strong></p>
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
 * Send registration confirmation email to Donor
 */
async function sendDonorRegistrationEmail(email, donorName) {
  const subject = 'Welcome to SHODESH';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #176b3a; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to SHODESH</h1>
        </div>
        
        <div class="content">
          <p>Hello <strong>${donorName}</strong>,</p>
          
          <p>Thank you for registering with SHODESH. Your account is now active.</p>
          
          <p><strong>You can now log in using:</strong></p>
          <p>
            Email: <strong>${email}</strong><br>
            Visit: <a href="https://shodesh.com/login" style="color: #176b3a;">https://shodesh.com/login</a>
          </p>
          
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
 * Send registration confirmation email to Individual
 */
async function sendIndividualRegistrationEmail(email, firstName) {
  const subject = 'Welcome to SHODESH';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #176b3a; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to SHODESH</h1>
        </div>
        
        <div class="content">
          <p>Hello <strong>${firstName}</strong>,</p>
          
          <p>Thank you for registering with SHODESH. Your account is now active.</p>
          
          <p><strong>You can now log in using:</strong></p>
          <p>
            Email: <strong>${email}</strong><br>
            Visit: <a href="https://shodesh.com/login" style="color: #176b3a;">https://shodesh.com/login</a>
          </p>
          
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

/**
 * Send event approval email to creator
 */
async function sendEventApprovedEmail(email, creatorName, eventTitle) {
  const subject = '✅ Your Event Has Been Approved - SHODESH';
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
        .event-title { background: #f0f8f5; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #176b3a; }
        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
        .button { display: inline-block; background: #176b3a; color: white; padding: 10px 25px; border-radius: 6px; text-decoration: none; margin: 10px 0; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Event Approved!</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${creatorName}</strong>,</p>
          
          <p>Great news! Your event has been approved by our admin team and is now live on the SHODESH platform.</p>
          
          <div class="event-title">
            <strong style="color: #176b3a;">Event:</strong><br>
            ${eventTitle}
          </div>
          
          <p>People can now donate to your campaign and volunteers can sign up to help.</p>
          
          <p>
            <a href="https://shodesh.com/dashboard" class="button">View Your Dashboard</a>
          </p>
          
          <p>Thank you for making a difference!<br>The SHODESH Team</p>
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
 * Send event rejection email to creator
 */
async function sendEventRejectedEmail(email, creatorName, eventTitle, reason) {
  const subject = '⚠️ Your Event Submission - Action Needed';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; }
        .event-title { background: #fef5f5; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #dc2626; }
        .reason-box { background: #fff5f5; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
        .button { display: inline-block; background: #176b3a; color: white; padding: 10px 25px; border-radius: 6px; text-decoration: none; margin: 10px 0; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Event Needs Review</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${creatorName}</strong>,</p>
          
          <p>Your event submission could not be approved at this time.</p>
          
          <div class="event-title">
            <strong style="color: #dc2626;">Event:</strong><br>
            ${eventTitle}
          </div>
          
          ${reason ? `<div class="reason-box">
            <strong>Reason:</strong><br>
            ${reason}
          </div>` : ''}
          
          <p>Please review the feedback and resubmit your event with the necessary changes. If you have questions, contact us at <strong>support@shodesh.com</strong></p>
          
          <p>
            <a href="https://shodesh.com/dashboard" class="button">Go to Dashboard</a>
          </p>
          
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

module.exports = {
  sendMail,
  sendFoundationRegistrationEmail,
  sendStaffRegistrationEmail,
  sendDonorRegistrationEmail,
  sendIndividualRegistrationEmail,
  sendFoundationApprovedEmail,
  sendStaffApprovedEmail,
  sendEventApprovedEmail,
  sendEventRejectedEmail
};
