const express = require('express');
const path = require('path');
const db = require('./config/db');

const app = express();

// ✅ Middleware: Parse incoming JSON
app.use(express.json());

// ✅ Serve static files from /src/public
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
console.log('📁 Static files served from:', publicPath);

// ✅ API: Handle donations
app.post('/donate', (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: 'Invalid donation amount' });
  }

  const sql = 'INSERT INTO donations (amount) VALUES (?)';
  db.query(sql, [amount], (err, result) => {
    if (err) {
      console.error('❌ Error inserting donation:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: '✅ Donation recorded successfully!' });
  });
});

// ✅ Test route
app.get('/test', (req, res) => {
  console.log('🔥 /test route was accessed');
  res.send('✅ /test route is working properly');
});

// ✅ Optional: Serve index.html manually if needed
app.get('/', (req, res) => {
  const filePath = path.join(publicPath, 'index.html');
  console.log('📄 Serving homepage from:', filePath);
  res.sendFile(filePath);
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is live at http://localhost:${PORT}`);
});
