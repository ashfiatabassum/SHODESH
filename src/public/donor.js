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

// Custom aesthetic alert function
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

    // Auto remove after duration
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

// Custom confirmation dialog
function showCustomConfirm(message, onConfirm, onCancel = null) {
    // Remove any existing modals
    const existingModals = document.querySelectorAll('.custom-modal');
    existingModals.forEach(modal => modal.remove());

    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-icon">🤔</div>
                    <h3>Confirmation</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn-primary" onclick="confirmAction()">Confirm</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Add event handlers
    window.closeModal = function() {
        modal.remove();
        if (onCancel) onCancel();
    };
    
    window.confirmAction = function() {
        modal.remove();
        if (onConfirm) onConfirm();
    };

    // Show modal
    setTimeout(() => modal.classList.add('show'), 10);
}

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
        showCustomAlert('Please fill in all required fields.', 'warning');
        return false;
    }

    // Validate name fields (letters and spaces only)
    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(firstName)) {
        showCustomAlert('First name should contain only letters and spaces.', 'error');
        return false;
    }
    if (!nameRegex.test(lastName)) {
        showCustomAlert('Last name should contain only letters and spaces.', 'error');
        return false;
    }

    // Validate username (minimum 4 characters, no spaces)
    if (username.length < 4) {
        showCustomAlert('Username must be at least 4 characters long.', 'error');
        return false;
    }
    if (username.includes(' ')) {
        showCustomAlert('Username cannot contain spaces.', 'error');
        return false;
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
    if (!emailRegex.test(email)) {
        showCustomAlert('Please enter a valid email address.', 'error');
        return false;
    }

    // Validate country field (letters and spaces only)
    if (!nameRegex.test(country)) {
        showCustomAlert('Country name should contain only letters and spaces.', 'error');
        return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        showCustomAlert('Passwords do not match. Please try again.', 'error');
        return false;
    }

    // Check password strength (minimum 6 characters)
    if (password.length < 6) {
        showCustomAlert('Password must be at least 6 characters long.', 'error');
        return false;
    }

    // Validate date of birth (should not be in future)
    const today = new Date();
    const dob = new Date(dateOfBirth);
    if (dob >= today) {
        showCustomAlert('Date of birth cannot be in the future.', 'error');
        return false;
    }

    // Check if user is at least 13 years old
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (age < 13 || (age === 13 && monthDiff < 0) || 
        (age === 13 && monthDiff === 0 && today.getDate() < dob.getDate())) {
        showCustomAlert('You must be at least 13 years old to register.', 'error');
        return false;
    }

    // Validate division field for Bangladesh
    const division = document.getElementById('division').value;
    if (country === 'Bangladesh') {
        if (!division) {
            showCustomAlert('Please select a division for Bangladesh.', 'warning');
            return false;
        }
        
        // Validate division is one of the valid Bangladesh divisions
        const validDivisions = ['Barisal', 'Chittagong', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];
        if (!validDivisions.includes(division)) {
            showCustomAlert('Please select a valid division.', 'error');
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

    // Show loading state
    showCustomAlert('Creating your account... Please wait.', 'info', 10000);

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
            showCustomAlert(
                `🎉 Account created successfully!<br><br>
                <strong>Your Donor ID:</strong> ${data.donorId}<br><br>
                You will now be redirected to the sign-in page.`, 
                'success', 
                4000
            );
            
            // Redirect to signin page after a delay
            setTimeout(() => {
                window.location.href = '/signin.html';
            }, 4000);
        } else {
            // Handle specific error types
            let errorMessage = data.message;
            let errorType = 'error';
            
            if (data.code === 'USERNAME_EXISTS') {
                errorMessage = `<strong>Username Already Taken!</strong><br><br>${data.message}<br><br>Please try a different username.`;
                errorType = 'warning';
            } else if (data.code === 'EMAIL_EXISTS') {
                errorMessage = `<strong>Email Already Registered!</strong><br><br>${data.message}<br><br>Try signing in instead or use a different email.`;
                errorType = 'warning';
            } else {
                errorMessage = `<strong>Registration Failed!</strong><br><br>${data.message}`;
            }
            
            showCustomAlert(errorMessage, errorType, 6000);
            
            // Focus on the problematic field if specified
            if (data.field) {
                const fieldElement = document.getElementById(data.field);
                if (fieldElement) {
                    fieldElement.focus();
                    fieldElement.style.borderColor = '#ff4757';
                    fieldElement.style.boxShadow = '0 0 10px rgba(255, 71, 87, 0.3)';
                    setTimeout(() => {
                        fieldElement.style.borderColor = '';
                        fieldElement.style.boxShadow = '';
                    }, 3000);
                }
            }
        }
    })
    .catch(error => {
        console.error('❌ Error:', error);
        showCustomAlert(
            `<strong>An error occurred during registration.</strong><br><br>
            Please check your internet connection and try again.<br><br>
            <small>Error: ${error.message}</small>`, 
            'error', 
            6000
        );
    });

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
                this.style.borderColor = '#ff4757';
                this.style.boxShadow = '0 0 10px rgba(255, 71, 87, 0.3)';
                this.title = 'Please enter a valid email address';
            } else {
                this.style.borderColor = '';
                this.style.boxShadow = '';
                this.title = '';
            }
        });
    }

    // Real-time password matching validation
    function checkPasswordMatch() {
        if (confirmPasswordInput && confirmPasswordInput.value && 
            passwordInput && passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.style.borderColor = '#ff4757';
            confirmPasswordInput.style.boxShadow = '0 0 10px rgba(255, 71, 87, 0.3)';
            confirmPasswordInput.title = 'Passwords do not match';
        } else if (confirmPasswordInput) {
            confirmPasswordInput.style.borderColor = '';
            confirmPasswordInput.style.boxShadow = '';
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
                inputElement.style.borderColor = '#2ed573';
                inputElement.style.boxShadow = '0 0 10px rgba(46, 213, 115, 0.3)';
                inputElement.title = `✅ ${field.charAt(0).toUpperCase() + field.slice(1)} is available`;
            } else {
                inputElement.style.borderColor = '#ff4757';
                inputElement.style.boxShadow = '0 0 10px rgba(255, 71, 87, 0.3)';
                inputElement.title = `❌ ${field.charAt(0).toUpperCase() + field.slice(1)} is already taken`;
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

// Add CSS styles for custom alerts and modals
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

    @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
    }

    /* Custom Modal Styles */
    .custom-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10001;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }

    .custom-modal.show {
        opacity: 1;
        visibility: visible;
    }

    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }

    .modal-content {
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 100%;
        overflow: hidden;
        transform: scale(0.8);
        transition: transform 0.3s ease;
    }

    .custom-modal.show .modal-content {
        transform: scale(1);
    }

    .modal-header {
        padding: 30px 30px 20px;
        text-align: center;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
    }

    .modal-icon {
        font-size: 48px;
        margin-bottom: 15px;
    }

    .modal-header h3 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
    }

    .modal-body {
        padding: 30px;
        text-align: center;
    }

    .modal-body p {
        margin: 0;
        font-size: 16px;
        line-height: 1.6;
        color: #2c3e50;
    }

    .modal-actions {
        padding: 0 30px 30px;
        display: flex;
        gap: 15px;
        justify-content: center;
    }

    .btn-primary, .btn-secondary {
        padding: 12px 30px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 100px;
    }

    .btn-primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
        background: #f8f9fa;
        color: #6c757d;
        border: 2px solid #e9ecef;
    }

    .btn-secondary:hover {
        background: #e9ecef;
        transform: translateY(-2px);
    }

    /* Enhanced input field styles */
    input:focus {
        outline: none !important;
        transition: all 0.3s ease;
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
        
        .modal-content {
            margin: 20px;
        }
        
        .modal-actions {
            flex-direction: column;
        }
    }
`;

document.head.appendChild(customStyles);