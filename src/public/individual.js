// Comprehensive form validation and interactive features
function validateAndSubmit() {
    // Get all form elements
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const phoneNID = document.getElementById('phoneNID').value.trim();
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const houseNo = document.getElementById('houseNo').value.trim();
    const roadNo = document.getElementById('roadNo').value.trim();
    const area = document.getElementById('area').value.trim();
    const district = document.getElementById('district').value;
    const division = document.getElementById('division').value;
    const zipCode = document.getElementById('zipCode').value.trim();
    const bkashNumber = document.getElementById('bkashNumber').value.trim();
    const bankAccount = document.getElementById('bankAccount').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check if all fields are filled
    if (!firstName || !lastName || !email || !username || !phoneNID || !dateOfBirth || 
        !houseNo || !roadNo || !area || !district || !division || 
        !zipCode || !bkashNumber || !bankAccount || !password || !confirmPassword) {
        showErrorAlert('Please fill in all required fields.');
        return false;
    }
      // Username validation
  if (username.length < 4) {
    alert('Username must be at least 4 characters long');
    return;
  }

  // Username format validation (only letters, numbers, underscore, dot)
  const usernamePattern = /^[a-zA-Z0-9._]+$/;
  if (!usernamePattern.test(username)) {
    alert('Username can only contain letters, numbers, dots, and underscores');
    return;
  }


    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showErrorAlert('Please enter a valid email address.');
        return false;
    }

    // Validate ZIP code (digits only)
    const zipRegex = /^[0-9]+$/;
    if (!zipRegex.test(zipCode)) {
        showErrorAlert('ZIP Code should contain only digits.');
        return false;
    }

    if (zipCode.length < 4 || zipCode.length > 10) {
        showErrorAlert('ZIP Code should be between 4 and 10 digits.');
        return false;
    }

    // Validate Bkash number (digits only)
    const bkashRegex = /^[0-9]+$/;
    if (!bkashRegex.test(bkashNumber)) {
        showErrorAlert('Bkash Number should contain only digits.');
        return false;
    }

    if (bkashNumber.length < 10 || bkashNumber.length > 15) {
        showErrorAlert('Bkash Number should be between 10 and 15 digits.');
        return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        showErrorAlert('Passwords do not match. Please try again.');
        return false;
    }

    // Check password strength (minimum 6 characters)
    if (password.length < 6) {
        showErrorAlert('Password must be at least 6 characters long.');
        return false;
    }

    // Validate date of birth (should not be in future)
    const today = new Date();
    const dob = new Date(dateOfBirth);
    if (dob >= today) {
        showErrorAlert('Date of birth cannot be in the future.');
        return false;
    }

    // Check if user is at least 13 years old
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (age < 13 || (age === 13 && monthDiff < 0) || 
        (age === 13 && monthDiff === 0 && today.getDate() < dob.getDate())) {
        showErrorAlert('You must be at least 13 years old to register.');
        return false;
    }

    // If all validations pass, show success message and redirect
    showSuccessAlert('Account created successfully!');
    setTimeout(() => {
        window.location.href = 'profileindividual.html';
    }, 1500);
    return false;
}

// Custom alert functions for better UX
function showErrorAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert error-alert';
    alertDiv.innerHTML = `
        <div class="alert-content">
            <span class="alert-icon">❌</span>
            <span class="alert-message">${message}</span>
            <button class="alert-close" onclick="closeAlert(this)">×</button>
        </div>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = '1';
        alertDiv.style.transform = 'translateY(0)';
    }, 10);
}

function showSuccessAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert success-alert';
    alertDiv.innerHTML = `
        <div class="alert-content">
            <span class="alert-icon">✅</span>
            <span class="alert-message">${message}</span>
        </div>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = '1';
        alertDiv.style.transform = 'translateY(0)';
    }, 10);
}

function closeAlert(button) {
    const alert = button.closest('.custom-alert');
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        alert.remove();
    }, 300);
}

// Real-time validation and interactive features
document.addEventListener('DOMContentLoaded', function() {
    const zipInput = document.getElementById('zipCode');
    const bkashInput = document.getElementById('bkashNumber');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const emailInput = document.getElementById('email');

    // Populate district dropdown
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
    
    districtSelect.innerHTML = '<option value="" disabled selected>Select District</option>';
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });

    // ZIP code validation - only digits
    if (zipInput) {
        zipInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            validateField(this, /^[0-9]{4,10}$/, 'ZIP Code should be 4-10 digits');
        });
    }

    // Bkash number validation - only digits
    if (bkashInput) {
        bkashInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            validateField(this, /^[0-9]{10,15}$/, 'Bkash Number should be 10-15 digits');
        });
    }

    // Real-time password matching validation
    function checkPasswordMatch() {
        if (confirmPasswordInput && confirmPasswordInput.value && 
            passwordInput && passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.parentElement.style.borderColor = '#ff0000';
            confirmPasswordInput.title = 'Passwords do not match';
        } else if (confirmPasswordInput) {
            confirmPasswordInput.parentElement.style.borderColor = '';
            confirmPasswordInput.title = '';
        }
    }

    if (passwordInput) passwordInput.addEventListener('input', checkPasswordMatch);
    if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', checkPasswordMatch);

    // Email validation
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            validateField(this, emailRegex, 'Please enter a valid email address');
        });
    }

    // Add staggered animation delays for form fields
    const formFields = document.querySelectorAll('.overlap, .overlap-2, .overlap-3, .overlap-4, .overlap-5, .phone-number-NID-wrapper, .date-of-birth-wrapper, .div-wrapper, .administrative-wrapper, .zip-code-wrapper, .bkash-number-wrapper, .bank-account-wrapper, .password-wrapper, .confirm-password-wrapper, .road-no-wrapper');
    
    formFields.forEach((field, index) => {
        field.style.animationDelay = `${index * 0.1}s`;
    });
});

function validateField(field, regex, errorMessage) {
    const container = field.parentElement;
    if (field.value && !regex.test(field.value)) {
        container.style.backgroundColor = '#ffe6e6';
        container.style.borderColor = '#ff0000';
        field.title = errorMessage;
    } else {
        container.style.backgroundColor = '';
        container.style.borderColor = '';
        field.title = '';
    }
}
