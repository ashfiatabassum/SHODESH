// Sample individual data (person requesting help)
const individualData = {
  personalInfo: {
    firstName: "Ahmad",
    lastName: "Hassan",
    email: "ahmad.hassan@email.com",
    phoneNID: "+880 1712-345678",
    dateOfBirth: "1985-03-12",
    memberSince: "2023"
  },
  address: {
    houseNo: "House #8",
    roadNo: "Road #2",
    area: "Mirpur",
    district: "Dhaka",
    division: "Dhaka",
    zipCode: "1216"
  },
  financial: {
    bkashNumber: "+880 1712-345678",
    bankAccount: "5432109876 - Islami Bank"
  },
  helpRequests: [
    {
      id: 1,
      title: "Medical Emergency - Surgery Required",
      category: "medical",
      amountNeeded: 150000,
      amountReceived: 85000,
      description: "Urgent surgery needed for my father's heart condition",
      status: "active",
      dateCreated: "2024-01-05",
      donors: 12
    },
    {
      id: 2,
      title: "Education Support for Children",
      category: "education",
      amountNeeded: 50000,
      amountReceived: 50000,
      description: "School fees and books for my three children",
      status: "completed",
      dateCreated: "2023-12-01",
      donors: 8
    }
  ],
  receivedDonations: [
    {
      donorName: "Fatima Khan",
      amount: 15000,
      date: "2024-01-20",
      message: "May Allah bless your father with good health",
      requestTitle: "Medical Emergency"
    },
    {
      donorName: "Rahul Ahmed", 
      amount: 25000,
      date: "2024-01-18",
      message: "Hope this helps with the surgery",
      requestTitle: "Medical Emergency"
    },
    {
      donorName: "Sarah Rahman",
      amount: 10000,
      date: "2023-12-15",
      message: "For the children's education",
      requestTitle: "Education Support"
    }
  ]
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadIndividualProfile();
  loadHelpRequests();
  loadReceivedDonations();
  calculateStats();
});

// Load individual profile
function loadIndividualProfile() {
  const { personalInfo, address, financial } = individualData;
  
  document.getElementById('individualName').textContent = `${personalInfo.firstName} ${personalInfo.lastName}`;
  document.getElementById('individualEmail').textContent = personalInfo.email;
  document.getElementById('memberSince').textContent = personalInfo.memberSince;
  
  // Personal info
  document.getElementById('firstName').textContent = personalInfo.firstName;
  document.getElementById('lastName').textContent = personalInfo.lastName;
  document.getElementById('email').textContent = personalInfo.email;
  document.getElementById('phoneNID').textContent = personalInfo.phoneNID;
  document.getElementById('dateOfBirth').textContent = formatDate(personalInfo.dateOfBirth);
  document.getElementById('zipCode').textContent = address.zipCode;
  
  // Address info
  document.getElementById('houseNo').textContent = address.houseNo;
  document.getElementById('roadNo').textContent = address.roadNo;
  document.getElementById('area').textContent = address.area;
  document.getElementById('district').textContent = address.district;
  document.getElementById('division').textContent = address.division;
  
  const fullAddress = `${address.houseNo}, ${address.roadNo}, ${address.area}, ${address.district}, ${address.division} - ${address.zipCode}`;
  document.getElementById('fullAddress').textContent = fullAddress;
  
  // Financial info
  document.getElementById('bkashNumber').textContent = financial.bkashNumber;
  document.getElementById('bankAccount').textContent = financial.bankAccount;
}

// Load help requests
function loadHelpRequests() {
  const requestsList = document.getElementById('requestsList');
  requestsList.innerHTML = '';
  
  individualData.helpRequests.forEach(request => {
    const progressPercentage = (request.amountReceived / request.amountNeeded) * 100;
    const statusClass = request.status === 'completed' ? 'completed' : 'active';
    
    const requestItem = document.createElement('div');
    requestItem.className = `request-item ${statusClass}`;
    requestItem.innerHTML = `
      <div class="request-header">
        <div class="request-title">${request.title}</div>
        <div class="request-status ${request.status}">${request.status.toUpperCase()}</div>
      </div>
      <div class="request-category">${request.category.toUpperCase()}</div>
      <div class="request-description">${request.description}</div>
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercentage}%"></div>
        </div>
        <div class="progress-text">
          <span>৳${request.amountReceived.toLocaleString()} raised</span>
          <span>৳${request.amountNeeded.toLocaleString()} needed</span>
        </div>
      </div>
      <div class="request-meta">
        <span><i class="fas fa-users"></i> ${request.donors} donors</span>
        <span><i class="fas fa-calendar"></i> ${formatDate(request.dateCreated)}</span>
      </div>
    `;
    requestsList.appendChild(requestItem);
  });
}

// Load received donations
function loadReceivedDonations() {
  const donationsList = document.getElementById('donationsList');
  donationsList.innerHTML = '';
  
  individualData.receivedDonations.forEach(donation => {
    const donationItem = document.createElement('div');
    donationItem.className = 'donation-item';
    donationItem.innerHTML = `
      <div class="donation-info">
        <div class="donation-donor">${donation.donorName}</div>
        <div class="donation-details">
          <span>${donation.requestTitle}</span>
          ${donation.message ? `<div class="donation-message">"${donation.message}"</div>` : ''}
        </div>
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
  const requests = individualData.helpRequests;
  const donations = individualData.receivedDonations;
  
  const totalRequests = requests.length;
  const totalReceived = donations.reduce((sum, d) => sum + d.amount, 0);
  const activeRequests = requests.filter(r => r.status === 'active').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;
  const totalDonors = requests.reduce((sum, r) => sum + r.donors, 0);
  
  document.getElementById('totalRequests').textContent = totalRequests;
  document.getElementById('totalReceived').textContent = '৳' + totalReceived.toLocaleString();
  document.getElementById('activeRequests').textContent = activeRequests;
  document.getElementById('completedRequests').textContent = completedRequests;
  document.getElementById('totalDonors').textContent = totalDonors;
}

// Modal functions
function editIndividual() {
  const modal = document.getElementById('editModal');
  const { personalInfo } = individualData;
  
  document.getElementById('editFirstName').value = personalInfo.firstName;
  document.getElementById('editLastName').value = personalInfo.lastName;
  document.getElementById('editEmail').value = personalInfo.email;
  document.getElementById('editPhoneNID').value = personalInfo.phoneNID;
  
  modal.classList.add('show');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('show');
}

function requestHelp() {
  document.getElementById('helpModal').classList.add('show');
}

function closeHelpModal() {
  document.getElementById('helpModal').classList.remove('show');
}

// Form submissions
document.getElementById('editForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  individualData.personalInfo.firstName = document.getElementById('editFirstName').value;
  individualData.personalInfo.lastName = document.getElementById('editLastName').value;
  individualData.personalInfo.email = document.getElementById('editEmail').value;
  individualData.personalInfo.phoneNID = document.getElementById('editPhoneNID').value;
  
  loadIndividualProfile();
  closeModal();
  showNotification('Profile updated successfully!');
});

document.getElementById('helpForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const newRequest = {
    id: individualData.helpRequests.length + 1,
    title: document.getElementById('helpTitle').value,
    category: document.getElementById('helpCategory').value,
    amountNeeded: parseInt(document.getElementById('helpAmount').value),
    amountReceived: 0,
    description: document.getElementById('helpDescription').value,
    status: 'active',
    dateCreated: new Date().toISOString().split('T')[0],
    donors: 0
  };
  
  individualData.helpRequests.unshift(newRequest);
  loadHelpRequests();
  calculateStats();
  closeHelpModal();
  showNotification('Help request submitted successfully!');
});

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
  `;
  document.body.appendChild(notification);
  setTimeout(() => document.body.removeChild(notification), 3000);
}

// Close modals on outside click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('show');
  }
});
// ...existing code...
// Update address for map (this was missing!)
  document.getElementById('addressForMap').textContent = fullAddress;
// Toggle card visibility
function toggleCard(cardId) {
  const card = document.getElementById(cardId);
  const toggleBtn = card.parentElement.querySelector('.toggle-btn i');
  
  if (card.style.display === 'none') {
    card.style.display = 'block';
    toggleBtn.style.transform = 'rotate(0deg)';
  } else {
    card.style.display = 'none';
    toggleBtn.style.transform = 'rotate(180deg)';
  }
}


//Show map function
function showMap() {
  const address = document.getElementById('addressForMap').textContent;
    
  if (address && address !== 'Loading...' && address !== 'Loading address...') {
    showNotification('Opening map for: ' + address);
    // Open Google Maps with the address
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  } else {
    showNotification('Address not loaded yet. Please wait...');
  }
}
// ...existing code...

// ...existing code...

// Go to home page
function goHome() {
  window.location.href = 'index.html';
}

// ...existing code...