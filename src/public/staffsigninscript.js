// Custom alert function (reuse from staff_signup.js)
function showCustomAlert(message, type = 'info', duration = 5000) {
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());

    const alertContainer = document.createElement('div');
    alertContainer.className = `custom-alert ${type}`;

    let icon;
    switch(type) {
        case 'success': icon = '✅'; break;
        case 'error': icon = '❌'; break;
        case 'warning': icon = '⚠️'; break;
        case 'loading': icon = '⏳'; break;
        case 'info': default: icon = 'ℹ️'; break;
    }

    alertContainer.innerHTML = `
        <div class="alert-content">
            <div class="alert-icon">${icon}</div>
            <div class="alert-message">${message}</div>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="alert-progress"></div>
    `;

    document.body.appendChild(alertContainer);

    setTimeout(() => {
        alertContainer.classList.add('show');
    }, 10);

    if (type !== 'loading') {
        setTimeout(() => {
            alertContainer.classList.add('hide');
            setTimeout(() => {
                if (alertContainer.parentNode) {
                    alertContainer.remove();
                }
            }, 300);
        }, duration);

        const progressBar = alertContainer.querySelector('.alert-progress');
        progressBar.style.animation = `progress ${duration}ms linear`;
    }
    return alertContainer;
}

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

// Debug: Confirm JS loaded
console.log('staffsigninscript.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById("staffLoginForm");
    if (!form) {
        alert('Staff login form not found!');
        return;
    }
    form.addEventListener("submit", handleStaffSignin);
});

async function handleStaffSignin(e) {
    e.preventDefault();
    const user = document.getElementById("staffUsername").value.trim();
    const pass = document.getElementById("staffPassword").value.trim();

    // Debug: Log input values
    console.log('Staff Signin Attempt:', { user, pass });

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

    const signinBtn = document.getElementById("staffSignin");
    const originalText = signinBtn.textContent;
    signinBtn.textContent = "Signing in...";
    signinBtn.disabled = true;
    signinBtn.style.opacity = "0.7";

    showCustomAlert('🔐 Verifying your credentials... Please wait.', 'loading');

    try {
        // Debug: Log fetch about to be sent
        console.log('Sending POST /api/staff/signin', { username: user, password: pass });

        const response = await fetch('/api/staff/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        // Debug: Log response status
        console.log('Fetch response status:', response.status);

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            data = { success: false, message: 'Server response error' };
            console.error('Response JSON parse error:', parseError);
        }

        removeLoadingAlert();

        // Debug: Log response data
        console.log('Fetch response data:', data);

        if (response.ok && data.success) {
            // Store staff data in localStorage
            localStorage.setItem('staffId', data.staffId);
            localStorage.setItem('staffData', JSON.stringify(data.staffData));
            localStorage.setItem('userType', 'staff');

            showCustomAlert(
                `🎉 <strong>Welcome back, ${data.staffData.first_name}!</strong><br><br>
                Successfully signed in as <strong>Staff</strong>.<br><br>
                <small>Redirecting to your dashboard...</small>`,
                'success',
                3000
            );

            setTimeout(() => {
                window.location.href = 'staff_profile.html';
            }, 3000);
            return;
        }

        let errorMessage = data.message || 'Invalid username or password.';
        if (response.status >= 500) {
            errorMessage = 'Server error occurred. Please try again later.';
        }

        showCustomAlert(
            `<strong>Sign In Failed</strong><br><br>
            ${errorMessage}<br><br>
            <small>Make sure your staff account is verified and you are using the correct credentials.</small>`,
            'error',
            8000
        );
    } catch (error) {
        removeLoadingAlert();
        showCustomAlert(
            `<strong>Connection Error</strong><br><br>
            Unable to connect to the server. Please check your internet connection and try again.<br><br>
            <small>Error: ${error.message}</small>`,
            'error',
            10000
        );
        // Debug: Log fetch error
        console.error('Fetch error:', error);
    } finally {
        signinBtn.textContent = originalText;
        signinBtn.disabled = false;
        signinBtn.style.opacity = "1";
    }
}

// Add CSS for alerts if not present (copy from staff_signup.js)
if (!document.querySelector('style[data-alert]')) {
    const customStyles = document.createElement('style');
    customStyles.setAttribute('data-alert', 'true');
    customStyles.textContent = `
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
        .custom-alert.show { right: 20px; transform: translateY(0); }
        .custom-alert.hide { right: -400px; opacity: 0; }
        .custom-alert.success { background: linear-gradient(135deg, #2ed573, #17c0eb); color: white; }
        .custom-alert.error { background: linear-gradient(135deg, #ff4757, #ff3838); color: white; }
        .custom-alert.warning { background: linear-gradient(135deg, #ffa502, #ff6348); color: white; }
        .custom-alert.loading { background: linear-gradient(135deg, #5f27cd, #341f97); color: white; }
        .custom-alert.info { background: linear-gradient(135deg, #3742fa, #2f3542); color: white; }
        .alert-content { display: flex; align-items: flex-start; padding: 20px; gap: 15px; position: relative; }
        .alert-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
        .custom-alert.loading .alert-icon { animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .alert-message { flex: 1; font-size: 14px; line-height: 1.5; font-weight: 500; }
        .alert-close { background: none; border: none; color: inherit; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background-color 0.2s; flex-shrink: 0; }
        .alert-close:hover { background-color: rgba(255, 255, 255, 0.2); }
        .custom-alert.loading .alert-close { display: none; }
        .alert-progress { height: 3px; background: rgba(255, 255, 255, 0.3); position: relative; overflow: hidden; }
        .alert-progress::before { content: ''; position: absolute; top: 0; left: 0; height: 100%; background: rgba(255, 255, 255, 0.7); width: 100%; }
        .custom-alert.loading .alert-progress { display: none; }
        @keyframes progress { from { width: 100%; } to { width: 0%; }
        }
        @media (max-width: 480px) {
            .custom-alert { right: -100%; width: calc(100% - 40px); }
            .custom-alert.show { right: 20px; }
        }
    `;
    document.head.appendChild(customStyles);
}