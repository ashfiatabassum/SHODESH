// SHODESH Individual Registration - Modern JavaScript with Backend Integration

// Initialize districts when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDistricts();
    initializeFormValidation();
    initializePasswordToggle();
});

// Bangladesh districts array
function initializeDistricts() {
    const districtSelect = document.getElementById('district');
    const districts = [
        'Bagerhat', 'Bandarban', 'Barguna', 'Barisal', 'Bhola', 'Bogra', 'Brahmanbaria',
        'Chandpur', 'Chittagong', 'Chuadanga', 'Comilla', "Cox's Bazar", 'Dhaka', 'Dinajpur',
        'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur',
        'Jessore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna',
        'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur',
        'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh',
        'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Nawabganj', 'Netrakona',
        'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari',
        'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj',
        'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
    ];
    
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
}

// Initialize real-time form validation
function initializeFormValidation() {
    // Username availability checking
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        let usernameTimeout;
        usernameInput.addEventListener('input', function() {
            clearTimeout(usernameTimeout);
            const username = this.value.trim();
            
            if (username.length >= 4) {
                usernameTimeout = setTimeout(() => {
                    checkAvailability('username', username, usernameInput);
                }, 500); // Wait 500ms after user stops typing
            }
        });
    }

    // Email availability checking
    const emailInput = document.getElementById('email');
    if (emailInput) {
        let emailTimeout;
        emailInput.addEventListener('input', function() {
            clearTimeout(emailTimeout);
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const email = this.value.trim();
            
            if (email && emailRegex.test(email)) {
                emailTimeout = setTimeout(() => {
                    checkAvailability('email', email, emailInput);
                }, 500); // Wait 500ms after user stops typing
            } else if (email && !emailRegex.test(email)) {
                this.style.borderColor = '#ff0000';
                this.title = 'Please enter a valid email address';
            } else {
                this.style.borderColor = '';
                this.title = '';
            }
        });
    }

    // Phone number validation and availability checking
    const phoneInput = document.getElementById('phoneNumber');
    if (phoneInput) {
        let phoneTimeout;
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            validatePhoneNumber(this);
            
            clearTimeout(phoneTimeout);
            const phoneNumber = this.value.trim();
            
            if (phoneNumber.length === 11) {
                phoneTimeout = setTimeout(() => {
                    // Format the number before checking
                    let formattedNumber = phoneNumber;
                    if (!formattedNumber.startsWith('0')) {
                        formattedNumber = '0' + formattedNumber.substring(1);
                    }
                    checkAvailability('mobile', formattedNumber, phoneInput);
                }, 500);
            }
        });
    }

    // NID validation and availability checking
    const nidInput = document.getElementById('nid');
    if (nidInput) {
        let nidTimeout;
        nidInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            validateNID(this);
            
            clearTimeout(nidTimeout);
            const nid = this.value.trim();
            
            if (nid.length >= 10 && nid.length <= 17) {
                nidTimeout = setTimeout(() => {
                    checkAvailability('nid', nid, nidInput);
                }, 500);
            }
        });
    }

    // ZIP code validation
    const zipInput = document.getElementById('zipCode');
    if (zipInput) {
        zipInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            validateZipCode(this);
        });
    }

    // bKash number validation
    const bkashInput = document.getElementById('bkashNumber');
    if (bkashInput) {
        bkashInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            validateBkashNumber(this);
        });
    }

    // Password matching
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            validatePasswordMatch(passwordInput, confirmPasswordInput);
        });
    }
}

// Password toggle functionality
function initializePasswordToggle() {
    // This function will be called by the onclick in HTML
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.parentElement.querySelector('.toggle-password i');
    
    if (field.type === 'password') {
        field.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        button.className = 'fas fa-eye';
    }
}

// Validation functions
function validatePhoneNumber(input) {
    const value = input.value;
    const group = input.closest('.form-group');
    
    if (value.length === 0) {
        setFieldState(group, 'neutral');
        return true;
    }
    
    if (value.length !== 11 || !value.startsWith('0')) {
        setFieldState(group, 'error');
        return false;
    }
    
    setFieldState(group, 'success');
    return true;
}

function validateNID(input) {
    const value = input.value;
    const group = input.closest('.form-group');
    
    if (value.length === 0) {
        setFieldState(group, 'neutral');
        return true;
    }
    
    if (value.length < 10 || value.length > 17) {
        setFieldState(group, 'error');
        return false;
    }
    
    setFieldState(group, 'success');
    return true;
}

function validateZipCode(input) {
    const value = input.value;
    const group = input.closest('.form-group');
    
    if (value.length === 0) {
        setFieldState(group, 'neutral');
        return true;
    }
    
    if (value.length !== 4) {
        setFieldState(group, 'error');
        return false;
    }
    
    setFieldState(group, 'success');
    return true;
}

function validateBkashNumber(input) {
    const value = input.value;
    const group = input.closest('.form-group');
    
    if (value.length === 0) {
        setFieldState(group, 'neutral');
        return true;
    }
    
    if (value.length !== 11 || !value.startsWith('0')) {
        setFieldState(group, 'error');
        return false;
    }
    
    setFieldState(group, 'success');
    return true;
}

function validateEmail(input) {
    const value = input.value;
    const group = input.closest('.form-group');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (value.length === 0) {
        setFieldState(group, 'neutral');
        return true;
    }
    
    if (!emailRegex.test(value)) {
        setFieldState(group, 'error');
        return false;
    }
    
    setFieldState(group, 'success');
    return true;
}

function validateUsername(input) {
    const value = input.value;
    const group = input.closest('.form-group');
    const usernamePattern = /^[a-zA-Z0-9._]+$/;
    
    if (value.length === 0) {
        setFieldState(group, 'neutral');
        return true;
    }
    
    if (value.length < 4 || !usernamePattern.test(value)) {
        setFieldState(group, 'error');
        return false;
    }
    
    setFieldState(group, 'success');
    return true;
}

function validatePasswordMatch(passwordInput, confirmPasswordInput) {
    const group = confirmPasswordInput.closest('.form-group');
    
    if (confirmPasswordInput.value.length === 0) {
        setFieldState(group, 'neutral');
        return true;
    }
    
    if (passwordInput.value !== confirmPasswordInput.value) {
        setFieldState(group, 'error');
        return false;
    }
    
    setFieldState(group, 'success');
    return true;
}

function setFieldState(group, state) {
    if (group) {
        group.classList.remove('error', 'success');
        if (state !== 'neutral') {
            group.classList.add(state);
        }
    }
}

// Main validation and submission function
async function validateAndSubmit() {
    console.log('🔥 Form submission started');
    
    // Get all form values
    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        nid: document.getElementById('nid').value.trim(),
        dateOfBirth: document.getElementById('dateOfBirth').value,
        houseNo: document.getElementById('houseNo').value.trim(),
        roadNo: document.getElementById('roadNo').value.trim(),
        area: document.getElementById('area').value.trim(),
        district: document.getElementById('district').value,
        division: document.getElementById('division').value,
        zipCode: document.getElementById('zipCode').value.trim(),
        bkashNumber: document.getElementById('bkashNumber').value.trim(),
        bankAccount: document.getElementById('bankAccount').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    console.log('📋 Form data collected:', formData);

    // Basic required fields check
    const requiredFields = ['firstName', 'lastName', 'username', 'email', 'phoneNumber', 'nid', 'dateOfBirth', 'houseNo', 'roadNo', 'area', 'district', 'division', 'zipCode', 'bkashNumber', 'bankAccount', 'password', 'confirmPassword'];
    
    for (let field of requiredFields) {
        if (!formData[field]) {
            showCustomAlert(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`, 'error');
            console.log(`❌ Missing field: ${field}`);
            return;
        }
    }

    // Password match check
    if (formData.password !== formData.confirmPassword) {
        showCustomAlert('Passwords do not match', 'error');
        console.log('❌ Password mismatch');
        return;
    }

    console.log('✅ Basic validation passed, submitting to backend...');
    
    // Submit to backend
    await submitRegistration(formData);
}

// Submit registration to backend
async function submitRegistration(formData) {
    console.log('🚀 Starting backend submission...');
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('span');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    try {
        console.log('🔄 Setting loading state...');
        // Show loading state
        submitBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'block';

        // Show loading alert
        showCustomAlert('🔄 Registering your account... Please wait.', 'loading');

        console.log('📤 Sending request to /api/individual/register...');
        const response = await fetch('/api/individual/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                nid: formData.nid,
                dateOfBirth: formData.dateOfBirth,
                houseNo: formData.houseNo,
                roadNo: formData.roadNo,
                area: formData.area,
                district: formData.district,
                division: formData.division,
                zipCode: formData.zipCode,
                bkashNumber: formData.bkashNumber,
                bankAccount: formData.bankAccount,
                password: formData.password
            })
        });

        console.log('📥 Response received:', response.status, response.statusText);

        // Remove loading alert
        removeLoadingAlert();

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📋 Response data:', data);

        if (data.success) {
            console.log('✅ Registration successful!');
            showCustomAlert(
                `🎉 <strong>Registration Successful!</strong><br><br>
                Your Individual ID: <strong>${data.individualId}</strong><br><br>
                <small>Redirecting to sign-in page...</small>`, 
                'success', 
                4000
            );
            
            // Redirect to signin page after a delay
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 4000);
        } else {
            console.log('❌ Registration failed:', data.message);
            
            // Handle specific error types with enhanced messaging
            let errorMessage = data.message;
            let alertType = 'error';
            
            if (data.code === 'USERNAME_EXISTS') {
                errorMessage = `<strong>Username Already Taken!</strong><br><br>${data.message}<br><br><small>Please try a different username.</small>`;
            } else if (data.code === 'EMAIL_EXISTS') {
                errorMessage = `<strong>Email Already Registered!</strong><br><br>${data.message}<br><br><small>Try logging in instead or use a different email.</small>`;
            } else if (data.code === 'MOBILE_EXISTS') {
                errorMessage = `<strong>Mobile Number Already Registered!</strong><br><br>${data.message}<br><br><small>Please use a different mobile number.</small>`;
            } else if (data.code === 'NID_EXISTS') {
                errorMessage = `<strong>NID Already Registered!</strong><br><br>${data.message}<br><br><small>Each person can only have one account.</small>`;
            } else {
                errorMessage = `<strong>Registration Failed!</strong><br><br>${data.message}`;
            }
            
            showCustomAlert(errorMessage, alertType, 6000);
            
            // Focus on the problematic field if specified
            if (data.field) {
                const fieldElement = document.getElementById(data.field);
                if (fieldElement) {
                    fieldElement.focus();
                    fieldElement.style.borderColor = '#ff0000';
                    setTimeout(() => {
                        fieldElement.style.borderColor = '';
                    }, 3000);
                }
            }
        }
    } catch (error) {
        console.error('💥 Registration error:', error);
        removeLoadingAlert();
        showCustomAlert(
            `<strong>Network Error</strong><br><br>
            ${error.message}<br><br>
            <small>Please check your connection and try again.</small>`, 
            'error', 
            7000
        );
    } finally {
        console.log('🔄 Resetting button state...');
        // Reset button state
        submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
    }
}

// Function to check username/email/mobile/nid availability
function checkAvailability(field, value, inputElement) {
    fetch('/api/individual/check-availability', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field: field, value: value })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.available) {
                inputElement.style.borderColor = '#2ed573';
                inputElement.style.boxShadow = '0 0 10px rgba(46, 213, 115, 0.3)';
                inputElement.title = `✅ ${data.message}`;
            } else {
                inputElement.style.borderColor = '#ff4757';
                inputElement.style.boxShadow = '0 0 10px rgba(255, 71, 87, 0.3)';
                inputElement.title = `❌ ${data.message}`;
            }
        }
    })
    .catch(error => {
        console.error('Error checking availability:', error);
        inputElement.style.borderColor = '';
        inputElement.style.boxShadow = '';
        inputElement.title = '';
    });
}

// Custom alert functions (same as signin and donor registration)
function showCustomAlert(message, type = 'info', duration = 5000) {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());

    // Create alert container
    const alertContainer = document.createElement('div');
    alertContainer.className = `custom-alert ${type}`;
    
    // Set icon based on type
    let icon;
    switch(type) {
        case 'success':
            icon = '✅';
            break;
        case 'error':
            icon = '❌';
            break;
        case 'warning':
            icon = '⚠️';
            break;
        case 'loading':
            icon = '⏳';
            break;
        case 'info':
        default:
            icon = 'ℹ️';
            break;
    }

    alertContainer.innerHTML = `
        <div class="alert-content">
            <div class="alert-icon">${icon}</div>
            <div class="alert-message">${message}</div>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="alert-progress"></div>
    `;

    // Add to page
    document.body.appendChild(alertContainer);

    // Animate in
    setTimeout(() => {
        alertContainer.classList.add('show');
    }, 10);

    // Auto remove after duration (except for loading alerts)
    if (type !== 'loading') {
        setTimeout(() => {
            alertContainer.classList.add('hide');
            setTimeout(() => {
                if (alertContainer.parentNode) {
                    alertContainer.remove();
                }
            }, 300);
        }, duration);

        // Start progress bar animation
        const progressBar = alertContainer.querySelector('.alert-progress');
        progressBar.style.animation = `progress ${duration}ms linear`;
    }

    return alertContainer;
}

// Function to remove loading alerts manually
function removeLoadingAlert() {
    const loadingAlerts = document.querySelectorAll('.custom-alert.loading');
    loadingAlerts.forEach(alert => {
        alert.classList.add('hide');
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 300);
    });
}

// Legacy alert functions for compatibility
function showSuccessAlert(message) {
    showCustomAlert(message, 'success');
}

function showErrorAlert(message) {
    showCustomAlert(message, 'error');
}

// Add CSS styles for custom alerts
const customStyles = document.createElement('style');
customStyles.textContent = `
    /* Custom Alert Styles */
    .custom-alert {
        position: fixed;
        top: 20px;
        right: -400px;
        width: 380px;
        z-index: 10000;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        backdrop-filter: blur(10px);
    }

    .custom-alert.show {
        right: 20px;
        transform: translateY(0);
    }

    .custom-alert.hide {
        right: -400px;
        opacity: 0;
    }

    .custom-alert.success {
        background: linear-gradient(135deg, #2ed573, #17c0eb);
        color: white;
    }

    .custom-alert.error {
        background: linear-gradient(135deg, #ff4757, #ff3838);
        color: white;
    }

    .custom-alert.warning {
        background: linear-gradient(135deg, #ffa502, #ff6348);
        color: white;
    }

    .custom-alert.loading {
        background: linear-gradient(135deg, #5f27cd, #341f97);
        color: white;
    }

    .custom-alert.info {
        background: linear-gradient(135deg, #3742fa, #2f3542);
        color: white;
    }

    .alert-content {
        display: flex;
        align-items: flex-start;
        padding: 20px;
        gap: 15px;
        position: relative;
    }

    .alert-icon {
        font-size: 24px;
        flex-shrink: 0;
        margin-top: 2px;
    }

    .custom-alert.loading .alert-icon {
        animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }

    .alert-message {
        flex: 1;
        font-size: 14px;
        line-height: 1.5;
        font-weight: 500;
    }

    .alert-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
        flex-shrink: 0;
    }

    .alert-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .custom-alert.loading .alert-close {
        display: none;
    }

    .alert-progress {
        height: 3px;
        background: rgba(255, 255, 255, 0.3);
        position: relative;
        overflow: hidden;
    }

    .alert-progress::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: rgba(255, 255, 255, 0.7);
        width: 100%;
    }

    .custom-alert.loading .alert-progress {
        display: none;
    }

    @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
    }

    /* Responsive design */
    @media (max-width: 480px) {
        .custom-alert {
            right: -100%;
            width: calc(100% - 40px);
        }
        
        .custom-alert.show {
            right: 20px;
        }
    }
`;
document.head.appendChild(customStyles);