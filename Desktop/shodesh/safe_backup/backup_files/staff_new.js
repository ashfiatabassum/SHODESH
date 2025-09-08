const express = require('express');
const router = express.Router();
const db = require('../config/db-test');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = 'uploads/cv/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for CV upload
const storage = multer.diskStorage({
    destination: uploadDir,
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
        // Check if file exists
        if (!file) {
            return cb(new Error('CV file is required'), false);
        }
        
        // Check file type
        const allowedTypes = /pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (!extname) {
            return cb(new Error('Only PDF, Word documents, and TXT files are allowed'), false);
        }
        
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
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request files:', req.files);
    
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
        
        console.log('✅ File upload processed:', req.file);
        if (!req.file) {
            console.error('❌ No file was received in the request');
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
        const [existingUsernames] = await db.execute('SELECT username FROM STAFF WHERE username = ?', [username]);
        
        if (existingUsernames.length > 0) {
            console.log(`❌ Username '${username}' already exists`);
            return res.status(409).json({
                success: false,
                message: 'This username is already taken. Please choose a different username.',
                field: 'username'
            });
        }
        
        console.log('🔍 Checking for existing email...');
        const [existingEmails] = await db.execute('SELECT email FROM STAFF WHERE email = ?', [email]);
        
        if (existingEmails.length > 0) {
            console.log(`❌ Email '${email}' already registered`);
            return res.status(409).json({
                success: false,
                message: 'An account with this email address already exists. Please use a different email or try signing in.',
                field: 'email'
            });
        }

        console.log('🔍 Checking for existing mobile number...');
        const [existingMobiles] = await db.execute('SELECT mobile FROM STAFF WHERE mobile = ?', [mobileNumber]);
        
        if (existingMobiles.length > 0) {
            console.log(`❌ Mobile number '${mobileNumber}' already registered`);
            return res.status(409).json({
                success: false,
                message: 'This mobile number is already registered. Please use a different number or try signing in.',
                field: 'mobile'
            });
        }
        
        console.log('🔍 Checking for existing NID...');
        const [existingNIDs] = await db.execute('SELECT nid FROM STAFF WHERE nid = ?', [nid]);
        
        if (existingNIDs.length > 0) {
            console.log(`❌ NID '${nid}' already registered`);
            return res.status(409).json({
                success: false,
                message: 'An account with this NID already exists.',
                field: 'nid'
            });
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
        
        // Insert data into database
        console.log('🔧 Inserting staff data into database');
        
        const insertQuery = `
            INSERT INTO staff (
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
                cv_path, 
                profile_image
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
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
            cvPath,
            profileImagePath
        ];
        
        const [result] = await db.execute(insertQuery, values);
        const staffId = result.insertId;
        
        console.log(`✅ Staff registration successful with ID: ${staffId}`);
        
        // Return success response
        res.status(201).json({
            success: true,
            message: 'Registration successful. You can now sign in.',
            staffId: staffId,
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
        res.status(500).json({
            success: false,
            message: 'An error occurred during registration. Please try again.'
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
        
        // Check if account is verified
        if (user.status !== 'active') {
            console.log(`❌ Account not active: ${username} (status: ${user.status})`);
            return res.status(403).json({
                success: false,
                message: 'Your account is pending verification. Please wait for admin approval.'
            });
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
        
        const { staffId } = req.params;
        console.log('Staff ID from params:', staffId);
        
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

        // Add staffId to values array
        values.push(staffId);

        const query = `
            UPDATE staff 
            SET ${updates.join(', ')}
            WHERE staff_id = ?
        `;

        console.log('Executing update query:', query);
        console.log('With values:', values);
        
        // Use transaction to ensure data integrity
        let result;
        try {
            await db.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
            await db.beginTransaction();
            
            const [queryResult] = await db.execute(query, values);
            result = queryResult;
            console.log('Update result:', result);
            
            await db.commit();
            console.log('Transaction committed successfully');
            
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
            try {
                await db.rollback();
                console.log('Transaction rolled back due to error');
            } catch (rollbackError) {
                console.error('Error during rollback:', rollbackError);
            }
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
