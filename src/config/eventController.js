// src/config/eventController.js 
const db = require("./db"); // CommonJS require

// Helper function to generate unique creation_id
// NOTE: creation_id column is defined as VARCHAR(7) -> must be exactly 7 chars.
// Format: 'CRE' + 4-digit random number (total length = 3 + 4 = 7)
const generateCreationId = () => {
  const prefix = "CRE";
  const randomNum = Math.floor(Math.random() * 9000 + 1000); // 4-digit number
  return `${prefix}${randomNum}`; // e.g., CRE1234
};

// Get all categories
const getCategories = (req, res) => {
  db.query('SELECT * FROM category', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

const getEventTypes = (req, res) => { 
  const { categoryId } = req.query;
  if (!categoryId) return res.status(400).json({ error: "categoryId is required" });

  const sql = `
    SELECT ebc.ebc_id, et.event_type_name
    FROM EVENT_BASED_ON_CATEGORY ebc
    JOIN EVENT_TYPE et ON ebc.event_type_id = et.event_type_id
    WHERE ebc.category_id = ?
    ORDER BY et.event_type_name
  `;

  db.query(sql, [categoryId], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Failed to fetch event types" });
    }
    res.json(rows); 
    // [{ebc_id: 1, event_type_name: 'Flood Relief'}, ...]
  });
};

// Create Event (updated to enforce XOR logic)
const createEvent = (req, res) => {
  // debug: what multer delivered
  console.log("REQ FILES:", req.files);
  console.log("REQ BODY:", req.body);

  // destructure expected fields from body
  const {
    creatorType,
    individualId,
    foundationId,
    ebcId,
    title,
    description,
    amountNeeded,
    division
  } = req.body;

  // basic validation
  if (!creatorType || !ebcId || !title || !description || !amountNeeded || !division) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // convert/validate numeric field
  const amountNum = Number(amountNeeded);
  if (Number.isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amountNeeded" });
  }

  // Directly use buffers from multer's memoryStorage
  const docBuffer = req.files?.doc?.[0]?.buffer || null;
  const coverPhotoBuffer = req.files?.coverPhoto?.[0]?.buffer || null;

  // Generate creation id
  const creationId = generateCreationId();

  // Enforce XOR logic for individual/foundation IDs
  let finalIndividualId = null;
  let finalFoundationId = null;

  if (creatorType === 'individual') {
    finalIndividualId = individualId || null;
    finalFoundationId = null;
  } else if (creatorType === 'foundation') {
    finalFoundationId = foundationId || null;
    finalIndividualId = null;
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid creatorType. Must be 'individual' or 'foundation'."
    });
  }

  // Columns to insert
  const columns = [
    'creation_id', 'creator_type', 'individual_id', 'foundation_id',
    'ebc_id', 'title', 'description', 'amount_needed',
    'division', 'doc', 'cover_photo'
  ];

  // Values array
  const values = [
    creationId,
    creatorType,
    finalIndividualId,
    finalFoundationId,
    ebcId,
    title,
    description,
    amountNum,
    division,
    docBuffer,
    coverPhotoBuffer
  ];

  // Debug logs
  console.log("INSERT columns count:", columns.length);
  console.log("VALUES length:", values.length);

  // Build parameter placeholders string (?, ?, ...)
  const placeholders = values.map(() => '?').join(', ');

  const sql = `INSERT INTO event_creation (${columns.join(', ')}) VALUES (${placeholders})`;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error inserting event:', err);
      return res.status(500).json({ success: false, message: err.sqlMessage || err.message });
    }

    res.json({
      success: true,
      message: `Event created successfully! Creation ID: ${creationId}`,
      creationId
    });
  });
};

module.exports = { getCategories, getEventTypes, createEvent };
