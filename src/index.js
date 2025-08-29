const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./config/db');

const adminRoutes = require('./routes/admin');
const donorRoutes = require('./routes/donor');
const foundationRoutes = require('./routes/foundation');
const individualRoutes = require('./routes/individual');
const staffRoutes = require('./routes/staff');

const app = express();

// ✅ Add request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ✅ Middleware: Parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/staff', staffRoutes);
console.log('✅ Staff routes registered');

// ✅ Test route for API functionality
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'SHODESH API is working!',
    timestamp: new Date().toISOString(),
    availableRoutes: {
      admin: [
        'POST /api/admin/login',
        'POST /api/admin/logout'
      ],
      donor: [
        'POST /api/donor/register',
        'POST /api/donor/signin',
        'GET /api/donor/profile/:donorId',
        'PUT /api/donor/update/:donorId',
        'POST /api/donor/check-availability'
      ],
      foundation: [
        'POST /api/foundation/register',
        'POST /api/foundation/signin'
      ],
      individual: [
        'POST /api/individual/register',
        'POST /api/individual/signin'
      ]
    }
  });
});

// ✅ Test route specifically for donor routes
app.get('/api/donor/test', (req, res) => {
  res.json({ 
    message: 'Donor routes are working!', 
    timestamp: new Date(),
    endpoints: [
      'POST /api/donor/register',
      'POST /api/donor/signin',
      'GET /api/donor/profile/:donorId',
      'PUT /api/donor/update/:donorId ← This should work now!',
      'POST /api/donor/check-availability'
    ]
  });
});

// ✅ Test route specifically for individual registration
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

// ✅ Serve specific HTML files
app.get('/signin', (req, res) => {
  res.sendFile(path.join(publicPath, 'signin.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(publicPath, 'signup.html'));
});

app.get('/profiledonor', (req, res) => {
  res.sendFile(path.join(publicPath, 'profiledonor.html'));
});

app.get('/donor', (req, res) => {
  res.sendFile(path.join(publicPath, 'donor.html'));
});

// ✅ Test route
app.get('/test', (req, res) => {
  console.log('🔥 /test route was accessed');
  res.send('✅ /test route is working properly');
});

// ✅ Serve index.html manually if needed
app.get('/', (req, res) => {
  const filePath = path.join(publicPath, 'index.html');
  console.log('📄 Serving homepage from:', filePath);
  res.sendFile(filePath);
});

// ✅ 404 handler for debugging
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.path,
    message: 'This endpoint does not exist',
    registeredRoutes: {
      '/api/donor/*': 'Donor-related endpoints',
      '/api/admin/*': 'Admin-related endpoints',
      '/api/foundation/*': 'Foundation-related endpoints',
      '/api/individual/*': 'Individual-related endpoints'
    }
  });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 SHODESH Server Started Successfully!');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`📂 Serving static files from: ${publicPath}`);
 
});