// Custom aesthetic alert function
function showCustomAlert(message, type = 'info', duration = 5000) {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());

    // Create alert container
    const alertContainer = document.createElement('div');
    alertContainer.className = 'custom-alert ${type}';
    
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
        progressBar.style.animation = 'progress ${duration}ms linear';
    }

    return alertContainer;
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
  showCustomAlert('🔐 Verifying your credentials... Please wait.', 'loading');
  
  try {
    console.log('🔐 Attempting to sign in with username:', user);
    
    // Try individual signin first
    console.log('🔐 Checking individual credentials...');
    let response = await fetch('/api/individual/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: user,
        password: pass
      })
    });
    
    console.log('📊 Individual response status:', response.status);
    
    // Handle different response types
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse individual response as JSON:', parseError);
      data = { success: false, message: 'Server response error' };
    }
    
    console.log('📋 Individual sign in response:', data);
    
    if (response.ok && data.success) {
      // Remove loading alert
      removeLoadingAlert();
      
      // Store individual data and redirect to profile
      localStorage.setItem('individualId', data.individualId);
      localStorage.setItem('individualData', JSON.stringify(data.individualData));
      localStorage.setItem('userType', 'individual');
      
      showCustomAlert(
        `🎉 <strong>Welcome back, ${data.individualData.personalInfo.firstName}!</strong><br><br>
        Successfully signed in as an <strong>Individual</strong>.<br><br>
        <small>Redirecting to your profile...</small>`, 
        'success', 
        3000
      );
      
      // Redirect to individual profile after delay
      setTimeout(() => {
        window.location.href = 'profileindividual.html';
      }, 3000);
      return;
    }
    
    // If individual signin failed, try donor signin
    console.log('🔐 Individual signin failed, trying donor signin...');
    console.log('Individual error message:', data.message);
    
    // Update loading message
    removeLoadingAlert();
    showCustomAlert('🔐 Checking donor credentials... Please wait.', 'loading');
    
    response = await fetch('/api/donor/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: user,
        password: pass
      })
    });
    
    console.log('📊 Donor response status:', response.status);
    
    // Handle different response types for donor
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse donor response as JSON:', parseError);
      data = { success: false, message: 'Server response error' };
    }
    
    console.log('📋 Donor sign in response:', data);
    
    // Remove loading alert
    removeLoadingAlert();
    
    if (response.ok && data.success) {
     // Ensure donorId is inside personalInfo
   

    // Store donor data and user type in localStorage
    localStorage.setItem('donorId', data.donorId);
    localStorage.setItem('donorData', JSON.stringify(data.donorData));
    localStorage.setItem('userType', 'donor');


     data.donorData.personalInfo.donorId = data.donorId;

      
      showCustomAlert(
        `🎉 <strong>Welcome back, ${data.donorData.personalInfo.firstName}!</strong><br><br>
        Successfully signed in as a <strong>Donor</strong>.<br><br>
        <small>Redirecting to your profile...</small>`, 
        'success', 
        3000
      );
      
      // Redirect to donor profile after delay
      setTimeout(() => {
        window.location.href = 'profiledonor.html';
      }, 3000);
      return;
    }
    
    // Both signin attempts failed - show detailed error message
    console.log('❌ Both signin attempts failed');
    console.log('Donor error message:', data.message);



    


    // After donor sign-in fails, try foundation sign-in
console.log('🔐 Donor signin failed, trying foundation signin...');
console.log('Donor error message:', data.message);

// Update loading message
removeLoadingAlert();
showCustomAlert('🔐 Checking foundation credentials... Please wait.', 'loading');

response = await fetch('/api/foundation/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: user,
    password: pass
  })
});

console.log('📊 Foundation response status:', response.status);

try {
  data = await response.json();
} catch (parseError) {
  console.error('❌ Failed to parse foundation response as JSON:', parseError);
  data = { success: false, message: 'Server response error' };
}

console.log('📋 Foundation sign in response:', data);

// Remove loading alert
removeLoadingAlert();

if (response.ok && data.success) {
  // Store donor data and user type in localStorage
    localStorage.setItem('foundationId', data.foundationId);
    localStorage.setItem('foundationData', JSON.stringify(data.foundationData));
    localStorage.setItem('userType', 'foundation');



  showCustomAlert(
    `🎉 <strong>Welcome back!</strong><br><br>
    Successfully signed in as a <strong>Foundation</strong>.<br><br>
    <small>Redirecting to your profile...</small>`, 
    'success', 
    3000
  );

  // Redirect to foundation profile after delay
  setTimeout(() => {
    window.location.href = 'profilefoundation.html';
  }, 3000);
  return;
}





    
    let errorMessage = 'Invalid username or password.';
    
    // Check if it's a server error
    if (response.status >= 500) {
      errorMessage = 'Server error occurred. Please try again later.';
    } else if (data.message) {
      errorMessage = data.message;
    }
    
    showCustomAlert(
      `<strong>Sign In Failed</strong><br><br>
      ${errorMessage}<br><br>
      <small>Make sure you're using the correct username and password for your account.</small><br><br>
      <strong>Account Types:</strong><br>
      • Individual Account<br>
      • Donor Account<br><br>
      <small>If you don't have an account, please register first.</small>`, 
      'error', 
      10000
    );
    
  } catch (error) {
    console.error('❌ Sign in error:', error);
    removeLoadingAlert();
    
    showCustomAlert(
      `<strong>Connection Error</strong><br><br>
      Unable to connect to the server. Please check your internet connection and try again.<br><br>
      <small>Error: ${error.message}</small><br><br>
      <small>Make sure the server is running on the correct port.</small>`, 
      'error', 
      10000
    );
  } finally {
    // Reset button state
    signinBtn.textContent = originalText;
    signinBtn.disabled = false;
    signinBtn.style.opacity = "1";
  }
});

// ...rest of the code remains the same...
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

  // Add account type indicator (only individual and donor)
  const formContainer = document.querySelector('.signin-form') || document.querySelector('form');
  if (formContainer && !document.querySelector('.account-types-info')) {
    const accountTypesInfo = document.createElement('div');
    accountTypesInfo.className = 'account-types-info';
    accountTypesInfo.innerHTML = `
      <div class="account-types-header">
        <i class="fas fa-info-circle"></i>
        <span>Supported Account Types</span>
      </div>
      <div class="account-types-list">
        <div class="account-type">
          <i class="fas fa-user"></i>
          <span>Individual</span>
        </div>
        <div class="account-type">
          <i class="fas fa-heart"></i>
          <span>Donor</span>
        </div>
        <div class="account-type">
          <i class="fas fa-heart"></i>
          <span>Foundation</span>
        </div>
      </div>
    `;
    
    // Insert before the form or at the end of the container
    const insertTarget = formContainer.querySelector('form') || formContainer;
    if (insertTarget.nextSibling) {
      formContainer.insertBefore(accountTypesInfo, insertTarget.nextSibling);
    } else {
      formContainer.appendChild(accountTypesInfo);
    }
  }
});

// Add CSS styles for custom alerts and enhanced UI
const customStyles = document.createElement('style');
customStyles.textContent = `
    /* Custom Alert Styles - Glassmorphism & Modern Look */
.custom-alert {
    position: fixed;
    top: 32px;
    right: -420px;
    width: 370px;
    z-index: 10000;
    border-radius: 18px;
    box-shadow: 0 8px 32px rgba(33,145,80,0.18), 0 2px 8px rgba(0,0,0,0.08);
    overflow: hidden;
    font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
    transition: all 0.45s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    backdrop-filter: blur(16px) saturate(180%);
    background: rgba(255,255,255,0.75);
    border: 1.5px solid rgba(33,145,80,0.13);
    color: #176b3a;
    opacity: 0.98;
}

.custom-alert.show {
    right: 32px;
    opacity: 1;
    animation: slideInRight 0.5s;
}

.custom-alert.hide {
    right: -420px;
    opacity: 0;
    transition: right 0.3s, opacity 0.3s;
}

.custom-alert.success {
    border-left: 6px solid #2ed573;
    background: rgba(46,213,115,0.10);
}
.custom-alert.error {
    border-left: 6px solid #ff4757;
    background: rgba(255,71,87,0.10);
}
.custom-alert.warning {
    border-left: 6px solid #ffa502;
    background: rgba(255,165,2,0.10);
}
.custom-alert.loading {
    border-left: 6px solid #5f27cd;
    background: rgba(95,39,205,0.10);
}
.custom-alert.info {
    border-left: 6px solid #219150;
    background: rgba(33,145,80,0.10);
}

.alert-content {
    display: flex;
    align-items: flex-start;
    padding: 22px 22px 18px 18px;
    gap: 16px;
    position: relative;
}

.alert-icon {
    font-size: 2rem;
    flex-shrink: 0;
    margin-top: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(33,145,80,0.08);
    box-shadow: 0 2px 8px rgba(33,145,80,0.08);
    transition: background 0.2s;
}
.custom-alert.success .alert-icon { background: rgba(46,213,115,0.15); color: #2ed573; }
.custom-alert.error .alert-icon { background: rgba(255,71,87,0.15); color: #ff4757; }
.custom-alert.warning .alert-icon { background: rgba(255,165,2,0.15); color: #ffa502; }
.custom-alert.loading .alert-icon { background: rgba(95,39,205,0.15); color: #5f27cd; }
.custom-alert.info .alert-icon { background: rgba(33,145,80,0.15); color: #219150; }

.custom-alert.loading .alert-icon {
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.12); }
}

.alert-message {
    flex: 1;
    font-size: 1.08rem;
    line-height: 1.6;
    font-weight: 500;
    color: #176b3a;
    word-break: break-word;
}

.custom-alert.success .alert-message { color: #176b3a; }
.custom-alert.error .alert-message { color: #b91c1c; }
.custom-alert.warning .alert-message { color: #b45309; }
.custom-alert.loading .alert-message { color: #341f97; }
.custom-alert.info .alert-message { color: #176b3a; }

.alert-close {
    background: none;
    border: none;
    color: #176b3a;
    font-size: 1.3rem;
    cursor: pointer;
    padding: 0 8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s, color 0.2s;
    flex-shrink: 0;
    margin-left: 8px;
    margin-top: 2px;
}
.alert-close:hover {
    background-color: rgba(33,145,80,0.12);
    color: #219150;
}
.custom-alert.loading .alert-close {
    display: none;
}

.alert-progress {
    height: 4px;
    background: rgba(33,145,80,0.10);
    position: relative;
    overflow: hidden;
    border-radius: 0 0 12px 12px;
}
.alert-progress::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    height: 100%;
    background: linear-gradient(90deg, #219150, #2ed573);
    width: 100%;
    border-radius: 0 0 12px 12px;
}
.custom-alert.success .alert-progress::before { background: linear-gradient(90deg, #2ed573, #219150); }
.custom-alert.error .alert-progress::before { background: linear-gradient(90deg, #ff4757, #b91c1c); }
.custom-alert.warning .alert-progress::before { background: linear-gradient(90deg, #ffa502, #b45309); }
.custom-alert.loading .alert-progress { display: none; }
.custom-alert.info .alert-progress::before { background: linear-gradient(90deg, #219150, #2ed573); }

@keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
}

/* Responsive */
@media (max-width: 600px) {
    .custom-alert {
        right: -100vw;
        width: calc(100vw - 24px);
        min-width: 0;
        max-width: 98vw;
        border-radius: 12px;
    }
    .custom-alert.show {
        right: 12px;
    }
    .alert-content {
        padding: 14px 10px 12px 10px;
        gap: 10px;
    }
    .alert-icon {
        font-size: 1.3rem;
        width: 28px;
        height: 28px;
    }
    .alert-message {
        font-size: 0.98rem;
    }
}
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
`;

document.head.appendChild(customStyles);