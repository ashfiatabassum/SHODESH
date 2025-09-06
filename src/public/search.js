// Professional Search Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Removed experimental MessageChannel debug that produced noisy console warnings.
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    // Adapt to existing markup: button has class 'search-submit-btn' (no id)
    const searchBtn = document.querySelector('.search-submit-btn');
    const categoryFilter = document.getElementById('categoryFilter');
    const eventFilter = document.getElementById('eventFilter');
    const urgencyFilter = document.getElementById('urgencyFilter'); // may be null (optional)
    const sortFilter = document.getElementById('sortFilter');
    // Clear filters button uses class 'clear-filters'
    const clearFiltersBtn = document.querySelector('.clear-filters');
    const resultsContainer = document.getElementById('searchResults');
    const loadingContainer = document.getElementById('loadingContainer');
    // View toggle buttons lack ids; select by order
    const viewButtons = document.querySelectorAll('.view-btn');
    const gridViewBtn = viewButtons[0] || null;
    const listViewBtn = viewButtons[1] || null;
    // In HTML the id is 'resultCount' (not 'resultsCount')
    const resultsCountEl = document.getElementById('resultCount');

    let campaigns = [];
    let categories = [];
    let eventTypes = [];
    let divisions = [];
    let filteredCampaigns = [];
    let currentView = 'grid';

    // Initialize page
    init();

    async function init() {
        await fetchFilters();
        await fetchCampaigns();
        displayCampaigns(filteredCampaigns);
        updateStats();
        bindEvents();
        animateStatsOnLoad();
    }

    async function fetchFilters() {
        // Fetch categories (only those with open events per SP logic)
        try {
            console.log('Fetching categories...');
            const catRes = await fetch('/api/search/categories');
            const catData = await catRes.json();
            categories = catData.data || [];
            populateDropdown(categoryFilter, categories, 'All Categories');
            console.log('Categories loaded:', categories);
        } catch (e) { console.error('Category fetch error', e); }

        // Initial Event dropdown: only All Events (will populate after category selection)
        eventFilter.innerHTML = '';
        const allEvOpt = document.createElement('option');
        allEvOpt.value = '';
        allEvOpt.textContent = 'All Events';
        eventFilter.appendChild(allEvOpt);
        eventFilter.disabled = true;

        // Initial divisions (all with campaigns)
        await refreshDivisions();
    }

    async function refreshDivisions() {
        const locationFilter = document.getElementById('locationFilter');
        if (!locationFilter) return;
        try {
            const params = new URLSearchParams();
            const eventOption = eventFilter.selectedOptions[0];
            const ebcId = eventOption ? eventOption.dataset.ebc : '';
            if (ebcId) params.append('ebc_id', ebcId);
            else if (categoryFilter.value) {
                params.append('category_id', categoryFilter.value);
                if (eventFilter.value) params.append('event_type_id', eventFilter.value);
            }
            const url = '/api/search/divisions' + (params.toString() ? `?${params.toString()}` : '');
            console.log('Fetching divisions...', url);
            const divRes = await fetch(url);
            const divData = await divRes.json();
            divisions = divData.data || [];
            populateDropdown(locationFilter, divisions, 'All Locations');
            console.log('Divisions loaded:', divisions);
        } catch (e) { console.error('Division fetch error', e); }
    }

    async function fetchEventTypesForCategory(categoryId) {
        try {
            console.log('Fetching event types for category', categoryId || '(all)');
            const url = categoryId ? `/api/search/event-types?category_id=${encodeURIComponent(categoryId)}` : '/api/search/event-types';
            const res = await fetch(url);
            const data = await res.json();
            eventTypes = data.data || [];
            populateDropdown(eventFilter, eventTypes, 'All Events');
            eventFilter.disabled = false;
            console.log('Event types loaded:', eventTypes);
        } catch (e) {
            console.error('Event types fetch error', e);
            eventFilter.disabled = true;
        }
    }

    async function fetchCampaigns() {
        try {
            console.log('Fetching campaigns...');
            const res = await fetch('/api/search/events');
            let campaignsRes = await res.json();
            campaigns = (campaignsRes.data || []).map(c => ({
                ...c,
                category: c.category || c.category_name || '',
                image: c.image || 'images/browse.jpeg',
                donors: c.donors ?? 0,
                daysLeft: c.daysLeft ?? 0,
                urgency: c.urgency || ''
            }));
            filteredCampaigns = [...campaigns];
            console.log('Campaigns loaded:', campaigns);
        } catch (e) {
            console.error('Campaign fetch error:', e);
            campaigns = [];
            filteredCampaigns = [];
        }
    }

    function populateDropdown(dropdown, items, defaultLabel) {
        dropdown.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = defaultLabel;
        dropdown.appendChild(defaultOpt);
        const arr = Array.isArray(items) ? items : items.data;
        if (arr && Array.isArray(arr)) {
            arr.forEach(item => {
                const opt = document.createElement('option');
                if (typeof item === 'object') {
                    if (dropdown.id === 'categoryFilter') {
                        opt.value = item.category_id || '';
                        opt.textContent = item.category_name || '';
                    } else if (dropdown.id === 'eventFilter') {
                        opt.value = item.event_type_id || '';
                        opt.textContent = item.event_type_name || '';
                        if (item.ebc_id) opt.dataset.ebc = item.ebc_id;
                        if (item.category_id) opt.dataset.category = item.category_id;
                    } else if (dropdown.id === 'locationFilter') {
                        opt.value = item.division || item.name || '';
                        const label = item.division || item.name || '';
                        if (item.campaign_count !== undefined) {
                            opt.textContent = `${label} (${item.campaign_count})`;
                        } else {
                            opt.textContent = label;
                        }
                    } else {
                        opt.value = item.name || item.id || '';
                        opt.textContent = item.name || item.id || '';
                    }
                } else {
                    opt.value = item;
                    opt.textContent = item;
                }
                dropdown.appendChild(opt);
            });
        }
    }

    function bindEvents() {
        // Search functionality
    if (searchInput) searchInput.addEventListener('input', debounce(handleSearch, 300));
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);

        // Quick tags
        document.querySelectorAll('.quick-tag').forEach(tag => {
            tag.addEventListener('click', function() {
                const tagText = this.textContent.toLowerCase();
                if (searchInput) searchInput.value = tagText;
                handleSearch();
            });
        });

        // Filters
        categoryFilter.addEventListener('change', async () => {
            const cat = categoryFilter.value;
            if (cat) {
                await fetchEventTypesForCategory(cat);
            } else {
                eventFilter.innerHTML = '<option value="">All Events</option>';
                eventFilter.disabled = true;
            }
            await refreshDivisions();
            await fetchEventsWithFilters();
        });
        eventFilter.addEventListener('change', async () => { await fetchEventsWithFilters(); });
        const locationFilterEl = document.getElementById('locationFilter');
        if (locationFilterEl) locationFilterEl.addEventListener('change', async () => { await fetchEventsWithFilters(); });
        eventFilter.addEventListener('change', async () => { await refreshDivisions(); });
        if (sortFilter) sortFilter.addEventListener('change', async () => { await fetchEventsWithFilters(); });
        if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => {
            clearAllFilters();
            eventFilter.innerHTML = '<option value="">All Events</option>';
            eventFilter.disabled = true;
            fetchEventsWithFilters();
        });

        // View toggle
    if (gridViewBtn) gridViewBtn.addEventListener('click', () => setView('grid'));
    if (listViewBtn) listViewBtn.addEventListener('click', () => setView('list'));

        // Search on Enter key
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') handleSearch();
            });
        }
    }

    async function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        await fetchEventsWithFilters(query);
    }

    async function applyFilters() {
        // Deprecated local filtering retained as no-op placeholder
        await fetchEventsWithFilters();
    }

    async function fetchEventsWithFilters(searchQuery = '') {
        const params = new URLSearchParams();
        const categoryVal = categoryFilter.value;
        const eventOption = eventFilter.selectedOptions[0];
        const eventTypeVal = eventFilter.value;
        const ebcId = eventOption ? eventOption.dataset.ebc : '';
        const locationVal = document.getElementById('locationFilter').value;
        const sortVal = sortFilter.value;

        if (ebcId) params.append('ebc_id', ebcId);
        else {
            if (categoryVal) params.append('category_id', categoryVal);
            if (eventTypeVal) params.append('event_type_id', eventTypeVal);
        }
        if (locationVal) params.append('division', locationVal);
        if (searchQuery) params.append('q', searchQuery);

        showLoading();
        try {
            const url = '/api/search/events' + (params.toString() ? `?${params.toString()}` : '');
            console.log('Fetching filtered events:', url);
            const res = await fetch(url);
            const data = await res.json();
            campaigns = (data.data || []).map(c => ({
                ...c,
                category: c.category || c.category_name || '',
                image: c.image || 'images/browse.jpeg',
                donors: c.donors ?? 0,
                daysLeft: c.daysLeft ?? 0,
                urgency: c.urgency || ''
            }));

            // Client-side sort (server returns recent by default)
            switch (sortVal) {
                case 'recent':
                    campaigns.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    break;
                case 'funded':
                    campaigns.sort((a, b) => ( (b.raised / (b.goal||1)) - (a.raised / (a.goal||1)) ));
                    break;
                // trending / urgent placeholders (need backend metrics)
                case 'trending':
                    campaigns.sort((a, b) => (b.donors||0) - (a.donors||0));
                    break;
                case 'urgent':
                    campaigns.sort((a, b) => ((b.urgency==='urgent')?1:0) - ((a.urgency==='urgent')?1:0));
                    break;
            }
            filteredCampaigns = [...campaigns];
            displayCampaigns(filteredCampaigns);
        } catch (e) {
            console.error('Filtered events fetch error', e);
            displayCampaigns([]);
        } finally {
            hideLoading();
        }
    }

    function displayCampaigns(campaigns) {
        resultsContainer.innerHTML = '';
        resultsContainer.className = `search-results ${currentView}-view`;
        
        if (campaigns.length === 0) {
            showNoResults();
            return;
        }

        campaigns.forEach((campaign, index) => {
            const campaignCard = createCampaignCard(campaign, index);
            resultsContainer.appendChild(campaignCard);
        });

        updateResultsCount(campaigns.length);
        // Animate cards
        setTimeout(() => {
            document.querySelectorAll('.campaign-card').forEach((card, index) => {
                setTimeout(() => {
                    card.style.animationDelay = `${index * 0.1}s`;
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 100);
    }

    function createCampaignCard(campaign, index) {
        const progressPercentage = Math.round((campaign.raised / campaign.goal) * 100);
        const formattedRaised = formatCurrency(campaign.raised);
        const formattedGoal = formatCurrency(campaign.goal);

        const card = document.createElement('div');
    card.className = 'campaign-card';
    card.dataset.campaignId = campaign.id;
        card.addEventListener('click', () => {
            if (campaign.id) {
                window.location.href = `event.html?creation_id=${encodeURIComponent(campaign.id)}`;
            }
        });
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${campaign.image}" alt="${campaign.title}" onerror="this.src='images/browse.jpeg'">
                <div class="urgency-badge ${campaign.urgency || ''}">
                    <i class="fas fa-exclamation-circle"></i>
                    ${((campaign.urgency || '').charAt(0).toUpperCase() + (campaign.urgency || '').slice(1))}
                </div>
                <div class="category-tag">${campaign.category}</div>
            </div>
            <div class="card-content">
                <h3 class="campaign-title">${campaign.title}</h3>
                <p class="campaign-description">${campaign.description}</p>
                
                <div class="campaign-meta">
                    <div>
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${campaign.location}</span>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-info">
                        <span>₹${formattedRaised} raised of ₹${formattedGoal}</span>
                        <span class="progress-percentage">${progressPercentage}%</span>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="btn-donate" onclick="event.stopPropagation(); donateToCampaign(${campaign.id})">
                        <i class="fas fa-heart"></i>
                        Donate Now
                    </button>
                    <button class="btn-share" onclick="event.stopPropagation(); shareCampaign(${campaign.id})" title="Share">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="btn-bookmark" onclick="event.stopPropagation(); bookmarkCampaign(${campaign.id})" title="Bookmark">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    function showNoResults() {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No campaigns found</h3>
                <p>Try adjusting your search criteria or browse all campaigns.</p>
                <button class="btn-primary" onclick="clearAllFilters()">View All Campaigns</button>
            </div>
        `;
        updateResultsCount(0);
    }

    function clearAllFilters() {
    searchInput.value = '';
    categoryFilter.value = '';
    eventFilter.value = '';
    document.getElementById('locationFilter').value = '';
    sortFilter.value = 'recent';
    filteredCampaigns = [...campaigns];
    displayCampaigns(filteredCampaigns);
    }

    function setView(view) {
        currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        if (view === 'grid') {
            gridViewBtn.classList.add('active');
        } else {
            listViewBtn.classList.add('active');
        }
        
        // Update results display
        resultsContainer.className = `search-results ${view}-view`;
    }

    function showLoading() {
        loadingContainer.style.display = 'flex';
        resultsContainer.style.opacity = '0.5';
    }

    function hideLoading() {
        loadingContainer.style.display = 'none';
        resultsContainer.style.opacity = '1';
    }

    function updateResultsCount(count) {
        // Update new style (number only) and legacy element if present
        if (resultsCountEl) resultsCountEl.textContent = count;
        const legacy = document.getElementById('resultsCount');
        if (legacy) legacy.textContent = `${count} campaign${count !== 1 ? 's' : ''} found`;
    }

    function updateStats() {
        const totalCampaigns = campaigns.length;
        // Raised this month: if backend supplies raised_this_month per event (stats proc), prefer that; else fallback to total raised
        const totalRaisedThisMonth = campaigns.reduce((sum, c) => sum + (c.raised_this_month != null ? Number(c.raised_this_month) : Number(c.raised)), 0);
        document.getElementById('totalCampaigns').textContent = totalCampaigns;
        document.getElementById('totalRaised').textContent = formatCurrency(totalRaisedThisMonth);
    }

    function animateStatsOnLoad() {
        document.querySelectorAll('.stat-number').forEach((stat, index) => {
            setTimeout(() => {
                stat.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    stat.style.transform = 'scale(1)';
                }, 200);
            }, index * 200);
        });
    }

    function formatCurrency(amount) {
        if (!amount || isNaN(amount)) return '0';
        if (amount < 1000) return Math.round(amount).toString();
        if (amount < 1_000_000) return (amount/1000).toFixed(1).replace(/\.0$/,'') + 'k';
        return (amount/1_000_000).toFixed(1).replace(/\.0$/,'') + 'M';
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Global functions for button actions
    window.donateToCampaign = function(campaignId) {
        // Redirect to donate page or open donation modal
        window.location.href = 'donate.html';
    };

    window.shareCampaign = function(campaignId) {
        // Implement share functionality
        if (navigator.share) {
            navigator.share({
                title: 'Support this campaign',
                text: 'Help us make a difference',
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Campaign link copied to clipboard!');
        }
    };

    window.bookmarkCampaign = function(campaignId) {
        // Implement bookmark functionality
        const campaign = campaigns.find(c => c.id === campaignId);
        if (campaign) {
            // Store in localStorage
            let bookmarks = JSON.parse(localStorage.getItem('bookmarkedCampaigns') || '[]');
            if (!bookmarks.includes(campaignId)) {
                bookmarks.push(campaignId);
                localStorage.setItem('bookmarkedCampaigns', JSON.stringify(bookmarks));
                alert('Campaign bookmarked!');
            } else {
                alert('Campaign already bookmarked!');
            }
        }
    };

    // 🔄 Listen for donation updates from other tabs and refresh the specific card's progress/raised amount.
    window.addEventListener('storage', ev => {
        if(ev.key === 'shodesh:lastDonation'){
            try {
                const payload = JSON.parse(ev.newValue||'{}');
                if(!payload.creationId) return;
                const card = document.querySelector(`.campaign-card[data-campaign-id="${payload.creationId}"]`);
                if(!card) return;
                // Refetch event detail for current numbers
                fetch(`/api/events/${encodeURIComponent(payload.creationId)}`)
                    .then(r=>r.json())
                    .then(data=>{
                        if(!data.success) return;
                        const e = data.data;
                        const pct = Math.round((Number(e.amount_received)/Number(e.amount_needed||1))*100);
                        const progressFill = card.querySelector('.progress-fill');
                        const progressInfo = card.querySelector('.progress-info span');
                        if(progressFill) progressFill.style.width = pct + '%';
                        if(progressInfo){
                            // Keep existing formatting style (k). We'll recompute simple k formatting.
                            const raisedK = formatCurrency(Number(e.amount_received));
                            const goalK = formatCurrency(Number(e.amount_needed));
                            progressInfo.textContent = `₹${raisedK} raised of ₹${goalK}`;
                        }
                        const pctEl = card.querySelector('.progress-percentage');
                        if(pctEl) pctEl.textContent = pct + '%';
                    }).catch(()=>{});
            } catch {}
        }
    });
});
