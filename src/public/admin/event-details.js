// public/js/event-details.js
// Admin — Event Details
const $ = (sel, root = document) => root.querySelector(sel);

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function authHeaders() {
  const headers = {};
  const token = sessionStorage.getItem('adminToken');
  if (token) headers['Authorization'] = token;
  return headers;
}

async function fetchJSON(url, opts) {
  const res = await fetch(url, { headers: authHeaders(), ...(opts || {}) });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
  return data;
}

function asTaka(n) {
  return Number(n || 0).toLocaleString('en-BD', {
    style: 'currency', currency: 'BDT', maximumFractionDigits: 0
  });
}
function pct(need, got) {
  need = Number(need || 0); got = Number(got || 0);
  return need > 0 ? Math.min(100, Math.round((got / need) * 100)) : 0;
}
function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

async function main() {
  const id = getParam('creation_id');
  if (!id) {
    $('#title').textContent = 'Missing creation_id';
    return;
  }
  try {
  const res = await fetchJSON(`/api/admin/events/${encodeURIComponent(id)}/details`);
    const e = res.data;
    window.currentEvent = e; // cache for modal

    // Cover
    const coverEl = $('#cover');
    if (e.cover_photo_url) coverEl.src = e.cover_photo_url;
    else coverEl.replaceWith(Object.assign(document.createElement('div'), {
      textContent: 'No cover photo uploaded',
      id: 'cover',
      style: 'display:flex;align-items:center;justify-content:center;height:320px;background:#e2e8f0;color:#475569;font-weight:600;font-size:18px;border-radius:12px;'
    }));

    // Basics
    $('#title').textContent = e.title || 'Untitled';
    $('#desc').textContent = e.description || '';
  $('#catTag').textContent = `${e.category_name || ''}${e.event_type_name ? ' • ' + e.event_type_name : ''}`;
    $('#divisionTag').textContent = e.division || '';

    // Status badge
    const status = (e.verification_status || 'unverified').toLowerCase();
    const secondVerification = e.second_verification_required === 1 || e.second_verification_required === true;
    const statusBadge = $('#badge');

    let displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
    if (status === 'pending' && secondVerification) displayStatus = 'Pending Staff';
    else if (status === 'pending' && !secondVerification) displayStatus = 'Pending Final';

    statusBadge.textContent = displayStatus;
  statusBadge.className = `badge ${status}`;

    if (e.created_at) {
      const d = new Date(e.created_at);
      const nice = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  $('#createdAtTag').textContent = `Created ${nice}`;
    }

    // Progress
    const p = pct(e.amount_needed, e.amount_received);
    $('#goal').textContent = asTaka(e.amount_needed);
    $('#raised').textContent = asTaka(e.amount_received);
    $('#pct').textContent = p + '%';
    $('#bar').style.width = p + '%';

    // About & Contact
    $('#about').textContent = e.description || '';
    if (e.creator_name || e.contact_phone || e.contact_email) {
      $('#contactSection').hidden = false;
      $('#contact').innerHTML = `
  ${e.creator_name ? `<div><strong>Organizer:</strong> ${escapeHTML(e.creator_name)}</div>` : ''}
  ${e.contact_phone ? `<div><strong>Phone:</strong> ${escapeHTML(e.contact_phone)}</div>` : ''}
  ${e.contact_email ? `<div><strong>Email:</strong> ${escapeHTML(e.contact_email)}</div>` : ''}
      `;
    }

    // Document
    const box = $('#docBox');
  if (e.document_url) box.innerHTML = `<a href="${e.document_url}" target="_blank" rel="noopener">Download Document</a>`;

    // Buttons logic
    const approveBtn = $('#approveBtn');
    const rejectBtn = $('#rejectBtn');
    const secondVerifyBtn = $('#secondVerifyBtn');
    approveBtn.style.display = 'none';
    rejectBtn.style.display = 'none';
    secondVerifyBtn.style.display = 'none';

    if (status === 'verified' || status === 'rejected') {
      // finalized — nothing to do
    } else if (status === 'pending' && secondVerification) {
      // waiting for staff — hide controls
    } else if (status === 'pending' && !secondVerification) {
      // staff approved, admin final decision
      approveBtn.style.display = 'inline-block';
      rejectBtn.style.display = 'inline-block';
      approveBtn.textContent = 'Final Approve';
      rejectBtn.textContent = 'Final Reject';
      approveBtn.onclick = () => verify(id, 'approve');
      rejectBtn.onclick = () => verify(id, 'reject');
    } else if (status === 'unverified') {
      // first admin review
      approveBtn.style.display = 'inline-block';
      rejectBtn.style.display = 'inline-block';
      approveBtn.onclick = () => verify(id, 'approve');
      rejectBtn.onclick = () => verify(id, 'reject');

      if (e.creator_type === 'individual') {
        secondVerifyBtn.style.display = 'inline-block';
        secondVerifyBtn.onclick = () => showStaffModal(id);
      }
    }
  } catch (err) {
    console.error('Admin event details load error:', err);
    $('#desc').textContent = 'Failed to load event details: ' + err.message;
  }
}

async function verify(id, action) {
  try {
    const res = await fetch(`/api/admin/events/${encodeURIComponent(id)}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ action })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || `Failed to ${action}`);
    alert(`Event ${action === 'approve' ? 'approved' : 'rejected'}`);
    window.location.reload();
  } catch (err) {
    alert('Verification failed: ' + err.message);
  }
}

async function showStaffModal(eventId) {
  const modal = $('#staffModal');
  const content = $('#staffContent');

  modal.style.display = 'flex';
  content.innerHTML = '<p>Preparing staff verification...</p>';

  try {
    // Step 1: switch event to "request_staff_verification"
  const verifyRes = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ action: 'request_staff' })
    });
    const verifyJson = await verifyRes.json();
    if (!verifyRes.ok || !verifyJson.success) {
      throw new Error(verifyJson.message || 'Failed to initialize staff verification');
    }

    // Step 2: fetch eligible staff for this event
    content.innerHTML = '<p>Loading available staff...</p>';
  const res = await fetchJSON(`/api/admin/events/${encodeURIComponent(eventId)}/available-staff`);
    const staff = res.data;

    if (!staff || staff.length === 0) {
      content.innerHTML = `
        <div style="text-align:center;padding:20px;">
          <p style="color:#6b7280;margin-bottom:10px;">No eligible staff available for verification</p>
          <p style="font-size:14px;color:#9ca3af;">
            Staff from <strong>${window.currentEvent?.division || 'this division'}</strong>
            who haven't assisted in individual registration are required.
          </p>
        </div>
      `;
      return;
    }

    let html = `
      <div style="margin-bottom:15px;">
        <p style="color:#374151;font-weight:500;">
          Available staff from <strong>${window.currentEvent?.division || 'this division'}</strong>:
        </p>
        <p style="font-size:13px;color:#6b7280;">
          Select a staff member to request verification for this event.
        </p>
      </div>
      <div class="staff-list">
    `;

    staff.forEach(s => {
      html += `
        <div class="staff-item">
          <div class="staff-info">
            <div class="staff-name">${escapeHTML(s.first_name)} ${escapeHTML(s.last_name)}</div>
            <div class="staff-details">
              Username: ${escapeHTML(s.username)} • Division: ${escapeHTML(s.division)}
            </div>
          </div>
          <button class="btn-select"
            onclick="requestStaffVerification('${eventId}', '${s.staff_id}', '${escapeHTML(s.first_name)} ${escapeHTML(s.last_name)}')">
            Select
          </button>
        </div>
      `;
    });

    html += '</div>';
    content.innerHTML = html;
  } catch (error) {
    console.error('Error loading staff:', error);
    content.innerHTML = `
      <div style="text-align:center;padding:20px;color:#ef4444;">
        <p>Failed to load available staff</p>
        <p style="font-size:14px;margin-top:10px;">${escapeHTML(error.message)}</p>
      </div>
    `;
  }
}

async function requestStaffVerification(eventId, staffId, staffName) {
  if (!confirm(`Assign verification to ${staffName}?\n\nThis staff member will be asked to review the event.`)) return;

  try {
    // Step 3: attach the chosen staff to the round-1 request row
  const assignRes = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}/assign-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ staff_id: staffId })
    });
    const assignJson = await assignRes.json();
    if (!assignRes.ok || !assignJson.success) {
      throw new Error(assignJson.message || 'Failed to assign staff');
    }

    closeStaffModal();
  alert(`Assigned ${staffName}. They will now see this event in their pending list.`);
    window.location.reload();
  } catch (error) {
    console.error('Staff assignment error:', error);
    alert('Failed to assign staff: ' + error.message);
  }
}

function closeStaffModal() {
  $('#staffModal').style.display = 'none';
}

$('#staffModal')?.addEventListener('click', function (e) {
  if (e.target === this) closeStaffModal();
});

document.addEventListener('DOMContentLoaded', main);