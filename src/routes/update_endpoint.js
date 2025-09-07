// Updated staff update endpoint
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

            return res.json({
                success: true,
                message: 'Profile updated successfully',
                data: staffData,
                staffData: staffData  // Add this for consistent response format
            });
        } catch (error) {
            console.error('Error fetching updated staff data:', error);
            return res.status(500).json({
                success: false,
                message: 'Profile was updated but there was an error retrieving the updated data'
            });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
