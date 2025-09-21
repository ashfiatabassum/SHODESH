// Staff Event Details - Verification Interface
const $ = (sel, root=document) => root.querySelector(sel);

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function fetchJSON(url, opts) {
  const staff = JSON.parse(localStorage.getItem('staffData') || '{}');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${staff.staff_id}`
  };
  
  const res = await fetch(url, { headers, ...(opts||{}) });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
  return data;
}

function asTaka(n){ 
  return Number(n||0).toLocaleString('en-BD', { 
    style: 'currency', 
    currency: 'BDT', 
    maximumFractionDigits: 0 
  }); 
}

function pct(need, got){ 
  need=Number(need||0); 
  got=Number(got||0); 
  return need>0? Math.min(100,Math.round((got/need)*100)) : 0; 
}

function escapeHTML(s){
  return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
}

async function main(){
  // Check staff authentication
  const staffDataRaw = localStorage.getItem('staffData');
  console.log('[DEBUG] staffData in localStorage:', staffDataRaw);
  if (!staffDataRaw) {
    alert('Please log in as staff first');
    window.location.href = 'staffsignin.html';
    return;
  }
  let staff;
  try {
    staff = JSON.parse(staffDataRaw);
    if (!staff.staff_id) throw new Error('Missing staff_id');
  } catch (e) {
    alert('Staff authentication data is corrupted. Please sign in again.');
    localStorage.removeItem('staffData');
    window.location.href = 'staffsignin.html';
    return;
  }

  const id = getParam('creation_id');
  if(!id){
    $('#title').textContent = 'Missing creation_id';
    return;
  }
  
  try{
    const res = await fetchJSON(`/api/staff/events/${encodeURIComponent(id)}/details`);
    const e = res.data;
    
    // Cover photo
    const coverEl = $('#cover');
    if(e.cover_photo_url){ 
      coverEl.src = e.cover_photo_url; 
    } else {
      coverEl.src = 'https://placehold.co/960x540?text=No+Cover+Photo';
    }
    
    // Basic information
    $('#title').textContent = e.title || 'Untitled';
    $('#desc').textContent = e.description || 'No description provided';
    $('#catTag').textContent = `${e.category_name||''}${e.event_type_name? ' • '+e.event_type_name:''}`;
    $('#divisionTag').textContent = e.division || '';
    $('#createdAtTag').textContent = `Created ${new Date(e.created_at).toLocaleDateString('en-BD')}`;
    
    // Financial information - using the admin layout structure
    $('#goal').textContent = asTaka(e.amount_needed);
    $('#raised').textContent = asTaka(e.amount_collected);
    const progress = pct(e.amount_needed, e.amount_collected);
    $('#pct').textContent = `${progress}%`;
    $('#bar').style.width = `${progress}%`;
    
    // Status badge
    const status = (e.verification_status || 'pending').toLowerCase();
    const badge = $('#badge');
    badge.className = `badge ${status}`;
    badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    
    // Documents
    const docBox = $('#docBox');
    if(e.documents && e.documents.length > 0){
      docBox.innerHTML = e.documents.map(doc => 
        `<a href="${escapeHTML(doc.url)}" target="_blank">${escapeHTML(doc.name)}</a>`
      ).join('<br>');
    } else {
      docBox.innerHTML = '<span class="muted">No document</span>';
    }
    
    // About section
    $('#about').innerHTML = escapeHTML(e.description || 'No additional details provided.');
    
    // Contact section (if available)
    if (e.creator_contact) {
      $('#contact').innerHTML = escapeHTML(e.creator_contact);
      $('#contactSection').hidden = false;
    }
    
    // Set up verification buttons
    setupVerificationButtons(id, e);
    
  } catch(error){
    console.error('Error loading event details:', error);
    $('#title').textContent = 'Error loading event';
    $('#desc').textContent = error.message;
  }
}

function setupVerificationButtons(eventId, eventData) {
  const approveBtn = $('#approveBtn');
  const rejectBtn = $('#rejectBtn');
  
  // Only show buttons for pending events
  if (eventData.verification_status !== 'pending') {
    approveBtn.style.display = 'none';
    rejectBtn.style.display = 'none';
    return;
  }
  
  approveBtn.addEventListener('click', () => verifyEvent(eventId, 'approve'));
  rejectBtn.addEventListener('click', () => verifyEvent(eventId, 'reject'));
}

async function verifyEvent(eventId, decision) {
  const action = decision === 'approve' ? 'approved' : 'rejected';
  const message = decision === 'approve' ? 
    'Are you sure you want to APPROVE this event?\n\nThis will mark the event as verified and active.' :
    'Are you sure you want to REJECT this event?\n\nPlease provide a reason for rejection.';
  
  let reason = '';
  if (decision === 'reject') {
    reason = prompt('Please provide a reason for rejection:');
    if (!reason || !reason.trim()) {
      alert('Rejection reason is required');
      return;
    }
  }
  
  if (!confirm(message)) return;
  
  try {
    const staff = JSON.parse(localStorage.getItem('staffData'));
    
    const response = await fetch(`/api/staff/events/${encodeURIComponent(eventId)}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staff.staff_id}`
      },
      body: JSON.stringify({ 
        decision: action,
        reason: reason.trim() || undefined
      })
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Verification failed');
    }
    
    alert(`Event ${action} successfully!\n\nReturning to your profile.`);
    window.location.href = 'staff_profile.html';
    
  } catch (error) {
    console.error('Verification error:', error);
    alert(`Failed to ${decision} event: ${error.message}`);
  }
}

document.addEventListener('DOMContentLoaded', main);