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

    return alertContainer; // Return reference for manual removal
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

document.getElementById("signin").addEventListener("click", async () => {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  
  // Basic validation
  if (!user || !pass) {
    showCustomAlert('Please enter both username and password', 'warning');
    return;
  }

  if (user.length < 4) {
    showCustomAlert('Username must be at least 4 characters long', 'error');
    return;
  }

  if (pass.length < 6) {
    showCustomAlert('Password must be at least 6 characters long', 'error');
    return;
  }
  
  // Show loading state
  const signinBtn = document.getElementById("signin");
  const originalText = signinBtn.textContent;
  signinBtn.textContent = "Signing in...";
  signinBtn.disabled = true;
  signinBtn.style.opacity = "0.7";
  
  // Show loading alert
  const loadingAlert = showCustomAlert('🔐 Verifying your credentials... Please wait.', 'loading');
  
  try {
    console.log('🔐 Attempting donor sign in...');
    
    // Send login request to backend
    const response = await fetch('/api/donor/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: user,
        password: pass
      })
    });
    
    const data = await response.json();
    console.log('📋 Sign in response:', data);
    
    // Remove loading alert
    removeLoadingAlert();
    
    if (data.success) {
      // Store donor data for profile page
      localStorage.setItem('donorId', data.donorId);
      localStorage.setItem('donorData', JSON.stringify(data.donorData));
      
      showCustomAlert(
        `🎉 <strong>Welcome back, ${data.donorData.personalInfo.firstName}!</strong><br><br>
        Successfully signed in to your SHODESH account.<br><br>
        <small>Redirecting to your profile...</small>`, 
        'success', 
        3000
      );
      
      // Redirect to donor profile after delay
      setTimeout(() => {
        window.location.href = 'profiledonor.html';
      }, 3000);
    } else {
      showCustomAlert(
        `<strong>Sign In Failed</strong><br><br>
        ${data.message}<br><br>
        <small>Please check your username and password and try again.</small>`, 
        'error', 
        6000
      );
    }
    
  } catch (error) {
    console.error('❌ Sign in error:', error);
    removeLoadingAlert();
    
    showCustomAlert(
      `<strong>Connection Error</strong><br><br>
      Unable to connect to the server. Please check your internet connection and try again.<br><br>
      <small>Error: ${error.message}</small>`, 
      'error', 
      7000
    );
  } finally {
    // Reset button state
    signinBtn.textContent = originalText;
    signinBtn.disabled = false;
    signinBtn.style.opacity = "1";
  }
});

// Handle Enter key press and add real-time validation
document.addEventListener('DOMContentLoaded', function() {
  const passwordField = document.getElementById("password");
  const usernameField = document.getElementById("username");
  
  // Enter key functionality
  if (passwordField) {
    passwordField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        document.getElementById("signin").click();
      }
    });
  }
  
  if (usernameField) {
    usernameField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        document.getElementById("signin").click();
      }
    });
  }

  // Real-time validation feedback for username
  if (usernameField) {
    usernameField.addEventListener('input', function() {
      const value = this.value.trim();
      if (value.length > 0 && value.length < 4) {
        this.style.borderColor = '#ff4757';
        this.style.boxShadow = '0 0 10px rgba(255, 71, 87, 0.3)';
        this.title = 'Username must be at least 4 characters';
      } else if (value.length >= 4) {
        this.style.borderColor = '#2ed573';
        this.style.boxShadow = '0 0 10px rgba(46, 213, 115, 0.3)';
        this.title = 'Username looks good';
      } else {
        this.style.borderColor = '';
        this.style.boxShadow = '';
        this.title = '';
      }
    });

    // Clear validation on focus
    usernameField.addEventListener('focus', function() {
      if (this.value.trim() === '') {
        this.style.borderColor = '';
        this.style.boxShadow = '';
        this.title = '';
      }
    });
  }

  // Real-time validation feedback for password
  if (passwordField) {
    passwordField.addEventListener('input', function() {
      const value = this.value;
      if (value.length > 0 && value.length < 6) {
        this.style.borderColor = '#ff4757';
        this.style.boxShadow = '0 0 10px rgba(255, 71, 87, 0.3)';
        this.title = 'Password must be at least 6 characters';
      } else if (value.length >= 6) {
        this.style.borderColor = '#2ed573';
        this.style.boxShadow = '0 0 10px rgba(46, 213, 115, 0.3)';
        this.title = 'Password looks good';
      } else {
        this.style.borderColor = '';
        this.style.boxShadow = '';
        this.title = '';
      }
    });

    // Clear validation on focus
    passwordField.addEventListener('focus', function() {
      if (this.value === '') {
        this.style.borderColor = '';
        this.style.boxShadow = '';
        this.title = '';
      }
    });
  }

  // Add visual feedback to signin button
  const signinBtn = document.getElementById("signin");
  if (signinBtn) {
    signinBtn.addEventListener('mouseenter', function() {
      if (!this.disabled) {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
      }
    });

    signinBtn.addEventListener('mouseleave', function() {
      if (!this.disabled) {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '';
      }
    });
  }
});

// Add CSS styles for custom alerts and enhanced UI
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

    /* Enhanced input field styles */
    input:focus {
        outline: none !important;
        transition: all 0.3s ease;
    }

    /* Sign in button enhancement */
    #signin {
        transition: all 0.3s ease;
    }

    #signin:disabled {
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
    }

    #signin:not(:disabled):hover {
        transition: all 0.3s ease;
    }

    /* Input field enhancements */
    input[type="text"], input[type="password"] {
        transition: all 0.3s ease;
    }

    input[type="text"]:focus, input[type="password"]:focus {
        transform: translateY(-1px);
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

        .alert-content {
            padding: 15px;
        }

        .alert-message {
            font-size: 13px;
        }
    }

    /* Additional animations */
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    /* Loading spinner for loading alerts */
    .custom-alert.loading .alert-icon::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-left: 30px;
        margin-top: 2px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

document.head.appendChild(customStyles);