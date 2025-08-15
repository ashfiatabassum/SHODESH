// Check if individual data exists in localStorage or fetch from server
let individualData = {};

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeIndividualData();
});

async function initializeIndividualData() {
  try {
    // Check if individual data is available in localStorage (from recent signin)
    const storedIndividualData = localStorage.getItem('individualData');
    const storedIndividualId = localStorage.getItem('individualId');
    
    console.log('🔍 Checking stored data...');
    console.log('Stored individualData:', storedIndividualData);
    console.log('Stored individualId:', storedIndividualId);
    
    if (storedIndividualData) {
      // Use stored data from recent signin
      individualData = JSON.parse(storedIndividualData);
      console.log('📋 Using stored individual data:', individualData);
      
      // Load the profile with actual data
      loadIndividualProfile();
      loadHelpRequests();
      loadReceivedDonations();
      calculateStats();
      animateCards();
      
    } else if (storedIndividualId) {
      // Fetch data from server using individual ID
      console.log('📡 Fetching data from server for ID:', storedIndividualId);
      
      const response = await fetch(`/api/individual/profile/${storedIndividualId}`);
      const result = await response.json();
      
      if (result.success) {
        individualData = result.individualData;
        console.log('📋 Fetched individual data from server:', individualData);
        
        // Load the profile with fetched data
        loadIndividualProfile();
        loadHelpRequests();
        loadReceivedDonations();
        calculateStats();
        animateCards();
        
      } else {
        throw new Error(result.message);
      }
    } else {
      // No individual data found - use default data instead of redirecting
      console.log('⚠️ No individual data found, using default data');
      individualData = getDefaultIndividualData();
      
      // Load the profile with default data
      loadIndividualProfile();
      loadHelpRequests();
      loadReceivedDonations();
      calculateStats();
      animateCards();
    }
    
  } catch (error) {
    console.error('❌ Error loading individual data:', error);
    // Use default data instead of redirecting to signin
    console.log('📋 Using default individual data due to error');
    individualData = getDefaultIndividualData();
    
    // Load the profile with default data
    loadIndividualProfile();
    loadHelpRequests();
    loadReceivedDonations();
    calculateStats();
    animateCards();
  }
}

function getDefaultIndividualData() {
  return {
    personalInfo: {
      firstName: "New",
      lastName: "Individual",
      email: "individual@email.com",
      phoneNumber: "+880 XXXX-XXXXXX",
      nidNumber: "XXXXXXXXXX",
      dateOfBirth: "1990-01-01",
      memberSince: "2024"
    },
    address: {
      houseNo: "Not provided",
      roadNo: "Not provided",
      area: "Not provided",
      district: "Not provided",
      division: "Not provided",
      zipCode: "Not provided"
    },
    financial: {
      bkashNumber: "+880 XXXX-XXXXXX",
      bankAccount: "Not provided"
    },
    helpRequests: [],
    receivedDonations: []
  };
}

// Load individual profile with data
function loadIndividualProfile() {
  console.log('🔄 Loading individual profile with data:', individualData);
  
  if (!individualData || !individualData.personalInfo) {
    console.error('❌ No individual data available for profile');
    return;
  }

  const { personalInfo, address, financial } = individualData;

  // Update header - check if elements exist
  const individualNameEl = document.getElementById('individualName');
  const individualEmailEl = document.getElementById('individualEmail');
  const memberSinceEl = document.getElementById('memberSince');
  
  if (individualNameEl) {
    individualNameEl.textContent = `${personalInfo.firstName} ${personalInfo.lastName}`;
  }
  if (individualEmailEl) {
    individualEmailEl.textContent = personalInfo.email;
  }
  if (memberSinceEl) {
    memberSinceEl.textContent = personalInfo.memberSince;
  }
  
  // Update personal info section safely with separate phone and NID
  const personalInfoElements = {
    'firstName': personalInfo.firstName,
    'lastName': personalInfo.lastName,
    'email': personalInfo.email,
    'phoneNumber': personalInfo.phoneNumber,
    'nidNumber': personalInfo.nidNumber,
    'dateOfBirth': formatDate(personalInfo.dateOfBirth)
  };
  
  Object.entries(personalInfoElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value || '-';
    } else {
      console.warn(`⚠️ Element with ID '${id}' not found`);
    }
  });
  
  // Update address info safely
  if (address) {
    const addressElements = {
      'houseNo': address.houseNo,
      'roadNo': address.roadNo,
      'area': address.area,
      'district': address.district,
      'division': address.division,
      'zipCode': address.zipCode
    };
    
    Object.entries(addressElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value || '-';
      } else {
        console.warn(`⚠️ Element with ID '${id}' not found`);
      }
    });
    
    // Update address for map (without "Complete Address" heading)
    const fullAddress = `${address.houseNo || '-'}, ${address.roadNo || '-'}, ${address.area || '-'}, ${address.district || '-'}, ${address.division || '-'} - ${address.zipCode || '-'}`;
    const addressForMapEl = document.getElementById('addressForMap');
    
    if (addressForMapEl) {
      addressForMapEl.textContent = fullAddress;
    }
  }
  
  // Update financial info safely
  if (financial) {
    const bkashEl = document.getElementById('bkashNumber');
    const bankAccountEl = document.getElementById('bankAccount');
    
    if (bkashEl) {
      bkashEl.textContent = financial.bkashNumber || '-';
    }
    if (bankAccountEl) {
      bankAccountEl.textContent = financial.bankAccount || '-';
    }
  }
  
  console.log('✅ Individual profile loaded successfully');
}

// Load help requests
function loadHelpRequests() {
  const helpRequestsList = document.getElementById('requestsList');
  if (!helpRequestsList) {
    console.warn('⚠️ requestsList element not found');
    return;
  }
  
  helpRequestsList.innerHTML = '';
  
  if (!individualData.helpRequests || individualData.helpRequests.length === 0) {
    helpRequestsList.innerHTML = `
      <div class="no-requests">
        <i class="fas fa-hand-holding-heart"></i>
        <p>No help requests yet. Create your first request to start receiving donations!</p>
        <button class="create-request-btn" onclick="requestHelp()">Create Help Request</button>
      </div>
    `;
    return;
  }
  
  individualData.helpRequests.forEach(request => {
    const requestItem = document.createElement('div');
    requestItem.className = 'request-item';
    requestItem.innerHTML = `
      <div class="request-info">
        <div class="request-title">${request.title}</div>
        <div class="request-description">${request.description}</div>
        <div class="request-amount">Target: ৳${request.targetAmount.toLocaleString()}</div>
      </div>
      <div class="request-status">
        <div class="status-badge ${request.status}">${request.status}</div>
        <div class="request-date">${formatDate(request.dateCreated)}</div>
      </div>
    `;
    helpRequestsList.appendChild(requestItem);
  });
}

// Load received donations
function loadReceivedDonations() {
  const donationsList = document.getElementById('donationsList');
  if (!donationsList) {
    console.warn('⚠️ donationsList element not found');
    return;
  }
  
  donationsList.innerHTML = '';
  
  if (!individualData.receivedDonations || individualData.receivedDonations.length === 0) {
    donationsList.innerHTML = `
      <div class="no-donations">
        <i class="fas fa-heart"></i>
        <p>No donations received yet. Share your help requests to start receiving support!</p>
      </div>
    `;
    return;
  }
  
  individualData.receivedDonations.forEach(donation => {
    const donationItem = document.createElement('div');
    donationItem.className = 'donation-item';
    donationItem.innerHTML = `
      <div class="donation-info">
        <div class="donation-title">From: ${donation.donorName}</div>
        <div class="donation-details">${donation.message || 'No message'}</div>
      </div>
      <div class="donation-meta">
        <div class="donation-amount">৳${donation.amount.toLocaleString()}</div>
        <div class="donation-date">${formatDate(donation.date)}</div>
      </div>
    `;
    donationsList.appendChild(donationItem);
  });
}

// Calculate stats
function calculateStats() {
  const totalRequests = individualData.helpRequests ? individualData.helpRequests.length : 0;
  const totalReceived = individualData.receivedDonations ? 
    individualData.receivedDonations.reduce((sum, d) => sum + d.amount, 0) : 0;
  const activeRequests = individualData.helpRequests ? 
    individualData.helpRequests.filter(r => r.status === 'active').length : 0;
  
  // Safely update stats elements
  const statsElements = {
    'totalRequests': totalRequests,
    'totalReceived': '৳' + totalReceived.toLocaleString(),
    'activeRequests': activeRequests
  };
  
  Object.entries(statsElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    } else {
      console.warn(`⚠️ Stats element with ID '${id}' not found`);
    }
  });
}

// Function to show address on map
function showMap() {
  if (!individualData || !individualData.address) {
    showCustomAlert('Address information not available', 'warning');
    return;
  }
  
  const { address } = individualData;
  const fullAddress = `${address.houseNo}, ${address.roadNo}, ${address.area}, ${address.district}, ${address.division}, Bangladesh`;
  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(fullAddress)}`;
  
  // Open in new tab
  window.open(googleMapsUrl, '_blank');
  showCustomAlert(`Opening your address on Google Maps...`, 'info');
}

// Functions for button actions
function editIndividual() {
  showCustomAlert('Profile editing feature coming soon!', 'info');
}

function requestHelp() {
  showCustomAlert('Help request feature coming soon!', 'info');
}

function goHome() {
  if (confirm('Are you sure you want to go back to the home page?')) {
    window.location.href = 'index.html';
  }
}

function toggleCard(cardId) {
  const card = document.getElementById(cardId);
  if (!card) return;
  
  const toggleBtn = card.parentElement.querySelector('.toggle-btn i');
  
  if (card.style.display === 'none') {
    card.style.display = 'block';
    if (toggleBtn) toggleBtn.className = 'fas fa-chevron-down';
  } else {
    card.style.display = 'none';
    if (toggleBtn) toggleBtn.className = 'fas fa-chevron-right';
  }
}

// Custom alert function
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

// Utility functions
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Animation function
function animateCards() {
  const cards = document.querySelectorAll('.info-card, .profile-header');
  cards.forEach((card, index) => {
    if (card) {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 200);
    }
  });
}

// Add CSS for animations and custom alerts
const style = document.createElement('style');
style.textContent = `
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

  /* Existing styles */
  .no-requests, .no-donations {
    text-align: center;
    padding: 40px 20px;
    color: #7f8c8d;
    background: #f8f9fa;
    border-radius: 12px;
    border: 2px dashed #e9ecef;
  }
  
  .no-requests i, .no-donations i {
    font-size: 3rem;
    color: #bdc3c7;
    margin-bottom: 15px;
    display: block;
  }
  
  .create-request-btn {
    margin-top: 15px;
    padding: 10px 20px;
    background: #4a7c59;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .create-request-btn:hover {
    background: #3a6249;
    transform: translateY(-2px);
  }
  
  .status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .status-badge.active {
    background: #d4edda;
    color: #155724;
  }
  
  .status-badge.completed {
    background: #cce5ff;
    color: #004085;
  }
  
  .status-badge.pending {
    background: #fff3cd;
    color: #856404;
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
  }
`;
document.head.appendChild(style);