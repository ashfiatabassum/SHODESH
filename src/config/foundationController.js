// src/config/foundationController.js
const db = require('./db');

// Delete foundation profile
const deleteFoundationProfile = (req, res) => {
    const foundationId = req.body.foundationId || req.params.foundationId;

    if (!foundationId) {
        return res.status(400).json({ success: false, message: 'Foundation ID is required' });
    }

    const checkSql = `
        SELECT COUNT(*) AS activeCount
        FROM EVENT_CREATION
        WHERE foundation_id = ? AND LOWER(TRIM(lifecycle_status)) = 'active'
    `;

    db.query(checkSql, [foundationId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (rows[0].activeCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Profile deletion unsuccessful due to the presence of active events.'
            });
        }

        // proceed with delete if no active events
        db.query('DELETE FROM FOUNDATION WHERE foundation_id = ?', [foundationId], (err2) => {
            if (err2) return res.status(500).json({ success: false, message: err2.message });

            res.json({ success: true, message: 'Foundation profile deleted successfully.' });
        });
    });
};

module.exports = {
    deleteFoundationProfile
};
