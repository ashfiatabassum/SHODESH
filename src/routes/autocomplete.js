// Autocomplete API for Campaign Search
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all campaigns for autocomplete
router.get('/campaigns', async (req, res) => {
    try {
        const sql = `
            SELECT 
                ec.creation_id,
                ec.campaign_title as title,
                ec.division,
                c.category_name as category
            FROM EVENT_CREATION ec
            LEFT JOIN EVENT_BASED_ON_CATEGORY ebc ON ec.ebc_id = ebc.ebc_id
            LEFT JOIN CATEGORY c ON ebc.category_id = c.category_id
            WHERE ec.lifecycle_status = 'active' 
                AND ec.verification_status = 'verified'
            ORDER BY ec.campaign_title
            LIMIT 100
        `;
        
        const [rows] = await db.promise().query(sql);
        
        const campaigns = rows.map(row => ({
            creation_id: row.creation_id,
            title: row.title,
            division: row.division || 'Unknown',
            category: row.category || 'General'
        }));
        
        res.json({ success: true, data: campaigns });
    } catch (error) {
        console.error('Autocomplete campaigns fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch campaigns for autocomplete', 
            error: error.message 
        });
    }
});

module.exports = router;