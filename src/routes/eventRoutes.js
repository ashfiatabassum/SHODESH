// src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/upload'); // memoryStorage
const db = require('../config/db'); // add DB connection
const { getCategories, getEventTypes, createEvent } = require('../config/eventController');

// Get categories
router.get('/categories', getCategories);

// Get event types by category
router.get('/event-types', getEventTypes);

// Create event with files
// Expecting two files: 'doc' and 'coverPhoto'
router.post(
  '/events',
  upload.fields([
    { name: 'doc', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
  ]),
  createEvent
);

// ✅ Download either doc or cover photo by creationId
router.get('/events/:id/file/:type', (req, res) => {
  const { id, type } = req.params;

  let column, filename, contentType;
  if (type === 'doc') {
    column = 'doc';
    filename = 'event_document.docx'; // set correct extension
    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  } else if (type === 'cover') {
    column = 'cover_photo';
    filename = 'event_cover.jpg'; // set correct extension
    contentType = 'image/jpeg';
  } else {
    return res.status(400).send('Invalid file type');
  }

  db.query(`SELECT ${column} FROM event_creation WHERE creation_id = ?`, [id], (err, rows) => {
    if (err || rows.length === 0 || !rows[0][column]) return res.status(404).send('File not found');

    const fileBuffer = rows[0][column];

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    res.send(fileBuffer);
  });
});

module.exports = router;
