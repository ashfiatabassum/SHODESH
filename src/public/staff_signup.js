// SHODESH Staff Registration - Modern JavaScript with Backend Integration

document.addEventListener('DOMContentLoaded', function() {
    // Debug: Confirm JS loaded
    console.log('staff_signup.js loaded');
    initializeDistricts();
    initializePasswordToggle();

    const form = document.getElementById('staffSignupForm');
    if (!form) {
        alert('Staff signup form not found!');
        return;
    }
    form.addEventListener('submit', validateAndSubmit);
});

function initializeDistricts() {
    const districtSelect = document.getElementById('district');
    if (!districtSelect) return;
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
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
}

function initializePasswordToggle() {
    // Already handled by HTML onclick
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.parentElement.querySelector('.toggle-password i');
    if (field.type === 'password') {
        field.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        button.className = 'fas fa-eye';
    }
}

async function validateAndSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('staffSignupForm');
    const msg = document.getElementById('messageContainer');
    msg.innerHTML = '';

    // Debug: Log form submission
    console.log('Submitting staff signup form');

    // Basic required fields check
    const requiredFields = [
        'first_name', 'last_name', 'username', 'email', 'mobile', 'nid', 'dob',
        'house_no', 'road_no', 'area', 'district', 'administrative_div', 'zip', 'password', 'confirmPassword'
    ];
    for (let field of requiredFields) {
        if (!form[field] || !form[field].value.trim()) {
            showCustomAlert(`${field.replace(/_/g, ' ')} is required`, 'error');
            if (form[field]) form[field].focus();
            return;
        }
    }
    if (form.password.value !== form.confirmPassword.value) {
        showCustomAlert('Passwords do not match', 'error');
        form.confirmPassword.focus();
        return;
    }
    if (!form.cv.files[0]) {
        showCustomAlert('Please upload your CV.', 'error');
        return;
    }
    if (form.cv.files[0].size > 5 * 1024 * 1024) {
        showCustomAlert('CV file must be less than 5MB.', 'error');
        return;
    }

    // Prepare FormData
    const formData = new FormData(form);

    // Debug: Log FormData keys
    for (let key of formData.keys()) {
        console.log('FormData:', key, formData.get(key));
    }

    // Show loading
    showCustomAlert('🔄 Registering your account... Please wait.', 'loading');

    try {
        const response = await fetch('/api/staff/signup', {
            method: 'POST',
            body: formData
        });
        // Debug: Log response status
        console.log('Fetch response status:', response.status);
        const data = await response.json();

        removeLoadingAlert();

        if (response.ok && data.success) {
            showCustomAlert(
                `🎉 <strong>Registration Successful!</strong><br><br>
                Your Staff ID: <strong>${data.staffId}</strong><br><br>
                <small>Awaiting admin verification.</small>`,
                'success', 4000
            );
            form.reset();
            setTimeout(() => {
        window.location.href = 'staff_profile.html';
    }, 2500);
        } else {
            showCustomAlert(data.message || 'Signup failed. Please try again.', 'error');
        }
    } catch (err) {
        removeLoadingAlert();
        showCustomAlert('Server error. Please try again later.', 'error');
        // Debug: Log error
        console.error('Fetch error:', err);
    }
}

// --- Custom Alert Functions (unchanged) ---
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

// Add CSS for alerts if not present
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