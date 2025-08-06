// Professional Search Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const urgencyFilter = document.getElementById('urgencyFilter');
    const sortFilter = document.getElementById('sortFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const resultsContainer = document.getElementById('searchResults');
    const loadingContainer = document.getElementById('loadingContainer');
    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');
    const resultsCount = document.getElementById('resultsCount');

    // Sample campaign data (in real app, this would come from API)
    const campaigns = [
        {
            id: 1,
            title: "Emergency Medical Support for Children",
            description: "Provide life-saving medical equipment and treatments for children in need. Every donation helps us reach more families and save precious lives.",
            category: "medical",
            urgency: "urgent",
            raised: 45000,
            goal: 75000,
            donors: 234,
            location: "Mumbai, India",
            image: "images/medical.jpg",
            daysLeft: 12
        },
        {
            id: 2,
            title: "Clean Water Initiative - Rural Villages",
            description: "Building wells and water purification systems to provide clean, safe drinking water to remote villages across rural areas.",
            category: "sanitation",
            urgency: "moderate",
            raised: 28000,
            goal: 50000,
            donors: 156,
            location: "Rajasthan, India",
            image: "images/sanitation.jpg",
            daysLeft: 25
        },
        {
            id: 3,
            title: "Education for All - Digital Learning Centers",
            description: "Establishing digital learning centers with computers, internet access, and educational software for underprivileged students.",
            category: "education",
            urgency: "normal",
            raised: 35000,
            goal: 60000,
            donors: 189,
            location: "Kerala, India",
            image: "images/education.jpg",
            daysLeft: 30
        },
        {
            id: 4,
            title: "Emergency Food Distribution Network",
            description: "Creating a sustainable food distribution network to ensure no family goes hungry. Focus on nutritious meals for children and elderly.",
            category: "food",
            urgency: "urgent",
            raised: 52000,
            goal: 80000,
            donors: 312,
            location: "Delhi, India",
            image: "images/browse.jpeg",
            daysLeft: 8
        },
        {
            id: 5,
            title: "Healthcare Mobile Clinics",
            description: "Mobile healthcare units bringing medical services directly to remote communities that lack access to hospitals and clinics.",
            category: "medical",
            urgency: "moderate",
            raised: 65000,
            goal: 100000,
            donors: 278,
            location: "Assam, India",
            image: "images/medical.jpg",
            daysLeft: 18
        },
        {
            id: 6,
            title: "Skill Development Training Programs",
            description: "Comprehensive skill development and vocational training programs to help unemployed youth gain marketable skills and find employment.",
            category: "education",
            urgency: "normal",
            raised: 22000,
            goal: 40000,
            donors: 98,
            location: "Punjab, India",
            image: "images/education.jpg",
            daysLeft: 45
        }
    ];

    let filteredCampaigns = [...campaigns];
    let currentView = 'grid';

    // Initialize page
    init();

    function init() {
        displayCampaigns(filteredCampaigns);
        updateStats();
        bindEvents();
        animateStatsOnLoad();
    }

    function bindEvents() {
        // Search functionality
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchBtn.addEventListener('click', handleSearch);
        
        // Quick tags
        document.querySelectorAll('.quick-tag').forEach(tag => {
            tag.addEventListener('click', function() {
                const tagText = this.textContent.toLowerCase();
                searchInput.value = tagText;
                handleSearch();
            });
        });

        // Filters
        categoryFilter.addEventListener('change', applyFilters);
        urgencyFilter.addEventListener('change', applyFilters);
        sortFilter.addEventListener('change', applyFilters);
        clearFiltersBtn.addEventListener('click', clearAllFilters);

        // View toggle
        gridViewBtn.addEventListener('click', () => setView('grid'));
        listViewBtn.addEventListener('click', () => setView('list'));

        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            filteredCampaigns = [...campaigns];
        } else {
            filteredCampaigns = campaigns.filter(campaign => 
                campaign.title.toLowerCase().includes(query) ||
                campaign.description.toLowerCase().includes(query) ||
                campaign.category.toLowerCase().includes(query) ||
                campaign.location.toLowerCase().includes(query)
            );
        }
        
        applyFilters();
    }

    function applyFilters() {
        let filtered = [...filteredCampaigns];

        // Category filter
        const category = categoryFilter.value;
        if (category && category !== 'all') {
            filtered = filtered.filter(campaign => campaign.category === category);
        }

        // Urgency filter
        const urgency = urgencyFilter.value;
        if (urgency && urgency !== 'all') {
            filtered = filtered.filter(campaign => campaign.urgency === urgency);
        }

        // Sort
        const sort = sortFilter.value;
        switch (sort) {
            case 'newest':
                filtered.sort((a, b) => a.id - b.id);
                break;
            case 'oldest':
                filtered.sort((a, b) => b.id - a.id);
                break;
            case 'amount_high':
                filtered.sort((a, b) => b.goal - a.goal);
                break;
            case 'amount_low':
                filtered.sort((a, b) => a.goal - b.goal);
                break;
            case 'progress':
                filtered.sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
                break;
            case 'urgent':
                const urgencyOrder = { urgent: 3, moderate: 2, normal: 1 };
                filtered.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);
                break;
        }

        showLoading();
        setTimeout(() => {
            displayCampaigns(filtered);
            hideLoading();
        }, 500);
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
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${campaign.image}" alt="${campaign.title}" onerror="this.src='images/browse.jpeg'">
                <div class="urgency-badge ${campaign.urgency}">
                    <i class="fas fa-exclamation-circle"></i>
                    ${campaign.urgency.charAt(0).toUpperCase() + campaign.urgency.slice(1)}
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
                    <div>
                        <i class="fas fa-users"></i>
                        <span>${campaign.donors} donors</span>
                    </div>
                    <div>
                        <i class="fas fa-calendar-alt"></i>
                        <span>${campaign.daysLeft} days left</span>
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
                    <button class="btn-donate" onclick="donateToCampaign(${campaign.id})">
                        <i class="fas fa-heart"></i>
                        Donate Now
                    </button>
                    <button class="btn-share" onclick="shareCampaign(${campaign.id})" title="Share">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="btn-bookmark" onclick="bookmarkCampaign(${campaign.id})" title="Bookmark">
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
        categoryFilter.value = 'all';
        urgencyFilter.value = 'all';
        sortFilter.value = 'newest';
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
        resultsCount.textContent = `${count} campaign${count !== 1 ? 's' : ''} found`;
    }

    function updateStats() {
        const totalCampaigns = campaigns.length;
        const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
        const totalDonors = campaigns.reduce((sum, campaign) => sum + campaign.donors, 0);
        const avgProgress = Math.round(campaigns.reduce((sum, campaign) => 
            sum + (campaign.raised / campaign.goal), 0) / campaigns.length * 100);

        document.getElementById('totalCampaigns').textContent = totalCampaigns;
        document.getElementById('totalRaised').textContent = formatCurrency(totalRaised);
        document.getElementById('totalDonors').textContent = totalDonors.toLocaleString();
        document.getElementById('avgProgress').textContent = `${avgProgress}%`;
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
        return (amount / 1000).toFixed(0) + 'k';
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
});
