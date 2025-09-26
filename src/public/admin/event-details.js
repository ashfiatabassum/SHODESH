// Admin — Event Details
const $ = (sel, root=document) => root.querySelector(sel);

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function fetchJSON(url, opts) {
  const res = await fetch(url, { headers: authHeaders(), ...(opts||{}) });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
  return data;
}

function authHeaders(){
  // Reuse session cookie for admin auth; add optional bearer if you use token
  const headers = {};
  const token = sessionStorage.getItem('adminToken');
  if (token) headers['Authorization'] = token;
  return headers;
}

function asTaka(n){ return Number(n||0).toLocaleString('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }); }
function pct(need, got){ need=Number(need||0); got=Number(got||0); return need>0? Math.min(100,Math.round((got/need)*100)) : 0; }
function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));}

async function main(){
  const id = getParam('creation_id');
  if(!id){
    $('#title').textContent = 'Missing creation_id';
    return;
  }
  try{
    const res = await fetchJSON(`/api/admin/events/${encodeURIComponent(id)}/details`);
    const e = res.data;
    // Cover
    const coverEl = $('#cover');
    if(e.cover_photo_url){ coverEl.src = e.cover_photo_url; }
    else coverEl.replaceWith(Object.assign(document.createElement('div'),{textContent:'No cover photo uploaded', id:'cover', style:'display:flex;align-items:center;justify-content:center;height:320px;background:#e2e8f0;color:#475569;font-weight:600;font-size:18px;border-radius:12px;'}));
    // Basics
    $('#title').textContent = e.title || 'Untitled';
    $('#desc').textContent = e.description || '';
    $('#catTag').textContent = `${e.category_name||''}${e.event_type_name? ' • '+e.event_type_name:''}`;
    $('#divisionTag').textContent = e.division || '';
    
    // Status badge
    const status = (e.verification_status || 'unverified').toLowerCase();
    const secondVerification = e.second_verification_required === 1;
    const statusBadge = $('#badge');
    
    // Determine display status
    let displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
    if (status === 'pending' && secondVerification) {
      displayStatus = 'Pending Staff';
    } else if (status === 'pending' && !secondVerification) {
      displayStatus = 'Pending Final';
    }
    
    statusBadge.textContent = displayStatus;
    statusBadge.className = `badge ${status}`;
    
    if(e.created_at){
      const d = new Date(e.created_at);
      const nice = d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
      $('#createdAtTag').textContent = `Created ${nice}`;
    }
    const p = pct(e.amount_needed, e.amount_received);
    $('#goal').textContent = asTaka(e.amount_needed);
    $('#raised').textContent = asTaka(e.amount_received);
    $('#pct').textContent = p+'%';
    $('#bar').style.width = p+'%';
    $('#about').textContent = e.description || '';
    if (e.creator_name || e.contact_phone || e.contact_email) {
      $('#contactSection').hidden = false;
      $('#contact').innerHTML = `
        ${e.creator_name ? `<div><strong>Organizer:</strong> ${escapeHTML(e.creator_name)}</div>`:''}
        ${e.contact_phone ? `<div><strong>Phone:</strong> ${escapeHTML(e.contact_phone)}</div>`:''}
        ${e.contact_email ? `<div><strong>Email:</strong> ${escapeHTML(e.contact_email)}</div>`:''}
      `;
    }
    // Doc
    const box = $('#docBox');
    if(e.document_url){ box.innerHTML = `<a href="${e.document_url}" target="_blank" rel="noopener">Download Document</a>`; }

    // Approve/Reject/Second Verification - show appropriate buttons based on status
    const approveBtn = $('#approveBtn');
    const rejectBtn = $('#rejectBtn');
    const secondVerifyBtn = $('#secondVerifyBtn');
    
    if (status === 'verified' || status === 'rejected') {
      // Event is finalized - hide all action buttons
      approveBtn.style.display = 'none';
      rejectBtn.style.display = 'none';
      secondVerifyBtn.style.display = 'none';
    } else if (status === 'pending' && secondVerification) {
      // Waiting for staff verification - only show staff info
      approveBtn.style.display = 'none';
      rejectBtn.style.display = 'none';
      secondVerifyBtn.style.display = 'none';
    } else if (status === 'pending' && !secondVerification) {
      // Staff approved, waiting for final admin decision
      approveBtn.style.display = 'inline-block';
      rejectBtn.style.display = 'inline-block';
      secondVerifyBtn.style.display = 'none';
      approveBtn.textContent = 'Final Approve';
      rejectBtn.textContent = 'Final Reject';
      approveBtn.addEventListener('click', ()=> verify(id, 'approve'));
      rejectBtn.addEventListener('click', ()=> verify(id, 'reject'));
    } else if (status === 'unverified') {
      // Initial admin review - show all options
      approveBtn.addEventListener('click', ()=> verify(id, 'approve'));
      rejectBtn.addEventListener('click', ()=> verify(id, 'reject'));
      
      // Only show second verification option for individual events
      if (e.creator_type === 'individual') {
        secondVerifyBtn.style.display = 'inline-block';
        secondVerifyBtn.addEventListener('click', ()=> showStaffModal(id));
      }
    }
    
    // Store event data globally for modal usage
    window.currentEvent = e;
  } catch(err){
    console.error('Admin event details load error:', err);
    $('#desc').textContent = 'Failed to load event details: '+err.message;
  }
}

async function verify(id, action){
  try{
    const res = await fetch(`/api/admin/events/${encodeURIComponent(id)}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ action })
    });
    const json = await res.json();
    if(!res.ok || !json.success) throw new Error(json.message||`Failed to ${action}`);
    alert(`Event ${action === 'approve' ? 'approved' : 'rejected'}`);
    // Reload details
    window.location.reload();
  }catch(err){
    alert('Verification failed: '+err.message);
  }
}

async function showStaffModal(eventId) {
  const modal = $('#staffModal');
  const content = $('#staffContent');
  
  modal.style.display = 'flex';
  content.innerHTML = '<p>Preparing staff verification...</p>';
  
  try {
    // First, request staff verification to change the event status
    const verifyRes = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ action: 'request_staff' })
    });
    
    const verifyJson = await verifyRes.json();
    if (!verifyRes.ok || !verifyJson.success) {
      throw new Error(verifyJson.message || 'Failed to initialize staff verification');
    }
    
    // Now fetch available staff (event should be pending with second_verification_required = 1)
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
          Available staff from <strong>${window.currentEvent?.division || 'this division'}</strong> division:
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
          <button class="btn-select" onclick="requestStaffVerification('${eventId}', '${s.staff_id}', '${escapeHTML(s.first_name)} ${escapeHTML(s.last_name)}')">
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
        <p style="font-size:14px;margin-top:10px;">${error.message}</p>
      </div>
    `;
  }
}

// ⬇️ MODIFIED: actually assigns the staff_id to the latest request row
async function requestStaffVerification(eventId, staffId, staffName) {
  if (!confirm(`Assign verification to ${staffName}?\n\nThis staff member will be notified to review the event.`)) {
    return;
  }
  
  try {
    // Persist the assignment (sets staff_id on the latest 'request_staff_verification' row)
    const res = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}/assign-staff`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ staff_id: staffId })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Assign failed');
    }

    closeStaffModal();
    alert(`Assigned to ${staffName}.`);
    window.location.reload();
    
  } catch (error) {
    console.error('Staff verification request error:', error);
    alert('Failed to assign staff verification: ' + error.message);
  }
}

function closeStaffModal() {
  $('#staffModal').style.display = 'none';
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
  const modal = $('#staffModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeStaffModal();
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', main);
