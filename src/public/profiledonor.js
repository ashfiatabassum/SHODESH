// Check if donor data exists in localStorage or fetch from server
let donorData = {};

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeDonorData();
});

async function initializeDonorData() {
  try {
    // Check if donor data is available in localStorage (from recent signup)
    const storedDonorData = localStorage.getItem('donorData');
    const storedDonorId = localStorage.getItem('donorId');
    
    console.log('🔍 Checking stored data...');
    console.log('Stored donorData:', storedDonorData);
    console.log('Stored donorId:', storedDonorId);
    
    if (storedDonorData) {
      // Use stored data from recent signup
      donorData = JSON.parse(storedDonorData);
      console.log('📋 Using stored donor data:', donorData);
      
      // Load the profile with actual data
      loadDonorProfile();
      loadDonationHistory();
      loadAchievements();
      calculateStats();
      animateCards();
      
    } else if (storedDonorId) {
      // Fetch data from server using donor ID
      console.log('📡 Fetching data from server for ID:', storedDonorId);
      
      const response = await fetch(`/api/donor/profile/${storedDonorId}`);
      const result = await response.json();
      
      if (result.success) {
        donorData = result.donorData;
        console.log('📋 Fetched donor data from server:', donorData);
        
        // Load the profile with fetched data
        loadDonorProfile();
        loadDonationHistory();
        loadAchievements();
        calculateStats();
        animateCards();
        
      } else {
        throw new Error(result.message);
      }
    } else {
      // No donor data found - use default data instead of redirecting
      console.log('⚠️ No donor data found, using default data');
      donorData = getDefaultDonorData();
      
      // Load the profile with default data
      loadDonorProfile();
      loadDonationHistory();
      loadAchievements();
      calculateStats();
      animateCards();
    }
    
  } catch (error) {
    console.error('❌ Error loading donor data:', error);
    // Use default data instead of redirecting to signin
    console.log('📋 Using default donor data due to error');
    donorData = getDefaultDonorData();
    
    // Load the profile with default data
    loadDonorProfile();
    loadDonationHistory();
    loadAchievements();
    calculateStats();
    animateCards();
  }
}

function getDefaultDonorData() {
  return {
    personalInfo: {
      firstName: "New",
      lastName: "Donor",
      username: "new_donor",
      email: "donor@email.com",
      dateOfBirth: "1990-01-01",
      country: "Bangladesh",
      division: "Dhaka",
      memberSince: "2024"
    },
    donations: [],
    achievements: [
      {
        title: "Welcome to SHODESH",
        description: "Successfully created your donor account",
        icon: "fas fa-star",
        earned: true
      }
    ]
  };
}

// Load donor profile with data
function loadDonorProfile() {
  console.log('🔄 Loading donor profile with data:', donorData);
  
  if (!donorData || !donorData.personalInfo) {
    console.error('❌ No donor data available for profile');
    return;
  }

  const { personalInfo } = donorData;

  // Update header - check if elements exist
  const donorNameEl = document.getElementById('donorName');
  const donorUsernameEl = document.getElementById('donorUsername');
  
  if (donorNameEl) {
    donorNameEl.textContent = `${personalInfo.firstName} ${personalInfo.lastName}`;
  }
  if (donorUsernameEl) {
    donorUsernameEl.textContent = `@${personalInfo.username}`;
  }
  
  // Update personal info section
  const personalInfoElements = {
    'fullName': `${personalInfo.firstName} ${personalInfo.lastName}`,
    'email': personalInfo.email,
    'dateOfBirth': personalInfo.dateOfBirth,
    'country': personalInfo.country,
    'division': personalInfo.division || '-',
    'memberSince': personalInfo.memberSince
  };
  
  Object.entries(personalInfoElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value || '-';
    } else {
      console.warn(`⚠️ Element with ID '${id}' not found`);
    }
  });

  // Update location information
  const locationCountryEl = document.getElementById('locationCountry');
  const locationDivisionEl = document.getElementById('locationDivision');
  const locationDivisionContainer = document.getElementById('locationDivisionContainer');
  
  if (locationCountryEl) {
    locationCountryEl.textContent = personalInfo.country || '-';
  }
  
  if (locationDivisionEl && personalInfo.division) {
    locationDivisionEl.textContent = personalInfo.division;
    if (locationDivisionContainer) {
      locationDivisionContainer.style.display = 'flex';
    }
  } else if (locationDivisionContainer) {
    locationDivisionContainer.style.display = 'none';
  }
  
  console.log('✅ Donor profile loaded successfully');
}

// Load donation history
function loadDonationHistory() {
  const donationsList = document.getElementById('donationsList');
  if (!donationsList) {
    console.warn('⚠️ donationsList element not found');
    return;
  }
  
  donationsList.innerHTML = '';
  
  if (!donorData.donations || donorData.donations.length === 0) {
    donationsList.innerHTML = `
      <div class="no-donations">
        <i class="fas fa-heart"></i>
        <p>No donations yet. Start making a difference today!</p>
        <button class="donate-btn" onclick="findProjects()">Find Projects to Support</button>
      </div>
    `;
    return;
  }
  
  donorData.donations.forEach(donation => {
    const donationItem = document.createElement('div');
    donationItem.className = 'donation-item';
    donationItem.innerHTML = `
      <div class="donation-info">
        <div class="donation-title">${donation.projectTitle}</div>
        <div class="donation-details">${donation.foundationName}</div>
      </div>
      <div class="donation-meta">
        <div class="donation-amount">৳${donation.amount.toLocaleString()}</div>
        <div class="donation-date">${formatDate(donation.date)}</div>
      </div>
    `;
    donationsList.appendChild(donationItem);
  });

  // Update donation stats
  updateDonationStats();
}

// Update donation statistics
function updateDonationStats() {
  const donations = donorData.donations || [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Calculate this month's donations
  const thisMonthAmount = donations.filter(d => {
    const donationDate = new Date(d.date);
    return donationDate.getMonth() === currentMonth && donationDate.getFullYear() === currentYear;
  }).reduce((sum, d) => sum + d.amount, 0);
  
  // Calculate this year's donations
  const thisYearAmount = donations.filter(d => {
    const donationDate = new Date(d.date);
    return donationDate.getFullYear() === currentYear;
  }).reduce((sum, d) => sum + d.amount, 0);
  
  // Find largest donation
  const largestDonation = donations.length > 0 ? Math.max(...donations.map(d => d.amount)) : 0;
  
  // Update elements
  const statsElements = {
    'thisMonth': '৳' + thisMonthAmount.toLocaleString(),
    'thisYear': '৳' + thisYearAmount.toLocaleString(),
    'largestDonation': '৳' + largestDonation.toLocaleString()
  };
  
  Object.entries(statsElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

// Load achievements
function loadAchievements() {
  const achievementsList = document.getElementById('achievementsList');
  if (!achievementsList) {
    console.warn('⚠️ achievementsList element not found');
    return;
  }
  
  achievementsList.innerHTML = '';
  
  if (!donorData.achievements || donorData.achievements.length === 0) {
    achievementsList.innerHTML = `
      <div class="no-achievements">
        <i class="fas fa-trophy"></i>
        <p>No achievements yet. Start donating to earn achievements!</p>
      </div>
    `;
    return;
  }
  
  donorData.achievements.forEach(achievement => {
    const achievementItem = document.createElement('div');
    achievementItem.className = `achievement-item ${achievement.earned ? 'earned' : 'locked'}`;
    achievementItem.innerHTML = `
      <div class="achievement-icon">
        <i class="${achievement.icon}"></i>
      </div>
      <div class="achievement-info">
        <div class="achievement-title">${achievement.title}</div>
        <div class="achievement-description">${achievement.description}</div>
      </div>
      ${achievement.earned ? '<div class="achievement-badge">✓</div>' : '<div class="achievement-badge">🔒</div>'}
    `;
    achievementsList.appendChild(achievementItem);
  });
}

// Calculate stats
function calculateStats() {
  const totalDonations = donorData.donations ? donorData.donations.length : 0;
  const totalAmount = donorData.donations ? donorData.donations.reduce((sum, d) => sum + d.amount, 0) : 0;
  
  // Safely update stats elements
  const statsElements = {
    'totalDonations': totalDonations,
    'totalAmount': '৳' + totalAmount.toLocaleString()
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

// Function to show country on map
function showCountryOnMap() {
  if (!donorData || !donorData.personalInfo || !donorData.personalInfo.country) {
    showNotification('Country information not available');
    return;
  }
  
  const country = donorData.personalInfo.country;
  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(country)}`;
  
  // Open in new tab
  window.open(googleMapsUrl, '_blank');
  showNotification(`Opening ${country} on Google Maps...`);
}

// Functions for HTML button calls
function editProfile() {
  showNotification('Edit profile feature is not available');
}

function shareProfile() {
  const profileUrl = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: 'SHODESH Donor Profile',
      text: `Check out ${donorData.personalInfo?.firstName || 'this'}'s donor profile on SHODESH`,
      url: profileUrl
    }).then(() => {
      showNotification('Profile shared successfully!');
    }).catch((error) => {
      console.log('Error sharing:', error);
      copyToClipboard(profileUrl);
    });
  } else {
    copyToClipboard(profileUrl);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Profile URL copied to clipboard!');
  }).catch(() => {
    showNotification('Unable to copy to clipboard');
  });
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

function sortDonations() {
  const sortValue = document.getElementById('sortFilter').value;
  console.log('Sorting donations by:', sortValue);
  
  if (!donorData.donations || donorData.donations.length === 0) return;
  
  // Sort donations based on selected value
  switch (sortValue) {
    case 'recent':
      donorData.donations.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'amount':
      donorData.donations.sort((a, b) => b.amount - a.amount);
      break;
    case 'oldest':
      donorData.donations.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
  }
  
  // Reload donation history
  loadDonationHistory();
  showNotification(`Sorted donations by ${sortValue}`);
}

function loadMoreDonations() {
  showNotification('Loading more donations...');
  // Implementation for pagination - would need backend support
}

function closeModal() {
  const modal = document.getElementById('editModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// Utility functions
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 15px 20px;
    background: #4a7c59; color: white; border-radius: 8px; z-index: 1001;
    font-family: 'Roboto Condensed', sans-serif; font-weight: 500;
    box-shadow: 0 5px 15px rgba(74, 124, 89, 0.4);
    animation: slideInRight 0.3s ease-out;
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
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

// Close modals on outside click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('show');
  }
});

// Other action functions
function findProjects() {
  showNotification('Redirecting to project listings...');
  // You can redirect to projects page when you create it
  // window.location.href = 'projects.html';
}

function logout() {
  if (confirm('Are you sure you want to logout? This will clear your session data.')) {
    localStorage.removeItem('donorData');
    localStorage.removeItem('donorId');
    window.location.href = 'signin.html';
  }
}

function goHome() {
  if (confirm('Are you sure you want to go back to the home page?')) {
    window.location.href = 'index.html';
  }
}

// Add CSS for animations and styling
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideOutRight {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
  }
  
  .no-donations, .no-achievements {
    text-align: center;
    padding: 40px 20px;
    color: #7f8c8d;
    background: #f8f9fa;
    border-radius: 12px;
    border: 2px dashed #e9ecef;
  }
  
  .no-donations i, .no-achievements i {
    font-size: 3rem;
    color: #bdc3c7;
    margin-bottom: 15px;
    display: block;
  }
  
  .donate-btn {
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
  
  .donate-btn:hover {
    background: #3a6249;
    transform: translateY(-2px);
  }
  
  .achievement-item.locked {
    opacity: 0.6;
    filter: grayscale(100%);
  }
  
  .achievement-badge {
    font-size: 1.2rem;
    margin-left: auto;
  }
  
  .location-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;
  }
  
  .location-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .location-text {
    flex: 1;
  }
  
  .btn-outline {
    padding: 8px 16px;
    border: 2px solid #4a7c59;
    background: transparent;
    color: #4a7c59;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  .btn-outline:hover {
    background: #4a7c59;
    color: white;
  }
`;
document.head.appendChild(style);