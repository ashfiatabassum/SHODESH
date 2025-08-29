const express = require('express');
const router = express.Router();
const db = require('../config/db');
const adminDb = require('../config/db-admin');

// POST /api/staff/check-username - Check if a username is already in use
router.post('/check-username', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' });
    }

    try {
        const [rows] = await adminDb.execute('SELECT username FROM STAFF WHERE username = ?', [username]);
        if (rows.length > 0) {
            return res.json({ success: true, exists: true, message: 'Username is already taken.' });
        } else {
            return res.json({ success: true, exists: false, message: 'Username is available.' });
        }
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
