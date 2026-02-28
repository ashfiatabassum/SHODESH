// merged-index.js (updated - contains both donation handlers and richer debug route)
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./config/db');

const adminRoutes = require('./routes/admin');
const donorRoutes = require('./routes/donor');
const foundationRoutes = require('./routes/foundation');
const individualRoutes = require('./routes/individual');
const searchRoutes = require('./routes/search');
const eventRoutes = require('./routes/event');
const eventcreationroutes = require('./routes/eventcreationroutes');
const autocompleteRoutes = require('./routes/autocomplete');
const staffRoutes = require('./routes/staff');


const app = express();

// 🔍 Startup diagnostics
console.log('🔧 Bootstrapping SHODESH server');
console.log('   • index.js path:', __filename);
console.log('   • NODE_ENV:', process.env.NODE_ENV);
console.log('   • CWD:', process.cwd());

// ✅ Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'shodesh-admin-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set true if HTTPS
}));

// ✅ Static files
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
app.use('/api/search', searchRoutes);
console.log('✅ Search routes registered');
app.use('/api/autocomplete', autocompleteRoutes);
console.log('✅ Autocomplete routes registered');
app.use('/api/events', eventRoutes);
console.log('✅ Event routes registered');
app.use('/api', eventcreationroutes);
console.log('✅ Event creation routes registered');
app.use('/api/staff', staffRoutes);
console.log('✅ Staff routes registered');

// 🔍 Debug route: list all registered routes (attempt to show parent prefix + child route)
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(mw => {
    if (mw.route && mw.route.path) {
      const methods = Object.keys(mw.route.methods).filter(m => mw.route.methods[m]);
      routes.push({ path: mw.route.path, methods });
    } else if (mw.name === 'router' && mw.handle && mw.handle.stack) {
      mw.handle.stack.forEach(r => {
        if (r.route && r.route.path) {
          const methods = Object.keys(r.route.methods).filter(m => r.route.methods[m]);

          // Try to capture parent prefix from router's regexp (best-effort)
          let prefix = mw.regexp && mw.regexp.source;
          if (prefix) {
            // crude extraction to convert regexp source to readable prefix
            prefix = prefix
              .replace(/^\\^/, '')
              .replace(/\\\/?\$.*$/, '')
              .replace(/\(\?:\^?/, '')
              .replace(/\(\?:\)/, '')
              .replace(/\\\//g, '/'); // unescape slashes
          }
          const composed = (mw && mw.regexp && mw.regexp.fast_slash) ? r.route.path : (prefix ? `${prefix}${r.route.path}` : r.route.path);
          routes.push({ path: composed, methods });
        }
      });
    }
  });
  res.json({ success: true, count: routes.length, routes });
});

// ✅ Test route for API functionality
app.get('/api/test', (req, res) => {
  res.json({
    message: 'SHODESH API is working!',
    timestamp: new Date().toISOString(),
    availableRoutes: {
      admin: ['POST /api/admin/login', 'POST /api/admin/logout'],
      donor: [
        'POST /api/staff/signin',
        'POST /api/donor/register',
        'POST /api/donor/signin',
        'GET /api/donor/profile/:donorId',
        'PUT /api/donor/update/:donorId',
        'POST /api/donor/check-availability'
      ],
      foundation: ['POST /api/foundation/register', 'POST /api/foundation/signin'],
      individual: ['POST /api/individual/register', 'POST /api/individual/signin']
    }
  });
});

// ✅ Donor test route (kept arrow text from originals)
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

// ✅ Individual test route
app.get('/api/individual/test', (req, res) => {
  res.json({
    message: 'Individual routes are working!',
    timestamp: new Date(),
    endpoint: '/api/individual/register is available for POST requests'
  });
});

/* -------------------------
   Donation handlers
   - /donate           : stored-procedure flow (from file 2)
   - /donate/simple    : simple INSERT fallback (from file 1)
   ------------------------- */

// ✅ Stored-proc donation (more complete, from file 2)
app.post('/donate', async (req, res) => {
  const { amount, creation_id } = req.body;
  const donorId = req.session?.donorId;

  if (!donorId) return res.status(401).json({ success: false, message: 'You must sign in as a donor before donating.' });
  if (!creation_id || typeof creation_id !== 'string' || creation_id.length !== 7) return res.status(400).json({ success: false, message: 'Valid creation_id is required.' });
  if (!amount || isNaN(amount) || Number(amount) <= 0) return res.status(400).json({ success: false, message: 'Invalid donation amount.' });

  try {
    await db.promise().query('CALL sp_record_donation(?,?,?)', [creation_id, donorId, amount]);
  } catch (err) {
    console.error('❌ sp_record_donation error:', err);
    if (err && err.sqlState === '45000') {
      return res.status(400).json({ success: false, message: err.message || 'Donation rejected by business rule' });
    }
    return res.status(500).json({ success: false, message: 'Database error', detail: err.message });
  }

  try {
    const [rows] = await db.promise().query(
      'SELECT fn_event_remaining(?) AS remaining, fn_event_is_eligible(?) AS eligible FROM DUAL',
      [creation_id, creation_id]
    );
    const meta = rows && rows[0] ? rows[0] : { remaining: null, eligible: null };
    return res.json({ success: true, message: 'Donation recorded successfully', remaining: meta.remaining, stillEligible: !!meta.eligible });
  } catch (err2) {
    console.warn('⚠ Post-donation function lookup failed:', err2.message);
    return res.json({ success: true, message: 'Donation recorded successfully', remaining: null, stillEligible: null });
  }
});

// ✅ Simple INSERT donation (original from file 1) — kept as fallback at /donate/simple
app.post('/donate/simple', (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: 'Invalid donation amount' });
  }

  const sql = 'INSERT INTO donations (amount) VALUES (?)';
  db.query(sql, [amount], (err, result) => {
    if (err) {
      console.error('❌ Error inserting donation (simple):', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: '✅ Donation recorded successfully (simple)!' });
  });
});

// ✅ Event eligibility check (file 2)
app.get('/api/events/:id/eligibility', async (req, res) => {
  const id = req.params.id;
  if (!id || id.length !== 7) return res.status(400).json({ success: false, message: 'Valid creation_id required' });
  try {
    const [rows] = await db.promise().query(
      'SELECT fn_event_remaining(?) AS remaining, fn_event_is_eligible(?) AS eligible FROM DUAL',
      [id, id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, creation_id: id, remaining: rows[0].remaining, eligible: !!rows[0].eligible });
  } catch (err) {
    console.error('Eligibility check error:', err);
    res.status(500).json({ success: false, message: 'Failed to evaluate eligibility', error: err.message });
  }
});

// ✅ Admin login/logout
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '1234') {
    req.session.adminToken = 'admin-authenticated';
    res.json({ success: true, message: 'Admin login successful', token: 'admin-authenticated' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Admin logout successful' });
});

// ✅ Static HTML routes
app.get('/signin', (req, res) => res.sendFile(path.join(publicPath, 'signin.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(publicPath, 'signup.html')));
app.get('/profiledonor', (req, res) => res.sendFile(path.join(publicPath, 'profiledonor.html')));
app.get('/donor', (req, res) => res.sendFile(path.join(publicPath, 'donor.html')));

// ✅ Test route
app.get('/test', (req, res) => {
  console.log('🔥 /test route was accessed');
  res.send('✅ /test route is working properly');
});

// ✅ Home route
app.get('/', (req, res) => {
  const filePath = path.join(publicPath, 'index.html');
  console.log('📄 Serving homepage from:', filePath);
  res.sendFile(filePath);
});

// ✅ 404 handler
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
      '/api/individual/*': 'Individual-related endpoints',
      '/api/search/*': 'Search & filter endpoints',
      '/api/events/*': 'Event list & detail endpoints',
      '/api/debug/routes': 'List all registered routes'
    }
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 SHODESH Server Started Successfully!');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`📂 Serving static files from: ${publicPath}`);
});
