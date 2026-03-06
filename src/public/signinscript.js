// Custom aesthetic alert function
function isValidEmail(email) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

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

  function getSelectedRole() {
  const el = document.getElementById('role');
  return el ? el.value : '';
}

function getRoleLabel(role) {
  switch (role) {
    case 'foundation': return 'NGO';
    case 'staff': return 'Volunteer';
    case 'individual': return 'Seeker';
    case 'donor': return 'Donor';
    case 'admin': return 'Admin';
    default: return 'User';
  }
}

function getSignupTarget(role) {
  switch (role) {
    case 'foundation': return 'foundation.html';
    case 'donor': return 'donor.html';
    case 'individual': return 'individual.html';
    case 'staff': return 'staff_signup.html';
    case 'admin': return '';
    default: return '';
  }
}

function updateSignupLinkUI() {
  const role = getSelectedRole();
  const signupText = document.getElementById('signupText');
  const signupLink = document.getElementById('signupLink');
  if (!signupText || !signupLink) return;

  const target = getSignupTarget(role);
  if (!target) {
    signupText.style.display = 'none';
    signupLink.setAttribute('href', '#');
    return;
  }

  signupText.style.display = '';
  signupLink.setAttribute('href', target);
}

function updateInputLabelUI() {
  const role = getSelectedRole();
  const usernameLabel = document.getElementById('usernameLabel');
  if (!usernameLabel) return;

  if (role === 'admin') {
    usernameLabel.textContent = 'Enter admin email';
  } else {
    usernameLabel.textContent = 'Enter your email';
  }
}

async function handleRoleBasedSignin(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();

  const role = getSelectedRole();
  const user = document.getElementById("loginIdentifier").value.trim();
  const pass = document.getElementById("password").value.trim();
  const roleLabel = getRoleLabel(role);

  if (!role) {
    showCustomAlert('Please select a role first', 'warning');
    return;
  }

  if (!user || !pass) {
    showCustomAlert('Please enter both email and password', 'warning');
    return;
  }

  if (!isValidEmail(user)) {
    showCustomAlert('Please enter a valid email address', 'error');
    return;
  }

  if (pass.length < 6) {
    showCustomAlert('Password must be at least 6 characters long', 'error');
    return;
  }

  const signinBtn = document.getElementById("signin");
  const buttonTextEl = signinBtn ? (signinBtn.querySelector('.button-text') || signinBtn) : null;
  const originalText = buttonTextEl ? buttonTextEl.textContent : 'Sign In';

  if (signinBtn) {
    if (buttonTextEl) buttonTextEl.textContent = "Signing in...";
    signinBtn.disabled = true;
    signinBtn.style.opacity = "0.7";
  }

  showCustomAlert(`🔐 Checking ${roleLabel} credentials... Please wait.`, 'loading');

  try {
    let endpoint;
    switch (role) {
      case 'individual': endpoint = '/api/individual/signin'; break;
      case 'donor': endpoint = '/api/donor/signin'; break;
      case 'foundation': endpoint = '/api/foundation/signin'; break;
      case 'staff': endpoint = '/api/staff/signin'; break;
      case 'admin': endpoint = '/api/admin/login'; break;
      default:
        removeLoadingAlert();
        showCustomAlert('Unknown role selected', 'error');
        return;
    }

    // All roles send email and password
    const payload = { email: user, password: pass };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse sign-in response as JSON:', parseError);
      data = { success: false, message: 'Server response error' };
    }

    removeLoadingAlert();

    if (response.ok && data.success) {
      if (role === 'individual') {
        localStorage.setItem('individualId', data.individualId);
        localStorage.setItem('individualData', JSON.stringify(data.individualData));
        localStorage.setItem('userType', 'individual');

        showCustomAlert(
          `🎉 <strong>Welcome back, ${data.individualData.personalInfo.firstName}!</strong><br><br>
          Successfully signed in as a <strong>Seeker</strong>.<br><br>
          <small>Redirecting to your profile...</small>`,
          'success',
          3000
        );
        setTimeout(() => window.location.href = 'profileindividual.html', 3000);
        return;
      }

      if (role === 'donor') {
        localStorage.setItem('donorId', data.donorId);
        localStorage.setItem('donorData', JSON.stringify(data.donorData));
        localStorage.setItem('userType', 'donor');
        if (data.donorData && data.donorData.personalInfo) {
          data.donorData.personalInfo.donorId = data.donorId;
        }

        showCustomAlert(
          `🎉 <strong>Welcome back, ${data.donorData.personalInfo.firstName}!</strong><br><br>
          Successfully signed in as a <strong>Donor</strong>.<br><br>
          <small>Redirecting to your profile...</small>`,
          'success',
          3000
        );
        setTimeout(() => window.location.href = 'profiledonor.html', 3000);
        return;
      }

      if (role === 'foundation') {
        localStorage.setItem('foundationId', data.foundationId);
        localStorage.setItem('foundationData', JSON.stringify(data.foundationData));
        localStorage.setItem('userType', 'foundation');

        const name = data.foundationData?.foundationInfo?.foundationName;
        showCustomAlert(
          `🎉 <strong>Welcome back${name ? `, ${name}` : ''}!</strong><br><br>
          Successfully signed in as an <strong>NGO</strong>.<br><br>
          <small>Redirecting to your profile...</small>`,
          'success',
          3000
        );
        setTimeout(() => window.location.href = 'profilefoundation.html', 3000);
        return;
      }

      if (role === 'staff') {
        localStorage.setItem('staffId', data.staffId);
        localStorage.setItem('staffData', JSON.stringify(data.staffData));
        localStorage.setItem('userType', 'staff');

        showCustomAlert(
          `🎉 <strong>Welcome back, ${data.staffData.first_name}!</strong><br><br>
          Successfully signed in as <strong>Volunteer</strong>.<br><br>
          <small>Redirecting to your dashboard...</small>`,
          'success',
          3000
        );
        setTimeout(() => window.location.href = 'staff_profile.html', 3000);
        return;
      }

      if (role === 'admin') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('userType', 'admin');
        showCustomAlert(
          `🎉 <strong>Admin login successful</strong><br><br>
          <small>Redirecting to admin dashboard...</small>`,
          'success',
          2000
        );
        setTimeout(() => window.location.href = 'admin/index.html', 2000);
        return;
      }
    }

    let errorMessage = data && data.message ? data.message : 'Invalid email or password.';
    if (response.status >= 500) errorMessage = 'Server error occurred. Please try again later.';

    showCustomAlert(
      `<strong>Sign In Failed</strong><br><br>
      ${errorMessage}<br><br>
      <small>Make sure you selected the correct role and entered the correct credentials.</small>`,
      'error',
      9000
    );
  } catch (error) {
    console.error('❌ Sign in error:', error);
    removeLoadingAlert();
    showCustomAlert(
      `<strong>Connection Error</strong><br><br>
      Unable to connect to the server. Please try again.<br><br>
      <small>Error: ${error.message}</small>`,
      'error',
      10000
    );
  } finally {
    if (signinBtn) {
      if (buttonTextEl) buttonTextEl.textContent = originalText;
      signinBtn.disabled = false;
      signinBtn.style.opacity = "1";
    }
  }
}

// ...rest of the code remains the same...
// Handle Enter key press and add real-time validation
document.addEventListener('DOMContentLoaded', function() {
  // Pre-fill form from URL parameters (from signup redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledEmail = urlParams.get('email');
  const prefilledRole = urlParams.get('role');
  
  const roleSelect = document.getElementById('role');
  const usernameField = document.getElementById('loginIdentifier');
  
  if (prefilledEmail) {
    if (usernameField) {
      usernameField.value = decodeURIComponent(prefilledEmail);
    }
  }
  
  if (prefilledRole && roleSelect) {
    roleSelect.value = prefilledRole;
    // Trigger change event to update UI
    roleSelect.dispatchEvent(new Event('change'));
  }
  
  // Role-based sign-in wiring
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', handleRoleBasedSignin);
  }

  // Role-based sign-up routing (removes role.html from navigation)
  if (roleSelect) {
    roleSelect.addEventListener('change', () => {
      updateSignupLinkUI();
      updateInputLabelUI();
    });
  }
  updateSignupLinkUI();
  updateInputLabelUI();

  const passwordField = document.getElementById("password");
  
  // Enter key functionality
  if (passwordField) {
    passwordField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        if (form && typeof form.requestSubmit === 'function') {
          form.requestSubmit();
        } else {
          document.getElementById("signin").click();
        }
      }
    });
  }
  
  if (usernameField) {
    usernameField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        if (form && typeof form.requestSubmit === 'function') {
          form.requestSubmit();
        } else {
          document.getElementById("signin").click();
        }
      }
    });
  }

  // Real-time validation feedback for email
  if (usernameField) {
    usernameField.addEventListener('input', function() {
      const value = this.value.trim();
      
      if (value.length > 0 && !isValidEmail(value)) {
        this.style.borderColor = '#d32f2f';
        this.style.boxShadow = '0 0 10px rgba(211, 47, 47, 0.3)';
        this.title = 'Please enter a valid email address';
      } else if (value.length > 0 && isValidEmail(value)) {
        this.style.borderColor = '#176b3a';
        this.style.boxShadow = '0 0 10px rgba(23, 107, 58, 0.3)';
        this.title = 'Email looks good';
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
      const role = getSelectedRole();
      const minLen = role === 'admin' ? 4 : 6;
      if (value.length > 0 && value.length < minLen) {
        this.style.borderColor = '#ff4757';
        this.style.boxShadow = '0 0 10px rgba(255, 71, 87, 0.3)';
        this.title = `Password must be at least ${minLen} characters`;
      } else if (value.length >= minLen) {
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
    /* Custom Alert Styles - Glassmorphism & Modern Look */
.custom-alert {
    position: fixed;
    top: 20px;
    right: -400px;
    width: 380px;
    z-index: 10000;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    font-family: 'Segoe UI', 'Poppins', Arial, sans-serif;
    transition: right 0.3s ease;
    background: #FFFFFF;
    border: 1px solid #E0E0E0;
    color: #333333;
}

.custom-alert.show {
    right: 20px;
}

.custom-alert.hide {
    right: -400px;
}

.custom-alert.success {
    border-left: 4px solid #333333;
}
.custom-alert.error {
    border-left: 4px solid #FF0000;
    color: #000000;
}
.custom-alert.warning {
    border-left: 4px solid #333333;
}
.custom-alert.loading {
    border-left: 4px solid #333333;
}
.custom-alert.info {
    border-left: 4px solid #333333;
}

.alert-content {
    display: flex;
    align-items: flex-start;
    padding: 22px 22px 18px 18px;
    gap: 16px;
    position: relative;
}

.alert-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
    margin-top: 2px;
    color: #333333;
}

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
  color: #0f172a;
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
    color: #0f172a;
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