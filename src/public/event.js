// SHODESH — Event Detail Page
const $ = (sel, root=document) => root.querySelector(sel);

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function fetchJSON(url) {
  const res = await fetch(url);
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok) {
    const message = (data && data.message) ? data.message : `HTTP ${res.status}`;
    const err = new Error(message + ` for ${url}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function asTaka(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 });
}
function pct(need, got) {
  need = Number(need||0); got = Number(got||0);
  if (need <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((got/need)*100)));
}

async function main() {
  const id = getParam('creation_id');
  if (!id) {
    $("#title").textContent = "Missing event id";
    $("#desc").textContent = "Provide ?creation_id=ECxxxxx in the URL.";
    return;
  }
  // Listen for donation updates from other tabs (localStorage event not fired in same tab that sets it)
  window.addEventListener('storage', ev => {
    if(ev.key === 'shodesh:lastDonation'){
      try {
        const payload = JSON.parse(ev.newValue||'{}');
        if(payload.creationId === id){
          // Only refresh monetary progress to keep UX snappy
          refreshAmounts(id);
        }
      } catch {/* ignore parse errors */}
    }
  });
  try {
  console.log('Fetching event detail for', id);
    let res;
    try {
      res = await fetchJSON(`/api/events/${encodeURIComponent(id)}`);
    } catch (primaryErr) {
      // If route missing (custom 404 json from global handler) attempt legacy path
      if (primaryErr.status === 404 && (!primaryErr.data || primaryErr.data.message === 'This endpoint does not exist')) {
        console.warn('Primary /api/events route missing, falling back to /api/search/event/');
        try {
          const legacy = await fetchJSON(`/api/search/event/${encodeURIComponent(id)}`);
          res = legacy; // legacy shape already success/data
        } catch (legacyErr) {
          throw legacyErr; // propagate legacy failure
        }
      } else {
        throw primaryErr;
      }
    }
    if(!res.success) {
      let extra = '';
      if (res.status) {
        extra = ` (status: verification=${res.status.verification_status}, lifecycle=${res.status.lifecycle_status})`;
      }
      throw new Error(res.message + extra);
    }
    const e = res.data;
    const coverEl = $("#cover");
    if (e.cover_photo_url) {
      coverEl.src = e.cover_photo_url;
      coverEl.alt = e.title || 'Event cover';
    } else {
      coverEl.replaceWith(Object.assign(document.createElement('div'), {textContent:'No photo uploaded', id:'cover', style:'display:flex;align-items:center;justify-content:center;height:320px;background:#e2e8f0;color:#475569;font-weight:600;font-size:18px;border-radius:12px;'}));
    }

    // Handle document section visibility and download
    const documentsSection = $("#documentsSection");
    const downloadDocBtn = $("#downloadDocBtn");
    
    // Check if event has supporting documentation (assuming doc field exists in response)
    if (e.has_doc || e.doc || e.doc_url) {
      documentsSection.hidden = false;
      
      // Set up document download functionality
      downloadDocBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        try {
          // Show loading state
          const originalText = downloadDocBtn.innerHTML;
          downloadDocBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M16 12L12 8L8 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Downloading...`;
          downloadDocBtn.disabled = true;
          
          // Create download link and trigger download
          const downloadUrl = `/api/events/${encodeURIComponent(id)}/file/doc`;
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `${e.title || 'Event'}_Supporting_Documents`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Reset button state after a short delay
          setTimeout(() => {
            downloadDocBtn.innerHTML = originalText;
            downloadDocBtn.disabled = false;
          }, 2000);
          
        } catch (error) {
          console.error('Document download failed:', error);
          
          // Show error state
          downloadDocBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
              <path d="M15 9L9 15" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 9L15 15" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Failed`;
          downloadDocBtn.style.background = '#ef4444';
          
          // Reset after delay
          setTimeout(() => {
            downloadDocBtn.innerHTML = originalText;
            downloadDocBtn.disabled = false;
            downloadDocBtn.style.background = '';
          }, 3000);
        }
      });
    } else {
      documentsSection.hidden = true;
    }
    $("#title").textContent = e.title || "Untitled event";
    $("#desc").textContent = e.description || "";
    $("#catTag").textContent = `${e.category_name || ''}${e.event_type_name ? ' • ' + e.event_type_name : ''}`.trim();
    $("#divisionTag").textContent = e.division || "";
    // Created date
    try {
      if (e.created_at) {
        const dt = new Date(e.created_at);
        const nice = dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        const rel = timeAgo(dt);
        $("#createdAtTag").textContent = `Created ${nice}${rel ? ' • ' + rel : ''}`;
      }
    } catch {}
    const progress = pct(e.amount_needed, e.amount_received);
    $("#goal").textContent = asTaka(e.amount_needed);
    $("#raised").textContent = asTaka(e.amount_received);
    $("#pct").textContent = progress + "%";
    $("#bar").style.width = progress + "%";

  $("#about").textContent = e.description || $("#desc").textContent;

    if (e.organizer || e.contact_phone || e.contact_email) {
      $("#contactSection").hidden = false;
      $("#contact").innerHTML = `
        ${e.organizer ? `<div><strong>Organizer:</strong> ${escapeHTML(e.organizer)}</div>` : ""}
        ${e.contact_phone ? `<div><strong>Phone:</strong> ${escapeHTML(e.contact_phone)}</div>` : ""}
        ${e.contact_email ? `<div><strong>Email:</strong> ${escapeHTML(e.contact_email)}</div>` : ""}
      `;
    }

    $("#donateBtn").addEventListener("click", () => {
      window.location.href = `/donate.html?creation_id=${encodeURIComponent(id)}`;
    });
    $("#shareBtn").addEventListener("click", async () => {
      try {
        await navigator.share({ title: e.title, text: "Support this event on SHODESH", url: window.location.href });
      } catch {}
      try {
        await navigator.clipboard.writeText(window.location.href);
        $("#shareBtn").textContent = "Link copied!";
        setTimeout(() => $("#shareBtn").textContent = "Share", 1500);
      } catch {}
    });

  } catch (err) {
    console.error('Event detail load error:', err);
    $("#title").textContent = "Event not found";
    let extra = '';
    if (err.data && err.data.status) {
      extra = `<br><small style="color:#b45309">Status: verification=${escapeHTML(err.data.status.verification_status)} lifecycle=${escapeHTML(err.data.status.lifecycle_status)}</small>`;
    }
    $("#desc").innerHTML = `We couldn't load details for this event.<br><small style="color:#64748b">ID: ${escapeHTML(id)} | ${escapeHTML(err.message)}</small>${extra}`;
  }
}

// Fetch only current amounts & update progress UI (lightweight refresh after donation elsewhere)
async function refreshAmounts(id){
  try {
    const res = await fetchJSON(`/api/events/${encodeURIComponent(id)}`);
    if(!res.success) return;
    const e = res.data;
    const progress = pct(e.amount_needed, e.amount_received);
    $("#raised").textContent = asTaka(e.amount_received);
    $("#pct").textContent = progress + "%";
    $("#bar").style.width = progress + "%";
  } catch(err){ console.warn('Refresh amounts failed:', err.message); }
}

function escapeHTML(str) {
  return String(str ?? "").replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[s]);
}

function timeAgo(date){
  try{
    const d = (date instanceof Date) ? date : new Date(date);
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff/1000);
    const min = Math.floor(sec/60);
    const hr = Math.floor(min/60);
    const day = Math.floor(hr/24);
    if (day > 365) return `${Math.floor(day/365)}y ago`;
    if (day > 30) return `${Math.floor(day/30)}mo ago`;
    if (day > 7) return `${Math.floor(day/7)}w ago`;
    if (day >= 1) return `${day}d ago`;
    if (hr >= 1) return `${hr}h ago`;
    if (min >= 1) return `${min}m ago`;
    if (sec >= 10) return `${sec}s ago`;
    return 'just now';
  } catch { return '' }
}

document.addEventListener("DOMContentLoaded", main);
