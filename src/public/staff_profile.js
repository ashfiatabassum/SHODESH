document.addEventListener("DOMContentLoaded", () => {
    // Check for staff data in localStorage first (from sign-in)
    const staffId = localStorage.getItem('staffId');
    const username = localStorage.getItem('staffUsername');
    
    // Setup sign out button
    const signoutBtn = document.getElementById('signout-btn');
    if (signoutBtn) {
        signoutBtn.addEventListener('click', handleSignOut);
    }
    
    // Function to generate initials from name
    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0) : '';
        const lastInitial = lastName ? lastName.charAt(0) : '';
        return (firstInitial + lastInitial).toUpperCase();
    };
    
    // Function to generate a consistent color based on name
    const getColorFromName = (name) => {
        // Using predefined professional gradient
        return 'linear-gradient(135deg, #3a7bd5, #00d2ff)';
    };
    
    // Function to fetch and display staff data
    const loadStaffProfile = async (forceRefresh = false) => {
        console.log('Loading staff profile with staffId:', staffId, 'and username:', username);
        console.log('Force refresh?', forceRefresh);
        
        // Try to get staff data from sessionStorage first (unless force refresh is enabled)
        let staffData = forceRefresh ? null : JSON.parse(sessionStorage.getItem('staffData') || 'null');
        console.log('Initial staff data from sessionStorage:', staffData);
        
        // If no data in sessionStorage but we have it in localStorage, use that
        if (!staffData) {
            const localStorageData = JSON.parse(localStorage.getItem('staffSignupData') || 'null');
            if (localStorageData) {
                console.log('Found staff data in localStorage:', localStorageData);
                staffData = localStorageData;
                // Store in sessionStorage for future use
                sessionStorage.setItem('staffData', JSON.stringify(staffData));
            }
        }
        
        // If still no data, fetch from the server
        if (!staffData && username) {
            try {
                console.log('No cached data found, fetching staff data from API');
                
                // Try to fetch from the actual API - always use username for profile lookup
                // This fixes the issue where staffId might be a database ID not matching username
                const response = await fetch(`/api/staff/profile/${username}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('staffToken') || ''}`
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('API response:', result);
                    
                    if (result.success && (result.profile || result.data)) {
                        // Use the profile or data property based on what's returned
                        staffData = result.profile || result.data;
                        
                        // Convert from profile format if needed
                        if (staffData.address && !staffData.house_no) {
                            staffData = {
                                first_name: staffData.firstName || staffData.first_name,
                                last_name: staffData.lastName || staffData.last_name,
                                username: staffData.username,
                                email: staffData.email,
                                mobile: staffData.mobile,
                                nid: staffData.nid,
                                house_no: staffData.address ? staffData.address.houseNo : staffData.house_no,
                                road_no: staffData.address ? staffData.address.roadNo : staffData.road_no,
                                area: staffData.address ? staffData.address.area : staffData.area,
                                district: staffData.address ? staffData.address.district : staffData.district,
                                administrative_div: staffData.address ? staffData.address.administrativeDiv : staffData.administrative_div,
                                zip: staffData.address ? staffData.address.zipCode : staffData.zip
                            };
                        }
                        
                        // Make sure we have access to both naming conventions
                        if (!staffData.firstName && staffData.first_name) {
                            staffData.firstName = staffData.first_name;
                        }
                        if (!staffData.lastName && staffData.last_name) {
                            staffData.lastName = staffData.last_name;
                        }
                        
                        // Cache the data
                        console.log('Storing fetched staff data:', staffData);
                        sessionStorage.setItem('staffData', JSON.stringify(staffData));
                        localStorage.setItem('staffSignupData', JSON.stringify(staffData));
                    } else {
                        console.warn('API response successful but no valid data found');
                    }
                } else {
                    console.error('API request failed with status:', response.status);
                }
                
                // If API fetch failed, try to use data from username
                if (!staffData) {
                    console.log('API fetch failed, creating minimal data from username');
                    
                    // Generate capitalized first and last name based on username
                    const names = username.split(/[._-]/).map(name => 
                        name.charAt(0).toUpperCase() + name.slice(1)
                    );
                    
                    // Create minimal placeholder data - but this should not happen
                    // Log an error since we shouldn't be using placeholders
                    console.error('⚠️ Warning: Using placeholder data. API fetch failed.');
                    
                    staffData = {
                        first_name: names[0] || '[First Name]',
                        last_name: names[1] || '[Last Name]',
                        username: username,
                        email: `${username}@example.com`,
                        mobile: '[Mobile Number]',
                        nid: '[NID Number]',
                        birth_date: '',
                        house_no: '[House No]',
                        road_no: '[Road No]',
                        area: '[Area - Neighborhood/Location]',
                        district: '[District]',
                        administrative_div: '[Administrative Division]',
                        zip: '[Zip Code]'
                    };
                    
                    // Save data to sessionStorage for this session
                    sessionStorage.setItem('staffData', JSON.stringify(staffData));
                }
            } catch (error) {
                console.error('Error fetching staff data:', error);
                // Don't redirect, instead use whatever data we can get
                console.log('Using fallback approach due to error');
            }
        }
        
        if (staffData) {
            // Update profile information
            const fullName = `${staffData.first_name || ''} ${staffData.last_name || ''}`.trim();
            
            document.getElementById("staff-name-header").textContent = fullName || username;
            document.getElementById("staff-name").textContent = fullName || username;
            document.getElementById("staff-username").textContent = staffData.username || '';
            document.getElementById("staff-email").textContent = staffData.email || 'Not provided';
            document.getElementById("staff-phone").textContent = staffData.mobile || '';
            document.getElementById("staff-nid").textContent = staffData.nid || '';
            
            // Display date of birth if available
            const dobElement = document.getElementById("staff-dob");
            if (dobElement) {
                const birthDate = staffData.birth_date || staffData.dob;
                console.log('Birth date found:', birthDate);
                
                if (birthDate) {
                    // Format date if it's in ISO format (YYYY-MM-DD)
                    if (birthDate.includes('-')) {
                        try {
                            const date = new Date(birthDate);
                            const formattedDate = date.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            });
                            dobElement.textContent = formattedDate;
                        } catch (e) {
                            console.error('Error formatting date:', e);
                            dobElement.textContent = birthDate;
                        }
                    } else {
                        dobElement.textContent = birthDate;
                    }
                } else {
                    dobElement.textContent = 'Not provided';
                }
            }
            
            // Set profile initials
            const initialsDiv = document.getElementById("profile-initials");
            initialsDiv.textContent = getInitials(staffData.first_name, staffData.last_name);
            
            // Display all address fields separately
            document.getElementById("staff-area").textContent = staffData.area || 'Not provided';
            
            // Handle administrative division specifically
            const adminDivElement = document.getElementById("staff-division");
            if (adminDivElement) {
                const adminDiv = staffData.administrative_div;
                console.log('Administrative Division found:', adminDiv);
                adminDivElement.textContent = adminDiv || 'Not provided';
            }
            
            document.getElementById("staff-district").textContent = staffData.district || 'Not provided';
            document.getElementById("staff-house").textContent = staffData.house_no || 'Not provided';
            document.getElementById("staff-road").textContent = staffData.road_no || 'Not provided';
            document.getElementById("staff-zip").textContent = staffData.zip || 'Not provided';
        } else {
            // Redirect to signin if no staff data found
            window.location.href = "volunteer_signin.html";
        }
    };

    // Function to open edit profile modal
    const openEditModal = () => {
        const staffData = JSON.parse(sessionStorage.getItem('staffData'));
        if (!staffData) return;

        // Populate edit form with current values
        document.getElementById("edit-username").value = staffData.username || '';
        document.getElementById("edit-email").value = staffData.email || '';
        document.getElementById("edit-phone").value = staffData.mobile || '';
        document.getElementById("edit-house-no").value = staffData.house_no || '';
        document.getElementById("edit-road-no").value = staffData.road_no || '';
        document.getElementById("edit-area").value = staffData.area || '';
        
        // Set selected value for district dropdown
        const districtDropdown = document.getElementById("edit-district");
        if (districtDropdown && staffData.district) {
            for (let i = 0; i < districtDropdown.options.length; i++) {
                if (districtDropdown.options[i].value === staffData.district) {
                    districtDropdown.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Set selected value for division dropdown
        const divisionDropdown = document.getElementById("edit-division");
        if (divisionDropdown && staffData.administrative_div) {
            for (let i = 0; i < divisionDropdown.options.length; i++) {
                if (divisionDropdown.options[i].value === staffData.administrative_div) {
                    divisionDropdown.selectedIndex = i;
                    break;
                }
            }
        }
        
        document.getElementById("edit-zip").value = staffData.zip || '';
        
        // Set date of birth if available
        const dobInput = document.getElementById("edit-dob");
        if (dobInput) {
            const birthDate = staffData.birth_date || staffData.dob;
            if (birthDate) {
                // If date is in ISO format (YYYY-MM-DD), use it directly
                if (birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    dobInput.value = birthDate;
                } else {
                    // Try to parse other date formats
                    try {
                        const date = new Date(birthDate);
                        if (!isNaN(date.getTime())) {
                            // Format as YYYY-MM-DD for input[type="date"]
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            dobInput.value = `${year}-${month}-${day}`;
                        }
                    } catch (e) {
                        console.error('Error parsing date:', e);
                    }
                }
            }
        }

        // Add class to body to prevent background scrolling
        document.body.classList.add('modal-open');
        
        // Show modal
        document.getElementById("editProfileModal").style.display = "block";
        
        // Scroll modal to top
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) modalContent.scrollTop = 0;
    };

    // Function to close edit profile modal
    const closeEditModal = () => {
        // Remove class from body to re-enable background scrolling
        document.body.classList.remove('modal-open');
        
        // Ensure the save button is reset
        const saveButton = document.getElementById('saveProfileBtn');
        if (saveButton) {
            saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            saveButton.disabled = false;
        }
        
        document.getElementById("editProfileModal").style.display = "none";
    };

    // Function to save profile changes
    const saveProfileChanges = async (e) => {
        e.preventDefault();
        
        const staffData = JSON.parse(sessionStorage.getItem('staffData'));
        if (!staffData) return;

        // Validate password fields if any are filled
        const passwordValidation = validatePasswordFields();
        if (!passwordValidation.valid) {
            showMessage(passwordValidation.message, 'error');
            return;
        }

        // Show loading indicator
        const submitButton = document.querySelector('#saveProfileBtn');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitButton.disabled = true;

        // Collect form data values and log them
        const email = document.getElementById("edit-email").value;
        const mobile = document.getElementById("edit-phone").value;
        const house_no = document.getElementById("edit-house-no").value;
        const road_no = document.getElementById("edit-road-no").value;
        const area = document.getElementById("edit-area").value;
        const district = document.getElementById("edit-district").value;
        const administrative_div = document.getElementById("edit-division").value;
        const zip = document.getElementById("edit-zip").value;
        
        console.log('Form field values:', {
            email,
            mobile,
            house_no,
            road_no,
            area,
            district,
            administrative_div,
            zip
        });
        
        const formData = {
            // Keep existing username (cannot be changed)
            username: staffData.username,
            email: email || staffData.email,
            mobile: mobile || staffData.mobile,
            house_no: house_no || staffData.house_no,
            road_no: road_no || staffData.road_no,
            area: area || staffData.area,
            district: district || staffData.district,
            administrative_div: administrative_div || staffData.administrative_div,
            zip: zip || staffData.zip,
            // Keep existing birth date (cannot be changed)
            birth_date: staffData.birth_date || staffData.dob
        };
        
        // Extra debug output for the final form data we're using
        console.log('Final form data with fallbacks:', formData);
        
        // Add password fields if they're filled
        const currentPassword = document.getElementById("edit-current-password").value;
        const newPassword = document.getElementById("edit-new-password").value;
        const confirmPassword = document.getElementById("edit-confirm-password").value;
        
        if (currentPassword && newPassword && confirmPassword) {
            formData.currentPassword = currentPassword;
            formData.newPassword = newPassword;
            formData.confirmPassword = confirmPassword;
        }

        // Always use the backend API (disable local development mode)
        const isLocalDevelopment = false; // Force API mode
        
        if (isLocalDevelopment) {
            // This block will never execute now
            try {
                console.log('Development mode: Updating profile locally');
                
                // Keep first_name and last_name from original data
                const updatedData = {
                    ...staffData,
                    ...formData
                };
                
                // Update session storage with new data
                sessionStorage.setItem('staffData', JSON.stringify(updatedData));
                
                // Store username in localStorage too
                if (formData.username !== staffData.username) {
                    localStorage.setItem('staffUsername', formData.username);
                }
                
                // Reload profile display
                loadStaffProfile();
                
                // Close modal
                closeEditModal();
                
                // Show success message
                showMessage('Profile updated successfully! (DEV MODE)', 'success');
            } catch (error) {
                console.error('Error updating profile:', error);
                showMessage('Error updating profile. Please try again.', 'error');
            }
            return;
        }

        // If not in development mode, try the actual API
        try {
            console.log('Sending update request for staff ID:', staffData.staff_id || staffId);
            console.log('Update data:', formData);
            
            // Try to get the staff_id from various sources
            let staffIdToUse = staffData.staff_id;
            
            // If not found in staffData, try localStorage
            if (!staffIdToUse) {
                staffIdToUse = localStorage.getItem('staffId');
                console.log('Retrieved staffId from localStorage:', staffIdToUse);
            }
            
            // If still not found, try the staffId parameter
            if (!staffIdToUse) {
                staffIdToUse = staffId;
                console.log('Using staffId from parameter:', staffIdToUse);
            }
            
            // Final check
            if (!staffIdToUse) {
                console.error('Staff ID not found in any source:', {
                    'staffData.staff_id': staffData.staff_id,
                    'localStorage.staffId': localStorage.getItem('staffId'),
                    'staffId parameter': staffId
                });
                throw new Error('Staff ID is required but not found in any source');
            }
            
            console.log('Final staff ID to use for update:', staffIdToUse);
            
            // Log the current field values
            console.log('Sending form data with these values:', {
                username: formData.username,
                email: formData.email,
                mobile: formData.mobile,
                birthDate: formData.birth_date,
                houseNo: formData.house_no,
                roadNo: formData.road_no,
                area: formData.area,
                district: formData.district,
                administrativeDiv: formData.administrative_div,
                zipCode: formData.zip
            });
            
            const requestBody = {
                username: formData.username,
                email: formData.email,
                mobile: formData.mobile,
                birthDate: formData.birth_date || formData.dob, // Support both field names
                houseNo: formData.house_no,
                roadNo: formData.road_no,
                area: formData.area,
                district: formData.district,
                administrativeDiv: formData.administrative_div,
                zipCode: formData.zip
            };
            
            console.log('Birthdate being sent:', requestBody.birthDate);
            
            // Add password fields if they exist
            if (formData.currentPassword && formData.newPassword && formData.confirmPassword) {
                requestBody.currentPassword = formData.currentPassword;
                requestBody.newPassword = formData.newPassword;
                requestBody.confirmPassword = formData.confirmPassword;
            }
            
            console.log('Updating profile for staff ID:', staffIdToUse);
            console.log('Request body:', JSON.stringify(requestBody, null, 2));
            
            const response = await fetch(`/api/staff/update/${staffIdToUse}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('staffToken') || ''}`
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('Update response status:', response.status);

            const result = await response.json();
            console.log('Update response:', result);
            
            if (!response.ok) {
                throw new Error(result.message || `Server responded with status: ${response.status}`);
            }
            
            if (result.success) {
                // Get the updated staff data from the response
                const updatedStaffData = result.data || result.staffData;
                
                if (!updatedStaffData) {
                    console.error('No staff data returned from server');
                    throw new Error('Server did not return updated staff data');
                }
                
                console.log('Updated staff data received:', updatedStaffData);
                
                // Make sure important fields are preserved
                if (!updatedStaffData.birth_date && formData.birth_date) {
                    updatedStaffData.birth_date = formData.birth_date;
                }
                
                if (!updatedStaffData.administrative_div && formData.administrative_div) {
                    updatedStaffData.administrative_div = formData.administrative_div;
                }
                
                console.log('Final staff data to store:', updatedStaffData);
                
                // Update session storage with new data
                sessionStorage.setItem('staffData', JSON.stringify(updatedStaffData));
                
                // Also update localStorage for persistence
                localStorage.setItem('staffSignupData', JSON.stringify(updatedStaffData));
                
                // Update localStorage with new username if it changed
                if (formData.username !== staffData.username && updatedStaffData.username) {
                    localStorage.setItem('staffUsername', updatedStaffData.username);
                }
                
                // Show success message
                showMessage('Profile updated successfully!', 'success');
                
                // Close modal
                closeEditModal();
                
                // Clear any cached data to force a complete reload
                console.log('Clearing cached profile data to force reload');
                sessionStorage.removeItem('staffData');
                localStorage.removeItem('staffSignupData'); // Also clear localStorage cache
                
                // Reload profile display with short delay to ensure updated data is used
                setTimeout(() => {
                    console.log('Reloading staff profile after update with force refresh');
                    loadStaffProfile(true); // Force a refresh from the server
                }, 100);
            } else {
                showMessage(result.message || 'Update failed', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showMessage('Error updating profile. Please try again.', 'error');
        } finally {
            // Restore button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            console.log('Button restored to:', originalButtonText);
        }
    };

    // Function to handle sign out
    function handleSignOut() {
        // Clear all stored staff data
        localStorage.removeItem('staffId');
        localStorage.removeItem('staffUsername');
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffSignupData');
        localStorage.removeItem('staffStatus');
        
        sessionStorage.removeItem('staffData');
        
        // Show message
        alert('You have been signed out successfully.');
        
        // Redirect to sign in page
        window.location.href = 'volunteer_signin.html';
    }
    
    // Function to show messages
    const showMessage = (message, type) => {
        const messageDiv = document.getElementById('message');
        
        // Add icon based on message type
        const icon = type === 'success' ? '✅' : '❌';
        messageDiv.innerHTML = `<strong>${icon}</strong> ${message}`;
        
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Scroll to top to ensure message is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Hide message after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    };

    // Setup password toggle functionality
    const setupPasswordToggles = () => {
        const toggleButtons = document.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Find the password input that is a sibling to this button
                const passwordInput = this.parentElement.querySelector('input[type="password"], input[type="text"]');
                
                if (passwordInput) {
                    // Toggle the type attribute
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                    
                    // Toggle the eye / eye-slash icon
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
                    }
                }
            });
        });
    };

    // Validate password fields
    const validatePasswordFields = () => {
        const currentPassword = document.getElementById('edit-current-password').value;
        const newPassword = document.getElementById('edit-new-password').value;
        const confirmPassword = document.getElementById('edit-confirm-password').value;
        
        // If all fields are empty, no password change is attempted
        if (!currentPassword && !newPassword && !confirmPassword) {
            return { valid: true };
        }
        
        // If any password field is filled, all must be filled
        if (!currentPassword || !newPassword || !confirmPassword) {
            return { 
                valid: false, 
                message: 'To change your password, you must fill all three password fields.' 
            };
        }
        
        // Check if new password meets minimum length
        if (newPassword.length < 8) {
            return { 
                valid: false, 
                message: 'New password must be at least 8 characters long.' 
            };
        }
        
        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            return { 
                valid: false, 
                message: 'New password and confirmation do not match.' 
            };
        }
        
        // All checks passed
        return { valid: true };
    };

    // Event Listeners
    document.querySelector(".edit-profile-btn").addEventListener("click", () => {
        openEditModal();
        setupPasswordToggles();
    });
    document.querySelector(".close-modal").addEventListener("click", closeEditModal);
    document.getElementById("editProfileForm").addEventListener("submit", saveProfileChanges);

    // Close modal if clicking outside
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("editProfileModal");
        if (e.target === modal) {
            closeEditModal();
        }
    });

    // Initial load of the profile
    loadStaffProfile();
});
