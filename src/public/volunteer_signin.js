// Volunteer Sign In Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('volunteerSigninForm');
    const formWrapper = document.querySelector('.form-wrapper');
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleVolunteerSignin();
    });
    
    // Add input validation styling
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', clearValidationError);
    });
});

function handleVolunteerSignin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Basic validation
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Show loading state
    showLoading(true);
    
    // Simulate authentication (replace with actual authentication logic)
    setTimeout(() => {
        // For now, we'll simulate a successful login
        // In a real application, you would send the credentials to your backend
        
        if (authenticateVolunteer(username, password)) {
            // Success - redirect to staff application form
            showSuccess('Sign in successful! Redirecting to application...');
            setTimeout(() => {
                // Store sign-in status
                localStorage.setItem('volunteerSignedIn', 'true');
                localStorage.setItem('volunteerUsername', username);
                
                // Redirect back to volunteer page to show application form
                window.location.href = 'volunteer.html';
            }, 1500);
        } else {
            showError('Invalid username or password. Please try again.');
            showLoading(false);
        }
    }, 2000);
}

function authenticateVolunteer(username, password) {
    // This is a placeholder authentication function
    // In a real application, you would send credentials to your backend
    
    // For demonstration, we'll accept any username with password "staff123"
    // You should replace this with actual authentication logic
    return password === 'staff123';
}

function handleSignup() {
    // Redirect to the staff signup page
    window.location.href = 'volunteer_signup.html';
}

function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    
    // Remove existing error styling
    clearValidationError(e);
    
    if (!value) {
        showInputError(input, 'This field is required');
    } else if (input.type === 'password' && value.length < 6) {
        showInputError(input, 'Password must be at least 6 characters');
    }
}

function clearValidationError(e) {
    const input = e.target;
    const errorMsg = input.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
    input.classList.remove('error');
}

function showInputError(input, message) {
    input.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.marginTop = '5px';
    
    input.parentNode.appendChild(errorDiv);
}

function showError(message) {
    removeExistingMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message error-msg';
    errorDiv.innerHTML = `
        <div style="background: #f8d7da; color: #721c24; padding: 12px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #f5c6cb;">
            ❌ ${message}
        </div>
    `;
    
    const form = document.getElementById('volunteerSigninForm');
    form.insertBefore(errorDiv, form.firstChild);
}

function showSuccess(message) {
    removeExistingMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'message success-msg';
    successDiv.innerHTML = `
        <div style="background: #d4edda; color: #155724; padding: 12px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #c3e6cb;">
            ✅ ${message}
        </div>
    `;
    
    const form = document.getElementById('volunteerSigninForm');
    form.insertBefore(successDiv, form.firstChild);
}

function removeExistingMessages() {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
}

function showLoading(show) {
    const formWrapper = document.querySelector('.form-wrapper');
    const submitBtn = document.querySelector('.signin-submit-btn');
    
    if (show) {
        formWrapper.classList.add('loading');
        submitBtn.textContent = 'Signing In...';
    } else {
        formWrapper.classList.remove('loading');
        submitBtn.textContent = 'Sign In';
    }
}

// Add CSS for input error styling
const style = document.createElement('style');
style.textContent = `
    .input-group input.error {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
    }
    
    .error-message {
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .message {
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
