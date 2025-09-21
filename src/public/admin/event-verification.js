// Admin Event Verification – dynamic filters like search.js with correct ebc_id handling
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const els = {
    status: $('statusFilter'),
    category: $('categoryFilter'),
    event: $('eventFilter'),
    organizer: $('organizerFilter'),
    grid: document.getElementById('eventsContainer')
  };

  const state = {
    status: '',
    categoryId: '',
    eventTypeId: '',
    ebcId: '',
    organizerType: ''
  };

  init();

  async function init() {
    await loadCategories(); // sp_get_categories
    bindHandlers();
    await loadAdminEvents();
  }

  function bindHandlers() {
    els.category.addEventListener('change', async () => {
      state.categoryId = els.category.value || '';
      state.eventTypeId = '';
      state.ebcId = '';
      resetEventDropdown();
      if (state.categoryId) await loadEventTypes(state.categoryId); // sp_get_event_types
      await loadAdminEvents();
    });

    els.event.addEventListener('change', async () => {
      const opt = els.event.selectedOptions[0];
      state.eventTypeId = els.event.value || '';
      state.ebcId = opt ? (opt.dataset.ebc || '') : '';
      await loadAdminEvents();
    });

    els.status?.addEventListener('change', async () => {
      state.status = els.status.value || '';
      await loadAdminEvents();
    });

    els.organizer?.addEventListener('change', async () => {
      state.organizerType = els.organizer.value || '';
      await loadAdminEvents();
    });
  }

  function resetEventDropdown() {
    els.event.innerHTML = '<option value="">All Events</option>';
    els.event.disabled = true;
  }

  async function loadCategories() {
    try {
      const res = await fetch('/api/search/categories'); // maps to sp_get_categories
      const json = await res.json();
      const rows = json?.data || [];
      els.category.innerHTML = '<option value="">All Categories</option>';
      rows.forEach(row => {
        const opt = document.createElement('option');
        opt.value = row.category_id;
        opt.textContent = row.category_name;
        els.category.appendChild(opt);
      });
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  }

  async function loadEventTypes(categoryId) {
    try {
      const url = `/api/search/event-types?category_id=${encodeURIComponent(categoryId)}`; // sp_get_event_types
      const res = await fetch(url);
      const json = await res.json();
      const rows = json?.data || [];
      resetEventDropdown();
      if (rows.length) els.event.disabled = false;
      rows.forEach(row => {
        const opt = document.createElement('option');
        opt.value = row.event_type_id;
        opt.textContent = row.event_type_name;
        // If backend provides ebc_id, keep it like search.js does
        if (row.ebc_id) opt.dataset.ebc = row.ebc_id;
        els.event.appendChild(opt);
      });
    } catch (e) {
      console.error('Failed to load event types:', e);
    }
  }

  async function loadAdminEvents() {
    try {
      const params = new URLSearchParams();
      if (state.status) params.set('status', state.status);
      if (state.categoryId) params.set('category_id', state.categoryId);
      if (state.eventTypeId) params.set('event_type_id', state.eventTypeId);
      if (state.ebcId) params.set('ebc_id', state.ebcId);
      if (state.organizerType) params.set('creator_type', state.organizerType);
      params.set('sort_by', 'recent');
      params.set('limit', '100');
      params.set('offset', '0');

      const headers = authHeaders();
  const res = await fetch(`/api/admin/events?${params.toString()}` , { headers });
      if (!res.ok) {
        console.warn('Admin verification endpoint not available', res.status);
        renderEmpty('No events');
        return;
      }
      const json = await res.json();
      const events = json?.data || [];
      renderEvents(events);
    } catch (e) {
      console.error('Failed to load admin events:', e);
      renderEmpty('Failed to load');
    }
  }

  function renderEmpty(msg) {
    els.grid.innerHTML = `
      <div class="no-events">
        <i class="fas fa-inbox"></i>
        <p>${msg}</p>
      </div>`;
  }

  function renderEvents(list) {
    if (!list || !list.length) return renderEmpty('No events');
    
    // Create grid container using search.css classes
    const gridContainer = document.createElement('div');
    gridContainer.className = 'search-results grid-view';
    
    const html = list.map(ev => {
      const status = (ev.verification_status || 'unverified').toLowerCase();
      const secondVerification = ev.second_verification_required === 1;
      
      // Determine badge and display status
      let badge, displayStatus;
      if (status === 'verified') {
        badge = 'verified';
        displayStatus = 'VERIFIED';
      } else if (status === 'pending' && secondVerification) {
        badge = 'pending';
        displayStatus = 'PENDING STAFF';
      } else if (status === 'pending' && !secondVerification) {
        badge = 'pending';
        displayStatus = 'PENDING FINAL';
      } else if (status === 'rejected') {
        badge = 'rejected';
        displayStatus = 'REJECTED';
      } else {
        badge = 'pending';
        displayStatus = 'UNVERIFIED';
      }
      
      const created = ev.created_at ? new Date(ev.created_at).toLocaleDateString() : '';
      const coverHtml = ev.has_cover_photo
        ? `<img src="/api/admin/events/${ev.creation_id}/cover-photo" alt="cover" onerror="this.replaceWith(document.createTextNode('No cover'))"/>`
        : '<div class="no-image">No cover photo uploaded</div>';
      const docLink = ev.has_document
        ? `<a class="btn secondary" href="/api/admin/events/${ev.creation_id}/document" target="_blank" rel="noopener">Download DOC</a>`
        : '<span class="muted">No document</span>';
      
      // Use search.css campaign-card structure - clickable to go to details
      return `
        <div class="campaign-card" data-id="${ev.creation_id}" onclick="window.location.href='/admin/event-details.html?creation_id=${encodeURIComponent(ev.creation_id)}'">
          <div class="card-image">
            ${coverHtml}
            <div class="urgency-badge ${badge}">${displayStatus}</div>
          </div>
          <div class="card-content">
            <h3 class="campaign-title">${escapeHtml(ev.title || '')}</h3>
            <p class="campaign-organizer">
              <i class="fas fa-user"></i>
              ${escapeHtml(ev.creator_name || ev.creator_type || '')}
              <span class="creator-type">(${ev.creator_type})</span>
            </p>
            <p class="campaign-category">
              <i class="fas fa-tag"></i>
              ${escapeHtml(ev.category_name || '')} - ${escapeHtml(ev.event_type_name || '')}
            </p>
            <p class="campaign-location">
              <i class="fas fa-map-marker-alt"></i>
              ${escapeHtml(ev.division || '')}
            </p>
            <div class="progress-section">
              <div class="amount-info">
                <span class="target">Goal: ৳${Number(ev.amount_needed||0).toLocaleString()}</span>
                <span class="raised">Raised: ৳${Number(ev.amount_received||0).toLocaleString()}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(100, (ev.amount_received || 0) / (ev.amount_needed || 1) * 100)}%"></div>
              </div>
            </div>
            <div class="campaign-meta">
              <span class="meta-item">
                <i class="fas fa-calendar"></i>
                ${created}
              </span>
              <span class="meta-item">
                <i class="fas fa-heart"></i>
                ${Number(ev.donor_count||0)} donors
              </span>
            </div>
            <div class="admin-actions">
              ${docLink}
            </div>
          </div>
        </div>`;
    }).join('');
    
    gridContainer.innerHTML = html;
    els.grid.innerHTML = '';
    els.grid.appendChild(gridContainer);
  }

  function escapeHtml(s) {
    return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  function authHeaders(){
    const headers = {};
    const token = sessionStorage.getItem('adminToken');
    if (token) headers['Authorization'] = token;
    return headers;
  }
});
