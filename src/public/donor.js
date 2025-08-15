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
    const country = document.getElementById('country').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check if all fields are filled
    if (!firstName || !lastName || !username || !dateOfBirth || !email || 
        !country || !password || !confirmPassword) {
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
        email: email,
        country: country,
        division: country === 'Bangladesh' ? division : null,
        dateOfBirth: dateOfBirth
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
            // Handle specific error types
            let errorMessage = data.message;
            if (data.code === 'USERNAME_EXISTS') {
                errorMessage = '❌ Username Already Taken!\n\n' + data.message + '\n\nPlease try a different username.';
            } else if (data.code === 'EMAIL_EXISTS') {
                errorMessage = '❌ Email Already Registered!\n\n' + data.message + '\n\nTry logging in instead or use a different email.';
            } else {
                errorMessage = '❌ Registration Failed!\n\n' + data.message;
            }
            alert(errorMessage);
            
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
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const emailInput = document.getElementById('email');

    // Real-time username availability checking
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

    // Real-time email availability checking
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
});

// Function to check username/email availability
function checkAvailability(field, value, inputElement) {
    fetch('/api/donor/check-availability', {
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
                inputElement.title = `✅ ${field.charAt(0).toUpperCase() + field.slice(1)} is available`;
            } else {
                inputElement.style.borderColor = '#ff0000';
                inputElement.title = `❌ ${field.charAt(0).toUpperCase() + field.slice(1)} is already taken`;
            }
        }
    })
    .catch(error => {
        console.error('Error checking availability:', error);
        inputElement.style.borderColor = '';
        inputElement.title = '';
    });
}
