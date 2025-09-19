// Search APIs for SHODESH Explore Campaigns
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get categories now via stored procedure (DBMS feature showcase)
router.get('/categories', async (req, res) => {
    try {
        const [resultSets] = await db.promise().query('CALL sp_get_categories()');
        const rows = resultSets[0] || resultSets; // mysql2 returns [ [rows], meta ]
        res.json({ success:true, data: rows });
    } catch (error) {
        console.error('Category fetch error (sp_get_categories):', error);
        res.status(500).json({ success:false, message:'Failed to fetch categories', error:error.message });
    }
});

// Get event types (optionally filtered by category having active + verified events)
router.get('/event-types', async (req, res) => {
    const { category_id } = req.query;
    try {
        const catParam = category_id || '';
        const [resultSets] = await db.promise().query('CALL sp_get_event_types(?)', [catParam]);
        const rows = resultSets[0] || resultSets;
        res.json({ success:true, data: rows });
    } catch (error) {
        console.error('Event types fetch error (sp_get_event_types):', error);
        res.status(500).json({ success:false, message:'Failed to fetch event types', error:error.message });
    }
});

// Get all divisions
// Divisions (optionally filtered)
router.get('/divisions', async (req, res) => {
    const { category_id, event_type_id, ebc_id } = req.query;
    // Stored proc does not handle ebc_id; fallback to legacy inline if ebc_id provided
    if (ebc_id) {
        let sql = `SELECT ec.division, COUNT(*) AS campaign_count
                   FROM EVENT_CREATION ec
                   JOIN EVENT_BASED_ON_CATEGORY ebc ON ec.ebc_id = ebc.ebc_id
                   WHERE ec.lifecycle_status='active' AND ec.verification_status='verified' AND ebc.ebc_id = ?
                   GROUP BY ec.division HAVING COUNT(*)>0 ORDER BY ec.division`;
        try {
            const [rows] = await db.promise().query(sql, [ebc_id]);
            return res.json({ success:true, data: rows.map(r=>({division:r.division, campaign_count:r.campaign_count})) });
        } catch(error){
            console.error('Division fetch error (fallback ebc_id):', error);
            return res.status(500).json({ success:false, message:'Failed to fetch divisions', error:error.message });
        }
    }
    try {
        const [resultSets] = await db.promise().query('CALL sp_get_divisions(?,?)', [category_id||'', event_type_id||'']);
        const rows = resultSets[0] || resultSets;
        // Procedure returns plain division list; enrich with counts requires extra query OR omit
        res.json({ success:true, data: rows.map(r => ({ division:r.division, campaign_count: undefined })) });
    } catch (error) {
        console.error('Division fetch error (sp_get_divisions):', error);
        res.status(500).json({ success:false, message:'Failed to fetch divisions', error:error.message });
    }
});

// Get events filtered by category, event type, division, sort
// Get events filtered by category, event type, division, and search
router.get('/events', async (req, res) => {
    const { category_id, event_type_id, ebc_id, division, q } = req.query;
    // Stored stats proc does not yet support ebc_id specifically; fallback raw SQL with inline aggregation when ebc_id provided
    if (ebc_id) {
        try {
            let sql = `SELECT 
                ec.creation_id AS id, ec.title, ec.description,
                ec.amount_needed AS goal, ec.amount_received AS raised,
                ec.division AS location, ec.created_at, ec.cover_photo,
                ebc.ebc_id, c.category_id, c.category_name, et.event_type_id, et.event_type_name,
                IFNULL((SELECT COUNT(DISTINCT d.donor_id) FROM DONATION d WHERE d.creation_id=ec.creation_id),0) AS donors,
                IFNULL((SELECT SUM(d.amount) FROM DONATION d WHERE d.creation_id=ec.creation_id),0) AS total_raised,
                IFNULL((SELECT SUM(d.amount) FROM DONATION d WHERE d.creation_id=ec.creation_id AND YEAR(d.paid_at)=YEAR(CURRENT_DATE) AND MONTH(d.paid_at)=MONTH(CURRENT_DATE)),0) AS raised_this_month,
                IFNULL((SELECT COUNT(DISTINCT d.donor_id) FROM DONATION d WHERE d.creation_id=ec.creation_id AND YEAR(d.paid_at)=YEAR(CURRENT_DATE) AND MONTH(d.paid_at)=MONTH(CURRENT_DATE)),0) AS donors_this_month,
                0 AS daysLeft, NULL AS urgency
            FROM EVENT_CREATION ec
            JOIN EVENT_BASED_ON_CATEGORY ebc ON ec.ebc_id = ebc.ebc_id
            JOIN CATEGORY c ON ebc.category_id = c.category_id
            JOIN EVENT_TYPE et ON ebc.event_type_id = et.event_type_id
            WHERE ec.lifecycle_status='active' AND ec.verification_status='verified' AND ebc.ebc_id = ?`;
            const params=[ebc_id];
            if (division){ sql += ' AND ec.division = ?'; params.push(division); }
            if (q){ sql += ' AND (ec.title LIKE ? OR ec.description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
            sql += ' ORDER BY ec.created_at DESC';
            const [rows] = await db.promise().query(sql, params);
            // Normalize shape to match stats proc mapping
            const mapped = rows.map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                goal: r.goal,
                raised: r.raised,
                location: r.location,
                created_at: r.created_at,
                creation_id: r.id,
                cover_photo: r.cover_photo,
                ebc_id: r.ebc_id,
                category_id: r.category_id,
                category_name: r.category_name,
                event_type_id: r.event_type_id,
                event_type_name: r.event_type_name,
                donors: r.donors || 0,
                total_raised: r.total_raised || r.raised,
                raised_this_month: r.raised_this_month || 0,
                donors_this_month: r.donors_this_month || 0,
                daysLeft: 0,
                urgency: null
            }));
            return res.json({ success:true, data:mapped });
        } catch (error) {
            console.error('Events fetch error (fallback ebc_id):', error);
            return res.status(500).json({ success:false, message:'Failed to fetch events', error:error.message });
        }
    }
    try {
        const [resultSets] = await db.promise().query('CALL sp_search_events_stats(?,?,?,?)', [category_id||'', event_type_id||'', division||'', q||'']);
        const rows = resultSets[0] || resultSets;
        const mapped = rows.map(r => ({
            id: r.creation_id,
            title: r.title,
            description: r.description,
            goal: r.amount_needed,
            raised: r.amount_received, // backward compatibility for existing UI
            location: r.division,
            created_at: r.created_at,
            creation_id: r.creation_id,
            cover_photo: r.cover_photo,
            ebc_id: r.ebc_id,
            category_id: r.category_id,
            category_name: r.category_name,
            event_type_id: r.event_type_id,
            event_type_name: r.event_type_name,
            donors: r.total_donors || 0,
            total_raised: r.total_raised || r.amount_received,
            raised_this_month: r.raised_this_month || 0,
            donors_this_month: r.donors_this_month || 0,
            daysLeft: 0,
            urgency: null
        }));
        res.json({ success:true, data:mapped });
    } catch (error) {
        console.error('Events fetch error (sp_search_events_stats):', error);
        res.status(500).json({ success:false, message:'Failed to fetch events', error:error.message });
    }
});

// Single event detail
router.get('/event/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [resultSets] = await db.promise().query('CALL sp_get_event_detail_stats(?)', [id]);
        const rows = resultSets[0] || resultSets;
        if(!rows.length) return res.status(404).json({ success:false, message:'Event not found' });
        const row = rows[0];
        if (!(row.verification_status === 'verified' && row.lifecycle_status === 'active')) {
            return res.status(404).json({ success:false, message:'Event not found (not active & verified)' });
        }
        // cover_photo not provided by proc (consistent with prior proc) - left as null placeholder
        res.json({ success:true, data:{
            creation_id: row.creation_id,
            title: row.title,
            description: row.description,
            amount_needed: row.amount_needed,
            amount_received: row.amount_received,
            division: row.division,
            verification_status: row.verification_status,
            lifecycle_status: row.lifecycle_status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            category_name: row.category_name,
            event_type_name: row.event_type_name,
            organizer: row.creator_name || null,
            contact_phone: row.contact_phone || null,
            contact_email: row.contact_email || null,
            total_donors: row.total_donors || 0,
            total_donations: row.total_donations || 0,
            total_raised: row.total_raised || row.amount_received,
            raised_this_month: row.raised_this_month || 0,
            donors_this_month: row.donors_this_month || 0,
            last_donation_at: row.last_donation_at || null
        }});
    } catch (error) {
        console.error('Single event fetch error (sp_get_event_detail_stats):', error);
        res.status(500).json({ success:false, message:'Failed to fetch event', error:error.message });
    }
});

module.exports = router;

// NOTE: Single event details route (mounted separately if needed)
