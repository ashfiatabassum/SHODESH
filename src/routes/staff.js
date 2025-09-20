const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');

// Multer config for file upload (CV)
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

// Helper: Generate staff ID
function generateStaffId(count) {
  return 'STF' + String(count + 1).padStart(4, '0');
}

// Helper: Validate email
function validateEmail(email) {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
  return emailRegex.test(email);
}

// Helper: Validate name
function validateName(name) {
  const nameRegex = /^[A-Za-z ]+$/;
  return nameRegex.test(name);
}


// POST /api/staff/signup
router.post('/signup', upload.single('cv'), async (req, res) => {
  console.log('Received body:', req.body);
console.log('Received file:', req.file);
  try {
    const {
      first_name, last_name, username, password, mobile, email, nid, dob,
      house_no, road_no, area, district, administrative_div, zip
    } = req.body;
    const cvBuffer = req.file ? req.file.buffer : null;

    // Input validation
    if (!first_name || !last_name || !username || !password || !mobile || !email || !nid || !dob) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }
    if (!validateName(first_name) || !validateName(last_name)) {
      return res.status(400).json({ success: false, message: 'Names can only contain letters and spaces.' });
    }
    if (username.length > 20) {
      return res.status(400).json({ success: false, message: 'Username cannot exceed 20 characters.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!/^\d{10,17}$/.test(nid)) {
      return res.status(400).json({ success: false, message: 'NID must be 10-17 digits.' });
    }
    if (!/^0\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Mobile must be 11 digits and start with 0.' });
    }

    // Check for duplicate username, email, or NID
    const [exists] = await db.promise().query(
      'SELECT staff_id FROM STAFF WHERE username=? OR email=? OR nid=?',
      [username, email, nid]
    );
    if (exists.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username, email, or NID already exists.',
        code: 'DUPLICATE'
      });
    }

    // Generate staff_id
    const [row] = await db.promise().query('SELECT COUNT(*) AS count FROM STAFF');
    const staff_id = generateStaffId(row[0].count);

    // Insert staff
    await db.promise().query(
      `INSERT INTO STAFF (
        staff_id, first_name, last_name, username, password, mobile, email, nid, dob,
        house_no, road_no, area, district, administrative_div, zip, CV, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        staff_id, first_name, last_name, username, password, mobile, email, nid, dob,
        house_no, road_no, area, district, administrative_div, zip, cvBuffer, 'unverified'
      ]
    );

    // Optionally, set session
    try { if (req.session) { req.session.staffId = staff_id; req.session.staffUsername = username; } } catch(e){}

    res.status(201).json({
      success: true,
      staffId: staff_id,
      message: 'Staff account created. Awaiting verification.'
    });
  } catch (err) {
    console.error('Staff signup error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

router.get('/signup', (req, res) => {
  res.json({ message: 'Staff signup endpoint is POST only.' });
});
router.get('/signup', (req, res) => {
  res.json({ message: 'Staff signup endpoint is POST only.' });
});




/////signin


router.post('/signin', async (req, res) => {
  console.log('POST /api/staff/signin called');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  try {
    const { username, password } = req.body;
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // Find staff by username
    const [rows] = await db.promise().query(
      'SELECT * FROM STAFF WHERE username = ?',
      [username]
    );
    console.log('DB rows:', rows);

    if (rows.length === 0) {
      console.log('No staff found for username:', username);
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const staff = rows[0];

    // Check password (plain text for now; use bcrypt in production)
    if (staff.password !== password) {
      console.log('Password mismatch for username:', username);
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Check status
    if (staff.status !== 'verified') {
      console.log('Staff not verified:', username);
      return res.status(403).json({ success: false, message: 'Your staff account is not verified yet.' });
    }

    // Prepare staff data for frontend (do not send password)
    const staffData = {
      staff_id: staff.staff_id,
      first_name: staff.first_name,
      last_name: staff.last_name,
      username: staff.username,
      email: staff.email,
      mobile: staff.mobile,
      nid: staff.nid,
      dob: staff.dob,
      house_no: staff.house_no,
      road_no: staff.road_no,
      area: staff.area,
      district: staff.district,
      administrative_div: staff.administrative_div,
      zip: staff.zip,
      status: staff.status
    };

    // Optionally, set session
    try { if (req.session) { req.session.staffId = staff.staff_id; req.session.staffUsername = staff.username; } } catch(e){}

    console.log('Staff signin successful:', staff.username);
    res.json({
      success: true,
      staffId: staff.staff_id,
      staffData
    });
  } catch (err) {
    console.error('Staff signin error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;