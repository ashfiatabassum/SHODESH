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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    // Validate phone number (only digits)
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phoneNumber)) {
        alert('Phone number should contain only digits.');
        return false;
    }

    // Validate phone number length (should be reasonable)
    if (phoneNumber.length < 7 || phoneNumber.length > 15) {
        alert('Phone number should be between 7 and 15 digits.');
        return false;
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

    // If all validations pass, show success message and redirect
    alert('Account created successfully!');
    window.location.href = 'success.html';
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
