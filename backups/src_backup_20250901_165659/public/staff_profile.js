document.addEventListener("DOMContentLoaded", () => {
    // Check for staff data in localStorage first (from sign-in)
    const staffId = localStorage.getItem('staffId');
    const username = localStorage.getItem('staffUsername');
    
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
    const loadStaffProfile = async () => {
        // Try to get staff data from sessionStorage first (for caching)
        let staffData = JSON.parse(sessionStorage.getItem('staffData') || 'null');
        
        // Check if we're in development mode or production
        const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // If no cached data or we want to refresh, fetch from server
        if (!staffData && username) {
            try {
                // First try to fetch from the actual API
                if (!isLocalDevelopment) {
                    console.log('Fetching staff data from API');
                    const response = await fetch(`/api/staff/profile/${staffId || username}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('staffToken')}`
                        }
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.data) {
                            staffData = result.data;
                            // Cache the data
                            sessionStorage.setItem('staffData', JSON.stringify(staffData));
                        }
                    }
                }
                
                // If API fetch failed or in development mode, try to use data from localStorage
                if (!staffData) {
                    console.log('API fetch failed or in development mode');
                    
                    // Check if we have signup data in localStorage from the volunteer_signup.html form
                    const signupData = JSON.parse(localStorage.getItem('staffSignupData') || 'null');
                    
                    if (signupData) {
                        console.log('Using signup data from localStorage');
                        staffData = signupData;
                    } else {
                        console.log('No signup data found, creating minimal placeholder data');
                        
                        // Generate capitalized first and last name based on username
                        const names = username.split(/[._-]/).map(name => 
                            name.charAt(0).toUpperCase() + name.slice(1)
                        );
                        
                        // Create minimal placeholder data with visual indicators that it's not real data
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
                    }
                    
                    // Save data to sessionStorage for this session
                    sessionStorage.setItem('staffData', JSON.stringify(staffData));
                }
            } catch (error) {
                console.error('Error fetching staff data:', error);
                // If an error occurs, redirect to signin
                window.location.href = "volunteer_signin.html";
                return;
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
            if (staffData.birth_date || staffData.dob) {
                const dobElement = document.getElementById("staff-dob");
                if (dobElement) {
                    const birthDate = staffData.birth_date || staffData.dob;
                    // Format date if it's in ISO format (YYYY-MM-DD)
                    if (birthDate && birthDate.includes('-')) {
                        try {
                            const date = new Date(birthDate);
                            const formattedDate = date.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            });
                            dobElement.textContent = formattedDate;
                        } catch (e) {
                            dobElement.textContent = birthDate;
                        }
                    } else {
                        dobElement.textContent = birthDate || 'Not provided';
                    }
                }
            }
            
            // Set profile initials
            const initialsDiv = document.getElementById("profile-initials");
            initialsDiv.textContent = getInitials(staffData.first_name, staffData.last_name);
            
            // Display all address fields separately
            document.getElementById("staff-area").textContent = staffData.area || 'Not provided';
            document.getElementById("staff-division").textContent = staffData.administrative_div || 'Not provided';
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
        document.getElementById("edit-district").value = staffData.district || '';
        document.getElementById("edit-division").value = staffData.administrative_div || '';
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
        
        document.getElementById("editProfileModal").style.display = "none";
    };

    // Function to save profile changes
    const saveProfileChanges = async (e) => {
        e.preventDefault();
        
        const staffData = JSON.parse(sessionStorage.getItem('staffData'));
        if (!staffData) return;

        // Show loading indicator
        const submitButton = document.querySelector('#editProfileForm button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Saving...';
        submitButton.disabled = true;

        const formData = {
            username: document.getElementById("edit-username").value,
            email: document.getElementById("edit-email").value,
            mobile: document.getElementById("edit-phone").value,
            house_no: document.getElementById("edit-house-no").value,
            road_no: document.getElementById("edit-road-no").value,
            area: document.getElementById("edit-area").value,
            district: document.getElementById("edit-district").value,
            administrative_div: document.getElementById("edit-division").value,
            zip: document.getElementById("edit-zip").value,
            birth_date: document.getElementById("edit-dob").value || staffData.birth_date || staffData.dob
        };

        // Check if we're in development mode with no backend
        const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalDevelopment) {
            // In development mode, directly update the staff data
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
            const response = await fetch(`/api/staff/update/${staffData.staff_id || staffId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('staffToken')}`
                },
                body: JSON.stringify({
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
                })
            });

            if (!response.ok) {
                throw new Error('Server responded with status: ' + response.status);
            }

            const result = await response.json();
            
            if (result.success) {
                // Update session storage with new data
                sessionStorage.setItem('staffData', JSON.stringify(result.data));
                
                // Update localStorage with new username if it changed
                if (formData.username !== staffData.username) {
                    localStorage.setItem('staffUsername', formData.username);
                }
                
                // Reload profile display
                loadStaffProfile();
                
                // Close modal
                closeEditModal();
                
                // Show success message
                showMessage('Profile updated successfully!', 'success');
            } else {
                showMessage(result.message || 'Update failed', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showMessage('Error updating profile. Please try again.', 'error');
        } finally {
            // Restore button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    };

    // Function to show messages
    const showMessage = (message, type) => {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    };

    // Event Listeners
    document.querySelector(".edit-profile-btn").addEventListener("click", openEditModal);
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
