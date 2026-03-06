// Bangladesh Location Data
const locationData = {
    "Dhaka": {
        "Dhaka": ["Adabor", "Banani", "Dakshin Khan", "Dhanmondi", "Gulshan", "Jatrabari", "Kafrul", "Kamalapur", "Kawran Bazar", "Khilgaon", "Kotwali", "Krishnanagar", "Mirpur", "Mohakali", "Motijheel", "Mugda", "Paltan", "Pallabi", "Ramna", "Rampura", "Sadarbazar", "Sangu", "Shabag", "Shahbag", "Shantinagar", "Siddeshwari", "Sutrapur", "Tejgaon", "Uttara"],
        "Faridpur": ["Alfadanga", "Bhanga", "Boalmari", "Charabhagi", "Faridpur Sadar", "Madaripur", "Nagarkanda", "Sadarpur"],
        "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
        "Manikganj": ["Ghatail", "Haripur", "Manikganj Sadar", "Saturia", "Shibalaya", "Tangail City"],
        "Munshiganj": ["Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sripur", "Tongibari"],
        "Narayanganj": ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"],
        "Narsingdi": ["Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur"],
        "Tangail": ["Basail", "Delduar", "Ghatail", "Gopalpur", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar", "Tutinj", "Varua"]
    },
    "Chattogram": {
        "Chattogram": ["Akber Shah", "Andermani", "Anwara", "Baizid", "Banasree", "Bayazid", "Begunbari", "Bayazid", "Chawkbazar", "Chandgaon", "Halishahar", "Hathazari", "Kamrangirchar", "Kotwali", "Labanchra", "Lohagara", "Mirsharai", "Nasirabad", "Pahartali", "Patanga", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"],
        "Bandarban": ["Lama", "Naikhongchari", "Rakhine", "Rangunia", "Rowangchhari", "Thanchi"],
        "Cox's Bazar": ["Chakaria", "Chhimichhari", "Cox's Bazar Sadar", "Kutubdia", "Maheshkhali", "Matarbari", "Ramu", "Teknaf", "Ukhia"],
        "Feni": ["Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Fulgazi", "Parshuram", "Sonagazi"],
        "Khagrachari": ["Dighinala", "Khagrachari Sadar", "Laksmipur", "Mahalchhari", "Manikchhari", "Panchhari", "Ramgarh"],
        "Lakshmipur": ["Kamalnagar", "Lakshmipur Sadar", "Raipur", "Ramgati", "Ramganj"],
        "Noakhali": ["Begumganj", "Chatkhil", "Companiganj", "Jhalokati", "Jhapatali", "Noakhali Sadar", "Senbag", "Subarnachar"]
    },
    "Barishal": {
        "Barishal": ["Barisal Sadar", "Gournadi", "Hizla", "Muladi", "Mehalchandra", "Bakerganj", "Banari"],
        "Bhola": ["Bhola Sadar", "Burhanuddin", "Charfesson", "Daulkando", "Tazumuddin"],
        "Jhalokati": ["Jhalokati Sadar", "Kathalia", "Rajaiganj"],
        "Pirojpur": ["Bhandaria", "Kawkhali", "Mathbaria", "Nesarabad", "Pirojpur Sadar", "Zianagar"]
    },
    "Khulna": {
        "Khulna": ["Batiaghata", "Dacope", "Dumuria", "Khulna Sadar", "Koyra", "Terkhada"],
        "Bagerhat": ["Bagerhat Sadar", "Chitalia", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Sarankhola"],
        "Chuadanga": ["Chuadanga Sadar", "Damurhuda", "Jibannagar"],
        "Jessore": ["Abhaynagar", "Barisal", "Jessore Sadar", "Jhikargacha", "Keshabpur", "Manirampur", "Sharsha"],
        "Jhenaidah": ["Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Manirampur", "Shailkupa", "Singra"]
    },
    "Rajshahi": {
        "Rajshahi": ["Bogra", "Boalia", "Durgapur", "Godagari", "Kahalu", "Mohanpur", "Paba", "Rajshahi Sadar", "Tanore"],
        "Bogra": ["Adamdighi", "Bogra Sadar", "Dhunat", "Dupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Shajahanpur", "Sherpur", "Shibganj", "Sonatola"],
        "Joypurhat": ["Akkelpur", "Joypurhat Sadar", "Kalihati", "Khetlal", "Panchbibi"],
        "Naogaon": ["Atrai", "Badalgachh", "Dhamrai", "Manda", "Naogaon Sadar", "Patnitala", "Raninagar", "Sapahar"],
        "Natore": ["Bagatipara", "Gurudaspur", "Lalpur", "Natore Sadar", "Singra"],
        "Nawabganj": ["Atwari", "Nawabganj Sadar", "Sharsha", "Sonimari"],
        "Pabna": ["Pabna Sadar", "Satkhira", "Sujanagar"]
    },
    "Rangpur": {
        "Dinajpur": ["Biral", "Birganj", "Hakimpur", "Kaharole", "Khansama", "Dinajpur Sadar", "Parbatipur"],
        "Gaibandha": ["Fulchhari", "Gaibandha Sadar", "Palashbari", "Sadullahpur", "Saghata", "Sughatta"],
        "Kurigram": ["Bhurungamari", "Charltonpur", "Kurigram Sadar", "Nageshwari", "Raiganj", "Rowmari", "Ulipur"],
        "Lalmonirhat": ["Aditmari", "Hatibandha", "Jaintiapur", "Lalmonirhat Sadar", "Patgram"],
        "Nilphamari": ["Domar", "Joypur", "Kishoreganj", "Nilphamari Sadar", "Saidpur"],
        "Pandchagarh": ["Debiganj", "Panchagarh Sadar", "Tetulia"],
        "Rangpur": ["Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirganj", "Pirgacha", "Rangpur Sadar", "Taraganj"],
        "Thakurgaon": ["Pirganj", "Thakurgaon Sadar", "Ullapara"]
    },
    "Mymensingh": {
        "Mymensingh": ["Ananda Bazar", "Bhaluka", "Durnsingh", "Fulbaria", "Gauripur", "Jamalpur", "Mymensingh Sadar", "Nandail", "Fulpur"],
        "Jamalpur": ["Bakhargunj", "Islampur", "Jamalpur Sadar", "Madarganj", "Melandaha", "Sarisab"],
        "Kishoreganj": ["Astagram", "Bhairab", "Hosainpur", "Kishoreganj Sadar", "Kotiadi", "Kuliarchar", "Mithamain", "Pakundia"],
        "Netrokona": ["Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Netrokona Sadar", "Purbadhala"]
    },
    "Sylhet": {
        "Sylhet": ["Balaganj", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Jaintiapur", "Sylhet Sadar", "Sunamganj"],
        "Habiganj": ["Ajmiriganj", "Bahubal", "Chunarughat", "Habiganj Sadar", "Lakhai", "Madhabpur", "Nabiganj"],
        "Moulvibazar": ["Barlekha", "Kulaura", "Moulvibazar Sadar", "Rajnagar", "Sreemangal"],
        "Sunamganj": ["Bishwamvarpur", "Chhatak", "Dharampasha", "Dowarabazar", "Jagannathpur", "Sunamganj Sadar", "Tahirpur"]
    }
};

// Division to Districts mapping (for initial District population)
const divisiontoDistricts = {
    "Dhaka": ["Dhaka", "Faridpur", "Gazipur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Tangail"],
    "Chattogram": ["Chattogram", "Bandarban", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali"],
    "Barishal": ["Barishal", "Bhola", "Jhalokati", "Pirojpur"],
    "Khulna": ["Khulna", "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah"],
    "Rajshahi": ["Rajshahi", "Bogra", "Joypurhat", "Naogaon", "Natore", "Nawabganj", "Pabna"],
    "Rangpur": ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Pandchagarh", "Rangpur", "Thakurgaon"],
    "Mymensingh": ["Mymensingh", "Jamalpur", "Kishoreganj", "Netrokona"],
    "Sylhet": ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"]
};

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

// Custom alert function (toaster style)
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

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        alertContainer.classList.remove('show');
        setTimeout(() => alertContainer.remove(), 300);
      }, duration);
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

    // Choose icon based on type
    let icon;
    if (type === 'success') {
        icon = '<i class="fas fa-check-circle"></i>';
    } else {
        icon = '<i class="fas fa-exclamation-circle"></i>';
    }

    alert.innerHTML = `
        ${icon}
        <span>${message.replace(/\n/g, '<br>')}</span>
        <button class="alert-close" onclick="closeAlert(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(alert);

    // Animate in
    setTimeout(() => {
        alert.classList.add('show');
    }, 10);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 400);
        }
    }, 5000);
}

function closeAlert(button) {
    button.closest('.message').remove();
}

// Cascading dropdown handlers
function handleDivisionChange() {
    const divisionSelect = document.getElementById('division');
    const districtSelect = document.getElementById('district');
    const areaSelect = document.getElementById('area');
    
    const selectedDivision = divisionSelect.value;
    
    // Clear and disable district select
    districtSelect.innerHTML = '<option value="" disabled selected>Select District</option>';
    districtSelect.disabled = true;
    
    // Clear and disable area select
    areaSelect.innerHTML = '<option value="" disabled selected>Select Area</option>';
    areaSelect.disabled = true;
    
    if (selectedDivision && divisiontoDistricts[selectedDivision]) {
        // Populate districts
        const districts = divisiontoDistricts[selectedDivision];
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
        districtSelect.disabled = false;
    }
}

function handleDistrictChange() {
    const divisionSelect = document.getElementById('division');
    const districtSelect = document.getElementById('district');
    const areaSelect = document.getElementById('area');
    
    const selectedDivision = divisionSelect.value;
    const selectedDistrict = districtSelect.value;
    
    // Clear and disable area select
    areaSelect.innerHTML = '<option value="" disabled selected>Select Area</option>';
    areaSelect.disabled = true;
    
    if (selectedDivision && selectedDistrict && locationData[selectedDivision] && locationData[selectedDivision][selectedDistrict]) {
        // Populate areas
        const areas = locationData[selectedDivision][selectedDistrict];
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            areaSelect.appendChild(option);
        });
        areaSelect.disabled = false;
    }
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
    { id: 'division', name: 'Division' },
    { id: 'district', name: 'District' },
    { id: 'area', name: 'Area' },
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
  formData.append('division', document.getElementById('division').value);
  formData.append('district', document.getElementById('district').value);
  formData.append('area', document.getElementById('area').value);
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
      showCustomAlert(
        `✅ Foundation registration successful!<br><br>
        Your registration is under review.<br><br>
        You will receive a confirmation email once approved.`,
        'success',
        4000
      );
      // Redirect to homepage after a delay
      setTimeout(() => {
        window.location.href = 'homepage.html';
      }, 4000);
    } else {
      showCustomAlert(data.message || '❌ Registration failed', 'error', 5000);
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
  // Division change event
  const divisionSelect = document.getElementById('division');
  if (divisionSelect) {
    divisionSelect.addEventListener('change', handleDivisionChange);
  }
  
  // District change event
  const districtSelect = document.getElementById('district');
  if (districtSelect) {
    districtSelect.addEventListener('change', handleDistrictChange);
  }
  
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