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

    // Validation checks
    const validationErrors = [];

    // Check required fields
    Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword' && !formData[key]) {
            validationErrors.push(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        }
    });

    // Name validation
    const namePattern = /^[A-Za-z ]+$/;
    if (formData.firstName && !namePattern.test(formData.firstName)) {
        validationErrors.push('First name can only contain letters and spaces');
    }
    if (formData.lastName && !namePattern.test(formData.lastName)) {
        validationErrors.push('Last name can only contain letters and spaces');
    }

    // Username validation
    if (formData.username && formData.username.length < 4) {
        validationErrors.push('Username must be at least 4 characters long');
    }
    if (formData.username && !/^[a-zA-Z0-9._]+$/.test(formData.username)) {
        validationErrors.push('Username can only contain letters, numbers, dots, and underscores');
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        validationErrors.push('Please enter a valid email address');
    }

    // Phone number validation
    if (formData.phoneNumber && (formData.phoneNumber.length !== 11 || !formData.phoneNumber.startsWith('0'))) {
        validationErrors.push('Phone number must be 11 digits starting with 0');
    }

    // NID validation
    if (formData.nid && (formData.nid.length < 10 || formData.nid.length > 17)) {
        validationErrors.push('NID must be between 10 and 17 digits');
    }

    // ZIP code validation
    if (formData.zipCode && formData.zipCode.length !== 4) {
        validationErrors.push('ZIP code must be exactly 4 digits');
    }

    // bKash validation
    if (formData.bkashNumber && (formData.bkashNumber.length !== 11 || !formData.bkashNumber.startsWith('0'))) {
        validationErrors.push('bKash number must be 11 digits starting with 0');
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
        validationErrors.push('Password must be at least 6 characters long');
    }

    if (formData.password !== formData.confirmPassword) {
        validationErrors.push('Passwords do not match');
    }

    // Date of birth validation
    if (formData.dateOfBirth) {
        const dob = new Date(formData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 13) {
            validationErrors.push('You must be at least 13 years old to register');
        }
    }

    // Area and district validation
    if (formData.area && !namePattern.test(formData.area)) {
        validationErrors.push('Area can only contain letters and spaces');
    }

    // If there are validation errors, show them
    if (validationErrors.length > 0) {
        showErrorAlert(validationErrors[0]);
        return;
    }

    // Submit to backend
    await submitRegistration(formData);
}

// Submit registration to backend
async function submitRegistration(formData) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('span');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';

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

        const data = await response.json();

        if (data.success) {
            showSuccessAlert(`${data.message} Your Individual ID: ${data.individualId}`);
            setTimeout(() => {
                window.location.href = 'profileindividual.html';
            }, 3000);
        } else {
            showErrorAlert(data.message);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showErrorAlert('Network error. Please check your connection and try again.');
    } finally {
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
