const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./config/db');


const adminRoutes = require('./routes/admin');
const donorRoutes = require('./routes/donor');
const foundationRoutes = require('./routes/foundation');
const individualRoutes = require('./routes/individual');

const app = express();




// ✅ Add request logging middleware (ADD THIS)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});







// ✅ Middleware: Parse incoming JSON
app.use(express.json());

// ✅ Session middleware for admin authentication
app.use(session({
  secret: 'shodesh-admin-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// ✅ Serve static files from /src/public
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
console.log('📁 Static files served from:', publicPath);
// ✅ Routes
console.log('🔗 Registering routes...');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes registered');
app.use('/api/donor', donorRoutes);
console.log('✅ Donor routes registered');
app.use('/api/foundation', foundationRoutes);
console.log('✅ Foundation routes registered');
app.use('/api/individual', individualRoutes);
console.log('✅ Individual routes registered');



// ✅ Test route specifically for individual registration (ADD THIS)
app.get('/api/individual/test', (req, res) => {
  res.json({ 
    message: 'Individual routes are working!', 
    timestamp: new Date(),
    endpoint: '/api/individual/register is available for POST requests'
  });
});





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

// ✅ Admin authentication route
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Fixed admin credentials for frontend testing
  if (username === 'admin' && password === '1234') {
    req.session.adminToken = 'admin-authenticated';
    res.json({ 
      success: true, 
      message: 'Admin login successful',
      token: 'admin-authenticated'
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid admin credentials' 
    });
  }
});

// ✅ Admin logout route
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ 
    success: true, 
    message: 'Admin logout successful' 
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






// ✅ 404 handler for debugging (ADD THIS)
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.path,
    message: 'This endpoint does not exist'
  });
});








// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is live at http://localhost:${PORT}`);
});
