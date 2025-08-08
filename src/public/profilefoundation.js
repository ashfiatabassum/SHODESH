// Sample foundation data
const foundationData = {
  foundationInfo: {
    foundationName: "Hope & Care Foundation",
    email: "info@hopecare.org", 
    phone: "+880 1712-345678",
    foundationLicense: "FND-2022-DHK-001",
    bkashNumber: "+880 1712-345678",
    bankAccount: "1234567890 - Dutch Bangla Bank",
    visionGoals: "To create a world where every person has access to basic necessities like food, shelter, education, and healthcare.",
    operatingSince: "2022"
  },
  address: {
    houseNo: "House #15",
    roadNo: "Road #3", 
    area: "Dhanmondi",
    district: "Dhaka",
    division: "Dhaka",
    zipCode: "1205"
  },
  projects: [
    {
      id: 1,
      title: "Emergency Flood Relief",
      category: "emergency",
      description: "Providing immediate relief to flood-affected families.",
      targetAmount: 500000,
      raisedAmount: 325000
    },
    {
      id: 2,
      title: "Rural Education Support", 
      category: "education",
      description: "Building schools for underprivileged children.",
      targetAmount: 800000,
      raisedAmount: 640000
    }
  ],
  donations: [
    {
      donorName: "Rahul Ahmed",
      project: "Emergency Flood Relief",
      amount: 15000,
      date: "2024-01-20"
    },
    {
      donorName: "Fatima Khan",
      project: "Rural Education Support", 
      amount: 25000,
      date: "2024-01-18"
    }
  ]
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadFoundationProfile();
  loadProjects();
  loadDonations();
  calculateStats();
});

// Load foundation profile
function loadFoundationProfile() {
  const { foundationInfo, address } = foundationData;
  
  document.getElementById('foundationName').textContent = foundationInfo.foundationName;
  document.getElementById('foundationLicense').textContent = `License: ${foundationInfo.foundationLicense}`;
  document.getElementById('foundationNameInfo').textContent = foundationInfo.foundationName;
  document.getElementById('email').textContent = foundationInfo.email;
  document.getElementById('phoneNumber').textContent = foundationInfo.phone;
  document.getElementById('licenseNumber').textContent = foundationInfo.foundationLicense;
  document.getElementById('bkashNumber').textContent = foundationInfo.bkashNumber;
  document.getElementById('bankAccount').textContent = foundationInfo.bankAccount;
  document.getElementById('visionGoals').textContent = foundationInfo.visionGoals;
  
  const fullAddress = `${address.houseNo}, ${address.roadNo}, ${address.area}, ${address.district}, ${address.division} - ${address.zipCode}`;
  document.getElementById('fullAddress').textContent = fullAddress;
}

// Load projects
function loadProjects() {
  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = '';
  
  foundationData.projects.forEach(project => {
    const progressPercentage = (project.raisedAmount / project.targetAmount) * 100;
    
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.innerHTML = `
      <div class="project-title">${project.title}</div>
      <div class="project-category">${project.category.toUpperCase()}</div>
      <div class="project-description">${project.description}</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
      </div>
      <div class="progress-text">
        <span>৳${project.raisedAmount.toLocaleString()} raised</span>
        <span>৳${project.targetAmount.toLocaleString()} goal</span>
      </div>
    `;
    projectsList.appendChild(projectCard);
  });
}

// Load donations
function loadDonations() {
  const donationsList = document.getElementById('donationsList');
  donationsList.innerHTML = '';
  
  foundationData.donations.forEach(donation => {
    const donationItem = document.createElement('div');
    donationItem.className = 'donation-item';
    donationItem.innerHTML = `
      <div class="donation-info">
        <div class="donation-title">${donation.donorName}</div>
        <div class="donation-details">${donation.project}</div>
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
  const totalProjects = foundationData.projects.length;
  const totalReceived = foundationData.donations.reduce((sum, d) => sum + d.amount, 0);
  const beneficiaries = 2500; // Sample number
  
  document.getElementById('totalProjects').textContent = totalProjects;
  document.getElementById('totalReceived').textContent = '৳' + totalReceived.toLocaleString();
  document.getElementById('beneficiaries').textContent = beneficiaries.toLocaleString();
}

// Modal functions
function editFoundation() {
  const modal = document.getElementById('editModal');
  const { foundationInfo } = foundationData;
  
  document.getElementById('editFoundationName').value = foundationInfo.foundationName;
  document.getElementById('editEmail').value = foundationInfo.email;
  document.getElementById('editPhone').value = foundationInfo.phone;
  document.getElementById('editVisionGoals').value = foundationInfo.visionGoals;
  
  modal.classList.add('show');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('show');
}

function addProject() {
  document.getElementById('projectModal').classList.add('show');
}

function closeProjectModal() {
  document.getElementById('projectModal').classList.remove('show');
}

// Form submissions
document.getElementById('editForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  foundationData.foundationInfo.foundationName = document.getElementById('editFoundationName').value;
  foundationData.foundationInfo.email = document.getElementById('editEmail').value;
  foundationData.foundationInfo.phone = document.getElementById('editPhone').value;
  foundationData.foundationInfo.visionGoals = document.getElementById('editVisionGoals').value;
  
  loadFoundationProfile();
  closeModal();
  showNotification('Profile updated successfully!');
});

document.getElementById('projectForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const newProject = {
    id: foundationData.projects.length + 1,
    title: document.getElementById('projectTitle').value,
    category: document.getElementById('projectCategory').value,
    description: document.getElementById('projectDescription').value,
    targetAmount: parseInt(document.getElementById('projectTarget').value),
    raisedAmount: 0
  };
  
  foundationData.projects.push(newProject);
  loadProjects();
  calculateStats();
  closeProjectModal();
  showNotification('Project created successfully!');
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

// Show map function
function showMap() {
  const address = document.getElementById('fullAddress').textContent;
  if (address && address !== 'Loading...' && address !== 'Loading address...') {
    showNotification('Opening map for: ' + address);
    // Open Google Maps with the address
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  } else {
    showNotification('Address not loaded yet. Please wait...');
  }
}

// ...existing code...