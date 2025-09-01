// Password toggle function
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.parentNode.querySelector('.toggle-password');
    const icon = button.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Message display functions
function showSuccess(message) {
    showAlert(message, 'success');
}

function showError(message) {
    showAlert(message, 'error');
}

function showAlert(message, type) {
    const container = document.getElementById('messageContainer');
    
    const alert = document.createElement('div');
    alert.className = `message ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    
    alert.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button class="alert-close" onclick="closeAlert(this)" style="background: none; border: none; color: inherit; margin-left: 10px; cursor: pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

function closeAlert(button) {
    button.closest('.message').remove();
}

function validateForm(event) {
  event.preventDefault(); // Prevent default form submission
  
  // Get all required fields
  const fields = [
    { id: 'foundationName', name: 'Foundation Name' },
    { id: 'email', name: 'Email' },
    { id: 'phone', name: 'Phone Number' },
    { id: 'houseNo', name: 'House No.' },
    { id: 'roadNo', name: 'Road No.' },
    { id: 'area', name: 'Area' },
    { id: 'district', name: 'District' },
    { id: 'division', name: 'Division' },
    { id: 'zipCode', name: 'Zip Code' },
    { id: 'bkash', name: 'Bkash Number' },
    { id: 'bankAccount', name: 'Bank Account Number' },
    { id: 'foundationLicense', name: 'Foundation License' },
    { id: 'password', name: 'Password' },
    { id: 'confirmPassword', name: 'Confirm Password' }
  ];
  
  let emptyFields = [];
  let validationErrors = [];
  
  // Check each field for empty values
  fields.forEach(field => {
    const element = document.getElementById(field.id);
    if (!element.value.trim()) {
      emptyFields.push(field.name);
    }
  });
  
  // Check if certificate file is uploaded
  const certificateFile = document.getElementById('certificate');
  if (!certificateFile.files.length) {
    emptyFields.push('Certificate (PDF file)');
  }
  
  // If there are empty fields, show error message and return
  if (emptyFields.length > 0) {
    showError('Please fill in all required fields:\n\n• ' + emptyFields.join('\n• '));
    return false;
  }
  
  // Now validate formats (only if fields are not empty)
  
  // 1. Validate Phone Number (11 digits)
  const phone = document.getElementById('phone').value.trim();
  if (!/^\d{11}$/.test(phone)) {
    validationErrors.push('Phone Number must be exactly 11 digits');
  }
  
  // 2. Validate Bkash Number (11 digits)
  const bkash = document.getElementById('bkash').value.trim();
  if (!/^\d{11}$/.test(bkash)) {
    validationErrors.push('Bkash Number must be exactly 11 digits');
  }
  
  // 3. Validate Email format
  const email = document.getElementById('email').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    validationErrors.push('Email must be in correct format (example@domain.com)');
  }
  
  // 4. Validate Zip Code (numbers only)
  const zipCode = document.getElementById('zipCode').value.trim();
  if (!/^\d+$/.test(zipCode)) {
    validationErrors.push('Zip Code must contain only numbers');
  }
  
  // 5. Check if passwords match
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  if (password !== confirmPassword) {
    validationErrors.push('Password and Confirm Password must match');
  }
  
  // 6. Validate password length (minimum 6 characters)
  if (password.length < 6) {
    validationErrors.push('Password must be at least 6 characters long');
  }
  
  // 7. Validate file type
  const file = certificateFile.files[0];
  if (file && file.type !== 'application/pdf') {
    validationErrors.push('Certificate must be a PDF file');
  }
  
  // If there are validation errors, show them
  if (validationErrors.length > 0) {
    showError('Please fix the following errors:\n\n• ' + validationErrors.join('\n• '));
    return false;
  }
  
  // If all validations pass, submit to backend
  console.log('🚀 Sending foundation registration request...');
  
  // Prepare form data for file upload
  const formData = new FormData();
  formData.append('foundationName', document.getElementById('foundationName').value.trim());
  formData.append('certificate', document.getElementById('certificate').files[0]);
  formData.append('foundationLicense', document.getElementById('foundationLicense').value.trim());
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('houseNo', document.getElementById('houseNo').value.trim());
  formData.append('roadNo', document.getElementById('roadNo').value.trim());
  formData.append('area', document.getElementById('area').value.trim());
  formData.append('district', document.getElementById('district').value);
  formData.append('division', document.getElementById('division').value);
  formData.append('zipCode', zipCode);
  formData.append('bkash', bkash);
  formData.append('bankAccount', document.getElementById('bankAccount').value.trim());
  formData.append('description', document.getElementById('description').value.trim());
  formData.append('password', password);

  // Send data to backend
  fetch('/api/foundation/register', {
    method: 'POST',
    body: formData // Don't set Content-Type, let browser set it for FormData
  })
  .then(response => {
    console.log('📡 Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📋 Response data:', data);
    if (data.success) {
      showSuccess('🎉 Foundation registration successful!\n\n' + 
            'Your Foundation ID is: ' + data.foundationId + '\n\n' +
            data.message + '\n\n' +
            'Please save your Foundation ID for future reference.');
      // Redirect to profile or success page
      setTimeout(() => {
        window.location.href = 'profilefoundation.html';
      }, 3000);
    } else {
      showError('❌ Registration failed: ' + data.message);
    }
  })
  .catch(error => {
    console.error('❌ Error:', error);
    showError('❌ An error occurred during registration. Please try again.\n\nError: ' + error.message);
  });

  return false; // Prevent default form submission
}

// Add real-time validation feedback
document.addEventListener('DOMContentLoaded', function() {
  // File input feedback
  const fileInput = document.getElementById('certificate');
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      const fileName = e.target.files[0] ? e.target.files[0].name : 'No file selected';
      console.log('Selected file:', fileName);
    });
  }
  
  // Phone number validation (real-time)
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      // Remove non-digits
      e.target.value = e.target.value.replace(/\D/g, '');
      // Limit to 11 digits
      if (e.target.value.length > 11) {
        e.target.value = e.target.value.slice(0, 11);
      }
    });
  }
  
  // Bkash number validation (real-time)
  const bkashInput = document.getElementById('bkash');
  if (bkashInput) {
    bkashInput.addEventListener('input', function(e) {
      // Remove non-digits
      e.target.value = e.target.value.replace(/\D/g, '');
      // Limit to 11 digits
      if (e.target.value.length > 11) {
        e.target.value = e.target.value.slice(0, 11);
      }
    });
  }
  
  // Zip code validation (real-time)
  const zipInput = document.getElementById('zipCode');
  if (zipInput) {
    zipInput.addEventListener('input', function(e) {
      // Remove non-digits
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }
  
  // Password confirmation feedback
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const passwordInput = document.getElementById('password');
  if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener('input', function() {
      if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordInput.style.borderColor = '#dc3545'; // Red border
      } else {
        confirmPasswordInput.style.borderColor = '#28a745'; // Green border
      }
    });
  }
});
