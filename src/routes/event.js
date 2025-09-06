// Event (Campaign) Routes - list & detail
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/events  (mounted path prefix added in index.js)
// Query params: category_id, event_type_id, ebc_id, division, q
router.get('/', async (req, res) => {
  const { category_id, event_type_id, ebc_id, division, q } = req.query;
  let sql = `
    SELECT 
      ec.creation_id        AS id,
      ec.title,
      ec.description,
      ec.amount_needed      AS goal,
      ec.amount_received    AS raised,
      ec.division           AS location,
      ec.created_at,
      ebc.ebc_id,
      c.category_id,
      c.category_name,
      et.event_type_id,
      et.event_type_name
    FROM EVENT_CREATION ec
    JOIN EVENT_BASED_ON_CATEGORY ebc ON ec.ebc_id = ebc.ebc_id
    JOIN CATEGORY c ON ebc.category_id = c.category_id
    JOIN EVENT_TYPE et ON ebc.event_type_id = et.event_type_id
    WHERE ec.lifecycle_status = 'active' AND ec.verification_status = 'verified'
  `;
  const params = [];
  if (ebc_id) { sql += ' AND ebc.ebc_id = ?'; params.push(ebc_id); }
  else {
    if (category_id) { sql += ' AND c.category_id = ?'; params.push(category_id); }
    if (event_type_id) { sql += ' AND et.event_type_id = ?'; params.push(event_type_id); }
  }
  if (division) { sql += ' AND ec.division = ?'; params.push(division); }
  if (q) { sql += ' AND (ec.title LIKE ? OR ec.description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  sql += ' ORDER BY ec.created_at DESC';
  try {
    const [rows] = await db.promise().query(sql, params);
    res.json({ success:true, data: rows });
  } catch (err) {
    console.error('Events list error:', err);
    res.status(500).json({ success:false, message: 'Failed to fetch events', error: err.message });
  }
});

// GET /api/events/:id - single event detail
router.get('/:id', async (req, res) => {
  const rawId = req.params.id || '';
  const id = rawId.trim();
  console.log(`[EventDetail] Fetch requested id='${rawId}' (trimmed='${id}')`);

  const baseSelect = `
    SELECT 
      ec.creation_id,
      ec.title,
      ec.description,
      ec.amount_needed,
      ec.amount_received,
      ec.division,
      ec.verification_status,
      ec.lifecycle_status,
      ec.created_at,
      ec.updated_at,
      c.category_name,
      et.event_type_name,
      ec.cover_photo,
  f.foundation_name,
  f.email AS foundation_email,
  f.mobile AS foundation_phone,
  f.bkash AS foundation_bkash,
  f.bank_account AS foundation_bank_account,
  i.first_name AS individual_first_name,
  i.mobile AS individual_phone,
  i.bkash AS individual_bkash,
  i.bank_account AS individual_bank_account
    FROM EVENT_CREATION ec
    JOIN EVENT_BASED_ON_CATEGORY ebc ON ec.ebc_id = ebc.ebc_id
    JOIN CATEGORY c ON ebc.category_id = c.category_id
    JOIN EVENT_TYPE et ON ebc.event_type_id = et.event_type_id
    LEFT JOIN FOUNDATION f ON ec.foundation_id = f.foundation_id
    LEFT JOIN INDIVIDUAL i ON ec.individual_id = i.individual_id
  `;
  const filteredSql = baseSelect + `
    WHERE ec.creation_id = ?
      AND ec.verification_status = 'verified'
      AND ec.lifecycle_status = 'active'
    LIMIT 1`;
  try {
    const [rows] = await db.promise().query(filteredSql, [id]);
    if (!rows.length) {
      console.warn(`[EventDetail] Not found with active+verified filters. Retrying without filters for diagnostic.`);
      const [allRows] = await db.promise().query(baseSelect + ' WHERE ec.creation_id = ? LIMIT 1', [id]);
      if (!allRows.length) {
        return res.status(404).json({ success:false, message:'Event not found (no record with that ID)' });
      }
      const r = allRows[0];
      return res.status(404).json({
        success:false,
        message:'Event exists but is not active + verified',
        status: { verification_status: r.verification_status, lifecycle_status: r.lifecycle_status }
      });
    }
    const row = rows[0];
    let cover_photo_url = null;
    if (row.cover_photo) {
      try {
        const base64 = Buffer.from(row.cover_photo).toString('base64');
        cover_photo_url = `data:image/jpeg;base64,${base64}`;
      } catch(e){ console.warn('Cover photo encode failed:', e.message); }
    }
    res.json({
      success:true,
      data:{
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
        cover_photo_url,
  organizer: row.foundation_name || row.individual_first_name || null,
  contact_phone: row.foundation_phone || row.individual_phone || null,
  contact_email: row.foundation_email || null,
  contact_bkash: row.foundation_bkash || row.individual_bkash || null,
  bank_account: row.foundation_bank_account || row.individual_bank_account || null
      }
    });
  } catch (err) {
    console.error('Single event error:', err);
    res.status(500).json({ success:false, message: 'Failed to fetch event', error: err.message });
  }
});

module.exports = router;
