// Admin Routes for SHODESH Platform
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
    // Check for admin session/token
    const adminToken = req.headers.authorization || req.session?.adminToken;
    
    if (!adminToken) {
        return res.status(401).json({ 
            success: false, 
            message: 'Admin authentication required' 
        });
    }
    
    // Verify admin token (implement your authentication logic)
    // For now, we'll assume the token is valid
    next();
};

// Dashboard Overview
router.get('/dashboard/stats', authenticateAdmin, async (req, res) => {
    try {
        // Get various statistics for the dashboard
        const [eventStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_events,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_events,
                SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_events,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_events
            FROM events
        `);
        
        const [donationStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_donations,
                SUM(amount) as total_amount,
                AVG(amount) as average_amount
            FROM donations
        `);
        
        const [foundationStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_foundations,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_foundations,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_foundations
            FROM foundations
        `);
        
        const [volunteerStats] = await db.execute(`
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
        
        const [events] = await db.execute(query, params);
        
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
        
        await db.execute(
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
            await db.execute(`
                INSERT INTO volunteer_verification_requests 
                (event_id, volunteer_id, instructions, status, created_at)
                VALUES (?, ?, ?, 'pending', NOW())
            `, [id, volunteerId, instructions]);
        }
        
        // Update event status to indicate volunteer verification is requested
        await db.execute(
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
        
        await db.execute(
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
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM foundations';
        const params = [];
        
        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [foundations] = await db.execute(query, params);
        
        res.json({
            success: true,
            data: foundations
        });
    } catch (error) {
        console.error('Foundations fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch foundations' 
        });
    }
});

router.put('/foundations/:id/verify', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { action, notes } = req.body;
        
        const status = action === 'approve' ? 'approved' : 'rejected';
        
        await db.execute(
            'UPDATE foundations SET status = ?, admin_notes = ?, verified_at = NOW() WHERE id = ?',
            [status, notes || null, id]
        );
        
        res.json({
            success: true,
            message: `Foundation ${action === 'approve' ? 'approved' : 'rejected'} successfully`
        });
    } catch (error) {
        console.error('Foundation verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update foundation status' 
        });
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
        
        const [volunteers] = await db.execute(query, params);
        
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
        
        await db.execute(
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
        const [eventResult] = await db.execute(
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
        const [volunteers] = await db.execute(`
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
        const [categories] = await db.execute(`
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
        
        const [result] = await db.execute(
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
        
        await db.execute(
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
        const [eventCheck] = await db.execute(
            'SELECT COUNT(*) as count FROM events WHERE category_id = ?',
            [id]
        );
        
        if (eventCheck[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete category that is being used by events' 
            });
        }
        
        await db.execute('DELETE FROM categories WHERE id = ?', [id]);
        
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
        
        const [analytics] = await db.execute(query, params);
        
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
        const [analytics] = await db.execute(`
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
        const [trending] = await db.execute(`
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
        const [settings] = await db.execute('SELECT * FROM admin_settings');
        
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
            await db.execute(
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
