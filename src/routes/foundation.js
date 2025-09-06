const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Generate foundation ID (simple implementation)
function generateFoundationId() {
  const prefix = 'FND';
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

// Valid Bangladesh divisions
const validDivisions = ['Barisal', 'Chittagong', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];

// POST /api/foundation/register - Register a new foundation
router.post('/register', upload.single('certificate'), async (req, res) => {
  console.log('📝 Foundation registration request received:', req.body);
  console.log('📄 Certificate file:', req.file ? 'Uploaded' : 'Missing');
  
  try {
    const {
      foundationName,
      foundationLicense,
      email,
      phone,
      houseNo,
      roadNo,
      area,
      district,
      division,
      zipCode,
      bkash,
      bankAccount,
      description,
      password
    } = req.body;

    console.log('📋 Extracted data:', {
      foundationName, foundationLicense, email, phone, district, division
    });

    // Input validation
    if (!foundationName || !foundationLicense || !email || !phone || !houseNo || 
        !roadNo || !area || !district || !division || !zipCode || !bkash || 
        !bankAccount || !description || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if certificate file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Foundation certificate PDF is required'
      });
    }

    // Validate foundation name format
    if (!validateName(foundationName)) {
      return res.status(400).json({
        success: false,
        message: 'Foundation name can only contain letters and spaces'
      });
    }

    // Validate foundation license length
    if (foundationLicense.length > 12) {
      return res.status(400).json({
        success: false,
        message: 'Foundation license cannot exceed 12 characters'
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
    let mobileNumber = phone.replace(/\D/g, ''); // Remove non-digits
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

    // Format bkash number
    let bkashNumber = bkash.replace(/\D/g, '');
    if (bkashNumber.length === 11 && bkashNumber.startsWith('0')) {
      // Already in correct format
    } else if (bkashNumber.length === 11 && !bkashNumber.startsWith('0')) {
      bkashNumber = '0' + bkashNumber.substring(1);
    } else if (bkashNumber.length === 10) {
      bkashNumber = '0' + bkashNumber;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Bkash number must be 11 digits in Bangladesh format'
      });
    }

    // Validate bkash number format
    if (!validateBangladeshMobile(bkashNumber)) {
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

    // Check for existing email, mobile, or foundation license
    const checkExistingQuery = `
      SELECT email, mobile, foundation_license FROM foundation 
      WHERE email = ? OR mobile = ? OR foundation_license = ?
    `;
    
    const existingResults = await new Promise((resolve, reject) => {
      db.query(checkExistingQuery, [email, mobileNumber, foundationLicense], (err, results) => {
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
      if (existing.email === email) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }
      if (existing.mobile === mobileNumber) {
        return res.status(409).json({
          success: false,
          message: 'Mobile number already registered'
        });
      }
      if (existing.foundation_license === foundationLicense) {
        return res.status(409).json({
          success: false,
          message: 'Foundation license already registered'
        });
      }
    }

    // Generate foundation ID
    const foundationId = generateFoundationId();

    // Insert foundation into database
    const insertQuery = `
      INSERT INTO foundation (
        foundation_id, foundation_name, certificate, foundation_license, 
        mobile, email, password, house_no, road_no, area, district, 
        administrative_div, zip, bkash, bank_account, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      foundationId,
      foundationName,
      req.file.buffer, // Store PDF as BLOB
      foundationLicense,
      mobileNumber,
      email,
      password, // No hashing as requested
      houseNo,
      roadNo,
      area,
      district,
      division, // maps to administrative_div
      zipCode,
      bkashNumber,
      bankAccount,
      description,
      'unverified' // Default status
    ];

    await new Promise((resolve, reject) => {
      db.query(insertQuery, insertValues, (err, result) => {
        if (err) {
          console.error('❌ Database insert error:', err);
          reject(err);
        } else {
          console.log('✅ Foundation inserted successfully:', result);
          resolve(result);
        }
      });
    });

    console.log('🎉 Registration successful for foundation:', foundationId);
    res.status(201).json({
      success: true,
      message: 'Foundation registration successful! Your account is under review and you will be notified once verified.',
      foundationId: foundationId,
      status: 'unverified'
    });

  } catch (error) {
    console.error('❌ Error registering foundation:', error);
    
    // Handle specific MySQL errors
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        success: false,
        message: 'Database table not found. Please ensure the FOUNDATION table exists.'
      });
    } else if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Email, mobile number, or foundation license already exists.'
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

// GET /api/foundation/check-availability - Check if email/mobile/license is available
router.post('/check-availability', (req, res) => {
  const { field, value } = req.body;

  if (!field || !value) {
    return res.status(400).json({
      success: false,
      message: 'Field and value are required'
    });
  }

  if (!['email', 'mobile', 'foundation_license'].includes(field)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid field. Must be email, mobile, or foundation_license'
    });
  }

  const query = `SELECT ${field} FROM foundation WHERE ${field} = ?`;
  
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








// POST /api/foundation/signin - Authenticate foundation
router.post('/signin', async (req, res) => {
  console.log('🔐 Foundation sign in request received:', req.body);

  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Query to find foundation by name (username)
    const query = `
      SELECT foundation_id, foundation_name, email, password, mobile, foundation_license, house_no, road_no, area, district, administrative_div, zip, bkash, bank_account, description, status
      FROM foundation
      WHERE foundation_name = ?
    `;

    const results = await new Promise((resolve, reject) => {
      db.query(query, [username], (err, results) => {
        if (err) {
          console.error('❌ Error fetching foundation:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Check if foundation exists
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const foundation = results[0];

    // Verify password (plain text comparison)
    if (foundation.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    console.log('✅ Foundation authenticated successfully:', foundation.foundation_id);

    // Prepare foundation data for profile
    const foundationData = {
      foundationInfo: {
        foundationName: foundation.foundation_name,
        email: foundation.email,
        phone: foundation.mobile,
        foundationLicense: foundation.foundation_license,
        bkashNumber: foundation.bkash,
        bankAccount: foundation.bank_account,
        visionGoals: foundation.description,
        operatingSince: "2022",
        status: foundation.status
      },
      address: {
        houseNo: foundation.house_no,
        roadNo: foundation.road_no,
        area: foundation.area,
        district: foundation.district,
        division: foundation.administrative_div,
        zipCode: foundation.zip
      }
    };

    console.log('Event:', project.creation_id, 'Donors:', donors);

    // Return success response with foundation data
    res.status(200).json({
      success: true,
      message: 'Sign in successful',
      foundationId: foundation.foundation_id,
      foundationData: foundationData
    });

  } catch (error) {
    console.error('❌ Error during foundation sign in:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});




// Get foundation profile
router.get('/profile/:foundationId', async (req, res) => {
  const { foundationId } = req.params;
  const query = `
    SELECT foundation_id, foundation_name, email, mobile, foundation_license, house_no, road_no, area, district, administrative_div, zip, bkash, bank_account, description, status
    FROM foundation
    WHERE foundation_id = ?
  `;
  db.query(query, [foundationId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Foundation not found' });
    }
    const foundation = results[0];
    res.json({
      success: true,
      foundationData: {
        foundationInfo: {
          foundationName: foundation.foundation_name,
          email: foundation.email,
          phone: foundation.mobile,
          foundationLicense: foundation.foundation_license,
          bkashNumber: foundation.bkash,
          bankAccount: foundation.bank_account,
           visionGoals: foundation.description,
          operatingSince: "2022",
          status: foundation.status
        },
        address: {
          houseNo: foundation.house_no,
          roadNo: foundation.road_no,
          area: foundation.area,
          district: foundation.district,
          division: foundation.administrative_div,
          zipCode: foundation.zip
        }
      }
    });
  });
});



router.post('/check-username', (req, res) => {
  const { username, foundationId } = req.body;
  db.query(
    'SELECT foundation_id FROM foundation WHERE foundation_name = ? AND foundation_id != ?',
    [username, foundationId],
    (err, results) => {
      if (err) return res.status(500).json({ available: false });
      res.json({ available: results.length === 0 });
    }
  );
});



router.put('/update/:foundationId', async (req, res) => {
  const foundationId = req.params.foundationId;
  const { username, newPassword, currentPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password required.' });
  }

  db.query('SELECT password FROM foundation WHERE foundation_id = ?', [foundationId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ success: false, message: 'Foundation not found.' });
    }
    const dbPassword = results[0].password;
    if (dbPassword !== currentPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    

    // Build update query
    let fields = [];
    let values = [];
    if (username) { fields.push('foundation_name = ?'); values.push(username); }
    if (newPassword) { fields.push('password = ?'); values.push(newPassword); }
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }
    values.push(foundationId);

    db.query(
      `UPDATE foundation SET ${fields.join(', ')} WHERE foundation_id = ?`,
      values,
      (err2, result) => {
        if (err2) {
          return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.json({ success: true, message: 'Profile updated successfully.' });
      }
    );
  });
});


router.get('/projects/:foundationId', async (req, res) => {
  const { foundationId } = req.params;
  try {
    const projectsQuery = `
      SELECT creation_id, title, description, amount_needed, amount_received
      FROM event_creation
      WHERE foundation_id = ?
      ORDER BY created_at DESC
    `;
    const projects = await new Promise((resolve, reject) => {
      db.query(projectsQuery, [foundationId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({ success: true, projects }); // Only projects, no donors
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
