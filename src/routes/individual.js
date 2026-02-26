// ================= Imports =================
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { deleteIndividualProfile } = require('../config/individualController');
//const authenticate = require('../middlewares/authenticate');

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
      mobileNumber,    // FIXED: Use mobileNumber instead of phoneNumber
      nid,             // FIXED: Use nid instead of nidNumber
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

    console.log('💾 Insert values:', insertValues);

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

// --- Robust STAFF_ASSIST insert (async/await, debug, always attempts insert) ---
if (req.body.assistingStaffId) {
  const assistingStaffId = req.body.assistingStaffId;
  console.log('🟡 Attempting STAFF_ASSIST insert for staff_id:', assistingStaffId);

  try {
    // 1. Check if staff exists
    const [staffRows] = await db.promise().query(
      "SELECT first_name, last_name, username FROM STAFF WHERE staff_id = ?",
      [assistingStaffId]
    );
    let staffName = "Unknown Staff";
    let staffUsername = "unknown";
    if (staffRows.length > 0) {
      staffName = staffRows[0].first_name + " " + staffRows[0].last_name;
      staffUsername = staffRows[0].username;
      console.log('✅ Staff found:', staffName, staffUsername);
    } else {
      console.warn('⚠️ No staff found with staff_id:', assistingStaffId);
    }

    // 2. Prepare values for insert
    const staffAssistId = "SA" + Math.floor(10000 + Math.random() * 90000);
    const individualName = req.body.firstName + " " + req.body.lastName;

    const insertValues = [
      staffAssistId,
      assistingStaffId,
      individualId,
      staffName,
      staffUsername,
      individualName
    ];

    console.log('🟢 STAFF_ASSIST insert values:', insertValues);

    // 3. Insert into STAFF_ASSIST
    const [assistResult] = await db.promise().query(
      `INSERT INTO STAFF_ASSIST (
        staff_assist_id, staff_id, individual_id, 
        staff_name_at_creation, staff_username_at_creation, 
        individual_name_at_creation, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      insertValues
    );
    console.log('✅ STAFF_ASSIST insert successful:', assistResult);

    // 4. Double-check insertion
    const [checkRows] = await db.promise().query(
      "SELECT * FROM STAFF_ASSIST WHERE staff_assist_id = ?",
      [staffAssistId]
    );
    if (checkRows.length > 0) {
      console.log('🔎 STAFF_ASSIST row confirmed in DB:', checkRows[0]);
    } else {
      console.error('❌ STAFF_ASSIST row NOT found after insert!');
    }

  } catch (err) {
    console.error('❌ STAFF_ASSIST insert error:', err);
  }
} else {
  console.log('ℹ️ No assistingStaffId provided, skipping STAFF_ASSIST insert.');
}

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

// POST /api/individual/signin - Authenticate individual
router.post('/signin', async (req, res) => {
  console.log('🔐 Individual sign in request received:', req.body);
  
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Query to find individual by email
    const query = `
      SELECT individual_id, first_name, last_name, username, email, password,
             mobile, nid, dob, house_no, road_no, area, district, 
             administrative_div, zip, bkash, bank_account
      FROM individual 
      WHERE email = ?
    `;
    
    const results = await new Promise((resolve, reject) => {
      db.query(query, [email], (err, results) => {
        if (err) {
          console.error('❌ Error fetching individual:', err);
          reject(err);
        } else {
          console.log('📋 Individual query results:', results.length);
          resolve(results);
        }
      });
    });

    // Check if individual exists
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const individual = results[0];
    
    // Verify password (plain text comparison)
    if (individual.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    console.log('✅ Individual authenticated successfully:', individual.individual_id);

    // Prepare individual data for profile
    const individualData = {
      personalInfo: {
        firstName: individual.first_name,
        lastName: individual.last_name,
        email: individual.email,
        phoneNumber: individual.mobile,      // FIXED: Use phoneNumber
        nid: individual.nid,           // FIXED: Use nidNumber
        dateOfBirth: individual.dob,
        memberSince: "2024" // You can calculate this from a created_at field if you have one
      },
      address: {
        houseNo: individual.house_no,
        roadNo: individual.road_no,
        area: individual.area,
        district: individual.district,
        division: individual.administrative_div,
        zipCode: individual.zip
      },
      financial: {
        bkashNumber: individual.bkash,
        bankAccount: individual.bank_account
      },
      helpRequests: [], // Will be populated from help_requests table later
      receivedDonations: [] // Will be populated from donations table later
    };

    // Return success response with individual data
    res.status(200).json({
      success: true,
      message: 'Sign in successful',
      individualId: individual.individual_id,
      individualData: individualData
    });

  } catch (error) {
    console.error('❌ Error during sign in:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/individual/profile/:individualId - Get individual profile data
router.get('/profile/:individualId', async (req, res) => {
  try {
    const { individualId } = req.params;
    
    const query = `
      SELECT individual_id, first_name, last_name, username, email, 
             mobile, nid, dob, house_no, road_no, area, district, 
             administrative_div, zip, bkash, bank_account
      FROM individual 
      WHERE individual_id = ?
    `;
    
    const results = await new Promise((resolve, reject) => {
      db.query(query, [individualId], (err, results) => {
        if (err) {
          console.error('❌ Error fetching individual profile:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Individual not found'
      });
    }

    const individual = results[0];
    const individualData = {
      personalInfo: {
        firstName: individual.first_name,
        lastName: individual.last_name,
        email: individual.email,
        phoneNumber: individual.mobile,      // FIXED: Use phoneNumber instead of phoneNID
        nid: individual.nid,
        dateOfBirth: individual.dob,
        memberSince: "2024"
      },
      address: {
        houseNo: individual.house_no,
        roadNo: individual.road_no,
        area: individual.area,
        district: individual.district,
        division: individual.administrative_div,
        zipCode: individual.zip
      },
      financial: {
        bkashNumber: individual.bkash,
        bankAccount: individual.bank_account
      },
      helpRequests: [],
      receivedDonations: []
    };

    res.json({
      success: true,
      individualData
    });

  } catch (error) {
    console.error('❌ Error fetching individual profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch individual profile'
    });
  }
});







router.put('/update/:individualId', async (req, res) => {
  const individualId = req.params.individualId;
  const { username, newPassword, currentPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password required.' });
  }

  db.query('SELECT password FROM individual WHERE individual_id = ?', [individualId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ success: false, message: 'Individual not found.' });
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
    values.push(individualId);

    db.query(
      `UPDATE individual SET ${fields.join(', ')} WHERE individual_id = ?`,
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


router.get('/projects/:individualId', async (req, res) => {
  const { individualId } = req.params;
  try {
    // Get all projects for the individual
    const projectsQuery = `
      SELECT creation_id, title, description, amount_needed, amount_received
      FROM event_creation
      WHERE individual_id = ?
      ORDER BY created_at DESC
    `;
    const projects = await new Promise((resolve, reject) => {
      db.query(projectsQuery, [individualId], (err, results) => {
        if (err) {
          console.error('❌ Error fetching projects:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // For each project, get donations with donor name
    const donationsMap = {};
    for (const project of projects) {
      const donationsQuery = `
        SELECT d.amount, d.paid_at, donor.first_name, donor.last_name
        FROM donation d
        JOIN donor ON d.donor_id = donor.donor_id
        WHERE d.creation_id = ?
        ORDER BY d.paid_at DESC
      `;
      const donations = await new Promise((resolve, reject) => {
        db.query(donationsQuery, [project.creation_id], (err, results) => {
          if (err) {
            console.error('❌ Error fetching donations:', err);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
      donationsMap[String(project.creation_id)] = donations; // <-- force string key
    }

    // Calculate total received for this individual
    const totalReceivedQuery = `
      SELECT SUM(amount_received) AS total_received
      FROM event_creation
      WHERE individual_id = ?
    `;
    const totalResult = await new Promise((resolve, reject) => {
      db.query(totalReceivedQuery, [individualId], (err, results) => {
        if (err) {
          console.error('❌ Error calculating total received:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
    const totalReceived = Number(totalResult[0]?.total_received) || 0;

    res.json({ success: true, projects, totalReceived, donationsMap });
  } catch (err) {
    console.error('❌ Error in projects route:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// GET /api/individual/donations/:individualId - All donations for this individual
router.get('/donations/:individualId', async (req, res) => {
  const { individualId } = req.params;
  try {
    const query = `
      SELECT d.amount, d.paid_at, donor.first_name, donor.last_name
      FROM donation d
      JOIN donor ON d.donor_id = donor.donor_id
      JOIN event_creation e ON d.creation_id = e.creation_id
      WHERE e.individual_id = ?
      ORDER BY d.paid_at DESC
    `;
    db.query(query, [individualId], (err, results) => {
      if (err) {
        console.error('❌ Error fetching donations:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.json({ success: true, donations: results });
    });
  } catch (err) {
    console.error('❌ Error in donations route:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});


// DELETE /api/individual/delete-profile
router.delete('/delete-profile', deleteIndividualProfile);

// Export router at the very end
module.exports = router;
