// routes/staff.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');

// ---------- Multer config for file upload (CV) ----------
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

// ---------- Helpers ----------
function generateStaffId(count) {
  return 'STF' + String(count + 1).padStart(4, '0');
}
function validateEmail(email) {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
  return emailRegex.test(email);
}
function validateName(name) {
  const nameRegex = /^[A-Za-z ]+$/;
  return nameRegex.test(name);
}

// ---------- Signup ----------
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

    // Check duplicates
    db.query(
      'SELECT staff_id FROM STAFF WHERE username=? OR email=? OR nid=?',
      [username, email, nid],
      (err, exists) => {
        if (err) {
          console.error('DB error during duplicate check:', err);
          return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
        }
        if (exists.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Username, email, or NID already exists.',
            code: 'DUPLICATE'
          });
        }

        // Generate staff_id
        db.query('SELECT COUNT(*) AS count FROM STAFF', (err, row) => {
          if (err) {
            console.error('DB error during staff_id generation:', err);
            return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
          }
          const staff_id = generateStaffId(row[0].count);

          // Insert staff
          db.query(
            `INSERT INTO STAFF (
              staff_id, first_name, last_name, username, password, mobile, email, nid, dob,
              house_no, road_no, area, district, administrative_div, zip, CV, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              staff_id, first_name, last_name, username, password, mobile, email, nid, dob,
              house_no, road_no, area, district, administrative_div, zip, cvBuffer, 'unverified'
            ],
            (err) => {
              if (err) {
                console.error('DB error during staff insert:', err);
                return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
              }
              try { if (req.session) { req.session.staffId = staff_id; req.session.staffUsername = username; } } catch(e){}

              res.status(201).json({
                success: true,
                staffId: staff_id,
                message: 'Staff account created. Awaiting verification.'
              });
            }
          );
        });
      }
    );
  } catch (err) {
    console.error('Staff signup error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// NOTE: Only one GET /signup route
router.get('/signup', (req, res) => {
  res.json({ message: 'Staff signup endpoint is POST only.' });
});

// ---------- Signin ----------
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

    db.query('SELECT * FROM STAFF WHERE username = ?', [username], (err, rows) => {
      if (err) {
        console.error('Staff signin DB error:', err);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
      }
      if (rows.length === 0) {
        console.log('No staff found for username:', username);
        return res.status(401).json({ success: false, message: 'Invalid username or password.' });
      }

      const staff = rows[0];
      // Plain text check (replace with bcrypt in prod)
      if (staff.password !== password) {
        console.log('Password mismatch for username:', username);
        return res.status(401).json({ success: false, message: 'Invalid username or password.' });
      }
      if (staff.status !== 'verified') {
        console.log('Staff not verified:', username);
        return res.status(403).json({ success: false, message: 'Your staff account is not verified yet.' });
      }

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

      try { if (req.session) { req.session.staffId = staff.staff_id; req.session.staffUsername = staff.username; } } catch(e){}

      console.log('Staff signin successful:', staff.username);
      res.json({ success: true, staffId: staff.staff_id, staffData });
    });
  } catch (err) {
    console.error('Staff signin error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ---------- Test ----------
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Staff routes are working!' });
});

// ---------- Auth middleware ----------
function authenticateStaff(req, res, next) {
  try {
    console.log('🔐 Staff authentication middleware called');
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Staff authentication required' });
    }
    const staffId = authHeader.substring(7);
    if (!staffId) {
      return res.status(401).json({ success: false, message: 'Invalid staff token' });
    }
    req.staffId = staffId;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Authentication error: ' + error.message });
  }
}

// ---------- Pending events (aligned with your view predicates) ----------
router.get('/pending-events', authenticateStaff, (req, res) => {
  const staffId = req.staffId;

  const sql = `
    SELECT 
      ec.creation_id,
      ec.title,
      ec.amount_needed,
      ec.created_at,
      ec.division,
      CASE 
        WHEN ec.creator_type = 'individual' THEN CONCAT(i.first_name, ' ', i.last_name)
        ELSE f.foundation_name
      END AS creator_name
    FROM EVENT_CREATION ec
    JOIN EVENT_VERIFICATION ev 
      ON ec.creation_id = ev.creation_id
    LEFT JOIN INDIVIDUAL i ON ec.individual_id = i.individual_id
    LEFT JOIN FOUNDATION f ON ec.foundation_id = f.foundation_id
    WHERE ec.verification_status = 'pending'
      AND ec.second_verification_required = 1
      AND ev.round_no = 1
      AND ev.decision = 'request_staff_verification'
      AND ev.staff_id = ?
    GROUP BY ec.creation_id
    ORDER BY ec.created_at DESC
  `;

  db.query(sql, [staffId], (err, rows) => {
    if (err) {
      console.error('Error fetching pending event details:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch pending events' });
    }
    res.json({ success: true, data: rows });
  });
});

// ---------- Event details for staff ----------
router.get('/events/:id/details', authenticateStaff, (req, res) => {
  const { id } = req.params;
  const staffId = req.staffId;

  // Verify access using the same predicates used to list pending events
  const canAccessSql = `
    SELECT 1
    FROM EVENT_CREATION ec
    JOIN EVENT_VERIFICATION ev ON ec.creation_id = ev.creation_id
    WHERE ec.creation_id = ?
      AND ec.verification_status = 'pending'
      AND ec.second_verification_required = 1
      AND ev.round_no = 1
      AND ev.decision = 'request_staff_verification'
      AND ev.staff_id = ?
    LIMIT 1
  `;

  db.query(canAccessSql, [id, staffId], (err, accessRows) => {
    if (err) {
      console.error('Error checking staff access:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch event details' });
    }
    if (accessRows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to verify this event' });
    }

    const detailSql = `
      SELECT 
        ec.*,
        c.category_name,
        et.event_type_name,
        CASE 
          WHEN ec.creator_type = 'individual' THEN CONCAT(i.first_name, ' ', i.last_name)
          ELSE f.foundation_name
        END AS creator_name
      FROM EVENT_CREATION ec
      LEFT JOIN INDIVIDUAL i ON ec.individual_id = i.individual_id AND ec.creator_type = 'individual'
      LEFT JOIN FOUNDATION f ON ec.foundation_id = f.foundation_id AND ec.creator_type = 'foundation'
      LEFT JOIN EVENT_BASED_ON_CATEGORY ebc ON ec.ebc_id = ebc.ebc_id
      LEFT JOIN CATEGORY c ON ebc.category_id = c.category_id
      LEFT JOIN EVENT_TYPE et ON ebc.event_type_id = et.event_type_id
      WHERE ec.creation_id = ?
      LIMIT 1
    `;

    db.query(detailSql, [id], (err2, rows) => {
      if (err2) {
        console.error('Error fetching event details:', err2);
        return res.status(500).json({ success: false, message: 'Failed to fetch event details' });
      }
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      res.json({ success: true, data: rows[0] });
    });
  });
});

// ---------- Staff decision ----------
router.put('/events/:id/verify', authenticateStaff, (req, res) => {
  const { id } = req.params;
  const { decision, reason } = req.body; // 'approved' or 'rejected'
  const staffId = req.staffId;

  if (!decision || !['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ success: false, message: 'Invalid decision. Use approved or rejected' });
  }
  if (decision === 'rejected' && (!reason || !reason.trim())) {
    return res.status(400).json({ success: false, message: 'Reason is required for rejection' });
  }

  // Verify access same as details/pending
  const canAccessSql = `
    SELECT 1
    FROM EVENT_CREATION ec
    JOIN EVENT_VERIFICATION ev ON ec.creation_id = ev.creation_id
    WHERE ec.creation_id = ?
      AND ec.verification_status = 'pending'
      AND ec.second_verification_required = 1
      AND ev.round_no = 1
      AND ev.decision = 'request_staff_verification'
      AND ev.staff_id = ?
    LIMIT 1
  `;

  db.query(canAccessSql, [id, staffId], (err, accessRows) => {
    if (err) {
      console.error('Error checking staff access:', err);
      return res.status(500).json({ success: false, message: 'Failed to verify event: ' + err.message });
    }
    if (accessRows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to verify this event' });
    }

    console.log(`🔍 Staff ${staffId} calling sp_staff_verify_event for ${id} with decision: ${decision}`);
    // NOTE: keeping your 3-arg signature (staffId, creationId, decision)
    db.query('CALL sp_staff_verify_event(?, ?, ?)', [staffId, id, decision], (err2) => {
      if (err2) {
        console.error('Error in staff verification:', err2);
        return res.status(500).json({ success: false, message: 'Failed to verify event: ' + err2.message });
      }
      console.log(`✅ Staff verification completed for ${id}: ${decision}`);
      const message = decision === 'approved'
        ? 'Event approved by staff. Sent back to admin for final approval.'
        : 'Event rejected by staff';
      res.json({ success: true, message, decision });
    });
  });
});

module.exports = router;
