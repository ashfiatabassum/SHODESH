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
    
    // Setup password toggle functionality for all password fields
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
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
            // Check file size (10MB limit)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                showFieldError(fileInput, 'File size must be less than 10MB');
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
    
    if (!validateForm()) {
        console.log('Form validation failed');
        return;
    }
    
    // Create FormData from the form
    const form = document.getElementById('volunteerSignupForm');
    const formData = new FormData(form);
    
    // Debug: Log all form data
    console.log('Form data:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }
    
    // Show loading indicator
    showLoading(true);
    
    // ALWAYS use the real API (no more development mode simulation)
    createVolunteerAccount(formData);
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
            
        case 'area':
            if (value && !validateArea(value)) {
                showFieldError(field, 'Area must contain only letters and spaces (e.g., Banani, Dhanmondi)');
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

function validateArea(area) {
    // Area validation (letters and spaces only)
    const regex = /^[A-Za-z ]+$/;
    return regex.test(area);
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
    
    // Call the real API to check username availability
    fetch('/api/staff/check-username', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.exists || (data.message && data.message.includes('taken'))) {
            showFieldError(document.getElementById('username'), 'This username is already taken');
        } else {
            clearFieldError({target: document.getElementById('username')});
            showFieldSuccess(document.getElementById('username'), 'Username is available');
        }
    })
    .catch(error => {
        console.error('Error checking username:', error);
    });
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
    // Send data to the backend API
    try {
        console.log('Creating volunteer account...');
        
        // Make sure we have all required fields
        const requiredFields = ['firstName', 'lastName', 'username', 'password', 'mobileNumber', 'nid', 'cv'];
        let missingFields = [];
        
        requiredFields.forEach(field => {
            if (field === 'cv') {
                const fileInput = document.getElementById('cv');
                if (!fileInput || !fileInput.files || !fileInput.files[0]) {
                    missingFields.push('CV file');
                    console.error('CV file is missing or not properly selected');
                } else {
                    console.log('CV file found:', fileInput.files[0].name);
                    // Ensure the CV file is included in the form data
                    if (!formData.has('cv')) {
                        formData.set('cv', fileInput.files[0]);
                    }
                }
            } else if (!formData.get(field)) {
                missingFields.push(field);
            }
        });
        
        if (missingFields.length > 0) {
            showError(`Missing required fields: ${missingFields.join(', ')}`);
            showLoading(false);
            return;
        }
        
        // Debug: Log all form data
        console.log('Form data:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }
        
        // Send the FormData directly to our backend API
        fetch('/api/staff/signup', {
            method: 'POST',
            body: formData, // FormData automatically sets the correct content-type for file uploads
        })
        .then(response => {
            console.log('Server response status:', response.status);
            
            // Clone the response before reading its body
            const responseClone = response.clone();
            
            // Always try to parse JSON regardless of status
            return response.json().then(data => {
                // Add response status to data for reference
                data._responseStatus = response.status;
                return data;
            }).catch(() => {
                // If parsing fails, try to get the text content instead
                return responseClone.text().then(textContent => {
                    console.log('Raw server response:', textContent);
                    return {
                        success: false,
                        _responseStatus: response.status,
                        message: `Server error (${response.status}): ${textContent.substring(0, 100)}...`
                    };
                }).catch(err => {
                    // If even text parsing fails, return a basic object
                    return {
                        success: false,
                        _responseStatus: response.status,
                        message: `Server error (${response.status})`
                    };
                });
            });
        })
        .then(data => {
            console.log('Server response data:', data);
            
            // If success is false or response was not ok (status >= 400)
            if (!data.success || data._responseStatus >= 400) {
                // Create an error object with the message
                const error = new Error(data.message || 'Server error occurred');
                
                // Add additional properties
                error.status = data._responseStatus;
                error.field = data.field;
                
                // If it's a 409 conflict error, add special handling
                if (data._responseStatus === 409) {
                    console.log('Conflict detected:', data.message);
                }
                
                throw error;
            }
            
            return data;
        })
        .then(data => {
            console.log('Registration successful:', data);
            
            // Show success message about verification
            showSuccess('Account created successfully! Redirecting to verification waiting page...');
            
            // Store username in sessionStorage for easier sign-in later
            sessionStorage.setItem('newStaffUsername', data.staffId || '');
            
            // Redirect after a delay to the verification waiting page with staff ID
            setTimeout(() => {
                window.location.href = `staff_verification_waiting.html?from=signup&staffId=${data.staffId || ''}`;
            }, 3000);
        })
        .catch(error => {
            // Show error message in the UI
            showError(error.message || 'An error occurred while creating your account. Please try again.');
            console.error('Account creation error:', error);
            
            // Handle 409 Conflict errors specifically
            if (error.status === 409) {
                // If we know which field caused the error from the server response
                if (error.field) {
                    const fieldId = error.field === 'email' ? 'gmail' : error.field;
                    const fieldInput = document.getElementById(fieldId);
                    if (fieldInput) {
                        showFieldError(fieldInput, error.message);
                        // Scroll to the field with the error
                        fieldInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                } 
                // If field wasn't specified, try to guess from the error message
                else if (error.message) {
                    if (error.message.includes('username')) {
                        showFieldError(document.getElementById('username'), error.message);
                        document.getElementById('username').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } 
                    else if (error.message.includes('email')) {
                        showFieldError(document.getElementById('gmail'), error.message);
                        document.getElementById('gmail').scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Add a sign-in link below the email field
                        const signInSuggestion = document.createElement('div');
                        signInSuggestion.className = 'signin-suggestion';
                        signInSuggestion.innerHTML = `
                            <p style="margin-top: 10px; color: #007bff;">
                                <a href="volunteer_signin.html" style="text-decoration: underline; color: #007bff;">
                                    Sign in with this email instead
                                </a>
                            </p>
                        `;
                        const emailGroup = document.getElementById('gmail').parentNode;
                        if (emailGroup && !emailGroup.querySelector('.signin-suggestion')) {
                            emailGroup.appendChild(signInSuggestion);
                        }
                    } 
                    else if (error.message.includes('mobile')) {
                        showFieldError(document.getElementById('mobileNumber'), error.message);
                        document.getElementById('mobileNumber').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } 
                    else if (error.message.includes('NID')) {
                        showFieldError(document.getElementById('nid'), error.message);
                        document.getElementById('nid').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
            
            showLoading(false);
        });
    } catch (error) {
        showError('An error occurred while creating your account. Please try again.');
        console.error('Account creation error:', error);
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
