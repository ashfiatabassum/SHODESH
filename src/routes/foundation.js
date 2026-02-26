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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Utility functions
function generateFoundationId() {
  const prefix = 'FND';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNum}`;
}

function validateBangladeshMobile(mobile) {
  return /^0[0-9]{10}$/.test(mobile);
}

function validateEmail(email) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/.test(email);
}

function validateName(name) {
  return /^[A-Za-z ]+$/.test(name);
}

const validDivisions = ['Barisal', 'Chittagong', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];

// -------------------- REGISTER FOUNDATION --------------------
router.post('/register', upload.single('certificate'), async (req, res) => {
  console.log('📝 Foundation registration request received:', req.body);
  console.log('📄 Certificate file:', req.file ? 'Uploaded' : 'Missing');
  
  try {
    const { foundationName, foundationLicense, email, phone, houseNo, roadNo, area, district, division, zipCode, bkash, bankAccount, description, password } = req.body;

    // Required fields validation
    if (!foundationName || !foundationLicense || !email || !phone || !houseNo || !roadNo || !area || !district || !division || !zipCode || !bkash || !bankAccount || !description || !password) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    if (!req.file) return res.status(400).json({ success: false, message: 'Foundation certificate PDF is required' });
    if (!validateName(foundationName)) return res.status(400).json({ success: false, message: 'Foundation name can only contain letters and spaces' });
    if (foundationLicense.length > 12) return res.status(400).json({ success: false, message: 'Foundation license cannot exceed 12 characters' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });

    // Mobile formatting
    let mobileNumber = phone.replace(/\D/g, '');
    if (mobileNumber.length === 10) mobileNumber = '0' + mobileNumber;
    if (!validateBangladeshMobile(mobileNumber)) return res.status(400).json({ success: false, message: 'Mobile number must be in Bangladesh format (0XXXXXXXXXX)' });

    // Bkash formatting
    let bkashNumber = bkash.replace(/\D/g, '');
    if (bkashNumber.length === 10) bkashNumber = '0' + bkashNumber;
    if (!validateBangladeshMobile(bkashNumber)) return res.status(400).json({ success: false, message: 'Bkash number must be in Bangladesh format (0XXXXXXXXXX)' });

    if (!validateEmail(email)) return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    if (!validDivisions.includes(division)) return res.status(400).json({ success: false, message: 'Please select a valid Bangladesh division' });
    if (!/^\d{4}$/.test(zipCode)) return res.status(400).json({ success: false, message: 'Zip code must be exactly 4 digits' });
    if (!/^\d{1,4}$/.test(roadNo)) return res.status(400).json({ success: false, message: 'Road number must be 1-4 digits' });
    if (!validateName(area)) return res.status(400).json({ success: false, message: 'Area can only contain letters and spaces' });
    if (!validateName(district)) return res.status(400).json({ success: false, message: 'District can only contain letters and spaces' });

    // Check existing
    const checkExistingQuery = `SELECT email, mobile, foundation_license FROM foundation WHERE email = ? OR mobile = ? OR foundation_license = ?`;
    const existingResults = await new Promise((resolve, reject) => {
      db.query(checkExistingQuery, [email, mobileNumber, foundationLicense], (err, results) => {
        if (err) reject(err); else resolve(results);
      });
    });
    if (existingResults.length > 0) {
      const existing = existingResults[0];
      if (existing.email === email) return res.status(409).json({ success: false, message: 'Email already registered' });
      if (existing.mobile === mobileNumber) return res.status(409).json({ success: false, message: 'Mobile number already registered' });
      if (existing.foundation_license === foundationLicense) return res.status(409).json({ success: false, message: 'Foundation license already registered' });
    }

    // Insert
    const foundationId = generateFoundationId();
    const insertQuery = `
      INSERT INTO foundation (foundation_id, foundation_name, certificate, foundation_license, mobile, email, password, house_no, road_no, area, district, administrative_div, zip, bkash, bank_account, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insertValues = [foundationId, foundationName, req.file.buffer, foundationLicense, mobileNumber, email, password, houseNo, roadNo, area, district, division, zipCode, bkashNumber, bankAccount, description, 'unverified'];
    await new Promise((resolve, reject) => {
      db.query(insertQuery, insertValues, (err, result) => { if (err) reject(err); else resolve(result); });
    });

    res.status(201).json({ success: true, message: 'Foundation registration successful! Your account is under review.', foundationId, status: 'unverified' });

  } catch (error) {
    console.error('❌ Error registering foundation:', error);
    res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
  }
});

// -------------------- CHECK AVAILABILITY --------------------
router.post('/check-availability', (req, res) => {
  const { field, value } = req.body;
  if (!field || !value) return res.status(400).json({ success: false, message: 'Field and value are required' });
  if (!['email', 'mobile', 'foundation_license'].includes(field)) return res.status(400).json({ success: false, message: 'Invalid field. Must be email, mobile, or foundation_license' });
  const query = `SELECT ${field} FROM foundation WHERE ${field} = ?`;
  db.query(query, [value], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, available: results.length === 0 });
  });
});

// -------------------- SIGNIN --------------------
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

  const query = `SELECT * FROM foundation WHERE email = ?`;
  const results = await new Promise((resolve, reject) => {
    db.query(query, [email], (err, results) => { if (err) reject(err); else resolve(results); });
  });
  if (results.length === 0) return res.status(401).json({ success: false, message: 'Invalid email or password' });

  const foundation = results[0];
  if (foundation.password !== password) return res.status(401).json({ success: false, message: 'Invalid email or password' });

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

  res.json({ success: true, message: 'Sign in successful', foundationId: foundation.foundation_id, foundationData });
});

// -------------------- GET PROFILE --------------------
router.get('/profile/:foundationId', async (req, res) => {
  const { foundationId } = req.params;
  const query = `SELECT * FROM foundation WHERE foundation_id = ?`;
  db.query(query, [foundationId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'Foundation not found' });
    const foundation = results[0];
    res.json({ success: true, foundationData: { foundationInfo: { foundationName: foundation.foundation_name, email: foundation.email, phone: foundation.mobile, foundationLicense: foundation.foundation_license, bkashNumber: foundation.bkash, bankAccount: foundation.bank_account, visionGoals: foundation.description, operatingSince: "2022", status: foundation.status }, address: { houseNo: foundation.house_no, roadNo: foundation.road_no, area: foundation.area, district: foundation.district, division: foundation.administrative_div, zipCode: foundation.zip } } });
  });
});

// -------------------- UPDATE PROFILE --------------------
router.put('/update/:foundationId', async (req, res) => {
  const foundationId = req.params.foundationId;
  const { username, newPassword, currentPassword } = req.body;
  if (!currentPassword) return res.status(400).json({ success: false, message: 'Current password required.' });

  db.query('SELECT password FROM foundation WHERE foundation_id = ?', [foundationId], (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ success: false, message: 'Foundation not found.' });
    if (results[0].password !== currentPassword) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    let fields = [], values = [];
    if (username) { fields.push('foundation_name = ?'); values.push(username); }
    if (newPassword) { fields.push('password = ?'); values.push(newPassword); }
    if (fields.length === 0) return res.status(400).json({ success: false, message: 'No fields to update.' });
    values.push(foundationId);

    db.query(`UPDATE foundation SET ${fields.join(', ')} WHERE foundation_id = ?`, values, (err2, result) => {
      if (err2) return res.status(500).json({ success: false, message: 'Database error.' });
      return res.json({ success: true, message: 'Profile updated successfully.' });
    });
  });
});

// -------------------- GET PROJECTS --------------------
router.get('/projects/:foundationId', async (req, res) => {
  const { foundationId } = req.params;
  try {
    const projects = await new Promise((resolve, reject) => {
      db.query('SELECT creation_id, title, description, amount_needed, amount_received FROM event_creation WHERE foundation_id = ? ORDER BY created_at DESC', [foundationId], (err, results) => { if (err) reject(err); else resolve(results); });
    });

    const donationsMap = {};
    for (const project of projects) {
      const donations = await new Promise((resolve, reject) => {
        db.query('SELECT d.amount, d.paid_at, donor.first_name, donor.last_name FROM donation d JOIN donor ON d.donor_id = donor.donor_id WHERE d.creation_id = ? ORDER BY d.paid_at DESC', [project.creation_id], (err, results) => { if (err) reject(err); else resolve(results); });
      });
      donationsMap[String(project.creation_id)] = donations;
    }

    const totalReceived = Number((await new Promise((resolve, reject) => { db.query('SELECT SUM(amount_received) AS total_received FROM event_creation WHERE foundation_id = ?', [foundationId], (err, results) => { if (err) reject(err); else resolve(results); }); }))[0]?.total_received) || 0;

    res.json({ success: true, projects, totalReceived, donationsMap });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// -------------------- GET DONATIONS --------------------
router.get('/donations/:foundationId', async (req, res) => {
  const { foundationId } = req.params;
  const query = 'SELECT amount, paid_at, first_name, last_name, title, description FROM foundation_donations_view WHERE foundation_id = ? ORDER BY paid_at DESC';
  db.query(query, [foundationId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, donations: results });
  });
});

// -------------------- DELETE FOUNDATION WITH CASCADE --------------------
router.delete('/delete/:foundationId', async (req, res) => {
  const { foundationId } = req.params;
  try {
    // Check active events
    const activeEvents = await new Promise((resolve, reject) => {
      db.query('SELECT creation_id FROM event_creation WHERE foundation_id = ? AND lifecycle_status = "active"', [foundationId], (err, results) => { if (err) reject(err); else resolve(results); });
    });
    if (activeEvents.length > 0) return res.status(400).json({ success: false, message: 'Profile deletion unsuccessful due to the presence of active events' });

    // Delete donations
    await new Promise((resolve, reject) => {
      db.query('DELETE d FROM donation d JOIN event_creation e ON d.creation_id = e.creation_id WHERE e.foundation_id = ?', [foundationId], (err, result) => { if (err) reject(err); else resolve(result); });
    });

    // Delete events
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM event_creation WHERE foundation_id = ?', [foundationId], (err, result) => { if (err) reject(err); else resolve(result); });
    });

    // Delete foundation
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM foundation WHERE foundation_id = ?', [foundationId], (err, result) => { if (err) reject(err); else resolve(result); });
    });

    res.json({ success: true, message: 'Foundation profile and related events/donations deleted successfully.' });
  } catch (err) {
    console.error('❌ Error deleting foundation:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
