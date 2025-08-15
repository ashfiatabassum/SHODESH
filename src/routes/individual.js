const express = require('express');
const router = express.Router();
const db = require('../config/db');

/*// Test route
router.get('/test', (req, res) => {
  console.log('🧪 Test route hit!');
  res.json({ message: 'Individual routes are working!' });
});*/

// Generate individual ID (simple implementation)
function generateIndividualId() {
  const prefix = 'IND';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNum}`;
}

// Validate Bangladesh mobile number format
function validateBangladeshMobile(mobile) {
  const bangladeshMobileRegex = /^0[0-9]{10}$/;
  return bangladeshMobileRegex.test(mobile);
}

// Validate email format
function validateEmail(email) {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
  return emailRegex.test(email);
}

// Validate name format (only letters and spaces)
function validateName(name) {
  const nameRegex = /^[A-Za-z ]+$/;
  return nameRegex.test(name);
}

// Validate NID format (10-17 digits)
function validateNID(nid) {
  const nidRegex = /^[0-9]{10,17}$/;
  return nidRegex.test(nid);
}

// Valid Bangladesh divisions
const validDivisions = ['Barisal', 'Chittagong', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];

// POST /api/individual/register - Register a new individual
router.post('/register', async (req, res) => {
  console.log('🎯 Individual register route hit!');
  console.log('📝 Request body:', req.body);
  console.log('📝 Individual registration request received:', req.body);
  
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      nid,
      dateOfBirth,
      houseNo,
      roadNo,
      area,
      district,
      division,
      zipCode,
      bkashNumber,
      bankAccount,
      password
    } = req.body;

    console.log('📋 Extracted data:', {
      firstName, lastName, username, email, phoneNumber, nid, district, division
    });

    // Input validation
    if (!firstName || !lastName || !username || !email || !phoneNumber || !nid || 
        !dateOfBirth || !houseNo || !roadNo || !area || !district || !division || 
        !zipCode || !bkashNumber || !bankAccount || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate name formats
    if (!validateName(firstName) || !validateName(lastName)) {
      return res.status(400).json({
        success: false,
        message: 'Names can only contain letters and spaces'
      });
    }

    // Validate username length
    if (username.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Username cannot exceed 15 characters'
      });
    }

    // Validate username format
    const usernamePattern = /^[a-zA-Z0-9._]+$/;
    if (!usernamePattern.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username can only contain letters, numbers, dots, and underscores'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Format mobile number to Bangladesh format (0XXXXXXXXXX)
    let mobileNumber = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    if (mobileNumber.length === 11 && mobileNumber.startsWith('0')) {
      // Already in correct format
    } else if (mobileNumber.length === 11 && !mobileNumber.startsWith('0')) {
      mobileNumber = '0' + mobileNumber.substring(1);
    } else if (mobileNumber.length === 10) {
      mobileNumber = '0' + mobileNumber;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be 11 digits in Bangladesh format'
      });
    }

    // Validate mobile number format
    if (!validateBangladeshMobile(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be in Bangladesh format (0XXXXXXXXXX)'
      });
    }

    // Validate NID
    if (!validateNID(nid)) {
      return res.status(400).json({
        success: false,
        message: 'NID must be 10-17 digits'
      });
    }

    // Format bkash number
    let bkashFormatted = bkashNumber.replace(/\D/g, '');
    if (bkashFormatted.length === 11 && bkashFormatted.startsWith('0')) {
      // Already in correct format
    } else if (bkashFormatted.length === 11 && !bkashFormatted.startsWith('0')) {
      bkashFormatted = '0' + bkashFormatted.substring(1);
    } else if (bkashFormatted.length === 10) {
      bkashFormatted = '0' + bkashFormatted;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Bkash number must be 11 digits in Bangladesh format'
      });
    }

    // Validate bkash number format
    if (!validateBangladeshMobile(bkashFormatted)) {
      return res.status(400).json({
        success: false,
        message: 'Bkash number must be in Bangladesh format (0XXXXXXXXXX)'
      });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate division
    if (!validDivisions.includes(division)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid Bangladesh division'
      });
    }

    // Validate zip code (4 digits)
    if (!/^\d{4}$/.test(zipCode)) {
      return res.status(400).json({
        success: false,
        message: 'Zip code must be exactly 4 digits'
      });
    }

    // Validate road number
    if (!/^\d{1,4}$/.test(roadNo)) {
      return res.status(400).json({
        success: false,
        message: 'Road number must be 1-4 digits'
      });
    }

    // Validate area format
    if (!validateName(area)) {
      return res.status(400).json({
        success: false,
        message: 'Area can only contain letters and spaces'
      });
    }

    // Validate district format
    if (!validateName(district)) {
      return res.status(400).json({
        success: false,
        message: 'District can only contain letters and spaces'
      });
    }

    // Validate date of birth
    const dobDate = new Date(dateOfBirth);
    const today = new Date();
    if (dobDate >= today) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth cannot be in the future'
      });
    }

    // Check if user is at least 13 years old
    const age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (age < 13 || (age === 13 && monthDiff < 0) || 
        (age === 13 && monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      return res.status(400).json({
        success: false,
        message: 'You must be at least 13 years old to register'
      });
    }

    // Check for existing username, email, mobile, or NID
    const checkExistingQuery = `
      SELECT username, email, mobile, nid FROM individual 
      WHERE username = ? OR email = ? OR mobile = ? OR nid = ?
    `;
    
    const existingResults = await new Promise((resolve, reject) => {
      db.query(checkExistingQuery, [username, email, mobileNumber, nid], (err, results) => {
        if (err) {
          console.error('❌ Error checking existing records:', err);
          reject(err);
        } else {
          console.log('📋 Existing check results:', results);
          resolve(results);
        }
      });
    });

    if (existingResults.length > 0) {
      const existing = existingResults[0];
      if (existing.username === username) {
        console.log(`❌ Username '${username}' already exists`);
        return res.status(409).json({
          success: false,
          message: 'This username is already taken. Please choose a different username.',
          field: 'username',
          code: 'USERNAME_EXISTS'
        });
      }
      if (existing.email === email) {
        console.log(`❌ Email '${email}' already registered`);
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please use a different email or try logging in.',
          field: 'email',
          code: 'EMAIL_EXISTS'
        });
      }
      if (existing.mobile === mobileNumber) {
        console.log(`❌ Mobile number '${mobileNumber}' already registered`);
        return res.status(409).json({
          success: false,
          message: 'This mobile number is already registered. Please use a different mobile number.',
          field: 'phoneNumber',
          code: 'MOBILE_EXISTS'
        });
      }
      if (existing.nid === nid) {
        console.log(`❌ NID '${nid}' already registered`);
        return res.status(409).json({
          success: false,
          message: 'This NID is already registered. Each person can only have one account.',
          field: 'nid',
          code: 'NID_EXISTS'
        });
      }
    }

    // Generate individual ID
    const individualId = generateIndividualId();

    // Insert individual into database
    const insertQuery = `
      INSERT INTO individual (
        individual_id, first_name, last_name, username, email, password, 
        mobile, nid, dob, house_no, road_no, area, district, 
        administrative_div, zip, bkash, bank_account
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      individualId,
      firstName,
      lastName,
      username,
      email,
      password, // No hashing as requested
      mobileNumber,
      nid,
      dateOfBirth,
      houseNo,
      roadNo,
      area,
      district,
      division, // maps to administrative_div
      zipCode,
      bkashFormatted,
      bankAccount
    ];

    await new Promise((resolve, reject) => {
      db.query(insertQuery, insertValues, (err, result) => {
        if (err) {
          console.error('❌ Database insert error:', err);
          reject(err);
        } else {
          console.log('✅ Individual inserted successfully:', result);
          resolve(result);
        }
      });
    });

    console.log('🎉 Registration successful for individual:', individualId);
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to SHODESH platform.',
      individualId: individualId
    });

  } catch (error) {
    console.error('❌ Error registering individual:', error);
    
    // Handle specific MySQL errors
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        success: false,
        message: 'Database table not found. Please ensure the INDIVIDUAL table exists.'
      });
    } else if (error.code === 'ER_DUP_ENTRY') {
      // Handle duplicate entry errors from database constraints
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('username')) {
        return res.status(409).json({
          success: false,
          message: 'This username is already taken. Please choose a different username.',
          field: 'username',
          code: 'USERNAME_EXISTS'
        });
      } else if (errorMessage.includes('email')) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please use a different email or try logging in.',
          field: 'email',
          code: 'EMAIL_EXISTS'
        });
      } else if (errorMessage.includes('mobile')) {
        return res.status(409).json({
          success: false,
          message: 'This mobile number is already registered. Please use a different mobile number.',
          field: 'phoneNumber',
          code: 'MOBILE_EXISTS'
        });
      } else if (errorMessage.includes('nid')) {
        return res.status(409).json({
          success: false,
          message: 'This NID is already registered. Each person can only have one account.',
          field: 'nid',
          code: 'NID_EXISTS'
        });
      } else {
        return res.status(409).json({
          success: false,
          message: 'Some of the information provided is already registered. Please check your username, email, mobile number, and NID.',
          code: 'DUPLICATE_ENTRY'
        });
      }
    } else if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
      return res.status(400).json({
        success: false,
        message: 'Data validation failed. Please check your input format.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
});

// POST /api/individual/check-availability - Check if username/email/mobile/nid is available
router.post('/check-availability', (req, res) => {
  const { field, value } = req.body;

  if (!field || !value) {
    return res.status(400).json({
      success: false,
      message: 'Field and value are required'
    });
  }

  if (!['username', 'email', 'mobile', 'nid'].includes(field)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid field. Must be username, email, mobile, or nid'
    });
  }

  const query = `SELECT ${field} FROM individual WHERE ${field} = ?`;
  
  db.query(query, [value], (err, results) => {
    if (err) {
      console.error('❌ Error checking availability:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    const isAvailable = results.length === 0;
    let fieldLabel = field;
    if (field === 'nid') fieldLabel = 'NID';
    if (field === 'mobile') fieldLabel = 'Mobile number';
    
    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable ? 
        `${fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1)} is available` : 
        `${fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1)} is already taken`,
      field: field
    });
  });
});

module.exports = router;





