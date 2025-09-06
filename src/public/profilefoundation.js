document.addEventListener('DOMContentLoaded', async function() {
  const foundationId = localStorage.getItem("foundationId");
  if (!foundationId) {
    showNotification("No foundation ID found. Please sign in again.");
    return;
  }
  try {
    const response = await fetch(`/api/foundation/profile/${foundationId}`);
    const data = await response.json();
    if (data.success) {
      loadFoundationProfile(data.foundationData);
      // Optionally, fetch projects and donations here if you have backend endpoints
    } else {
      showNotification(data.message || "Failed to load profile.");
    }
  } catch (err) {
    showNotification("Network error. Please try again.");
  }
});

function loadFoundationProfile(foundationData) {
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

// Navigation for home button
function goHome() {
  window.location.href = "index.html";
}

function logout() {
  if (confirm('Are you sure you want to logout? This will clear your session data.')) {
    localStorage.clear();
    window.location.href = 'index.html';
  }
}