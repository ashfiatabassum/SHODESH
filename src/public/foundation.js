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
  
  // If there are empty fields, show alert and return
  if (emptyFields.length > 0) {
    alert('Please fill in all required fields:\n\n• ' + emptyFields.join('\n• '));
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
    alert('Please fix the following errors:\n\n• ' + validationErrors.join('\n• '));
    return false;
  }
  
  // If all validations pass, redirect to success page
  alert('Registration successful! All information is valid.');
  window.location.href = 'success.html';
  return false; // Prevent actual form submission
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
// Beautiful loading overlay function
function createLoadingOverlay(actionName) {
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(45deg, 
            rgba(74, 151, 130, 0.9) 0%, 
            rgba(175, 62, 62, 0.9) 50%,
            rgba(74, 151, 130, 0.9) 100%
        );
        background-size: 400% 400%;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        animation: overlayFadeIn 0.5s ease-out, gradientShift 3s ease-in-out infinite;
    `;
    
    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.style.cssText = `
        color: white;
        font-size: 3vw;
        font-weight: 700;
        font-family: "Roboto Condensed", Helvetica, sans-serif;
        animation: loadingPulse 1s ease-in-out infinite;
        margin-bottom: 20px;
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
    `;
    loadingText.textContent = `${actionName}...`;
    
    // Create animated dots
    const dotsContainer = document.createElement('div');
    dotsContainer.style.cssText = `
        display: flex;
        gap: 10px;
    `;
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            width: 15px;
            height: 15px;
            background: white;
            border-radius: 50%;
            animation: dotBounce 1.4s ease-in-out infinite;
            animation-delay: ${i * 0.2}s;
        `;
        dotsContainer.appendChild(dot);
    }
    
    // Create spinning loader
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-top: 30px;
    `;
    
    overlay.appendChild(loadingText);
    overlay.appendChild(dotsContainer);
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    
    // Add animation styles if they don't exist
    if (!document.querySelector('#loading-animations')) {
        const style = document.createElement('style');
        style.id = 'loading-animations';
        style.textContent = `
            @keyframes overlayFadeIn {
                0% { opacity: 0; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1); }
            }
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            @keyframes loadingPulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.05); }
            }
            @keyframes dotBounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}
