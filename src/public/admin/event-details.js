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
    const statusBadge = $('#badge');
    statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
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

    // Approve/Reject - only show for unverified events
    const approveBtn = $('#approveBtn');
    const rejectBtn = $('#rejectBtn');
    
    if (status === 'verified' || status === 'rejected') {
      approveBtn.style.display = 'none';
      rejectBtn.style.display = 'none';
    } else {
      approveBtn.addEventListener('click', ()=> verify(id, 'approve'));
      rejectBtn.addEventListener('click', ()=> verify(id, 'reject'));
    }
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
      body: JSON.stringify({ action, notes: '' })
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

document.addEventListener('DOMContentLoaded', main);
