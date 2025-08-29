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
    }

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
      password, // Plain text as per your setup
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
    
    // Return donor data for profile page
    res.status(201).json({
      success: true,
      message: 'Donor registered successfully!',
      donorId: donorId,
      donorData: {
        personalInfo: {
          firstName,
          lastName,
          username,
          email,
          dateOfBirth,
          country,
          division: country === 'Bangladesh' ? division : null,
          memberSince: new Date().getFullYear().toString()
        },
        donations: [],
        achievements: [
          {
            title: "Welcome to SHODESH",
            description: "Successfully created your donor account",
            icon: "fas fa-star",
            earned: true
          }
        ]
      }
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
        message: 'Username or email already exists.'
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

// POST /api/donor/signin - Authenticate donor
router.post('/signin', async (req, res) => {
  console.log('🔐 Donor sign in request received:', req.body);
  
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Query to find donor by username
    const query = `
      SELECT donor_id, first_name, last_name, username, email, password,
             date_of_birth, country, division, profile_created_at
      FROM donor 
      WHERE username = ?
    `;
    
    const results = await new Promise((resolve, reject) => {
      db.query(query, [username], (err, results) => {
        if (err) {
          console.error('❌ Error fetching donor:', err);
          reject(err);
        } else {
          console.log('📋 Donor query results:', results.length);
          resolve(results);
        }
      });
    });

    // Check if donor exists
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const donor = results[0];
    
    // Verify password (plain text comparison)
    if (donor.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    console.log('✅ Donor authenticated successfully:', donor.donor_id);

    // Prepare donor data for profile
    const donorData = {
      personalInfo: {
        firstName: donor.first_name,
        lastName: donor.last_name,
        username: donor.username,
        email: donor.email,
        dateOfBirth: donor.date_of_birth,
        country: donor.country,
        division: donor.division,
        memberSince: new Date(donor.profile_created_at).getFullYear().toString()
      },
      donations: [], // Will be populated from donations table later
      achievements: [
        {
          title: "Welcome to SHODESH",
          description: "Successfully created your donor account",
          icon: "fas fa-star",
          earned: true
        },
        {
          title: "Returning Member",
          description: "Signed in to your account",
          icon: "fas fa-sign-in-alt",
          earned: true
        }
      ]
    };

    // Return success response with donor data
    res.status(200).json({
      success: true,
      message: 'Sign in successful',
      donorId: donor.donor_id,
      donorData: donorData
    });

  } catch (error) {
    console.error('❌ Error during sign in:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/donor/profile/:donorId - Get donor profile data
router.get('/profile/:donorId', async (req, res) => {
  try {
    const { donorId } = req.params;
    
    // Query only table fields
    const query = `
      SELECT donor_id, first_name, last_name, username, email, 
             date_of_birth, country, division, profile_created_at
      FROM donor 
      WHERE donor_id = ?
    `;
    
    const results = await new Promise((resolve, reject) => {
      db.query(query, [donorId], (err, results) => {
        if (err) {
          console.error('❌ Error fetching donor profile:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    const donor = results[0];
    const donorData = {
      personalInfo: {
        firstName: donor.first_name,
        lastName: donor.last_name,
        username: donor.username,
        email: donor.email,
        dateOfBirth: donor.date_of_birth,
        country: donor.country,
        division: donor.division,
        memberSince: new Date(donor.profile_created_at).getFullYear().toString()
      },
      donations: [], // Empty for new users
      achievements: [
        {
          title: "Welcome to SHODESH",
          description: "Successfully created your donor account",
          icon: "fas fa-star",
          earned: true
        }
      ]
    };

    res.json({
      success: true,
      donorData
    });

  } catch (error) {
    console.error('❌ Error fetching donor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donor profile'
    });
  }
});

// POST /api/donor/check-availability - Check if username/email is available
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

    const isAvailable = results.length === 0;
    
    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable ? 
        `${field.charAt(0).toUpperCase() + field.slice(1)} is available` : 
        `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken`,
      field: field
    });
  });
});





router.post('/check-username', (req, res) => {
  const { username, donorId } = req.body;
  db.query(
    'SELECT donor_id FROM donor WHERE username = ? AND donor_id != ?',
    [username, donorId],
    (err, results) => {
      if (err) return res.status(500).json({ available: false });
      res.json({ available: results.length === 0 });
    }
  );
});



router.put('/update/:donorId', async (req, res) => {
  const donorId = req.params.donorId;
  const { username, newPassword, currentPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password required.' });
  }

  db.query('SELECT password FROM donor WHERE donor_id = ?', [donorId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ success: false, message: 'Donor not found.' });
    }
    const dbPassword = results[0].password;
    if (dbPassword !== currentPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    

    // Build update query
    let fields = [];
    let values = [];
    if (username) { fields.push('username = ?'); values.push(username); }
    if (newPassword) { fields.push('password = ?'); values.push(newPassword); }
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }
    values.push(donorId);

    db.query(
      `UPDATE donor SET ${fields.join(', ')} WHERE donor_id = ?`,
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



module.exports = router;