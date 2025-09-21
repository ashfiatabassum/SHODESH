let donorData = {};

document.addEventListener('DOMContentLoaded', function() {
  initializeDonorData();
});
document.addEventListener('DOMContentLoaded', () => {
  const deleteBtn = document.getElementById('deleteProfileBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete your donor profile? This action cannot be undone.')) {
        const donorId = localStorage.getItem('donorId');
        if (!donorId) return;

        fetch(`/api/donor/${donorId}`, { method: 'DELETE' })
          .then(res => res.json())
          .then(result => {
            if (result.success) {
              localStorage.clear();
              window.location.href = 'index.html';
            } else {
              alert(result.message || 'Failed to delete profile');
            }
          })
          .catch(() => {
            alert('Network error while deleting profile');
          });
      }
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const deleteBtn = document.getElementById('deleteProfileBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      showCustomConfirm(
        'Are you sure you want to delete your donor profile? This action cannot be undone.',
        async () => {
          const donorId = localStorage.getItem('donorId');
          if (!donorId) return;

          try {
            const response = await fetch(`/api/donor/${donorId}`, {
              method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
              localStorage.clear();
              window.location.href = 'index.html';
            } else {
              showCustomAlert(result.message || 'Failed to delete profile', 'error');
            }
          } catch (err) {
            showCustomAlert('Network error while deleting profile', 'error');
          }
        }
      );
    });
  }
});



async function initializeDonorData() {
  try {
    const storedDonorData = localStorage.getItem('donorData');
    const storedDonorId = localStorage.getItem('donorId');

    if (storedDonorData) {
      donorData = JSON.parse(storedDonorData);
      loadDonorProfile();
      await loadDonationHistory();
      loadAchievements();
      animateCards();
    } else if (storedDonorId) {
      const response = await fetch(`/api/donor/profile/${storedDonorId}`);
      const result = await response.json();
      if (result.success) {
        donorData = result.donorData;
        loadDonorProfile();
        await loadDonationHistory();
        loadAchievements();
        animateCards();
      } else {
        throw new Error(result.message);
      }
    } else {
      donorData = getDefaultDonorData();
      loadDonorProfile();
      await loadDonationHistory();
      loadAchievements();
      animateCards();
    }
  } catch (error) {
    donorData = getDefaultDonorData();
    loadDonorProfile();
    await loadDonationHistory();
    loadAchievements();
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

function goHome() {
  window.location.href = "index.html";
}

function loadDonorProfile() {
  if (!donorData || !donorData.personalInfo) return;
  const { personalInfo } = donorData;
  const donorNameEl = document.getElementById('donorName');
  const donorUsernameEl = document.getElementById('donorUsername');
  if (donorNameEl) donorNameEl.textContent = `${personalInfo.firstName} ${personalInfo.lastName}`;
  if (donorUsernameEl) donorUsernameEl.textContent = `@${personalInfo.username}`;
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
    if (element) element.textContent = value || '-';
  });
  const locationCountryEl = document.getElementById('locationCountry');
  const locationDivisionEl = document.getElementById('locationDivision');
  const locationDivisionContainer = document.getElementById('locationDivisionContainer');
  if (locationCountryEl) locationCountryEl.textContent = personalInfo.country || '-';
  if (locationDivisionEl && personalInfo.division) {
    locationDivisionEl.textContent = personalInfo.division;
    if (locationDivisionContainer) locationDivisionContainer.style.display = 'flex';
  } else if (locationDivisionContainer) {
    locationDivisionContainer.style.display = 'none';
  }
}

// Load donation history and update stats
async function loadDonationHistory() {
  const donationsList = document.getElementById('donationsList');
  if (!donationsList) return;
  const donorId = localStorage.getItem('donorId') || donorData.personalInfo?.donorId;
  if (!donorId) {
    donationsList.innerHTML = `<p>No donor ID found.</p>`;
    updateDonationStats(0, 0, 0);
    return;
  }
  try {
    const response = await fetch(`/api/donor/donations/${donorId}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    donorData.donations = result.donations || [];
    const totalDonation = result.totalDonation || 0;
    const largestDonation = result.largestDonation || 0;
    donationsList.innerHTML = '';

    console.log('Donations to render:', donorData.donations);
    
    if (donorData.donations.length === 0) {
      donationsList.innerHTML = `
        <div class="no-donations">
          <i class="fas fa-heart"></i>
          <p>No donations yet. Start making a difference today!</p>
          <button class="donate-btn" onclick="findProjects()">Find Projects to Support</button>
        </div>
      `;
      updateDonationStats(0, 0, 0);
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
    updateDonationStats(donorData.donations.length, totalDonation, largestDonation);
  } catch (error) {
    donationsList.innerHTML = `<p>Error loading donations: ${error.message}</p>`;
    updateDonationStats(0, 0, 0);
  }
}

// Update donation statistics (total count, total amount, largest)
function updateDonationStats(count, totalAmount, largestDonation) {
  const totalDonationsEl = document.getElementById('totalDonations');
  const totalAmountEl = document.getElementById('totalAmount');
  const largestDonationEl = document.getElementById('largestDonation');
  if (totalDonationsEl) totalDonationsEl.textContent = count;
  if (totalAmountEl) totalAmountEl.textContent = '৳' + (totalAmount || 0).toLocaleString();
  if (largestDonationEl) largestDonationEl.textContent = '৳' + (largestDonation || 0).toLocaleString();
}

// Load achievements
function loadAchievements() {
  const achievementsList = document.getElementById('achievementsList');
  if (!achievementsList) return;
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

function findProjects() {
  showNotification('Redirecting to project listings...');
  window.location.href = 'search.html';
}

function logout() {
  if (confirm('Are you sure you want to logout? This will clear your session data.')) {
    localStorage.removeItem('donorData');
    localStorage.removeItem('donorId');
    window.location.href = 'index.html';
  }
}

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

// ...existing code...

function shareProfile() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: url
    }).catch(() => {});
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      alert("Profile link copied to clipboard!");
    }, () => {
      alert("Could not copy link. Please copy manually.");
    });
  }
}



// Add this function to your profiledonor.js

function showCountryOnMap() {
  // Get country name from profile
  const country = document.getElementById('locationCountry')?.textContent?.trim() || "Bangladesh";
  // Show modal
  document.getElementById('mapModal').style.display = 'flex';

  // Use Nominatim API to get country coordinates
  fetch(`https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(country)}&format=json&limit=1`)
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        // Remove previous map if exists
        if (window.countryMapInstance) {
          window.countryMapInstance.remove();
        }

        // Initialize Leaflet map
        window.countryMapInstance = L.map('countryMap').setView([lat, lon], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(window.countryMapInstance);

        L.marker([lat, lon]).addTo(window.countryMapInstance)
          .bindPopup(country)
          .openPopup();
      } else {
        document.getElementById('countryMap').innerHTML = '<p style="padding:20px;">Map not available for this country.</p>';
      }
    })
    .catch(() => {
      document.getElementById('countryMap').innerHTML = '<p style="padding:20px;">Map could not be loaded.</p>';
    });
}

// Close map modal
function closeMapModal() {
  document.getElementById('mapModal').style.display = 'none';
  if (window.countryMapInstance) {
    window.countryMapInstance.remove();
    window.countryMapInstance = null;
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
      .danger-btn {
    margin-top: 10px;
    padding: 10px 20px;
    background: #c0392b;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  .danger-btn:hover {
    background: #a93226;
  }
`;
document.head.appendChild(style);