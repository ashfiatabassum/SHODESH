const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Generate donor ID (simple implementation)
function generateDonorId() {
  const prefix = 'D';
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomNum.toString().padStart(6, '0')}`;
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

// Valid Bangladesh divisions
const validDivisions = ['Barisal', 'Chittagong', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];

// POST /api/donor/register - Register a new donor
router.post('/register', async (req, res) => {
  console.log('📝 Donor registration request received:', req.body);
  
  try {
    const {
      firstName,
      lastName,
      username,
      password,
      email,
      country,
      division,
      dateOfBirth
    } = req.body;

    console.log('📋 Extracted data:', {
      firstName, lastName, username, email, country, division, dateOfBirth
    });

    // Input validation
    if (!firstName || !lastName || !username || !password || !email || !country || !dateOfBirth) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate name format
    if (!validateName(firstName) || !validateName(lastName)) {
      return res.status(400).json({
        success: false,
        message: 'Names can only contain letters and spaces'
      });
    }

    // Validate username length
    if (username.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Username cannot exceed 20 characters'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate country and division logic
    if (country === 'Bangladesh') {
      if (!division) {
        return res.status(400).json({
          success: false,
          message: 'Division is required for Bangladesh'
        });
      }
      if (!validDivisions.includes(division)) {
        return res.status(400).json({
          success: false,
          message: 'Please select a valid Bangladesh division'
        });
      }
    } else if (division) {
      return res.status(400).json({
        success: false,
        message: 'Division should only be provided for Bangladesh'
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

    // Check for existing username or email
    const checkExistingQuery = `
      SELECT username, email FROM donor 
      WHERE username = ? OR email = ?
    `;
    
    const existingResults = await new Promise((resolve, reject) => {
      db.query(checkExistingQuery, [username, email], (err, results) => {
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
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }
      if (existing.email === email) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    // Hash password
    const hashedPassword = password; // No hashing for now

    // Generate donor ID
    const donorId = generateDonorId();

    // Insert donor into database
    const insertQuery = `
      INSERT INTO donor (
        donor_id, first_name, last_name, username, email, password, 
        country, division, date_of_birth
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      donorId,
      firstName,
      lastName,
      username,
      email,
      hashedPassword,
      country,
      country === 'Bangladesh' ? division : null,
      dateOfBirth
    ];

    await new Promise((resolve, reject) => {
      db.query(insertQuery, insertValues, (err, result) => {
        if (err) {
          console.error('❌ Database insert error:', err);
          reject(err);
        } else {
          console.log('✅ Donor inserted successfully:', result);
          resolve(result);
        }
      });
    });

    console.log('🎉 Registration successful for donor:', donorId);
    res.status(201).json({
      success: true,
      message: 'Donor registered successfully!',
      donorId: donorId
    });

  } catch (error) {
    console.error('❌ Error registering donor:', error);
    
    // Handle specific MySQL errors
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        success: false,
        message: 'Database table not found. Please ensure the DONOR table exists.'
      });
    } else if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Username, email, or mobile number already exists.'
      });
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

// GET /api/donor/check-availability - Check if username/email is available
router.post('/check-availability', (req, res) => {
  const { field, value } = req.body;

  if (!field || !value) {
    return res.status(400).json({
      success: false,
      message: 'Field and value are required'
    });
  }

  if (!['username', 'email'].includes(field)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid field. Must be username or email'
    });
  }

  const query = `SELECT ${field} FROM donor WHERE ${field} = ?`;
  
  db.query(query, [value], (err, results) => {
    if (err) {
      console.error('❌ Error checking availability:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      available: results.length === 0
    });
  });
});

module.exports = router;
