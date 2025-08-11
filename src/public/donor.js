// Letter-by-letter animation for heading
const headingText = "TOGETHER, WE CREATE THE COMMUNITY WE WANT TO SEE.";
let i = 0;
const headingEl = document.getElementById("headingText");

function typeWriter() {
  if (i < headingText.length) {
    headingEl.innerHTML += headingText.charAt(i);
    i++;
    setTimeout(typeWriter, 80);
  }
}
window.onload = typeWriter;

// Comprehensive form validation function
function validateForm() {
    // Get all form elements
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const username = document.getElementById('username').value.trim();
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const email = document.getElementById('email').value.trim();
    const countryCode = document.getElementById('countryCode').value;
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const country = document.getElementById('country').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check if all fields are filled
    if (!firstName || !lastName || !username || !dateOfBirth || !email || 
        !countryCode || !phoneNumber || !country || !password || !confirmPassword) {
        alert('Please fill in all required fields.');
        return false;
    }

    // Validate name fields (letters and spaces only)
    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(firstName)) {
        alert('First name should contain only letters and spaces.');
        return false;
    }
    if (!nameRegex.test(lastName)) {
        alert('Last name should contain only letters and spaces.');
        return false;
    }

    // Validate username (minimum 4 characters, no spaces)
    if (username.length < 4) {
        alert('Username must be at least 4 characters long.');
        return false;
    }
    if (username.includes(' ')) {
        alert('Username cannot contain spaces.');
        return false;
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    // Validate country field (letters and spaces only)
    if (!nameRegex.test(country)) {
        alert('Country name should contain only letters and spaces.');
        return false;
    }

    // Validate and format mobile number
    let mobileNumber = '';
    if (countryCode === '+880' && country === 'Bangladesh') {
        // For Bangladesh, ensure the number starts with 0 and is 11 digits
        if (!phoneNumber.startsWith('1')) {
            alert('For Bangladesh, phone number should start with 1 (without the 0).');
            return false;
        }
        mobileNumber = '0' + phoneNumber; // Add leading 0
        if (!/^0[0-9]{10}$/.test(mobileNumber)) {
            alert('For Bangladesh, mobile number should be 11 digits starting with 0.');
            return false;
        }
    } else {
        // For other countries, validate phone number (only digits)
        const phoneRegex = /^[0-9]+$/;
        if (!phoneRegex.test(phoneNumber)) {
            alert('Phone number should contain only digits.');
            return false;
        }
        // For international format, keep as entered
        mobileNumber = phoneNumber;
        
        // Validate phone number length (should be reasonable)
        if (phoneNumber.length < 7 || phoneNumber.length > 15) {
            alert('Phone number should be between 7 and 15 digits.');
            return false;
        }
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return false;
    }

    // Check password strength (minimum 6 characters)
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return false;
    }

    // Validate date of birth (should not be in future)
    const today = new Date();
    const dob = new Date(dateOfBirth);
    if (dob >= today) {
        alert('Date of birth cannot be in the future.');
        return false;
    }

    // Check if user is at least 13 years old
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (age < 13 || (age === 13 && monthDiff < 0) || 
        (age === 13 && monthDiff === 0 && today.getDate() < dob.getDate())) {
        alert('You must be at least 13 years old to register.');
        return false;
    }

    // Validate division field for Bangladesh
    const division = document.getElementById('division').value;
    if (country === 'Bangladesh') {
        if (!division) {
            alert('Please select a division for Bangladesh.');
            return false;
        }
        
        // Validate division is one of the valid Bangladesh divisions
        const validDivisions = ['Barisal', 'Chittagong', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];
        if (!validDivisions.includes(division)) {
            alert('Please select a valid division.');
            return false;
        }
    }

    // If all validations pass, submit data to backend
    const donorData = {
        firstName: firstName,
        lastName: lastName,
        username: username,
        password: password,
        mobile: mobileNumber,
        email: email,
        country: country,
        division: country === 'Bangladesh' ? division : null,
        DOB: dateOfBirth
    };

    console.log('Donor data to be saved:', donorData);

    // Send data to backend
    console.log('🚀 Sending donor registration request...');
    fetch('/api/donor/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(donorData)
    })
    .then(response => {
        console.log('📡 Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('📋 Response data:', data);
        if (data.success) {
            alert('🎉 Account created successfully!\n\n' + 
                  'Your Donor ID is: ' + data.donorId + '\n\n' +
                  'Please save this ID for future reference.');
            // Redirect to login or home page
            window.location.href = '/signin.html';
        } else {
            alert('❌ Registration failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('❌ Error:', error);
        alert('❌ An error occurred during registration. Please try again.\n\nError: ' + error.message);
    });

    return false; // Prevent default form submission
    window.location.href = 'profiledonor.html';
    return false; // Prevent default form submission
}

// Add real-time validation when page loads
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phoneNumber');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const emailInput = document.getElementById('email');

    // Phone number input validation - only allow digits
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            // Remove any non-digit characters
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Add visual feedback
            if (this.value && !/^[0-9]+$/.test(this.value)) {
                this.style.borderColor = '#ff0000';
            } else {
                this.style.borderColor = '';
            }
        });
    }

    // Real-time password matching validation
    function checkPasswordMatch() {
        if (confirmPasswordInput && confirmPasswordInput.value && 
            passwordInput && passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.style.borderColor = '#ff0000';
            confirmPasswordInput.title = 'Passwords do not match';
        } else if (confirmPasswordInput) {
            confirmPasswordInput.style.borderColor = '';
            confirmPasswordInput.title = '';
        }
    }

    if (passwordInput) passwordInput.addEventListener('input', checkPasswordMatch);
    if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', checkPasswordMatch);

    // Email validation
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.style.borderColor = '#ff0000';
                this.title = 'Please enter a valid email address';
            } else {
                this.style.borderColor = '';
                this.title = '';
            }
        });
    }
});
