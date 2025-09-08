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
      await loadProjects(foundationId);
      await loadReceivedDonations(foundationId); // <-- fetch donations after projects
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

async function loadProjects(foundationId) {
  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = '<p>Loading projects...</p>';
  try {
    const response = await fetch(`/api/foundation/projects/${foundationId}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    const projects = result.projects || [];
    document.getElementById('totalProjects').textContent = projects.length;

    // Use backend totalReceived and ensure it's a number
    const totalReceived = Number(result.totalReceived) || 0;
    document.getElementById('totalReceived').textContent = '৳' + totalReceived.toLocaleString();

    renderProjects(projects);
  } catch (err) {
    projectsList.innerHTML = `<p>Error loading projects: ${err.message}</p>`;
  }
}

function renderProjects(projects) {
  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = '';

  projects.forEach((project, idx) => {
    const projectDiv = document.createElement('div');
    projectDiv.className = 'project-dropdown';
    projectDiv.innerHTML = `
      <button class="project-title-btn" onclick="toggleProjectDetails('project-details-${idx}')">
        ${project.title}
      </button>
      <div class="project-details" id="project-details-${idx}" style="display:none;">
        <p><strong>Description:</strong> ${project.description}</p>
        <p><strong>Amount Needed:</strong> ৳${Number(project.amount_needed).toLocaleString()}</p>
        <p><strong>Amount Received:</strong> ৳${Number(project.amount_received).toLocaleString()}</p>
      </div>
    `;
    projectsList.appendChild(projectDiv);
  });
}

async function loadReceivedDonations(foundationId) {
  const card = document.getElementById('receivedDonationsCard');
  if (!card) return;

  try {
    const response = await fetch(`/api/foundation/donations/${foundationId}`);
    const result = await response.json();
    const donations = result.success ? result.donations : [];

    card.innerHTML = `
      <div class="card-header">
        <h2><i class="fas fa-hand-holding-heart"></i> Received Donations</h2>
      </div>
      <div class="card-content">
        <div class="donations-list" style="margin-top:10px;">
          ${donations.length === 0
            ? '<p style="color:#888;">No donations received yet.</p>'
            : `
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${donations.map(d => `
                  <div style="
                    background: #f8f9fa;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(74,124,89,0.07);
                    padding: 14px 18px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                  ">
                    <span style="font-weight:600; color:#2d5a3d;">
                      ${d.first_name} ${d.last_name}
                    </span>
                    <span style="color:#4a7c59; font-weight:700;">৳${Number(d.amount).toLocaleString()}</span>
                    <span style="color:#888; font-size:0.95em;">${new Date(d.paid_at).toLocaleDateString()}</span>
                  </div>
                `).join('')}
              </div>
            `
          }
        </div>
      </div>
    `;
  } catch (err) {
    card.innerHTML = `<div class="card-header">
      <h2><i class="fas fa-hand-holding-heart"></i> Received Donations</h2>
    </div>
    <div class="card-content">
      <p style="color:#888;">Error loading donations.</p>
    </div>`;
    console.error('Error loading donations:', err);
  }
}

function toggleProjectDetails(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
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