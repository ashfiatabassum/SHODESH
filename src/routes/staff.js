const express = require('express');
const router = express.Router();
const db = require('../config/db-test');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/cv/');
console.log('Creating upload directory at:', uploadDir);
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('✅ Upload directory created successfully');
    } catch (error) {
        console.error('❌ Error creating upload directory:', error);
    }
}

// Configure multer for CV upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Make sure directory exists before upload
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        crypto.randomBytes(16, (err, buf) => {
            if (err) return cb(err);
            cb(null, buf.toString('hex') + path.extname(file.originalname));
        });
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        console.log('Processing file upload for:', file ? file.originalname : 'unknown file');
        
        // Check if file exists
        if (!file) {
            console.error('No file provided in request');
            return cb(new Error('CV file is required'), false);
        }
        
        // Check file type
        const allowedTypes = /pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (!extname) {
            console.error(`Invalid file type: ${file.originalname}`);
            return cb(new Error('Only PDF, Word documents, and TXT files are allowed'), false);
        }
        
        console.log('File passed validation:', file.originalname);
        return cb(null, true);
    }
});

// Check if username exists
router.post('/check-username', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' });
    }

    try {
        const [rows] = await db.execute('SELECT username FROM staff WHERE username = ?', [username]);
        return res.json({ 
            success: true, 
            exists: rows.length > 0,
            message: rows.length > 0 ? 'Username is already taken' : 'Username is available'
        });
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Staff signup
router.post('/signup', (req, res, next) => {
    console.log('📥 Staff signup request initiated');
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request files:', req.files);
    
    // Check if the request includes a file
    if (req.is('multipart/form-data') || req.headers['content-type']?.includes('multipart/form-data')) {
        console.log('✅ Multipart form detected, processing file upload');
    } else {
        console.log('⚠️ Warning: Request may not be multipart/form-data');
    }
    
    upload.single('cv')(req, res, (err) => {
        if (err) {
            console.error('❌ File upload error:', err);
            // Handle multer errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'CV file is too large. Maximum file size is 10MB.'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'CV upload error: ' + err.message
            });
        }
        
        console.log('✅ File upload processed');
        if (!req.file) {
            console.error('❌ No file was received in the request');
            console.log('Request body:', req.body);
            console.log('Form fields received:', Object.keys(req.body));
            
            return res.status(400).json({
                success: false,
                message: 'CV file is required but was not received'
            });
        }
        
        console.log('📄 File details:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });
        
        console.log('📄 File details:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });
        
        // Continue to the next middleware/handler
        next();
    });
}, async (req, res) => {
    console.log('📥 Staff signup request received:', req.body);
    
    try {
        // Extract data from the form submission
        const {
            firstName,
            lastName,
            username,
            password,
            mobileNumber,
            gmail: email,
            nid,
            birthDay,
            birthMonth,
            birthYear,
            houseNo,
            roadNo,
            area,
            district,
            administrativeDiv,
            zipCode
        } = req.body;

        // Check required fields
        if (!firstName || !lastName || !username || !password || !mobileNumber || !email || !nid) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }
        console.log('📋 Required fields checked: All present');

        // Validate username format
        const usernamePattern = /^[a-zA-Z0-9._]+$/;
        if (!usernamePattern.test(username)) {
            console.log('❌ Invalid username format');
            return res.status(400).json({
                success: false,
                message: 'Username can only contain letters, numbers, dots, and underscores'
            });
        }
        console.log('🔍 Validating username format: Valid');

        // Validate mobile number
        const mobileRegex = /^01[3-9]\d{8}$/;
        if (!mobileRegex.test(mobileNumber)) {
            console.log('❌ Invalid mobile number format');
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid Bangladeshi mobile number'
            });
        }
        console.log('🔍 Validating mobile number format: Valid');

        // Validate email format
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Invalid email format');
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }
        console.log('🔍 Validating email format: Valid');

        // Validate name formats
        const nameRegex = /^[A-Za-z\s.-]{2,50}$/;
        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
            console.log('❌ Invalid name format');
            return res.status(400).json({
                success: false,
                message: 'Names can only contain letters, spaces, dots, and hyphens'
            });
        }
        console.log('🔍 Validating name formats: Valid');

        // Format date of birth
        let dob = null;
        try {
            if (birthYear && birthMonth && birthDay) {
                const monthPadded = birthMonth.toString().padStart(2, '0');
                const dayPadded = birthDay.toString().padStart(2, '0');
                dob = `${birthYear}-${monthPadded}-${dayPadded}`;
            }
        } catch (error) {
            console.log('❌ Error formatting date of birth:', error);
            return res.status(400).json({
                success: false,
                message: 'Invalid date of birth'
            });
        }
        console.log('🔍 Validating date of birth: Valid');

        // Validate age (minimum 18 years)
        if (dob) {
            const dobDate = new Date(dob);
            const today = new Date();
            const ageDiff = today.getFullYear() - dobDate.getFullYear();
            const monthDiff = today.getMonth() - dobDate.getMonth();
            
            const age = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate()) 
                ? ageDiff - 1 
                : ageDiff;
                
            if (age < 18) {
                console.log('❌ Staff must be at least 18 years old');
                return res.status(400).json({
                    success: false,
                    message: 'You must be at least 18 years old to register as staff'
                });
            }
            console.log('🔍 Validating age (minimum 18): Valid');
        }

        // Validate NID
        const nidRegex = /^\d{10,17}$/;
        if (!nidRegex.test(nid)) {
            console.log('❌ Invalid NID format');
            return res.status(400).json({
                success: false,
                message: 'NID must be 10-17 digits'
            });
        }
        console.log('🔍 Validating NID format: Valid');

        // Validate road number
        if (roadNo && !(/^[A-Za-z0-9\s./-]{1,10}$/).test(roadNo)) {
            console.log('❌ Invalid road number format');
            return res.status(400).json({
                success: false, 
                message: 'Invalid road number format'
            });
        }
        console.log('🔍 Validating road number: Valid');

        // Validate zip code
        if (zipCode && !(/^\d{4}$/).test(zipCode)) {
            console.log('❌ Invalid zip code format');
            return res.status(400).json({
                success: false,
                message: 'Zip code must be 4 digits'
            });
        }
        console.log('🔍 Validating zip code: Valid');

        // Validate district and administrative division
        const validDistricts = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Other'];
        const validDivisions = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'];
        
        if (district && !validDistricts.includes(district)) {
            console.log('❌ Invalid district');
            return res.status(400).json({
                success: false,
                message: 'Please select a valid district'
            });
        }
        
        if (administrativeDiv && !validDivisions.includes(administrativeDiv)) {
            console.log('❌ Invalid administrative division');
            return res.status(400).json({
                success: false,
                message: 'Please select a valid administrative division'
            });
        }
        console.log('🔍 Validating district and administrative division: Valid');
        
        console.log('✅ All validations passed');

        // Check for existing username, email, mobile, or NID one by one to give more specific error messages
        console.log('🔍 Checking for existing username...');
        try {
            const [existingUsernames] = await db.execute('SELECT username FROM staff WHERE username = ?', [username]);
            
            if (existingUsernames.length > 0) {
                console.log(`❌ Username '${username}' already exists`);
                return res.status(409).json({
                    success: false,
                    message: 'This username is already taken. Please choose a different username.',
                    field: 'username'
                });
            }
        } catch (usernameCheckError) {
            console.error('Error checking for existing username:', usernameCheckError);
            // Continue with registration process even if the check fails
        }
        
        console.log('🔍 Checking for existing email...');
        try {
            const [existingEmails] = await db.execute('SELECT email FROM staff WHERE email = ?', [email]);
            
            if (existingEmails.length > 0) {
                console.log(`❌ Email '${email}' already registered`);
                return res.status(409).json({
                    success: false,
                    message: 'An account with this email address already exists. Please use a different email or try signing in.',
                    field: 'email'
                });
            }
        } catch (emailCheckError) {
            console.error('Error checking for existing email:', emailCheckError);
            // Continue with registration process even if the check fails
        }

        console.log('🔍 Checking for existing mobile number...');
        try {
            const [existingMobiles] = await db.execute('SELECT mobile FROM staff WHERE mobile = ?', [mobileNumber]);
            
            if (existingMobiles.length > 0) {
                console.log(`❌ Mobile number '${mobileNumber}' already registered`);
                return res.status(409).json({
                    success: false,
                    message: 'This mobile number is already registered. Please use a different number or try signing in.',
                    field: 'mobile'
                });
            }
        } catch (mobileCheckError) {
            console.error('Error checking for existing mobile:', mobileCheckError);
            // Continue with registration process even if the check fails
        }
        
        console.log('🔍 Checking for existing NID...');
        try {
            const [existingNIDs] = await db.execute('SELECT nid FROM staff WHERE nid = ?', [nid]);
            
            if (existingNIDs.length > 0) {
                console.log(`❌ NID '${nid}' already registered`);
                return res.status(409).json({
                    success: false,
                    message: 'An account with this NID already exists.',
                    field: 'nid'
                });
            }
        } catch (nidCheckError) {
            console.error('Error checking for existing NID:', nidCheckError);
            // Continue with registration process even if the check fails
        }
        
        console.log('✅ No duplicate records found');
        
        // Get the uploaded CV file path
        const cvPath = req.file.path;
        console.log('CV file path:', cvPath);
        
        // Create directories for images if they don't exist
        try {
            const dirPath = 'uploads/staff_images/';
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        } catch (dirError) {
            console.error('Error creating directory for staff images:', dirError);
            return res.status(500).json({
                success: false,
                message: 'Error creating directory for staff images'
            });
        }
        
        let profileImagePath = null;
        
        // Handle profile image upload if it exists
        if (req.body.profileImage) {
            try {
                // Save base64 image to file
                const base64Image = req.body.profileImage.split(';base64,').pop();
                profileImagePath = `uploads/staff_images/${Date.now()}_${username}.jpg`;
                
                fs.writeFileSync(profileImagePath, base64Image, { encoding: 'base64' });
                console.log('📄 Profile image saved:', profileImagePath);
            } catch (fileError) {
                console.error('Error saving profile image:', fileError);
                // Continue registration even if image upload fails
                console.log('⚠️ Continuing registration without profile image');
            }
        }
        
        // Generate a unique staff_id
        const staffIdPrefix = 'STF';
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
        const generatedStaffId = `${staffIdPrefix}${randomNum}`;
        
        console.log('🔧 Inserting staff data into database with ID:', generatedStaffId);
        
        // Insert data into database
        const insertQuery = `
            INSERT INTO staff (
                staff_id,
                username, 
                password, 
                first_name, 
                last_name, 
                email, 
                mobile, 
                nid, 
                dob, 
                house_no, 
                road_no, 
                area, 
                district, 
                administrative_div, 
                zip, 
                cv_filename, 
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unverified')
        `;
        
        const values = [
            generatedStaffId,
            username,
            password, // In production, you should hash passwords
            firstName,
            lastName,
            email,
            mobileNumber,
            nid,
            dob,
            houseNo || null,
            roadNo || null,
            area || null,
            district || null,
            administrativeDiv || null,
            zipCode || null,
            req.file.originalname  // Use original filename instead of path
        ];
        
        const [result] = await db.execute(insertQuery, values);
        // Use the generated staff ID
        console.log(`✅ Staff registration successful with ID: ${generatedStaffId} and result:`, result);
        
        // Return success response
        res.status(201).json({
            success: true,
            message: 'Registration successful. You can now sign in.',
            staffId: generatedStaffId,
            staffData: {
                username,
                firstName,
                lastName,
                email,
                mobile: mobileNumber,
                nid,
                birth_date: dob,
                address: {
                    houseNo,
                    roadNo,
                    area,
                    district,
                    administrativeDiv,
                    zipCode
                }
            }
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        console.error('Error stack:', error.stack);
        
        // Provide more specific error messages
        if (error.code === 'ER_DUP_ENTRY') {
            // MySQL duplicate entry error
            let field = 'entry';
            if (error.message.includes('username')) field = 'username';
            if (error.message.includes('email')) field = 'email';
            if (error.message.includes('mobile')) field = 'mobileNumber';
            if (error.message.includes('nid')) field = 'nid';
            
            return res.status(409).json({
                success: false,
                message: `This ${field} is already registered. Please use a different ${field}.`,
                field: field
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'An error occurred during registration. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Staff signin
router.post('/signin', async (req, res) => {
    try {
        console.log('📥 Staff signin request received');
        const { username, password } = req.body;
        
        if (!username || !password) {
            console.log('❌ Missing credentials');
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }
        
        // Check if user exists
        console.log(`🔍 Checking credentials for user: ${username}`);
        const [users] = await db.execute(
            'SELECT staff_id, username, first_name, last_name, password, status FROM staff WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            console.log(`❌ User not found: ${username}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }
        
        const user = users[0];
        
        // Verify password (in production, use bcrypt.compare)
        if (user.password !== password) {
            console.log(`❌ Invalid password for user: ${username}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }
        
        // TEMPORARY FIX: Allow login regardless of verification status
        console.log(`⚠️ Login status check bypassed for ${username} (current status: ${user.status})`);
        
        // Automatically update the user's status to verified for easier development
        try {
            await db.execute('UPDATE staff SET status = ? WHERE username = ?', ['verified', username]);
            console.log(`✅ Account automatically verified for: ${username}`);
        } catch (err) {
            console.error('Error updating status:', err);
            // Continue anyway even if update fails
        }
        
        console.log(`✅ Successful signin: ${username}`);
        
        // In a real app, generate JWT token here
        // const token = jwt.sign({ id: user.staff_id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
        
        res.json({
            success: true,
            message: 'Sign in successful',
            staffId: user.staff_id,
            username: user.username,
            fullName: `${user.first_name} ${user.last_name}`,
            status: user.status,
            token: 'dummy-token-for-demo' // In production, use JWT
        });
    } catch (error) {
        console.error('❌ Signin error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during sign in'
        });
    }
});

// Get staff profile by ID
router.get('/profile/:staffId', async (req, res) => {
    try {
        console.log('🔍 Fetching staff profile');
        const { staffId } = req.params;
        console.log(`Requesting profile for staff ID: ${staffId}`);

        // Check if staffId is a username instead of an ID
        let query, params;
        
        if (isNaN(staffId)) {
            // It's probably a username
            console.log('Looking up by username:', staffId);
            query = 'SELECT * FROM staff WHERE username = ?';
            params = [staffId];
        } else {
            // It's a staff ID number
            console.log('Looking up by staff ID:', staffId);
            query = 'SELECT * FROM staff WHERE staff_id = ?';
            params = [staffId];
        }
        
        const [rows] = await db.execute(query, params);
        
        if (rows.length === 0) {
            console.log('❌ Staff profile not found');
            return res.status(404).json({
                success: false,
                message: 'Staff profile not found'
            });
        }
        
        const staff = rows[0];
        console.log(`✅ Found staff profile for ${staff.first_name} ${staff.last_name}`);
        
        // Remove sensitive information
        delete staff.password;
        
        res.json({
            success: true,
            message: 'Staff profile retrieved successfully',
            profile: staff
        });
    } catch (error) {
        console.error('❌ Error fetching staff profile:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the staff profile'
        });
    }
});

// Update staff profile
router.put('/update/:staffId', async (req, res) => {
    try {
        console.log('🔄 Processing staff profile update request');
        
        let { staffId } = req.params;
        console.log('Raw staff ID from params:', staffId);
        
        // Check if we were given a username instead of a staff_id
        let isUsername = false;
        if (isNaN(staffId) && !staffId.startsWith('STF')) {
            isUsername = true;
            console.log('Staff ID appears to be a username:', staffId);
            
            // Try to get the actual staff ID from the database
            try {
                const [users] = await db.execute(
                    'SELECT staff_id FROM staff WHERE username = ?',
                    [staffId]
                );
                
                if (users.length > 0) {
                    const actualStaffId = users[0].staff_id;
                    console.log(`Found actual staff ID ${actualStaffId} for username ${staffId}`);
                    staffId = actualStaffId;
                } else {
                    console.log(`Could not find a staff record for username: ${staffId}`);
                }
            } catch (error) {
                console.error('Error looking up staff ID by username:', error);
            }
        }
        
        const {
            username,
            mobile,
            email,
            birthDate,
            houseNo,
            roadNo,
            area,
            district,
            administrativeDiv,
            zipCode,
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;
        
        console.log('Update request body:', JSON.stringify({
            username,
            mobile,
            email,
            birthDate: birthDate ? 'provided' : undefined,
            houseNo,
            roadNo,
            area,
            district,
            administrativeDiv,
            zipCode,
            hasCurrentPassword: !!currentPassword,
            hasNewPassword: !!newPassword,
            hasConfirmPassword: !!confirmPassword
        }, null, 2));
        
        // Log the entire request body to help with debugging
        console.log('Full request body:', JSON.stringify(req.body, null, 2));

        // First check if username is taken by another user
        if (username) {
            const [existing] = await db.execute(
                'SELECT staff_id FROM staff WHERE username = ? AND staff_id != ?',
                [username, staffId]
            );
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }
        }

        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];
        
        if (username) {
            updates.push('username = ?');
            values.push(username);
        }
        if (mobile) {
            updates.push('mobile = ?');
            values.push(mobile);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        if (houseNo) {
            updates.push('house_no = ?');
            values.push(houseNo);
        }
        if (roadNo) {
            updates.push('road_no = ?');
            values.push(roadNo);
        }
        if (area) {
            updates.push('area = ?');
            values.push(area);
        }
        if (district) {
            updates.push('district = ?');
            values.push(district);
        }
        if (administrativeDiv) {
            updates.push('administrative_div = ?');
            values.push(administrativeDiv);
        }
        if (zipCode) {
            updates.push('zip = ?');
            values.push(zipCode);
        }
        if (birthDate) {
            // Make sure birthDate is in the correct format: YYYY-MM-DD
            let formattedDate = birthDate;
            if (!(birthDate instanceof Date) && !isNaN(Date.parse(birthDate))) {
                formattedDate = new Date(birthDate).toISOString().split('T')[0];
            }
            
            updates.push('dob = ?');
            values.push(formattedDate);
            console.log('Updating DOB to:', formattedDate);
        }
        
        // Log the district and administrative division being updated
        console.log('Updating district:', district);
        console.log('Updating administrative division:', administrativeDiv);

        // Handle password change if requested
        if (currentPassword && newPassword && confirmPassword) {
            console.log('Password change requested');
            
            // Verify passwords match
            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password and confirmation do not match'
                });
            }
            
            // Verify password complexity (at least 8 characters)
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 8 characters long'
                });
            }
            
            // Verify current password
            console.log('Verifying current password for staff ID:', staffId);
            
            const [userRows] = await db.execute(
                'SELECT password FROM staff WHERE staff_id = ?',
                [staffId]
            );
            
            if (userRows.length === 0) {
                console.error('Staff not found for password verification:', staffId);
                return res.status(404).json({
                    success: false,
                    message: 'Staff not found'
                });
            }
            
            const storedPassword = userRows[0].password;
            console.log('Retrieved stored password. Current password match?', storedPassword === currentPassword);
            
            // For simplicity, we're assuming passwords are stored in plaintext
            // In a real app, you would use bcrypt or similar to compare hashed passwords
            if (storedPassword !== currentPassword) {
                console.error('Current password verification failed');
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            
            // Add password to updates
            updates.push('password = ?');
            values.push(newPassword);
            
            console.log('Password verification successful, will update password');
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        // Make sure staffId is correctly formatted (should start with STF)
        if (!staffId.startsWith('STF')) {
            console.log('Adding STF prefix to staff ID if needed');
            if (!isNaN(staffId)) {
                // It's numeric, add STF prefix
                staffId = 'STF' + staffId;
            }
        }
        
        // Add staffId to values array
        values.push(staffId);
        
        console.log('Final staff ID for update:', staffId);

        const query = `
            UPDATE staff 
            SET ${updates.join(', ')}
            WHERE staff_id = ?
        `;

        console.log('Executing update query:', query);
        console.log('With values:', values);
        
        // Create a formatted SQL query for debugging
        let debugQuery = query;
        values.forEach((val, index) => {
            debugQuery = debugQuery.replace('?', typeof val === 'string' ? `'${val}'` : val);
        });
        console.log('Debug SQL query:', debugQuery);
        
        // Execute the update directly without transaction
        let result;
        try {
            // Execute the query directly
            const [queryResult] = await db.execute(query, values);
            result = queryResult;
            console.log('Update result:', result);
            
            // Log if any rows were actually updated
            if (result.affectedRows === 0) {
                console.warn('Warning: No rows were updated. Staff ID might be incorrect.');
                return res.status(404).json({
                    success: false,
                    message: 'No records were updated. Please check your staff ID.'
                });
            } else {
                console.log(`Successfully updated ${result.affectedRows} row(s).`);
            }
        } catch (dbError) {
            console.error('Database error during update:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Database error: ' + dbError.message
            });
        }

        // Fetch updated staff data
        try {
            const [rows] = await db.execute(
                'SELECT * FROM staff WHERE staff_id = ?',
                [staffId]
            );
            
            if (!rows || rows.length === 0) {
                console.error('Could not fetch updated staff data after update');
                return res.status(500).json({
                    success: false,
                    message: 'Update may have succeeded but could not retrieve updated data'
                });
            }
            
            const updatedStaff = rows[0];
            console.log('Successfully retrieved updated staff data:', updatedStaff);
            
            // Return complete staff data (except password)
            const staffData = {
                staff_id: updatedStaff.staff_id,
                username: updatedStaff.username,
                first_name: updatedStaff.first_name,
                last_name: updatedStaff.last_name,
                email: updatedStaff.email,
                mobile: updatedStaff.mobile,
                nid: updatedStaff.nid,
                birth_date: updatedStaff.dob, // Map dob to birth_date for client compatibility
                dob: updatedStaff.dob,
                house_no: updatedStaff.house_no,
                road_no: updatedStaff.road_no,
                area: updatedStaff.area,
                district: updatedStaff.district,
                administrative_div: updatedStaff.administrative_div,
                zip: updatedStaff.zip,
                status: updatedStaff.status
            };
            
            console.log("Successfully updated staff profile:", staffData);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: staffData,
                staffData: staffData  // Add this for consistent response format
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
