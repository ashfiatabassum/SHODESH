// src/config/upload.js
const multer = require('multer');

// Memory storage keeps files in req.files.buffer (BLOB)
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
