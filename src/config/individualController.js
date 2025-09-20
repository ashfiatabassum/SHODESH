// src/config/individualController.js
const db = require('./db');

// Delete individual profile
const deleteIndividualProfile = (req, res) => {
    const individualId = req.body.individualId || req.params.individualId;

    if (!individualId) {
        return res.status(400).json({ success: false, message: 'Individual ID is required' });
    }

    const sql = 'DELETE FROM INDIVIDUAL WHERE individual_id = ?';
const checkSql = `
    SELECT COUNT(*) AS activeCount
    FROM EVENT_CREATION
    WHERE individual_id = ? AND LOWER(TRIM(lifecycle_status)) = 'active'
`;

db.query(checkSql, [individualId], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (rows[0].activeCount > 0) {
        return res.status(400).json({
            success: false,
            message: 'Profile deletion unsuccessful due to the presence of active events.'
        });
    }

    // proceed with delete if no active events
    db.query('DELETE FROM INDIVIDUAL WHERE individual_id = ?', [individualId], (err2) => {
        if (err2) return res.status(500).json({ success: false, message: err2.message });
        res.json({ success: true, message: 'Profile deleted successfully.' });
    });
});

};

module.exports = {
    deleteIndividualProfile
};