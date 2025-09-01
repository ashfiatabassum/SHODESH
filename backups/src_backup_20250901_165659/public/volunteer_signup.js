// Volunteer Sign Up Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    populateDateDropdowns();
});

function initializePage() {
    // Initialize any page-specific functionality
    setupFileUpload();
}

function setupEventListeners() {
    const form = document.getElementById('volunteerSignupForm');
    const inputs = document.querySelectorAll('input, select');
    
    // Form submission - using direct event listener
    if (form) {
        console.log('Form found, adding submit listener');
        form.addEventListener('submit', handleFormSubmission);
        
        // Also add click handler to the submit button as a backup
        const submitBtn = document.querySelector('.signup-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                // This is a backup in case the form submit event doesn't fire
                if (e.target.type === 'submit') {
                    console.log('Submit button clicked');
                    // The form's submit event should handle this
                }
            });
        }
    } else {
        console.error('Form not found!');
    }
    
    // Input validation
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Password confirmation
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    confirmPassword.addEventListener('input', validatePasswordMatch);
    password.addEventListener('input', validatePasswordMatch);
    
    // Username availability check (debounced)
    const username = document.getElementById('username');
    let usernameTimeout;
    username.addEventListener('input', function() {
        clearTimeout(usernameTimeout);
        usernameTimeout = setTimeout(() => checkUsernameAvailability(this.value), 500);
    });
}

function populateDateDropdowns() {
    populateDays();
    populateYears();
}

function populateDays() {
    const daySelect = document.getElementById('birthDay');
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
}

function populateYears() {
    const yearSelect = document.getElementById('birthYear');
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 80; // 80 years ago
    const maxYear = currentYear - 16; // Minimum 16 years old
    
    for (let year = maxYear; year >= minYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

function setupFileUpload() {
    const fileInput = document.getElementById('cv');
    const fileLabel = document.querySelector('.file-upload-label');
    const fileText = document.querySelector('.file-upload-text');
    const fileInfo = document.querySelector('.file-info');
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            // Check file size (5MB limit)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                showFieldError(fileInput, 'File size must be less than 5MB');
                fileInput.value = '';
                return;
            }
            
            // Check file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            if (!allowedTypes.includes(file.type)) {
                showFieldError(fileInput, 'Please upload a PDF, DOC, DOCX, or TXT file');
                fileInput.value = '';
                return;
            }
            
            // Update UI
            fileLabel.classList.add('file-selected');
            fileText.textContent = file.name;
            
            // Display file size in KB if less than 1MB, otherwise in MB
            let sizeText;
            if (file.size < 1024 * 1024) { // Less than 1MB
                sizeText = `Size: ${(file.size / 1024).toFixed(2)} KB`;
            } else {
                sizeText = `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
            }
            fileInfo.textContent = sizeText;
            
            clearFieldError({target: fileInput});
        } else {
            fileLabel.classList.remove('file-selected');
            fileText.textContent = 'Choose CV file';
            fileInfo.textContent = '';
        }
    });
}

// Simple form submission function
function handleFormSubmission(e) {
    e.preventDefault();
    console.log('Form submission started');
    
    // Create FormData from the form
    const form = document.getElementById('volunteerSignupForm');
    const formData = new FormData(form);
    
    // Show loading indicator
    showLoading(true);
    
    // Check if we're in development mode with no backend
    const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalDevelopment) {
        // For local development without backend, simulate a successful response
        setTimeout(() => {
            console.log('Development mode: Simulating successful signup');
            showSuccess("Account created successfully! (DEV MODE)");
            
            // Store complete form data for development testing
            const username = formData.get('username');
            
            // Create a birth date string
            const birthDay = formData.get('birthDay');
            const birthMonth = formData.get('birthMonth');
            const birthYear = formData.get('birthYear');
            const birthDate = birthDay && birthMonth && birthYear ? 
                `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}` : '';
            
            // Store complete staff data
            const staffData = {
                username: username,
                first_name: formData.get('firstName'),
                last_name: formData.get('lastName'),
                email: formData.get('gmail'),
                mobile: formData.get('mobileNumber'),
                nid: formData.get('nid'),
                birth_date: birthDate,
                house_no: formData.get('houseNo'),
                road_no: formData.get('roadNo'),
                area: formData.get('area'),
                district: formData.get('district'),
                administrative_div: formData.get('division'),
                zip: formData.get('zipCode'),
                staff_id: 'dev-' + Date.now()
            };
            
            // Save to sessionStorage for immediate use
            sessionStorage.setItem('staffData', JSON.stringify(staffData));
            
            // Save to localStorage for persistent storage (for the profile page)
            localStorage.setItem('staffUsername', username);
            localStorage.setItem('staffId', staffData.staff_id);
            localStorage.setItem('staffSignupData', JSON.stringify(staffData));
            
            // Redirect to staff_pending.html after 2 seconds
            setTimeout(() => {
                window.location.href = 'staff_pending.html'; // Note: removed the leading slash
            }, 2000);
        }, 1500);
        return;
    }
    
    // If not in development mode, try the actual API
    fetch('/api/staff/signup', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Server response:', response);
        if (!response.ok) {
            throw new Error('Server responded with status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        
        if (data.success) {
            // Success! Show message and redirect
            showSuccess("Account created successfully!");
            
            // Store user data for future use
            if (data.staffData) {
                // Save to localStorage for persistent storage (for the profile page)
                localStorage.setItem('staffUsername', data.staffData.username);
                localStorage.setItem('staffId', data.staffData.staff_id);
                localStorage.setItem('staffSignupData', JSON.stringify(data.staffData));
                
                // If a token was provided, store it too
                if (data.token) {
                    localStorage.setItem('staffToken', data.token);
                }
            }
            
            // Redirect to staff_pending.html after 2 seconds
            setTimeout(() => {
                window.location.href = 'staff_pending.html'; // Note: removed the leading slash
            }, 2000);
        } else {
            // Show error message
            showError(data.message || "Failed to create account");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError("An error occurred. Please try again.");
    })
    .finally(() => {
        showLoading(false);
    });
}

function validateForm() {
    const inputs = document.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({target: input})) {
            isValid = false;
        }
    });
    
    // Additional validations
    if (!validatePasswordMatch()) {
        isValid = false;
    }
    
    if (!validateAge()) {
        isValid = false;
    }
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    clearFieldError(e);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Specific field validations
    switch (field.id) {
        case 'mobileNumber':
            if (value && !validateMobileNumber(value)) {
                showFieldError(field, 'Please enter a valid Bangladeshi mobile number');
                return false;
            }
            break;
            
        case 'nid':
            if (value && !validateNID(value)) {
                showFieldError(field, 'Please enter a valid NID number (10-17 digits)');
                return false;
            }
            break;
            
        case 'gmail':
            if (value && !validateEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
            break;
            
        case 'password':
            if (value && !validatePassword(value)) {
                showFieldError(field, 'Password must be at least 8 characters with letters and numbers');
                return false;
            }
            break;
            
        case 'zipCode':
            if (value && !validateZipCode(value)) {
                showFieldError(field, 'Please enter a valid 4-digit zip code');
                return false;
            }
            break;
    }
    
    return true;
}

function validateMobileNumber(mobile) {
    // Bangladeshi mobile number validation (11 digits starting with 01)
    const regex = /^01[3-9]\d{8}$/;
    return regex.test(mobile);
}

function validateNID(nid) {
    // NID validation (10-17 digits)
    const regex = /^\d{10,17}$/;
    return regex.test(nid);
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePassword(password) {
    // At least 8 characters, contains letters and numbers
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
}

function validateZipCode(zipCode) {
    // 4-digit zip code
    const regex = /^\d{4}$/;
    return regex.test(zipCode);
}

function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password && confirmPassword && password !== confirmPassword) {
        showFieldError(document.getElementById('confirmPassword'), 'Passwords do not match');
        return false;
    }
    
    if (password === confirmPassword && confirmPassword) {
        clearFieldError({target: document.getElementById('confirmPassword')});
    }
    
    return true;
}

function validateAge() {
    const day = document.getElementById('birthDay').value;
    const month = document.getElementById('birthMonth').value;
    const year = document.getElementById('birthYear').value;
    
    if (day && month && year) {
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        if (age < 16) {
            showFieldError(document.getElementById('birthYear'), 'You must be at least 16 years old to volunteer');
            return false;
        }
    }
    
    return true;
}

function checkUsernameAvailability(username) {
    if (!username || username.length < 3) return;
    
    // Simulate username availability check (replace with actual API call)
    // For demo purposes, "admin" and "test" are considered taken
    const takenUsernames = ['admin', 'test', 'volunteer', 'shodesh'];
    
    if (takenUsernames.includes(username.toLowerCase())) {
        showFieldError(document.getElementById('username'), 'This username is already taken');
    } else {
        clearFieldError({target: document.getElementById('username')});
        showFieldSuccess(document.getElementById('username'), 'Username is available');
    }
}

function showFieldError(field, message) {
    clearFieldError({target: field});
    
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function showFieldSuccess(field, message) {
    clearFieldError({target: field});
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.color = '#28a745';
    successDiv.style.fontSize = '14px';
    successDiv.style.marginTop = '5px';
    
    field.parentNode.appendChild(successDiv);
}

function clearFieldError(e) {
    const field = e.target;
    const errorMsg = field.parentNode.querySelector('.error-message');
    const successMsg = field.parentNode.querySelector('.success-message');
    
    if (errorMsg) {
        errorMsg.remove();
    }
    if (successMsg) {
        successMsg.remove();
    }
    
    field.classList.remove('error');
}

function createVolunteerAccount(formData) {
    // This would normally send data to your backend API
    // For now, we'll simulate the process
    
    try {
        // Convert FormData to object for processing
        const accountData = {};
        for (let [key, value] of formData.entries()) {
            accountData[key] = value;
        }
        
        // Simulate API call
        console.log('Creating volunteer account:', accountData);
        
        // Show success message
        showSuccess('Account created successfully! Please check your email for verification.');
        
        // Redirect after a delay
        setTimeout(() => {
            window.location.href = 'volunteer_signin.html';
        }, 3000);
        
    } catch (error) {
        showError('An error occurred while creating your account. Please try again.');
        console.error('Account creation error:', error);
    } finally {
        showLoading(false);
    }
}

function showSuccess(message) {
    removeExistingMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'message success';
    successDiv.innerHTML = `✅ ${message}`;
    
    const form = document.getElementById('volunteerSignupForm');
    form.insertBefore(successDiv, form.firstChild);
    
    // Scroll to top
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function showError(message) {
    removeExistingMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message error';
    errorDiv.innerHTML = `❌ ${message}`;
    
    const form = document.getElementById('volunteerSignupForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Scroll to top
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function removeExistingMessages() {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
}

function showLoading(show) {
    const formWrapper = document.querySelector('.form-wrapper');
    const submitBtn = document.querySelector('.signup-submit-btn');
    
    if (show) {
        formWrapper.classList.add('loading');
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
    } else {
        formWrapper.classList.remove('loading');
        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
    }
}
