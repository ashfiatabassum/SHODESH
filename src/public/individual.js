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
    // Phone number validation
    const phoneInput = document.getElementById('phoneNumber');
    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        validatePhoneNumber(this);
    });

    // NID validation
    const nidInput = document.getElementById('nid');
    nidInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        validateNID(this);
    });

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

    // Email validation
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function() {
        validateEmail(this);
    });

    // Username validation
    const usernameInput = document.getElementById('username');
    usernameInput.addEventListener('blur', function() {
        validateUsername(this);
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
            showErrorAlert(data.message);
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
