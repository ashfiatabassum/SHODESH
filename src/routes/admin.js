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
        // Get various statistics for the dashboard
        const [eventStats] = await adminDb.execute(`
            SELECT 
                COUNT(*) as total_events,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_events,
                SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_events,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_events
            FROM events
        `);
        
        const [donationStats] = await adminDb.execute(`
            SELECT 
                COUNT(*) as total_donations,
                SUM(amount) as total_amount,
                AVG(amount) as average_amount
            FROM donations
        `);
        
        const [foundationStats] = await adminDb.execute(`
            SELECT 
                COUNT(*) as total_foundations,
                SUM(CASE WHEN status = 'unverified' THEN 1 ELSE 0 END) as pending_foundations,
                SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as approved_foundations
            FROM foundation
        `);
        
        const [volunteerStats] = await adminDb.execute(`
            SELECT 
                COUNT(*) as total_volunteers,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_volunteers,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_volunteers
            FROM volunteers
        `);
        
        res.json({
            success: true,
            data: {
                events: eventStats[0],
                donations: donationStats[0],
                foundations: foundationStats[0],
                volunteers: volunteerStats[0]
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch dashboard statistics' 
        });
    }
});

// Event Management Routes
router.get('/events', authenticateAdmin, async (req, res) => {
    try {
        const { status, category, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT e.*, f.name as organizer_name, c.name as category_name
            FROM events e
            LEFT JOIN foundations f ON e.foundation_id = f.id
            LEFT JOIN categories c ON e.category_id = c.id
        `;
        
        const conditions = [];
        const params = [];
        
        if (status) {
            conditions.push('e.status = ?');
            params.push(status);
        }
        
        if (category) {
            conditions.push('c.name = ?');
            params.push(category);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [events] = await adminDb.execute(query, params);
        
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Events fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch events' 
        });
    }
});

router.put('/events/:id/verify', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { action, notes } = req.body; // action: 'approve', 'reject'
        
        const status = action === 'approve' ? 'verified' : 'rejected';
        
        await adminDb.execute(
            'UPDATE events SET status = ?, admin_notes = ?, verified_at = NOW() WHERE id = ?',
            [status, notes || null, id]
        );
        
        res.json({
            success: true,
            message: `Event ${action === 'approve' ? 'approved' : 'rejected'} successfully`
        });
    } catch (error) {
        console.error('Event verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update event status' 
        });
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
router.get('/categories', authenticateAdmin, async (req, res) => {
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
});

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

module.exports = router;
