// public/js/staff_profile.js
document.addEventListener('DOMContentLoaded', function () {
  // Check if staff is logged in
  const staffData = localStorage.getItem('staffData');
  if (!staffData) {
    window.location.href = 'staffsignin.html';
    return;
  }
  const staff = JSON.parse(staffData || '{}');

  // Fill profile fields
  setText('staffName', `${safe(staff.first_name)} ${safe(staff.last_name)}`.trim());
  setText('staffId', staff.staff_id || 'N/A');
  setText('staffUsername', staff.username || 'N/A');
  setText('staffEmail', staff.email || 'N/A');
  setText('staffMobile', staff.mobile || 'N/A');
  setText('staffNid', staff.nid || 'N/A');
  setText('staffDob', formatDate(staff.dob));
  setText('staffAddress', [
    staff.house_no, staff.road_no, staff.area, staff.district, staff.administrative_div, staff.zip
  ].filter(Boolean).join(' ') || 'N/A');
  setText('staffStatus', staff.status || 'N/A');

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('staffId');
      localStorage.removeItem('staffData');
      localStorage.removeItem('userType');
      window.location.href = 'staffsignin.html';
    });
  }

  // Create Individual Account
  const createBtn = document.getElementById('createIndividualBtn');
  if (createBtn) {
    createBtn.addEventListener('click', function () {
      const stored = localStorage.getItem('staffData');
      if (stored) sessionStorage.setItem('assistingStaff', stored);
      window.location.href = 'individual.html';
    });
  }

  // Load pending verification events
  loadPendingEvents(staff).catch(err => {
    console.error('loadPendingEvents failed:', err);
  });
});

async function loadPendingEvents(staff) {
  const container = document.getElementById('pendingEventsContainer');
  if (!container) return;

  container.innerHTML = `<div class="loading">Loading pending events...</div>`;

  try {
    const resp = await fetch('/api/staff/pending-events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staff.staff_id || ''}` // Simple auth using staff_id
      }
    });

    if (!resp.ok) {
      if (resp.status === 404) {
        throw new Error('Staff verification endpoints not available. Please restart the server.');
      } else if (resp.status === 500) {
        container.innerHTML = `
          <div class="no-events" style="background:#fff3cd;color:#856404;border:1px solid #ffeaa7;padding:20px;">
            🔧 <strong>Feature Under Maintenance</strong>
            <br><small style="margin-top:8px;display:block;">
              The event verification system is being set up. This feature will be available shortly.
            </small>
            <br><small style="color:#6b7280;margin-top:8px;display:block;">
              For now, you can still use the "Create Individual Account" feature above.
            </small>
          </div>
        `;
        return;
      }
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.message || `Server error: ${resp.status}`);
    }

    const data = await resp.json();
    console.log('Pending events payload:', data);

    if (!data.data || data.data.length === 0) {
      container.innerHTML = '<div class="no-events">📭 No pending events for verification</div>';
      return;
    }

    container.innerHTML = data.data.map(event => `
      <div class="event-card" onclick="openEventDetails('${safe(event.creation_id)}')">
        <h4>${safe(event.title)}</h4>
        <div class="event-meta">
          <span>👤 ${safe(event.creator_name || 'Unknown')}</span>
          <span>📍 ${safe(event.division || 'N/A')}</span>
          <span>💰 ${formatTaka(event.amount_needed)}</span>
          <span>📅 ${formatDate(event.created_at)}</span>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading pending events:', error);
    container.innerHTML = `
      <div class="no-events" style="color:#e53e3e;">
        ❌ Failed to load pending events
        <br><small style="color:#6b7280;margin-top:8px;display:block;">
          ${safe(error.message)}
        </small>
        <br><small style="color:#6b7280;margin-top:8px;display:block;">
          Please make sure the server is running and try refreshing the page.
        </small>
      </div>
    `;
  }
}

function openEventDetails(creationId) {
  if (!creationId) return;
  window.location.href = `staff-event-details.html?creation_id=${encodeURIComponent(creationId)}`;
}

// ---------- Utils ----------
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function safe(v) {
  // quick text escape by using textContent on a temp node
  const div = document.createElement('div');
  div.textContent = v == null ? '' : String(v);
  return div.textContent;
}
function formatTaka(amount) {
  const num = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0
    }).format(num);
  } catch {
    return `${num} BDT`;
  }
}
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d)) return 'N/A';
  return d.toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' });
}
