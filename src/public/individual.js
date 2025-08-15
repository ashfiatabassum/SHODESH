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
    zipInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        validateZipCode(this);
    });

    // bKash number validation
    const bkashInput = document.getElementById('bkashNumber');
    bkashInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        validateBkashNumber(this);
    });

    // Password matching
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch(passwordInput, confirmPasswordInput);
    });
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
    group.classList.remove('error', 'success');
    if (state !== 'neutral') {
        group.classList.add(state);
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
            showErrorAlert(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
            console.log(`❌ Missing field: ${field}`);
            return;
        }
    }

    // Password match check
    if (formData.password !== formData.confirmPassword) {
        showErrorAlert('Passwords do not match');
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
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';

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

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📋 Response data:', data);

        if (data.success) {
            console.log('✅ Registration successful!');
            showSuccessAlert(`${data.message} Your Individual ID: ${data.individualId}`);
            setTimeout(() => {
                window.location.href = 'profileindividual.html';
            }, 3000);
        } else {
            console.log('❌ Registration failed:', data.message);
            
            // Handle specific error types with enhanced messaging
            let errorMessage = data.message;
            if (data.code === 'USERNAME_EXISTS') {
                errorMessage = '❌ Username Already Taken!\n\n' + data.message + '\n\nPlease try a different username.';
            } else if (data.code === 'EMAIL_EXISTS') {
                errorMessage = '❌ Email Already Registered!\n\n' + data.message + '\n\nTry logging in instead or use a different email.';
            } else if (data.code === 'MOBILE_EXISTS') {
                errorMessage = '❌ Mobile Number Already Registered!\n\n' + data.message + '\n\nPlease use a different mobile number.';
            } else if (data.code === 'NID_EXISTS') {
                errorMessage = '❌ NID Already Registered!\n\n' + data.message + '\n\nEach person can only have one account.';
            } else {
                errorMessage = '❌ Registration Failed!\n\n' + data.message;
            }
            
            showErrorAlert(errorMessage);
            
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
        showErrorAlert(`Network error: ${error.message}. Please check your connection and try again.`);
    } finally {
        console.log('🔄 Resetting button state...');
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// Alert functions
function showSuccessAlert(message) {
    showAlert(message, 'success');
}

function showErrorAlert(message) {
    showAlert(message, 'error');
}

function showAlert(message, type) {
    const container = document.getElementById('messageContainer');
    
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    
    alert.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button class="alert-close" onclick="closeAlert(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

function closeAlert(button) {
    button.closest('.alert').remove();
}






// This goes in your frontend JavaScript, NOT in the server route file
async function submitRegistration(formData) {
    try {
        const response = await fetch('/api/individual/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        console.log('Full server response:', result);

        if (!response.ok) {
            console.error('Server error details:', result.message);
            alert('Registration failed: ' + result.message);
            return;
        }

        // Success handling
        alert('Registration successful!');
        
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error: ' + error.message);
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
                inputElement.style.borderColor = '#00aa00';
                inputElement.title = `✅ ${data.message}`;
            } else {
                inputElement.style.borderColor = '#ff0000';
                inputElement.title = `❌ ${data.message}`;
            }
        }
    })
    .catch(error => {
        console.error('Error checking availability:', error);
        inputElement.style.borderColor = '';
        inputElement.title = '';
    });
}