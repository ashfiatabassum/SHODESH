// Sample donor data (in real application, this would come from a database)
const donorData = {
  personalInfo: {
    firstName: "Rahul",
    lastName: "Ahmed",
    username: "rahul_helper",
    email: "rahul.ahmed@email.com",
    phone: "+880 1712-345678",
    dateOfBirth: "1995-03-15",
    country: "Bangladesh",
    division: "Dhaka",
    memberSince: "2022"
  },
  address: {
    houseNo: "House #25",
    roadNo: "Road #7",
    area: "Dhanmondi",
    district: "Dhaka",
    division: "Dhaka",
    zipCode: "1205"
  },
  donations: [
    {
      id: 1,
      title: "Flood Relief Fund",
      amount: 5000,
      date: "2024-01-15",
      recipient: "Sylhet Flood Victims",
      type: "Emergency Relief"
    },
    {
      id: 2,
      title: "Winter Clothing Drive",
      amount: 3000,
      date: "2023-12-20",
      recipient: "Street Children Foundation",
      type: "Seasonal Help"
    },
    {
      id: 3,
      title: "Education Support",
      amount: 7500,
      date: "2023-11-10",
      recipient: "Rural School Development",
      type: "Education"
    },
    {
      id: 4,
      title: "Medical Emergency",
      amount: 10000,
      date: "2023-10-05",
      recipient: "Cancer Patient Support",
      type: "Healthcare"
    },
    {
      id: 5,
      title: "Food Distribution",
      amount: 2500,
      date: "2023-09-18",
      recipient: "Daily Wage Workers",
      type: "Food Security"
    },
    {
      id: 6,
      title: "Clean Water Project",
      amount: 8000,
      date: "2023-08-22",
      recipient: "Village Water Supply",
      type: "Infrastructure"
    }
  ],
  achievements: [
    {
      title: "First Donation",
      description: "Made your first donation to help others",
      icon: "fas fa-star",
      earned: true
    },
    {
      title: "Generous Heart",
      description: "Donated over ৳25,000 in total",
      icon: "fas fa-heart",
      earned: true
    },
    {
      title: "Regular Supporter",
      description: "Made donations for 6 consecutive months",
      icon: "fas fa-medal",
      earned: true
    },
    {
      title: "Community Champion",
      description: "Supported 5+ different causes",
      icon: "fas fa-trophy",
      earned: true
    },
    {
      title: "Emergency Helper",
      description: "Responded to 3+ emergency relief campaigns",
      icon: "fas fa-ambulance",
      earned: false
    },
    {
      title: "Education Advocate",
      description: "Donated ৳10,000+ to education causes",
      icon: "fas fa-graduation-cap",
      earned: false
    }
  ]
};

let currentDonationPage = 1;
const donationsPerPage = 3;
let sortOrder = 'recent';

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadDonorProfile();
  loadDonationHistory();
  loadAchievements();
  calculateStats();
  
  // Add smooth scrolling animation delay for cards
  animateCards();
});

// Load donor profile information
function loadDonorProfile() {
  const { personalInfo, address } = donorData;
  
  // Update header information
  document.getElementById('donorName').textContent = `${personalInfo.firstName} ${personalInfo.lastName}`;
  document.getElementById('donorUsername').textContent = `@${personalInfo.username}`;
  document.getElementById('memberSince').textContent = personalInfo.memberSince;
  
  // Update personal information
  document.getElementById('fullName').textContent = `${personalInfo.firstName} ${personalInfo.lastName}`;
  document.getElementById('email').textContent = personalInfo.email;
  document.getElementById('phoneNumber').textContent = personalInfo.phone;
  document.getElementById('dateOfBirth').textContent = formatDate(personalInfo.dateOfBirth);
  document.getElementById('country').textContent = personalInfo.country;
  document.getElementById('division').textContent = personalInfo.division;
  
  // Update address information
  const fullAddress = `${address.houseNo}, ${address.roadNo}, ${address.area}, ${address.district}, ${address.division} - ${address.zipCode}`;
  document.getElementById('fullAddress').textContent = fullAddress;
}

// Load donation history
function loadDonationHistory() {
  const donationsList = document.getElementById('donationsList');
  const startIndex = (currentDonationPage - 1) * donationsPerPage;
  const endIndex = startIndex + donationsPerPage;
  
  let sortedDonations = [...donorData.donations];
  
  // Sort donations based on selected order
  switch(sortOrder) {
    case 'recent':
      sortedDonations.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'amount':
      sortedDonations.sort((a, b) => b.amount - a.amount);
      break;
    case 'oldest':
      sortedDonations.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
  }
  
  const donationsToShow = sortedDonations.slice(startIndex, endIndex);
  
  if (currentDonationPage === 1) {
    donationsList.innerHTML = '';
  }
  
  donationsToShow.forEach((donation, index) => {
    const donationElement = createDonationElement(donation, startIndex + index);
    donationsList.appendChild(donationElement);
    
    // Animate donation items
    setTimeout(() => {
      donationElement.style.opacity = '1';
      donationElement.style.transform = 'translateX(0)';
    }, index * 100);
  });
  
  // Hide load more button if all donations are shown
  const loadMoreContainer = document.querySelector('.load-more-container');
  if (endIndex >= sortedDonations.length) {
    loadMoreContainer.style.display = 'none';
  } else {
    loadMoreContainer.style.display = 'block';
  }
}

// Create donation element
function createDonationElement(donation, index) {
  const donationItem = document.createElement('div');
  donationItem.className = 'donation-item';
  donationItem.style.opacity = '0';
  donationItem.style.transform = 'translateX(-30px)';
  donationItem.style.transition = 'all 0.5s ease';
  
  donationItem.innerHTML = `
    <div class="donation-info">
      <div class="donation-title">${donation.title}</div>
      <div class="donation-details">
        <span>${donation.recipient}</span> • <span>${donation.type}</span>
      </div>
    </div>
    <div class="donation-meta">
      <div class="donation-amount">৳${donation.amount.toLocaleString()}</div>
      <div class="donation-date">${formatDate(donation.date)}</div>
    </div>
  `;
  
  // Add click animation
  donationItem.addEventListener('click', function() {
    this.style.transform = 'scale(0.98)';
    setTimeout(() => {
      this.style.transform = 'translateX(10px)';
    }, 100);
  });
  
  return donationItem;
}

// Load achievements
function loadAchievements() {
  const achievementsList = document.getElementById('achievementsList');
  achievementsList.innerHTML = '';
  
  donorData.achievements.forEach((achievement, index) => {
    const achievementElement = createAchievementElement(achievement);
    achievementsList.appendChild(achievementElement);
    
    // Animate achievement items
    setTimeout(() => {
      achievementElement.style.opacity = '1';
      achievementElement.style.transform = 'scale(1)';
    }, index * 150);
  });
}

// Create achievement element
function createAchievementElement(achievement) {
  const achievementItem = document.createElement('div');
  achievementItem.className = `achievement-item ${achievement.earned ? 'earned' : 'locked'}`;
  achievementItem.style.opacity = '0';
  achievementItem.style.transform = 'scale(0.9)';
  achievementItem.style.transition = 'all 0.5s ease';
  
  if (!achievement.earned) {
    achievementItem.style.filter = 'grayscale(100%)';
    achievementItem.style.opacity = '0.6';
  }
  
  achievementItem.innerHTML = `
    <div class="achievement-icon">
      <i class="${achievement.icon}"></i>
    </div>
    <div class="achievement-info">
      <span class="title">${achievement.title}</span>
      <span class="description">${achievement.description}</span>
    </div>
  `;
  
  // Add click effect for earned achievements
  if (achievement.earned) {
    achievementItem.addEventListener('click', function() {
      this.style.transform = 'scale(1.05)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
    });
  }
  
  return achievementItem;
}

// Calculate and display statistics
function calculateStats() {
  const donations = donorData.donations;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Total donations and amount
  const totalDonations = donations.length;
  const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
  
  // This month donations
  const thisMonthAmount = donations
    .filter(donation => {
      const donationDate = new Date(donation.date);
      return donationDate.getMonth() === currentMonth && donationDate.getFullYear() === currentYear;
    })
    .reduce((sum, donation) => sum + donation.amount, 0);
  
  // This year donations
  const thisYearAmount = donations
    .filter(donation => new Date(donation.date).getFullYear() === currentYear)
    .reduce((sum, donation) => sum + donation.amount, 0);
  
  // Largest donation
  const largestDonation = Math.max(...donations.map(donation => donation.amount));
  
  // Update DOM with animation
  animateCountUp('totalDonations', totalDonations);
  animateCountUp('totalAmount', totalAmount, '৳');
  animateCountUp('thisMonth', thisMonthAmount, '৳');
  animateCountUp('thisYear', thisYearAmount, '৳');
  animateCountUp('largestDonation', largestDonation, '৳');
}

// Animate counting up numbers
function animateCountUp(elementId, targetValue, prefix = '') {
  const element = document.getElementById(elementId);
  const startValue = 0;
  const duration = 2000;
  const startTime = performance.now();
  
  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
    
    element.textContent = prefix + currentValue.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(updateCount);
    }
  }
  
  requestAnimationFrame(updateCount);
}

// Toggle card collapse/expand
function toggleCard(cardId) {
  const cardContent = document.getElementById(cardId);
  const toggleBtn = cardContent.parentElement.querySelector('.toggle-btn i');
  
  cardContent.classList.toggle('collapsed');
  
  if (cardContent.classList.contains('collapsed')) {
    toggleBtn.style.transform = 'rotate(-90deg)';
  } else {
    toggleBtn.style.transform = 'rotate(0deg)';
  }
}

// Sort donations
function sortDonations() {
  const sortFilter = document.getElementById('sortFilter');
  sortOrder = sortFilter.value;
  currentDonationPage = 1;
  loadDonationHistory();
}

// Load more donations
function loadMoreDonations() {
  currentDonationPage++;
  loadDonationHistory();
}

// Edit profile modal functions
function editProfile() {
  const modal = document.getElementById('editModal');
  const { personalInfo } = donorData;
  
  // Populate form with current data
  document.getElementById('editFirstName').value = personalInfo.firstName;
  document.getElementById('editLastName').value = personalInfo.lastName;
  document.getElementById('editEmail').value = personalInfo.email;
  document.getElementById('editPhone').value = personalInfo.phone;
  
  modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('editModal');
  modal.classList.remove('show');
}

// Handle form submission
document.getElementById('editForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Get form data
  const firstName = document.getElementById('editFirstName').value;
  const lastName = document.getElementById('editLastName').value;
  const email = document.getElementById('editEmail').value;
  const phone = document.getElementById('editPhone').value;
  
  // Update donor data (in real app, this would be sent to server)
  donorData.personalInfo.firstName = firstName;
  donorData.personalInfo.lastName = lastName;
  donorData.personalInfo.email = email;
  donorData.personalInfo.phone = phone;
  
  // Reload profile
  loadDonorProfile();
  
  // Close modal
  closeModal();
  
  // Show success message
  showNotification('Profile updated successfully!', 'success');
});

// Share profile function
function shareProfile() {
  const shareText = `Check out ${donorData.personalInfo.firstName}'s donation profile on SHODESH! Total donations: ৳${donorData.donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'SHODESH - Donor Profile',
      text: shareText,
      url: window.location.href
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      showNotification('Profile link copied to clipboard!', 'info');
    });
  }
}

// Show map function
function showMap() {
  const address = donorData.address;
  const query = `${address.area}, ${address.district}, ${address.division}, Bangladesh`;
  const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  window.open(mapUrl, '_blank');
}

// Utility functions
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#4a7c59' : type === 'error' ? '#dc3545' : '#17a2b8'};
    color: white;
    border-radius: 8px;
    z-index: 1001;
    animation: slideInFromRight 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutToRight 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Animate cards on page load
function animateCards() {
  const cards = document.querySelectorAll('.info-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 200);
  });
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutToRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);

// Close modal when clicking outside
document.getElementById('editModal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeModal();
  }
});

// Keyboard navigation for modal
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// Add intersection observer for scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'slideInFromBottom 0.6s ease forwards';
    }
  });
}, { threshold: 0.1 });

// Observe all cards for scroll animations
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.info-card');
  cards.forEach(card => observer.observe(card));
});