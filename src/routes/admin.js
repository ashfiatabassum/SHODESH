// Admin Routes for SHODESH Platform
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const adminDb = require('../config/db-admin'); // Use promise-based DB for admin functionality

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
    console.log('🔐 Admin auth check - Headers:', req.headers.authorization ? 'Present' : 'Missing');
    
    // Check for admin session/token
    const adminToken = req.headers.authorization || req.session?.adminToken;
    
    if (!adminToken) {
        console.log('❌ Admin auth failed - No token');
        return res.status(401).json({ 
            success: false, 
            message: 'Admin authentication required' 
        });
    }
    
    console.log('✅ Admin auth passed');
    // Verify admin token (implement your authentication logic)
    // For now, we'll assume the token is valid
    next();
};

// ...existing code... (no allowPublicRead in production)

// Dashboard Overview
router.get('/dashboard/stats', authenticateAdmin, async (req, res) => {
    try {
        // Use actual schema tables (uppercase) from DBMS.txt
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
            // VOLUNTEER table may not exist in current schema; default zeros
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

// Event Management Routes — list campaigns (mirrors verification list behavior)
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
            include_inactive = 'false'
        } = req.query;

        // Use raw JOIN mirroring search.js fallback, but include unverified as well and keep lifecycle active
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
        
        // For admin verification, we need to show both:
        // 1. Unverified events (which are typically inactive)
        // 2. Verified events (which are typically active)
        // So we don't filter by lifecycle_status by default
        
        if (status) {
            sql += ' AND ec.verification_status = ?';
            params.push(status);
        } else {
            // Show all three verification statuses: unverified, verified, and rejected
            sql += " AND ec.verification_status IN (?,?,?)";
            params.push('unverified');
            params.push('verified');
            params.push('rejected');
        }
        
        // Only exclude closed events (keep inactive for unverified and active for verified)
        sql += " AND ec.lifecycle_status != 'closed'";
        if (category_id) { sql += ' AND c.category_id = ?'; params.push(category_id); }
        if (event_type_id) { sql += ' AND et.event_type_id = ?'; params.push(event_type_id); }
        if (ebc_id) { sql += ' AND ebc.ebc_id = ?'; params.push(ebc_id); }
        if (creator_type) { sql += ' AND ec.creator_type = ?'; params.push(creator_type); }
        sql += sort_by === 'recent' ? ' ORDER BY ec.created_at DESC' : ' ORDER BY ec.created_at DESC';
        sql += ' LIMIT ? OFFSET ?';
        
        // Add pagination parameters
        const limitNum = parseInt(limit, 10) || 100;
        const offsetNum = parseInt(offset, 10) || 0;
        params.push(limitNum);
        params.push(offsetNum);
        
        // Use query() with manual escaping instead of execute() with prepared statements
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

// Shortcut for unverified events - delegate to /events route
router.get('/events/unverified', authenticateAdmin, async (req, res) => {
    req.query.status = 'unverified';
    // Use req.app to properly delegate to the /events route
    return req.app.handle({ 
        ...req, 
        url: req.url.replace('/unverified', ''),
        path: req.path.replace('/unverified', '')
    }, res);
});

// Approve/Reject an event (insert into EVENT_VERIFICATION; triggers should apply to EVENT_CREATION)
router.put('/events/:id/verify', authenticateAdmin, async (req, res) => {
    const conn = adminDb; // promise pool
    try {
        const { id } = req.params; // creation_id like ECxxxxx
        const { action, notes } = req.body; // 'approve' or 'reject'
        const decision = action === 'approve' ? 'verified' : 'rejected';
        const staffId = req.headers['x-admin-staff-id'] || null; // optional

        // Try stored procedure first if available
        try {
            console.log(`🔍 Attempting stored procedure for ${id} with decision: ${decision}`);
            await conn.execute('CALL sp_admin_verify_event(?,?,?,?)', [id, decision, notes || null, staffId]);
            console.log(`✅ Stored procedure succeeded for ${id}: ${decision}`);
            return res.json({ success: true, message: `Event ${decision} via procedure` });
        } catch (spErr) {
            // Fallback to manual insert + direct status update (if trigger not present)
            console.log(`⚠️  Stored procedure failed for ${id}, falling back to manual update. Error:`, spErr.message);
            if (spErr && spErr.code !== 'ER_SP_DOES_NOT_EXIST') {
                console.warn('sp_admin_verify_event failed, falling back. Cause:', spErr.message);
            }
        }

        // Generate a simple log_id (7-char): EV + timestamp base36 last 5
        const logId = 'EV' + (Date.now().toString(36).slice(-5)).toUpperCase();
        // Insert verification log
        await conn.execute(
            `INSERT INTO EVENT_VERIFICATION (log_id, creation_id, round_no, staff_id, decision, request_staff_verification, notes, verified_at)
             VALUES (?, ?, 1, ?, ?, 0, ?, NOW())`,
            [logId, id, staffId, decision, notes || null]
        );
        // Apply to EVENT_CREATION directly in case trigger not present
        // When approving: set verification_status='verified' AND lifecycle_status='active'
        // When rejecting: set verification_status='rejected' and lifecycle_status='inactive'
        // Note: Unverified events remain 'unverified' unless explicitly rejected
        console.log(`🔄 Manual update for ${id}: action=${action}, decision=${decision}`);
        
        if (action === 'approve') {
            console.log(`✅ Approving event ${id}: verified/active`);
            await conn.execute(
                `UPDATE EVENT_CREATION SET 
                    verification_status = 'verified', 
                    lifecycle_status = 'active',
                    updated_at = NOW() 
                WHERE creation_id = ?`,
                [id]
            );
        } else if (action === 'reject') {
            console.log(`❌ Rejecting event ${id}: rejected/inactive`);
            await conn.execute(
                `UPDATE EVENT_CREATION SET 
                    verification_status = 'rejected',
                    lifecycle_status = 'inactive',
                    updated_at = NOW()
                WHERE creation_id = ?`,
                [id]
            );
        }
        
        console.log(`✅ Manual update completed for ${id}`);
        return res.json({ success: true, message: `Event ${decision} successfully` });
    } catch (error) {
        console.error('Event verification error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify event', error: error.message });
    }
});

// Admin: Event details (rich) for a creation_id
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

// Admin: Stream cover photo BLOB
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

// Admin: Stream supporting document BLOB
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

router.post('/events/:id/request-volunteer-verification', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { volunteerIds, instructions } = req.body;
        
        // Create verification requests for selected volunteers
        for (const volunteerId of volunteerIds) {
            await adminDb.execute(`
                INSERT INTO volunteer_verification_requests 
                (event_id, volunteer_id, instructions, status, created_at)
                VALUES (?, ?, ?, 'pending', NOW())
            `, [id, volunteerId, instructions]);
        }
        
        // Update event status to indicate volunteer verification is requested
        await adminDb.execute(
            'UPDATE events SET volunteer_verification_requested = true WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Volunteer verification requests sent successfully'
        });
    } catch (error) {
        console.error('Volunteer verification request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send verification requests' 
        });
    }
});

router.put('/events/:id/trending', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isTrending } = req.body;
        
        await adminDb.execute(
            'UPDATE events SET is_trending = ?, trending_added_at = ? WHERE id = ?',
            [isTrending, isTrending ? new Date() : null, id]
        );
        
        res.json({
            success: true,
            message: `Event ${isTrending ? 'added to' : 'removed from'} trending successfully`
        });
    } catch (error) {
        console.error('Trending update error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update trending status' 
        });
    }
});

// =============================
// STAFF VERIFICATION (Admin)
// =============================

// List staff (no BLOBs) via view V_ADMIN_STAFF
router.get('/staff', authenticateAdmin, async (req, res) => {
    try {
        const { status } = req.query; // unverified | verified | suspended | all
        const params = [];
        let sql = 'SELECT * FROM V_ADMIN_STAFF';
        if (status && status !== 'all') {
            sql += ' WHERE status = ?';
            params.push(status);
        }
        sql += ' ORDER BY staff_id DESC';
        const [rows] = await adminDb.execute(sql, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('❌ Staff list error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch staff' });
    }
});

// Staff details (metadata, no raw BLOB in JSON)
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

// Staff CV download/stream (BLOB)
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

// Verify/Suspend/Unsuspend staff via stored procedure
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

// Permanently delete a staff record (admin action)
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

// Foundation Management Routes
router.get('/foundations', authenticateAdmin, async (req, res) => {
    try {
        console.log('📋 GET /api/admin/foundations - Request received');
        console.log('📋 Query params:', req.query);
        
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
                CASE 
                    WHEN certificate IS NULL THEN 0
                    ELSE LENGTH(certificate)
                END as certificate_size
            FROM foundation
        `;
        const params = [];
        
        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY foundation_id DESC';
        
        console.log('📋 Executing query:', query);
        console.log('📋 Query params:', params);
        
        const [foundations] = await adminDb.execute(query, params);
        
        // Convert has_certificate to boolean and add certificate status
        const processedFoundations = foundations.map(foundation => ({
            ...foundation,
            has_certificate: !!foundation.has_certificate,
            certificate_status: foundation.has_certificate ? 'available' : 'not_uploaded',
            certificate_size: foundation.certificate_size || 0
        }));
        
        console.log('📋 Query result count:', processedFoundations.length);
        console.log('📋 Sample foundation:', processedFoundations[0] ? {
            id: processedFoundations[0].foundation_id,
            name: processedFoundations[0].foundation_name,
            status: processedFoundations[0].status,
            has_certificate: processedFoundations[0].has_certificate
        } : 'None');
        
        res.json({
            success: true,
            data: processedFoundations,
            count: processedFoundations.length
        });
    } catch (error) {
        console.error('❌ Foundations fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch foundations',
            error: error.message
        });
    }
});

// Get unverified foundations for admin verification
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
        
        res.json({
            success: true,
            data: foundations
        });
    } catch (error) {
        console.error('Unverified foundations fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch unverified foundations' 
        });
    }
});

// Get specific foundation details for verification
router.get('/foundations/:id/details', authenticateAdmin, async (req, res) => {
    try {
        console.log('📋 GET /api/admin/foundations/:id/details - Request received');
        const { id } = req.params;
        console.log('📋 Foundation ID:', id);
        
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
        
        console.log('📋 Foundation query result count:', foundation.length);
        
        if (foundation.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Foundation not found'
            });
        }
        
        console.log('📋 Found foundation:', foundation[0].foundation_name);
        
        // Convert BLOB to base64 if certificate exists and remove the raw BLOB data
        if (foundation[0].certificate && foundation[0].certificate !== null) {
            console.log('🖼️ Converting certificate BLOB to base64, size:', foundation[0].certificate.length);
            foundation[0].certificate_base64 = foundation[0].certificate.toString('base64');
            foundation[0].has_certificate = true;
            // Remove the raw BLOB data to avoid sending huge response
            foundation[0].certificate = null;
        } else {
            console.log('🖼️ No certificate found for foundation');
            foundation[0].certificate_base64 = null;
            foundation[0].has_certificate = false;
            foundation[0].certificate = null;
        }
        
        res.json({
            success: true,
            data: foundation[0]
        });
    } catch (error) {
        console.error('❌ Foundation details fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch foundation details',
            error: error.message
        });
    }
});

// Serve foundation certificate image
router.get('/foundations/:id/certificate', authenticateAdmin, async (req, res) => {
    try {
        console.log('🖼️ GET /api/admin/foundations/:id/certificate - Request received');
        const { id } = req.params;
        
        const [foundation] = await adminDb.execute(`
            SELECT certificate FROM foundation WHERE foundation_id = ?
        `, [id]);
        
        if (foundation.length === 0 || !foundation[0].certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }
        
        const certificateBuffer = foundation[0].certificate;
        
        // Detect file type from buffer header
        let contentType = 'application/octet-stream';
        let filename = 'certificate';
        
        if (certificateBuffer.length >= 4) {
            const header = certificateBuffer.toString('hex', 0, 4).toUpperCase();
            const pdfHeader = certificateBuffer.toString('ascii', 0, 4);
            
            if (pdfHeader === '%PDF') {
                contentType = 'application/pdf';
                filename = 'certificate.pdf';
            } else if (header.startsWith('FFD8FF')) {
                contentType = 'image/jpeg';
                filename = 'certificate.jpg';
            } else if (header.startsWith('89504E47')) {
                contentType = 'image/png';
                filename = 'certificate.png';
            } else if (header.startsWith('474946')) {
                contentType = 'image/gif';
                filename = 'certificate.gif';
            }
        }
        
        // Set appropriate headers
        res.set({
            'Content-Type': contentType,
            'Content-Length': certificateBuffer.length,
            'Content-Disposition': `inline; filename="${filename}"`,
            'Cache-Control': 'public, max-age=86400' // Cache for 1 day
        });
        
        console.log('🖼️ Serving certificate image, size:', certificateBuffer.length, 'bytes');
        res.send(certificateBuffer);
        
    } catch (error) {
        console.error('❌ Certificate serve error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to serve certificate image',
            error: error.message
        });
    }
});

router.put('/foundations/:id/verify', authenticateAdmin, async (req, res) => {
    // Robust verification: transactional update with validation and clear responses
    const { id } = req.params;
    const { action } = req.body;

    // Validate input
    if (!id) {
        return res.status(400).json({ success: false, message: 'Foundation id is required' });
    }

        if (!['approve', 'delete'].includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid action. Must be 'approve' or 'delete'" });
        }

        let connection;
        try {
            connection = await adminDb.getConnection();
            await connection.beginTransaction();

            // Lock the foundation row to avoid race conditions
            const [rows] = await connection.execute(
                'SELECT foundation_id, status FROM foundation WHERE foundation_id = ? FOR UPDATE',
                [id]
            );

            if (rows.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Foundation not found' });
            }

            if (action === 'approve') {
                // Approve foundation
                const [updateResult] = await connection.execute(
                    'UPDATE foundation SET status = ? WHERE foundation_id = ?',
                    ['verified', id]
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
            } else if (action === 'delete') {
                // Delete foundation
                const [deleteResult] = await connection.execute(
                    'DELETE FROM foundation WHERE foundation_id = ?',
                    [id]
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
            try { if (connection) await connection.rollback(); } catch (e) { /* ignore */ }
            return res.status(500).json({ success: false, message: 'Failed to update foundation status', error: error.message });
        } finally {
            try { if (connection) connection.release(); } catch (e) { /* ignore */ }
        }

    try {
        // Acquire a dedicated connection for the transaction
        connection = await adminDb.getConnection();
        await connection.beginTransaction();

        // Lock the foundation row to avoid race conditions
        const [rows] = await connection.execute(
            'SELECT foundation_id, status FROM foundation WHERE foundation_id = ? FOR UPDATE',
            [id]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Foundation not found' });
        }

        const currentStatus = rows[0].status;

        // If already in desired state, commit and return the current state
        if (currentStatus === newStatus) {
            await connection.commit();
            return res.json({ success: true, message: `Foundation already ${newStatus}`, foundationId: id, status: newStatus });
        }

        // Perform the update using a single safe statement
        const [updateResult] = await connection.execute(
            'UPDATE foundation SET status = ? WHERE foundation_id = ?',
            [newStatus, id]
        );

        // Ensure update affected a row
        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(500).json({ success: false, message: 'Failed to update foundation status' });
        }

        await connection.commit();

        // Return the updated foundation summary
        const [updatedRows] = await adminDb.execute(
            'SELECT foundation_id, foundation_name, email, mobile, status FROM foundation WHERE foundation_id = ?',
            [id]
        );

        return res.json({ success: true, message: `Foundation ${newStatus} successfully`, data: updatedRows[0] });
    } catch (error) {
        console.error('❌ Foundation verification error:', error);
        try { if (connection) await connection.rollback(); } catch (e) { /* ignore */ }
        return res.status(500).json({ success: false, message: 'Failed to update foundation status', error: error.message });
    } finally {
        try { if (connection) connection.release(); } catch (e) { /* ignore */ }
    }
});

// Volunteer Management Routes
router.get('/volunteers', authenticateAdmin, async (req, res) => {
    try {
        const { status, location, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM volunteers';
        const conditions = [];
        const params = [];
        
        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }
        
        if (location) {
            conditions.push('location LIKE ?');
            params.push(`%${location}%`);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [volunteers] = await adminDb.execute(query, params);
        
        res.json({
            success: true,
            data: volunteers
        });
    } catch (error) {
        console.error('Volunteers fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch volunteers' 
        });
    }
});

router.put('/volunteers/:id/verify', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { action, notes } = req.body;
        
        const status = action === 'approve' ? 'approved' : 'rejected';
        
        await adminDb.execute(
            'UPDATE volunteers SET status = ?, admin_notes = ?, verified_at = NOW() WHERE id = ?',
            [status, notes || null, id]
        );
        
        res.json({
            success: true,
            message: `Volunteer ${action === 'approve' ? 'approved' : 'rejected'} successfully`
        });
    } catch (error) {
        console.error('Volunteer verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update volunteer status' 
        });
    }
});

router.get('/volunteers/nearby/:eventId', authenticateAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Get event location first
        const [eventResult] = await adminDb.execute(
            'SELECT location FROM events WHERE id = ?',
            [eventId]
        );
        
        if (eventResult.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }
        
        const eventLocation = eventResult[0].location;
        
        // Find volunteers in the same area (simplified matching by location name)
        const [volunteers] = await adminDb.execute(`
            SELECT id, name, email, phone, location, skills, availability
            FROM volunteers 
            WHERE status = 'approved' 
            AND location LIKE ?
            ORDER BY created_at DESC
        `, [`%${eventLocation.split(',')[0]}%`]); // Match by city/district
        
        res.json({
            success: true,
            data: volunteers
        });
    } catch (error) {
        console.error('Nearby volunteers fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch nearby volunteers' 
        });
    }
});

// Category Management Routes
/*router.get('/categories', authenticateAdmin, async (req, res) => {
    try {
        const [categories] = await adminDb.execute(`
            SELECT c.*, COUNT(e.id) as event_count
            FROM categories c
            LEFT JOIN events e ON c.id = e.category_id
            GROUP BY c.id
            ORDER BY c.name
        `);
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Categories fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch categories' 
        });
    }
});

router.post('/categories', authenticateAdmin, async (req, res) => {
    try {
        const { name, icon, description } = req.body;
        
        if (!name || !icon) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name and icon are required' 
            });
        }
        
        const [result] = await adminDb.execute(
            'INSERT INTO categories (name, icon, description, active, created_at) VALUES (?, ?, ?, true, NOW())',
            [name, icon, description || null]
        );
        
        res.json({
            success: true,
            message: 'Category created successfully',
            data: { id: result.insertId, name, icon, description }
        });
    } catch (error) {
        console.error('Category creation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create category' 
        });
    }
});

router.put('/categories/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, description, active } = req.body;
        
        await adminDb.execute(
            'UPDATE categories SET name = ?, icon = ?, description = ?, active = ? WHERE id = ?',
            [name, icon, description, active, id]
        );
        
        res.json({
            success: true,
            message: 'Category updated successfully'
        });
    } catch (error) {
        console.error('Category update error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update category' 
        });
    }
});

router.delete('/categories/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if category is being used by any events
        const [eventCheck] = await adminDb.execute(
            'SELECT COUNT(*) as count FROM events WHERE category_id = ?',
            [id]
        );
        
        if (eventCheck[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete category that is being used by events' 
            });
        }
        
        await adminDb.execute('DELETE FROM categories WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Category deletion error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete category' 
        });
    }
});*/

// Donation Analytics Routes
router.get('/analytics/donations', authenticateAdmin, async (req, res) => {
    try {
        const { period = 'month', startDate, endDate } = req.query;
        
        let dateGroup;
        switch (period) {
            case 'day':
                dateGroup = 'DATE(created_at)';
                break;
            case 'week':
                dateGroup = 'YEARWEEK(created_at)';
                break;
            case 'month':
                dateGroup = 'DATE_FORMAT(created_at, "%Y-%m")';
                break;
            case 'year':
                dateGroup = 'YEAR(created_at)';
                break;
            default:
                dateGroup = 'DATE_FORMAT(created_at, "%Y-%m")';
        }
        
        let query = `
            SELECT 
                ${dateGroup} as period,
                COUNT(*) as donation_count,
                SUM(amount) as total_amount,
                AVG(amount) as average_amount
            FROM donations
        `;
        
        const params = [];
        const conditions = [];
        
        if (startDate && endDate) {
            conditions.push('DATE(created_at) BETWEEN ? AND ?');
            params.push(startDate, endDate);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ` GROUP BY ${dateGroup} ORDER BY period DESC`;
        
        const [analytics] = await adminDb.execute(query, params);
        
        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Donation analytics error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch donation analytics' 
        });
    }
});

router.get('/analytics/donations/by-category', authenticateAdmin, async (req, res) => {
    try {
        const [analytics] = await adminDb.execute(`
            SELECT 
                c.name as category_name,
                c.icon as category_icon,
                COUNT(d.id) as donation_count,
                SUM(d.amount) as total_amount,
                AVG(d.amount) as average_amount
            FROM categories c
            LEFT JOIN events e ON c.id = e.category_id
            LEFT JOIN donations d ON e.id = d.event_id
            GROUP BY c.id, c.name, c.icon
            HAVING donation_count > 0
            ORDER BY total_amount DESC
        `);
        
        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Category donation analytics error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch category donation analytics' 
        });
    }
});

// Trending Management Routes
router.get('/trending', authenticateAdmin, async (req, res) => {
    try {
        const [trending] = await adminDb.execute(`
            SELECT e.*, f.name as organizer_name, c.name as category_name
            FROM events e
            LEFT JOIN foundations f ON e.foundation_id = f.id
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE e.is_trending = true
            ORDER BY e.trending_added_at DESC
        `);
        
        res.json({
            success: true,
            data: trending
        });
    } catch (error) {
        console.error('Trending fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch trending events' 
        });
    }
});

// Admin Settings Routes
router.get('/settings', authenticateAdmin, async (req, res) => {
    try {
        const [settings] = await adminDb.execute('SELECT * FROM admin_settings');
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Settings fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch settings' 
        });
    }
});

router.put('/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = req.body;
        
        for (const [key, value] of Object.entries(settings)) {
            await adminDb.execute(
                'INSERT INTO admin_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
        }
        
        res.json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update settings' 
        });
    }
});





// Get categories with their event types
router.get('/categories/events', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await adminDb.execute(`
            SELECT 
                c.category_id, c.category_name,
                GROUP_CONCAT(et.event_type_name ORDER BY et.event_type_name) AS event_type_names,
                GROUP_CONCAT(et.event_type_id ORDER BY et.event_type_name) AS event_type_ids
            FROM CATEGORY c
            LEFT JOIN EVENT_BASED_ON_CATEGORY ebc ON ebc.category_id = c.category_id
            LEFT JOIN EVENT_TYPE et ON et.event_type_id = ebc.event_type_id
            GROUP BY c.category_id, c.category_name
            ORDER BY c.category_name
        `);

        const data = rows.map(row => ({
            category_id: row.category_id,
            category_name: row.category_name,
            event_types: (row.event_type_names ? row.event_type_names.split(',') : []).map((name, idx) => ({
                event_type_id: row.event_type_ids ? row.event_type_ids.split(',')[idx] : '',
                event_type_name: name
            }))
        }));

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories', error: err.message });
    }
});

// Delete category (with check for usage)
router.delete('/categories/:categoryId', authenticateAdmin, async (req, res) => {
    const { categoryId } = req.params;
    try {
        // Check if category is used in any events
        const [used] = await adminDb.execute(
            `SELECT COUNT(*) AS cnt FROM EVENT_CREATION ec
             JOIN EVENT_BASED_ON_CATEGORY ebc ON ec.ebc_id = ebc.ebc_id
             WHERE ebc.category_id = ?`, [categoryId]
        );
        if (used[0].cnt > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete category in use by events.' });
        }
        // Delete links first
        await adminDb.execute('DELETE FROM EVENT_BASED_ON_CATEGORY WHERE category_id = ?', [categoryId]);
        // Delete category
        await adminDb.execute('DELETE FROM CATEGORY WHERE category_id = ?', [categoryId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete failed', error: err.message });
    }
});




router.post('/categories/full', authenticateAdmin, async (req, res) => {
    const { name, icon, eventTypes } = req.body;
    if (!name || !Array.isArray(eventTypes) || eventTypes.length === 0) {
        return res.status(400).json({ success: false, message: 'Category name and at least one event type required.' });
    }

    const connection = await adminDb.getConnection();
    try {
        await connection.beginTransaction();

        // Insert category
        // Use 7 characters max for category_id
const category_id = 'CAT' + Math.floor(1000 + Math.random() * 9000); // 'CAT1234'
        await connection.execute(
            'INSERT INTO CATEGORY (category_id, category_name) VALUES (?, ?)',
            [category_id, name]
        );

        // Insert event types and link them
        for (const eventTypeName of eventTypes) {
            const event_type_id = 'EVT' + Math.floor(1000 + Math.random() * 9000); // 7 chars
            await connection.execute(
                'INSERT IGNORE INTO EVENT_TYPE (event_type_id, event_type_name) VALUES (?, ?)',
                [event_type_id, eventTypeName]
            );

            const [etRow] = await connection.execute(
                'SELECT event_type_id FROM EVENT_TYPE WHERE event_type_name = ?',
                [eventTypeName]
            );
            const final_event_type_id = etRow[0].event_type_id;

            await connection.execute(
                'INSERT IGNORE INTO EVENT_BASED_ON_CATEGORY (ebc_id, category_id, event_type_id) VALUES (?, ?, ?)',
                [
                    'EBC' + Math.floor(1000 + Math.random() * 9000),
                    category_id,
                    final_event_type_id
                ]
            );
        }

        await connection.commit();
        res.json({ success: true, message: 'Category and event types added.' });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to add category and event types.' });
    } finally {
        connection.release();
    }
});



router.post('/categories/:categoryId/add-event-type', authenticateAdmin, async (req, res) => {
    const { categoryId } = req.params;
    const { eventTypeName } = req.body;
    if (!eventTypeName) {
        return res.status(400).json({ success: false, message: 'Event type name required.' });
    }
    const connection = await adminDb.getConnection();
    try {
        await connection.beginTransaction();

        // Insert event type if not exists
        const event_type_id = 'EVT' + Math.floor(1000 + Math.random() * 9000); // 7 chars
        await connection.execute(
            'INSERT IGNORE INTO EVENT_TYPE (event_type_id, event_type_name) VALUES (?, ?)',
            [event_type_id, eventTypeName]
        );
        // Get event_type_id (if already exists)
        const [etRow] = await connection.execute(
            'SELECT event_type_id FROM EVENT_TYPE WHERE event_type_name = ?',
            [eventTypeName]
        );
        const final_event_type_id = etRow[0].event_type_id;

        // Insert into EVENT_BASED_ON_CATEGORY if not exists
        await connection.execute(
            'INSERT IGNORE INTO EVENT_BASED_ON_CATEGORY (ebc_id, category_id, event_type_id) VALUES (?, ?, ?)',
            [
                'EBC' + Math.floor(1000 + Math.random() * 9000),
                categoryId,
                final_event_type_id
            ]
        );

        await connection.commit();
        res.json({ success: true, message: 'Event type added to category.' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ success: false, message: 'Failed to add event type to category.' });
    } finally {
        connection.release();
    }
});

module.exports = router;