// Use built-in fetch (Node 18+)
// Change these values to match your test data
const FOUNDATION_ID = 'F000002';
const ACTION = 'approve'; // 'approve' or 'suspend'

(async () => {
  try {
    if (typeof fetch !== 'function') {
      throw new Error('Global fetch is not available in this Node.js. Use Node 18+ or install node-fetch.');
    }

    const res = await fetch(`http://localhost:3000/api/admin/foundations/${FOUNDATION_ID}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'admin-authenticated'
      },
      body: JSON.stringify({ action: ACTION })
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { json = text; }

    console.log('Status:', res.status);
    console.log('Response:', json);
  } catch (err) {
    console.error('Request failed:', err.message || err);
    process.exit(1);
  }
})();
