// Admin Routes for SHODESH Platform
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const adminDb = require('../config/db-admin'); // Use promise-based DB for admin functionality

// Make sure your main server enables JSON body parsing:
// app.use(express.json());

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  console.log('🔐 Admin auth check - Headers:', req.headers.authorization ? 'Present' : 'Missing');
  const adminToken = req.headers.authorization || req.session?.adminToken;
  if (!adminToken) {
    console.log('❌ Admin auth failed - No token');
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  console.log('✅ Admin auth passed');
  next();
};

// =============================
// DASHBOARD
// =============================
router.get('/dashboard/stats', authenticateAdmin, async (req, res) => {
  try {
    const [eventStatsRows] = await adminDb.execute(`
      SELECT 
        COUNT(*) AS total_events,
        SUM(CASE WHEN verification_status = 'unverified' THEN 1 ELSE 0 END) AS pending_events,
        SUM(CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) AS verified_events,
        SUM(CASE WHEN verification_status = 'rejected' THEN 1 ELSE 0 END) AS rejected_events
      FROM EVENT_CREATION 
      WHERE lifecycle_status != 'closed'`);
    const [donationStatsRows] = await adminDb.execute(`
      SELECT 
        COUNT(*) AS total_donations,
        COALESCE(SUM(amount),0) AS total_amount,
        COALESCE(AVG(amount),0) AS average_amount
      FROM DONATION`);
    const [foundationStatsRows] = await adminDb.execute(`
      SELECT 
        COUNT(*) AS total_foundations,
        SUM(CASE WHEN status = 'unverified' THEN 1 ELSE 0 END) AS pending_foundations,
        SUM(CASE WHEN status = 'verified'   THEN 1 ELSE 0 END) AS approved_foundations
      FROM FOUNDATION`);

    let volunteerStats = { total_volunteers: 0, pending_volunteers: 0, approved_volunteers: 0 };
    try {
      const [volRows] = await adminDb.execute(`
        SELECT 
          COUNT(*) AS total_volunteers,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_volunteers,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_volunteers
        FROM VOLUNTEER`);
      volunteerStats = volRows[0] || volunteerStats;
    } catch (e) {
      console.warn('VOLUNTEER stats skipped:', e.message);
    }

    res.json({
      success: true,
      data: {
        events: eventStatsRows[0] || {},
        donations: donationStatsRows[0] || {},
        foundations: foundationStatsRows[0] || {},
        volunteers: volunteerStats
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics', error: error.message });
  }
});

// =============================
// EVENTS LISTING (ADMIN VIEW)
// =============================
router.get('/events', authenticateAdmin, async (req, res) => {
  try {
    const {
      status = '',
      category_id = '',
      event_type_id = '',
      ebc_id = '',
      creator_type = '',
      sort_by = 'recent',
      limit = 100,
      offset = 0,
    } = req.query;

    let sql = `
      SELECT 
        ec.creation_id,
        ec.creator_type,
        CASE 
          WHEN ec.creator_type='individual' THEN CONCAT(COALESCE(i.first_name,''),' ',COALESCE(i.last_name,''))
          WHEN ec.creator_type='foundation' THEN COALESCE(f.foundation_name,'')
          ELSE 'Unknown Creator'
        END AS creator_name,
        ec.individual_id,
        ec.foundation_id,
        ec.title,
        ec.description,
        ec.amount_needed,
        ec.amount_received,
        ec.division,
        ec.verification_status,
        ec.lifecycle_status,
        ec.second_verification_required,
        ec.created_at,
        ebc.ebc_id,
        c.category_id, c.category_name,
        et.event_type_id, et.event_type_name,
        CASE WHEN ec.cover_photo IS NOT NULL THEN 1 ELSE 0 END AS has_cover_photo,
        CASE WHEN ec.doc IS NOT NULL THEN 1 ELSE 0 END AS has_document
      FROM EVENT_CREATION ec
      JOIN EVENT_BASED_ON_CATEGORY ebc ON ebc.ebc_id = ec.ebc_id
      JOIN CATEGORY c ON c.category_id = ebc.category_id
      JOIN EVENT_TYPE et ON et.event_type_id = ebc.event_type_id
      LEFT JOIN INDIVIDUAL i ON i.individual_id = ec.individual_id
      LEFT JOIN FOUNDATION f ON f.foundation_id = ec.foundation_id
      WHERE 1=1`;

    const params = [];

    if (status) {
      sql += ' AND ec.verification_status = ?';
      params.push(status);
    } else {
      sql += " AND ec.verification_status IN (?,?,?,?)";
      params.push('unverified', 'pending', 'verified', 'rejected');
    }

    sql += " AND ec.lifecycle_status != 'closed'";
    if (category_id) { sql += ' AND c.category_id = ?'; params.push(category_id); }
    if (event_type_id) { sql += ' AND et.event_type_id = ?'; params.push(event_type_id); }
    if (ebc_id) { sql += ' AND ebc.ebc_id = ?'; params.push(ebc_id); }
    if (creator_type) { sql += ' AND ec.creator_type = ?'; params.push(creator_type); }
    sql += (sort_by === 'recent' ? ' ORDER BY ec.created_at DESC' : ' ORDER BY ec.created_at DESC');
    sql += ' LIMIT ? OFFSET ?';

    const limitNum = parseInt(limit, 10) || 100;
    const offsetNum = parseInt(offset, 10) || 0;
    params.push(limitNum, offsetNum);

    const escapedParams = params.map(p => adminDb.escape(p));
    let finalSql = sql;
    let paramIndex = 0;
    finalSql = finalSql.replace(/\?/g, () => escapedParams[paramIndex++]);

    const [rows] = await adminDb.query(finalSql);
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
  }
});

router.get('/events/unverified', authenticateAdmin, async (req, res) => {
  req.query.status = 'unverified';
  return req.app.handle({ 
    ...req, 
    url: req.url.replace('/unverified', ''),
    path: req.path.replace('/unverified', '')
  }, res);
});

// =============================
// EVENT VERIFICATION
// =============================
router.put('/events/:id/verify', authenticateAdmin, async (req, res) => {
  const conn = adminDb; // promise pool
  try {
    const { id } = req.params; // ECxxxxx
    const { action, request_staff_verification } = req.body;

    let decision;
    if (action === 'approve') decision = 'approved';
    else if (action === 'reject') decision = 'rejected';
    else if (action === 'request_staff' || request_staff_verification) decision = 'request_staff_verification';
    else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use approve, reject, or request_staff' });
    }

    console.log(`🔍 Calling sp_admin_verify_event for ${id} with decision: ${decision}`);
    await conn.execute('CALL sp_admin_verify_event(?, ?)', [id, decision]);
    console.log(`✅ Event verification completed for ${id}: ${decision}`);
    
    const [rows] = await conn.execute(
      'SELECT verification_status, second_verification_required FROM EVENT_CREATION WHERE creation_id = ?', 
      [id]
    );
    const event = rows[0];
    let message;
    if (decision === 'approved') message = 'Event approved and activated';
    else if (decision === 'rejected') message = 'Event rejected';
    else message = 'Staff verification requested';
    
    return res.json({ 
      success: true, 
      message, 
      verification_status: event?.verification_status,
      second_verification_required: event?.second_verification_required 
    });
  } catch (error) {
    console.error('Event verification error:', error);
    if (error.message.includes('Staff verification only allowed for individual events')) {
      return res.status(400).json({ success: false, message: 'Staff verification is only available for individual-created events' });
    }
    res.status(500).json({ success: false, message: 'Failed to verify event', error: error.message });
  }
});

router.put('/events/:id/staff-verify', authenticateAdmin, async (req, res) => {
  const conn = adminDb;
  try {
    const { id } = req.params;
    const { action, staff_id } = req.body;
    if (!staff_id) {
      return res.status(400).json({ success: false, message: 'Staff ID is required for staff verification' });
    }
    const decision = action === 'approve' ? 'approved' : 'rejected';
    console.log(`🔍 Staff verification: ${staff_id} verifying ${id} with decision: ${decision}`);
    await conn.execute('CALL sp_staff_verify_event(?, ?, ?)', [staff_id, id, decision]);
    console.log(`✅ Staff verification completed for ${id}: ${decision}`);
    
    const [rows] = await conn.execute(
      'SELECT verification_status, second_verification_required FROM EVENT_CREATION WHERE creation_id = ?', 
      [id]
    );
    const event = rows[0];
    let message = (decision === 'approved')
      ? 'Event approved by staff, pending final admin approval'
      : 'Event rejected by staff';
    return res.json({ 
      success: true, 
      message,
      verification_status: event?.verification_status,
      second_verification_required: event?.second_verification_required 
    });
  } catch (error) {
    console.error('Staff verification error:', error);
    if (error.message.includes('Staff cannot verify events for individuals they assisted')) {
      return res.status(400).json({ success: false, message: 'You cannot verify events for individuals you helped register' });
    } else if (error.message.includes('Staff can only verify events from their own division')) {
      return res.status(400).json({ success: false, message: 'You can only verify events from your division' });
    } else if (error.message.includes('Event is not pending staff verification')) {
      return res.status(400).json({ success: false, message: 'This event is not pending staff verification' });
    }
    res.status(500).json({ success: false, message: 'Failed to complete staff verification', error: error.message });
  }
});

// Get events pending staff verification (for staff dashboard)
router.get('/events/pending-staff', authenticateAdmin, async (req, res) => {
  try {
    const { division } = req.query;
    let sql = 'SELECT * FROM v_events_pending_staff_verification';
    const params = [];
    if (division) { sql += ' WHERE target_division = ?'; params.push(division); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await adminDb.execute(sql, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching pending staff events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events pending staff verification' });
  }
});

// Get events pending final admin approval (after staff approval)
router.get('/events/pending-admin-final', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await adminDb.execute(
      'SELECT * FROM v_events_pending_admin_final ORDER BY staff_approval_at DESC'
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching events pending final admin approval:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events pending final admin approval' });
  }
});

// Get available staff for event verification
router.get('/events/:id/available-staff', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await adminDb.execute(
      'SELECT * FROM v_available_staff_for_verification WHERE creation_id = ?',
      [id]
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching available staff:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch available staff for verification' });
  }
});


// =============================
// Assign staff to latest pending request_staff_verification
// (shared handler, registered for BOTH POST and PUT)
// =============================
async function assignStaffHandler(req, res) {
  try {
    const { id } = req.params;          // creation_id (e.g., CRE6933)
    const { staff_id } = req.body;

    if (!staff_id) {
      return res.status(400).json({ success: false, message: 'staff_id required' });
    }

    // Assign the most recent unassigned "request_staff_verification" log to this staff member
    const [result] = await adminDb.execute(`
      UPDATE EVENT_VERIFICATION ev
      JOIN (
        SELECT log_id
        FROM EVENT_VERIFICATION
        WHERE creation_id = ?
          AND decision = 'request_staff_verification'
          AND staff_id IS NULL
        ORDER BY verified_at DESC, log_id DESC
        LIMIT 1
      ) x ON x.log_id = ev.log_id
      SET ev.staff_id = ?
    `, [id, staff_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pending staff-verification request to assign (not requested yet or already assigned)'
      });
    }

    return res.json({ success: true, message: 'Staff assigned to verification request' });
  } catch (e) {
    console.error('assign-staff error:', e);
    return res.status(500).json({ success: false, message: 'Failed to assign staff', error: e.message });
  }
}

// Register both verbs:
router.post('/events/:id/assign-staff', authenticateAdmin, assignStaffHandler);
router.put('/events/:id/assign-staff', authenticateAdmin, assignStaffHandler);


// =============================
// EVENT DETAILS & ASSETS
// =============================
router.get('/events/:id/details', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT
        ec.creation_id,
        ec.title,
        ec.description,
        ec.amount_needed,
        ec.amount_received,
        ec.division,
        ec.verification_status,
        ec.lifecycle_status,
        ec.created_at,
        ec.updated_at,
        (ec.cover_photo IS NOT NULL) AS has_cover_photo,
        (ec.doc IS NOT NULL) AS has_document,
        ebc.ebc_id,
        c.category_id, c.category_name,
        et.event_type_id, et.event_type_name,
        ec.creator_type,
        CASE WHEN ec.creator_type='individual' THEN CONCAT(i.first_name,' ',i.last_name) ELSE f.foundation_name END AS creator_name,
        CASE WHEN ec.creator_type='individual' THEN i.mobile ELSE f.mobile END AS contact_phone,
        CASE WHEN ec.creator_type='individual' THEN i.email  ELSE f.email  END AS contact_email,
        (SELECT COUNT(*) FROM DONATION d WHERE d.creation_id=ec.creation_id) AS total_donors,
        (SELECT COALESCE(SUM(d.amount),0) FROM DONATION d WHERE d.creation_id=ec.creation_id) AS total_raised,
        (SELECT MAX(d.paid_at) FROM DONATION d WHERE d.creation_id=ec.creation_id) AS last_donation_at
      FROM EVENT_CREATION ec
      JOIN EVENT_BASED_ON_CATEGORY ebc ON ebc.ebc_id = ec.ebc_id
      JOIN CATEGORY c ON c.category_id = ebc.category_id
      JOIN EVENT_TYPE et ON et.event_type_id = ebc.event_type_id
      LEFT JOIN INDIVIDUAL i ON i.individual_id = ec.individual_id
      LEFT JOIN FOUNDATION f ON f.foundation_id = ec.foundation_id
      WHERE ec.creation_id = ?`;
    const [rows] = await adminDb.execute(sql, [id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Event not found' });
    const e = rows[0];
    e.cover_photo_url = e.has_cover_photo ? `/api/admin/events/${id}/cover-photo` : null;
    e.document_url = e.has_document ? `/api/admin/events/${id}/document` : null;
    return res.json({ success:true, data: e });
  } catch (error) {
    console.error('Admin event details error:', error);
    res.status(500).json({ success:false, message:'Failed to fetch event details', error: error.message });
  }
});

router.get('/events/:id/cover-photo', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await adminDb.execute('SELECT cover_photo FROM EVENT_CREATION WHERE creation_id = ?', [id]);
    if (!rows.length || !rows[0].cover_photo) return res.status(404).json({ success:false, message:'No cover photo' });
    const buf = rows[0].cover_photo;
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `inline; filename="${id}_cover.jpg"`);
    res.send(buf);
  } catch (error) {
    console.error('Cover photo stream error:', error);
    res.status(500).json({ success:false, message:'Failed to stream cover photo' });
  }
});

router.get('/events/:id/document', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await adminDb.execute('SELECT doc FROM EVENT_CREATION WHERE creation_id = ?', [id]);
    if (!rows.length || !rows[0].doc) return res.status(404).json({ success:false, message:'No document uploaded' });
    const buf = rows[0].doc;
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${id}_document.bin"`);
    res.send(buf);
  } catch (error) {
    console.error('Document stream error:', error);
    res.status(500).json({ success:false, message:'Failed to download document' });
  }
});

// =============================
// STAFF (ADMIN)
// =============================
router.get('/staff', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query; // unverified | verified | suspended | all
    const params = [];
    let sql = 'SELECT * FROM V_ADMIN_STAFF';
    if (status && status !== 'all') { sql += ' WHERE status = ?'; params.push(status); }
    sql += ' ORDER BY staff_id DESC';
    const [rows] = await adminDb.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ Staff list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff' });
  }
});

router.get('/staff/:id/details', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await adminDb.execute(
      `SELECT 
         staff_id, username, first_name, last_name, email, mobile, nid, dob,
         house_no, road_no, area, district, administrative_div, zip,
         status,
         (CV IS NOT NULL) AS has_cv,
         CASE WHEN CV IS NULL THEN 0 ELSE OCTET_LENGTH(CV) END AS cv_size
       FROM STAFF
       WHERE staff_id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('❌ Staff details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff details' });
  }
});

router.get('/staff/:id/cv', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await adminDb.execute('SELECT CV FROM STAFF WHERE staff_id = ?', [id]);
    if (!rows.length || !rows[0].CV) return res.status(404).json({ success: false, message: 'No CV uploaded' });
    const buf = rows[0].CV;
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${id}_cv.bin"`);
    res.send(buf);
  } catch (error) {
    console.error('❌ Staff CV error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch CV' });
  }
});

router.put('/staff/:id/verify', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // 'verify' | 'suspend' | 'unsuspend'
    const adminUser = req.headers['x-admin-user'] || 'admin';
    if (!['verify','suspend','unsuspend'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    await adminDb.execute('CALL sp_admin_verify_staff(?,?,?,?)', [id, action, notes || null, adminUser]);
    res.json({ success: true, message: `Staff ${action} successful` });
  } catch (error) {
    console.error('❌ Staff verify error:', error);
    if (error && error.sqlState === '45000') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to update staff status' });
  }
});

router.delete('/staff/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await adminDb.execute('DELETE FROM STAFF WHERE staff_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    return res.json({ success: true, message: 'Staff deleted' });
  } catch (err) {
    console.error('Error deleting staff:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete staff' });
  }
});

// =============================
// FOUNDATIONS (ADMIN)
// =============================
router.get('/foundations', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        foundation_id,
        foundation_name,
        foundation_license,
        email,
        mobile,
        house_no,
        road_no,
        area,
        district,
        administrative_div,
        zip,
        bkash,
        bank_account,
        description,
        status,
        certificate IS NOT NULL as has_certificate,
        CASE WHEN certificate IS NULL THEN 0 ELSE LENGTH(certificate) END as certificate_size
      FROM foundation
    `;
    const params = [];
    if (status) { query += ' WHERE status = ?'; params.push(status); }
    query += ' ORDER BY foundation_id DESC';
    const [foundations] = await adminDb.execute(query, params);
    const processedFoundations = foundations.map(foundation => ({
      ...foundation,
      has_certificate: !!foundation.has_certificate,
      certificate_status: foundation.has_certificate ? 'available' : 'not_uploaded',
      certificate_size: foundation.certificate_size || 0
    }));
    res.json({ success: true, data: processedFoundations, count: processedFoundations.length });
  } catch (error) {
    console.error('❌ Foundations fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch foundations', error: error.message });
  }
});

router.get('/foundations/unverified', authenticateAdmin, async (req, res) => {
  try {
    const [foundations] = await adminDb.execute(`
      SELECT 
        foundation_id,
        foundation_name,
        foundation_license,
        certificate,
        email,
        mobile,
        house_no,
        road_no,
        area,
        district,
        administrative_div,
        zip,
        bkash,
        bank_account,
        description,
        status
      FROM foundation 
      WHERE status = 'unverified' 
      ORDER BY foundation_id ASC
    `);
    res.json({ success: true, data: foundations });
  } catch (error) {
    console.error('Unverified foundations fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unverified foundations' });
  }
});

router.get('/foundations/:id/details', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [foundation] = await adminDb.execute(`
      SELECT 
        foundation_id,
        foundation_name,
        foundation_license,
        certificate,
        email,
        mobile,
        house_no,
        road_no,
        area,
        district,
        administrative_div,
        zip,
        bkash,
        bank_account,
        description,
        status
      FROM foundation 
      WHERE foundation_id = ?
    `, [id]);
    if (foundation.length === 0) {
      return res.status(404).json({ success: false, message: 'Foundation not found' });
    }
    if (foundation[0].certificate) {
      foundation[0].certificate_base64 = foundation[0].certificate.toString('base64');
      foundation[0].has_certificate = true;
      foundation[0].certificate = null;
    } else {
      foundation[0].certificate_base64 = null;
      foundation[0].has_certificate = false;
      foundation[0].certificate = null;
    }
    res.json({ success: true, data: foundation[0] });
  } catch (error) {
    console.error('❌ Foundation details fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch foundation details', error: error.message });
  }
});

router.get('/foundations/:id/certificate', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [foundation] = await adminDb.execute(`
      SELECT certificate FROM foundation WHERE foundation_id = ?
    `, [id]);
    if (foundation.length === 0 || !foundation[0].certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    const certificateBuffer = foundation[0].certificate;

    let contentType = 'application/octet-stream';
    let filename = 'certificate';
    if (certificateBuffer.length >= 4) {
      const header = certificateBuffer.toString('hex', 0, 4).toUpperCase();
      const pdfHeader = certificateBuffer.toString('ascii', 0, 4);
      if (pdfHeader === '%PDF') { contentType = 'application/pdf'; filename = 'certificate.pdf'; }
      else if (header.startsWith('FFD8FF')) { contentType = 'image/jpeg'; filename = 'certificate.jpg'; }
      else if (header.startsWith('89504E47')) { contentType = 'image/png'; filename = 'certificate.png'; }
      else if (header.startsWith('474946')) { contentType = 'image/gif'; filename = 'certificate.gif'; }
    }
    res.set({
      'Content-Type': contentType,
      'Content-Length': certificateBuffer.length,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'public, max-age=86400'
    });
    res.send(certificateBuffer);
  } catch (error) {
    console.error('❌ Certificate serve error:', error);
    res.status(500).json({ success: false, message: 'Failed to serve certificate image', error: error.message });
  }
});

router.put('/foundations/:id/verify', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  if (!id) return res.status(400).json({ success: false, message: 'Foundation id is required' });
  if (!['approve','delete'].includes(action)) {
    return res.status(400).json({ success: false, message: "Invalid action. Must be 'approve' or 'delete'" });
  }
  let connection;
  try {
    connection = await adminDb.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      'SELECT foundation_id, status FROM foundation WHERE foundation_id = ? FOR UPDATE', [id]
    );
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Foundation not found' });
    }
    if (action === 'approve') {
      const [updateResult] = await connection.execute(
        'UPDATE foundation SET status = ? WHERE foundation_id = ?', ['verified', id]
      );
      if (updateResult.affectedRows === 0) {
        await connection.rollback();
        return res.status(500).json({ success: false, message: 'Failed to update foundation status' });
      }
      await connection.commit();
      const [updatedRows] = await adminDb.execute(
        'SELECT foundation_id, foundation_name, email, mobile, status FROM foundation WHERE foundation_id = ?',
        [id]
      );
      return res.json({ success: true, message: 'Foundation verified successfully', data: updatedRows[0] });
    } else {
      const [deleteResult] = await connection.execute(
        'DELETE FROM foundation WHERE foundation_id = ?', [id]
      );
      if (deleteResult.affectedRows === 0) {
        await connection.rollback();
        return res.status(500).json({ success: false, message: 'Failed to delete foundation' });
      }
      await connection.commit();
      return res.json({ success: true, message: 'Foundation deleted successfully', foundationId: id });
    }
  } catch (error) {
    console.error('❌ Foundation verification error:', error);
    try { if (connection) await connection.rollback(); } catch {}
    return res.status(500).json({ success: false, message: 'Failed to update foundation status', error: error.message });
  } finally {
    try { if (connection) connection.release(); } catch {}
  }
});


// =============================
// CATEGORIES + EVENT TYPES (ADMIN)
// =============================

// GET /api/admin/categories/events
router.get('/categories/events', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await adminDb.execute(`
      SELECT 
        c.category_id,
        c.category_name,
        et.event_type_id,
        et.event_type_name
      FROM CATEGORY c
      LEFT JOIN EVENT_BASED_ON_CATEGORY ebc ON ebc.category_id = c.category_id
      LEFT JOIN EVENT_TYPE et ON et.event_type_id = ebc.event_type_id
      ORDER BY c.category_name ASC, et.event_type_name ASC
    `);

    const byCat = new Map();
    for (const r of rows) {
      if (!byCat.has(r.category_id)) {
        byCat.set(r.category_id, {
          category_id: r.category_id,
          category_name: r.category_name,
          event_types: []
        });
      }
      if (r.event_type_id) {
        byCat.get(r.category_id).event_types.push({
          event_type_id: r.event_type_id,
          event_type_name: r.event_type_name
        });
      }
    }

    res.json({ success: true, data: Array.from(byCat.values()) });
  } catch (err) {
    console.error('Categories/events fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories with event types', error: err.message });
  }
});


// POST /api/admin/categories/:id/add-event-type
// Creates the event type if missing, then maps it to the category.
// Explicitly generates ebc_id (fixes “Field 'ebc_id' doesn't have a default value”).
router.post('/categories/:id/add-event-type', authenticateAdmin, async (req, res) => {
  const { id } = req.params; // category_id like CAT0001
  const { eventTypeName } = req.body;

  if (!eventTypeName || !eventTypeName.trim()) {
    return res.status(400).json({ success: false, message: 'eventTypeName is required' });
  }

  let conn;
  try {
    conn = await adminDb.getConnection();
    await conn.beginTransaction();

    // helper to generate next ID like CAT0001/EVT0001/EBC0001
    async function nextPrefixedId(table, col, prefix, pad = 4) {
      const [rows] = await conn.query(
        `SELECT ${col} AS id FROM ${table} WHERE ${col} LIKE ? ORDER BY ${col} DESC LIMIT 1`,
        [`${prefix}%`]
      );
      if (!rows.length) return `${prefix}${'1'.padStart(pad, '0')}`;
      const last = String(rows[0].id || '');
      const m = last.match(/^([A-Za-z]+)(\d+)$/);
      if (m) {
        const width = m[2].length;
        const nextNum = (parseInt(m[2], 10) + 1).toString().padStart(width, '0');
        return `${prefix}${nextNum}`;
      }
      return `${prefix}${Date.now().toString().slice(-pad)}`;
    }

    // ensure category exists
    const [catRows] = await conn.execute('SELECT category_id FROM CATEGORY WHERE category_id = ?', [id]);
    if (!catRows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // find or create event type
    const cleanName = eventTypeName.trim();
    const [etRows] = await conn.execute(
      'SELECT event_type_id FROM EVENT_TYPE WHERE event_type_name = ?',
      [cleanName]
    );

    let eventTypeId;
    if (etRows.length) {
      eventTypeId = etRows[0].event_type_id;
    } else {
      const newEvtId = await nextPrefixedId('EVENT_TYPE', 'event_type_id', 'EVT', 4);
      await conn.execute(
        'INSERT INTO EVENT_TYPE (event_type_id, event_type_name) VALUES (?, ?)',
        [newEvtId, cleanName]
      );
      eventTypeId = newEvtId;
    }

    // map in EVENT_BASED_ON_CATEGORY (generate ebc_id explicitly)
    const [mapRows] = await conn.execute(
      'SELECT ebc_id FROM EVENT_BASED_ON_CATEGORY WHERE category_id = ? AND event_type_id = ?',
      [id, eventTypeId]
    );
    if (!mapRows.length) {
      const ebcId = await nextPrefixedId('EVENT_BASED_ON_CATEGORY', 'ebc_id', 'EBC', 4);
      await conn.execute(
        'INSERT INTO EVENT_BASED_ON_CATEGORY (ebc_id, category_id, event_type_id) VALUES (?, ?, ?)',
        [ebcId, id, eventTypeId]
      );
    }

    await conn.commit();

    // return updated list for this category
    const [evts] = await adminDb.execute(
      `SELECT et.event_type_id, et.event_type_name
       FROM EVENT_BASED_ON_CATEGORY ebc
       JOIN EVENT_TYPE et ON et.event_type_id = ebc.event_type_id
       WHERE ebc.category_id = ?
       ORDER BY et.event_type_name ASC`,
      [id]
    );

    res.json({
      success: true,
      message: 'Event type added to category',
      data: { category_id: id, event_types: evts }
    });
  } catch (err) {
    try { if (conn) await conn.rollback(); } catch {}
    console.error('Add event type error:', err);
    res.status(500).json({ success: false, message: 'Failed to add event type to category', error: err.message });
  } finally {
    try { if (conn) conn.release(); } catch {}
  }
});


// POST /api/admin/categories/full
// Body: { name: string, icon?: string, eventTypes: string[] }
router.post('/categories/full', authenticateAdmin, async (req, res) => {
  const { name, icon = null, eventTypes } = req.body || {};

  if (!name || !Array.isArray(eventTypes) || eventTypes.length === 0) {
    return res.status(400).json({ success: false, message: 'name and non-empty eventTypes are required' });
  }

  let conn;
  try {
    conn = await adminDb.getConnection();
    await conn.beginTransaction();

    async function nextPrefixedId(table, col, prefix, pad = 4) {
      const [rows] = await conn.query(
        `SELECT ${col} AS id FROM ${table} WHERE ${col} LIKE ? ORDER BY ${col} DESC LIMIT 1`,
        [`${prefix}%`]
      );
      if (!rows.length) return `${prefix}${'1'.padStart(pad, '0')}`;
      const last = String(rows[0].id || '');
      const m = last.match(/^([A-Za-z]+)(\d+)$/);
      if (m) {
        const width = m[2].length;
        const nextNum = (parseInt(m[2], 10) + 1).toString().padStart(width, '0');
        return `${prefix}${nextNum}`;
      }
      return `${prefix}${Date.now().toString().slice(-pad)}`;
    }

    // 1) Create category
    const catId = await nextPrefixedId('CATEGORY', 'category_id', 'CAT', 4);
    await conn.execute(
      `INSERT INTO CATEGORY (category_id, category_name, icon) VALUES (?, ?, ?)`,
      [catId, name.trim(), icon]
    );

    // 2) Ensure each event type exists, then 3) map CAT<->EVT via EBC
    const createdEventTypes = [];
    for (const rawName of eventTypes) {
      const etName = String(rawName || '').trim();
      if (!etName) continue;

      const [exist] = await conn.execute(
        `SELECT event_type_id FROM EVENT_TYPE WHERE event_type_name = ?`,
        [etName]
      );

      let eventTypeId;
      if (exist.length) {
        eventTypeId = exist[0].event_type_id;
      } else {
        eventTypeId = await nextPrefixedId('EVENT_TYPE', 'event_type_id', 'EVT', 4);
        await conn.execute(
          `INSERT INTO EVENT_TYPE (event_type_id, event_type_name) VALUES (?, ?)`,
          [eventTypeId, etName]
        );
      }

      const [mapped] = await conn.execute(
        `SELECT ebc_id FROM EVENT_BASED_ON_CATEGORY WHERE category_id = ? AND event_type_id = ?`,
        [catId, eventTypeId]
      );
      if (!mapped.length) {
        const ebcId = await nextPrefixedId('EVENT_BASED_ON_CATEGORY', 'ebc_id', 'EBC', 4);
        await conn.execute(
          `INSERT INTO EVENT_BASED_ON_CATEGORY (ebc_id, category_id, event_type_id) VALUES (?, ?, ?)`,
          [ebcId, catId, eventTypeId]
        );
      }

      createdEventTypes.push({ event_type_id: eventTypeId, event_type_name: etName });
    }

    await conn.commit();

    res.json({
      success: true,
      message: 'Category and event types created & mapped',
      data: {
        category_id: catId,
        category_name: name.trim(),
        event_types: createdEventTypes
      }
    });
  } catch (err) {
    try { if (conn) await conn.rollback(); } catch {}
    console.error('POST /categories/full error:', err);
    res.status(500).json({ success: false, message: 'Failed to create category with event types', error: err.message });
  } finally {
    try { if (conn) conn.release(); } catch {}
  }
});

// =============================
// ANALYTICS (ADMIN)
// =============================
router.get('/analytics/test', (req, res) => {
  res.json({ success: true, message: 'Analytics routes are loaded!' });
});

router.get('/analytics/overview', authenticateAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const [results] = await adminDb.execute(
      'CALL sp_get_donation_analytics(?, ?, ?)',
      [start_date || null, end_date || null, 1]
    );
    const actualKpiRow = results[1] && results[1][0] ? results[1][0] : {};
    const actualTrendData = results[2] || [];
    const actualGeographic = results[3] || [];
    const kpis = {
      total_donations: actualKpiRow.total_donations || 0,
      unique_donors: actualKpiRow.unique_donors || 0,
      total_amount_raised: parseFloat(actualKpiRow.total_amount) || 0,
      average_donation: parseFloat(actualKpiRow.average_donation) || 0,
      min_donation: parseFloat(actualKpiRow.min_donation) || 0,
      max_donation: parseFloat(actualKpiRow.max_donation) || 0,
      campaigns_supported: actualKpiRow.campaigns_supported || 0,
      active_days: actualKpiRow.active_days || 0,
      active_campaigns: actualKpiRow.active_campaigns || 0,
      repeat_donors: actualKpiRow.repeat_donors || 0,
      amount_growth: 0, donor_growth: 0, donation_growth: 0, avg_growth: 0
    };
    res.json({
      success: true,
      data: { kpis, trends: actualTrendData, geographic: actualGeographic, period: { start: start_date, end: end_date } }
    });
  } catch (error) {
    console.error('❌ Analytics overview error:', error);
    try {
      const [overviewData] = await adminDb.execute(`
        SELECT * FROM v_donation_overview 
        WHERE (? IS NULL OR donation_date >= ?) 
        AND (? IS NULL OR donation_date <= ?)
        LIMIT 1
      `, [req.query.start_date, req.query.start_date, req.query.end_date, req.query.end_date]);
      const [trendsData] = await adminDb.execute(`
        SELECT * FROM v_donation_trends_monthly 
        WHERE (? IS NULL OR donation_month >= DATE_FORMAT(?, '%Y-%m')) 
        AND (? IS NULL OR donation_month <= DATE_FORMAT(?, '%Y-%m'))
        ORDER BY donation_month DESC
        LIMIT 12
      `, [req.query.start_date, req.query.start_date, req.query.end_date, req.query.end_date]);
      res.json({ success: true, data: { kpis: overviewData[0] || {}, trends: trendsData, period: { start: req.query.start_date, end: req.query.end_date } } });
    } catch (fallbackError) {
      console.error('❌ Analytics fallback error:', fallbackError);
      res.status(500).json({ success: false, message: 'Failed to fetch analytics data', error: error.message });
    }
  }
});

router.get('/analytics/detailed', authenticateAdmin, async (req, res) => {
  try {
    const { start_date, end_date, period = 'month' } = req.query;
    const [results] = await adminDb.execute('CALL sp_get_trend_analysis(?, ?, ?)', [start_date || null, end_date || null, period]);
    res.json({ success: true, data: results[0] || [] });
  } catch (error) {
    console.error('❌ Detailed analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch detailed analytics', error: error.message });
  }
});

router.get('/analytics/donors', authenticateAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const [segmentData] = await adminDb.execute(`
      SELECT * FROM v_donor_analytics 
      WHERE (? IS NULL OR last_donation_date >= ?) 
      AND (? IS NULL OR last_donation_date <= ?)
      ORDER BY total_donated DESC
    `, [start_date, start_date, end_date, end_date]);

    const [topDonors] = await adminDb.execute(`
      SELECT 
        CONCAT(d.first_name, ' ', d.last_name) as donor_name,
        d.email,
        SUM(don.amount) as total_amount,
        COUNT(don.donation_id) as donation_count,
        MAX(don.paid_at) as last_donation_date,
        fn_donor_segment_score(
          SUM(don.amount), 
          COUNT(don.donation_id), 
          DATEDIFF(CURDATE(), MAX(don.paid_at))
        ) as segment_score
      FROM DONOR d
      JOIN DONATION don ON d.donor_id = don.donor_id
      WHERE (? IS NULL OR don.paid_at >= ?) 
      AND (? IS NULL OR don.paid_at <= ?)
      GROUP BY d.donor_id, d.first_name, d.last_name, d.email
      ORDER BY total_amount DESC
      LIMIT 20
    `, [start_date, start_date, end_date, end_date]);

    const topDonorsWithSegments = topDonors.map(donor => {
      const score = donor.segment_score || 0;
      let segment = 'New';
      if (score >= 8) segment = 'Champion';
      else if (score >= 6) segment = 'Loyal';
      else if (score >= 4) segment = 'Regular';
      else if (score >= 2) segment = 'Repeat';
      return { ...donor, segment };
    });

    const segments = segmentData.reduce((acc, row) => {
      const existing = acc.find(s => s.segment === row.segment);
      if (existing) {
        existing.donor_count += row.donor_count || 0;
        existing.total_amount += parseFloat(row.total_amount || 0);
      } else {
        acc.push({
          segment: row.segment,
          donor_count: row.donor_count || 0,
          total_amount: parseFloat(row.total_amount || 0),
          avg_donation: parseFloat(row.avg_donation || 0)
        });
      }
      return acc;
    }, []);

    res.json({ success: true, data: { segments, top_donors: topDonorsWithSegments } });
  } catch (error) {
    console.error('❌ Donor analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch donor analytics', error: error.message });
  }
});

router.get('/analytics/trends', authenticateAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const [trendsData] = await adminDb.execute(`
      SELECT 
        YEAR(paid_at) as donation_year,
        MONTH(paid_at) as donation_month,
        DATE_FORMAT(paid_at, '%Y-%m') as month_year,
        DATE_FORMAT(paid_at, '%M %Y') as month_name,
        COUNT(donation_id) as donation_count,
        COUNT(DISTINCT donor_id) as unique_donors,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM DONATION 
      WHERE (? IS NULL OR paid_at >= ?) 
      AND (? IS NULL OR paid_at <= ?)
      GROUP BY YEAR(paid_at), MONTH(paid_at), DATE_FORMAT(paid_at, '%Y-%m'), DATE_FORMAT(paid_at, '%M %Y')
      ORDER BY YEAR(paid_at) DESC, MONTH(paid_at) DESC
      LIMIT 24
    `, [start_date, start_date, end_date, end_date]);

  const trendsWithGrowth = trendsData.map((current, index) => {
      if (index < trendsData.length - 1) {
        const previous = trendsData[index + 1];
        const growthRate = previous.total_amount > 0 
          ? ((current.total_amount - previous.total_amount) / previous.total_amount) * 100 
          : 0;
        return { period: current.donation_month, total_amount: current.total_amount, donation_count: current.donation_count, unique_donors: current.unique_donors, avg_donation: current.avg_donation, growth_rate: growthRate };
      }
      return { period: current.donation_month, total_amount: current.total_amount, donation_count: current.donation_count, unique_donors: current.unique_donors, avg_donation: current.avg_donation, growth_rate: 0 };
    });

    res.json({ success: true, data: trendsWithGrowth });
  } catch (error) {
    console.error('❌ Trends analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trends analytics', error: error.message });
  }
});

router.get('/analytics/geographic', authenticateAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const [geoData] = await adminDb.execute(`
      SELECT * FROM v_geographic_distribution 
      WHERE (? IS NULL OR last_donation >= ?) 
      AND (? IS NULL OR last_donation <= ?)
      ORDER BY total_amount DESC
    `, [start_date, start_date, end_date, end_date]);

    const countries = geoData.filter(row => row.country).map(row => ({
      country: row.country,
      total_amount: parseFloat(row.total_amount || 0),
      donor_count: row.donor_count || 0,
      donation_count: row.donation_count || 0
    }));
    const divisions = geoData
      .filter(row => row.division && row.country === 'Bangladesh')
      .map(row => ({
        division: row.division,
        total_amount: parseFloat(row.total_amount || 0),
        donor_count: row.donor_count || 0,
        donation_count: row.donation_count || 0
      }));
    res.json({ success: true, data: { countries, divisions } });
  } catch (error) {
    console.error('❌ Geographic analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch geographic analytics', error: error.message });
  }
});

router.get('/analytics/campaigns', authenticateAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const [campaignData] = await adminDb.execute(`
      SELECT * FROM v_campaign_performance 
      WHERE (? IS NULL OR last_donation >= ?) 
      AND (? IS NULL OR last_donation <= ?)
      ORDER BY amount_received DESC
      LIMIT 50
    `, [start_date, start_date, end_date, end_date]);
    res.json({
      success: true,
      data: campaignData.map(row => ({
        ...row,
        total_amount: parseFloat(row.amount_received || 0),
        avg_donation: parseFloat(row.avg_donation || 0),
        success_rate: parseFloat(row.success_rate || 0)
      }))
    });
  } catch (error) {
    console.error('❌ Campaign analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch campaign analytics', error: error.message });
  }
});

router.get('/analytics/realtime', authenticateAdmin, async (req, res) => {
  try {
    const [realtimeStats] = await adminDb.execute(`
      SELECT 
        COUNT(*) as donations_today,
        COALESCE(SUM(amount), 0) as amount_today,
        COUNT(DISTINCT donor_id) as unique_donors_today
      FROM DONATION 
      WHERE DATE(paid_at) = CURDATE()
    `);
    const [hourlyStats] = await adminDb.execute(`
      SELECT 
        HOUR(paid_at) as hour_of_day,
        COUNT(*) as donation_count,
        SUM(amount) as total_amount
      FROM DONATION 
      WHERE DATE(paid_at) = CURDATE()
      GROUP BY HOUR(paid_at)
      ORDER BY hour_of_day
    `);
  res.json({ success: true, data: { today_summary: realtimeStats[0], hourly_breakdown: hourlyStats } });
  } catch (error) {
    console.error('❌ Real-time analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch real-time analytics', error: error.message });
  }
});

router.get('/analytics/export', authenticateAdmin, async (req, res) => {
  try {
    const { type, format, start_date, end_date } = req.query;
    let data = [];
    let filename = 'analytics_export';
    if (type === 'donations') {
      const [donationData] = await adminDb.execute(`
        SELECT 
          d.donation_id,
          don.donor_name,
          don.email,
          d.amount,
          d.paid_at,
          ec.title as campaign_name,
          ec.verification_status
        FROM DONATION d
        LEFT JOIN DONOR don ON d.donor_id = don.donor_id
        LEFT JOIN EVENT_CREATION ec ON d.creation_id = ec.creation_id
        WHERE (? IS NULL OR DATE(d.paid_at) >= ?) 
        AND (? IS NULL OR DATE(d.paid_at) <= ?)
        ORDER BY d.paid_at DESC
      `, [start_date, start_date, end_date, end_date]);
      data = donationData; filename = 'donations_export';
    } else if (type === 'donors') {
      const [donorData] = await adminDb.execute(`
        SELECT 
          d.donor_id,
          d.donor_name,
          d.email,
          d.mobile,
          d.country,
          d.division,
          COUNT(don.donation_id) as total_donations,
          SUM(don.amount) as total_amount,
          MAX(don.paid_at) as last_donation
        FROM DONOR d
        LEFT JOIN DONATION don ON d.donor_id = don.donor_id
        WHERE (? IS NULL OR DATE(don.paid_at) >= ?) 
        AND (? IS NULL OR DATE(don.paid_at) <= ?)
        GROUP BY d.donor_id
        ORDER BY total_amount DESC
      `, [start_date, start_date, end_date, end_date]);
      data = donorData; filename = 'donors_export';
    } else if (type === 'campaigns') {
      const [campaignData] = await adminDb.execute(`
        SELECT * FROM v_campaign_performance 
        WHERE (? IS NULL OR last_donation >= ?) 
        AND (? IS NULL OR last_donation <= ?)
        ORDER BY total_donated DESC
      `, [start_date, start_date, end_date, end_date]);
      data = campaignData; filename = 'campaigns_export';
    } else if (type === 'trends') {
      const [trendsData] = await adminDb.execute(`
        SELECT * FROM v_donation_trends_monthly 
        WHERE (? IS NULL OR month_year >= ?) 
        AND (? IS NULL OR month_year <= ?)
        ORDER BY donation_year ASC, donation_month ASC
      `, [start_date, start_date, end_date, end_date]);
      data = trendsData; filename = 'trends_export';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid export type' });
    }

    if (format === 'csv') {
      if (data.length === 0) {
        return res.status(404).json({ success: false, message: 'No data to export' });
      }
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(','))
      ].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csvContent);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json(data);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid format. Use csv or json' });
    }
  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export data', error: error.message });
  }
});

router.post('/analytics/refresh-cache', authenticateAdmin, async (req, res) => {
  try {
    await adminDb.execute('CALL sp_refresh_analytics_cache()');
    res.json({ success: true, message: 'Analytics cache refreshed successfully' });
  } catch (error) {
    console.error('❌ Cache refresh error:', error);
    res.status(500).json({ success: false, message: 'Failed to refresh cache', error: error.message });
  }
});

module.exports = router;
