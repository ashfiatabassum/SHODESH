// Standalone Autocomplete for Campaign Search
(function() {
    'use strict';
    
    let autocompleteData = [];
    let filteredData = [];
    let selectedIndex = -1;
    let debounceTimeout = null;
    
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const dropdown = document.getElementById('autocompleteDropdown');
    
    // Initialize autocomplete when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        if (searchInput && dropdown) {
            initAutocomplete();
        }
    });
    
    async function initAutocomplete() {
        // Load all campaigns data
        await loadCampaigns();
        
        // Bind events
        searchInput.addEventListener('input', handleInput);
        searchInput.addEventListener('keydown', handleKeydown);
        searchInput.addEventListener('focus', handleFocus);
        document.addEventListener('click', handleOutsideClick);
    }
    
    async function loadCampaigns() {
        try {
            const response = await fetch('/api/autocomplete/campaigns');
            const data = await response.json();
            if (data.success) {
                autocompleteData = data.data;
            }
        } catch (error) {
            console.error('Failed to load campaigns for autocomplete:', error);
        }
    }
    
    function handleInput(e) {
        const query = e.target.value.trim();
        
        clearTimeout(debounceTimeout);
        
        if (query.length >= 1) {
            debounceTimeout = setTimeout(() => {
                filterCampaigns(query);
                showDropdown();
            }, 150);
        } else {
            hideDropdown();
        }
    }
    
    function handleKeydown(e) {
        if (dropdown.style.display === 'none') return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, filteredData.length - 1);
                updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    selectCampaign(filteredData[selectedIndex]);
                }
                break;
            case 'Escape':
                hideDropdown();
                break;
        }
    }
    
    function handleFocus(e) {
        if (e.target.value.trim().length >= 1 && filteredData.length > 0) {
            showDropdown();
        }
    }
    
    function handleOutsideClick(e) {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            hideDropdown();
        }
    }
    
    function filterCampaigns(query) {
        const lowerQuery = query.toLowerCase();
        filteredData = autocompleteData.filter(campaign => 
            campaign.title.toLowerCase().startsWith(lowerQuery)
        );
        selectedIndex = -1;
        renderDropdown();
    }
    
    function renderDropdown() {
        if (filteredData.length === 0) {
            dropdown.innerHTML = '<div class="autocomplete-item" style="color: #999; font-style: italic;">No campaigns found</div>';
            return;
        }
        
        const html = filteredData.map((campaign, index) => `
            <div class="autocomplete-item" data-index="${index}">
                <div class="autocomplete-title">${escapeHtml(campaign.title)}</div>
                <div class="autocomplete-meta">${escapeHtml(campaign.category)} • ${escapeHtml(campaign.division)}</div>
            </div>
        `).join('');
        
        dropdown.innerHTML = html;
        
        // Add click listeners
        dropdown.querySelectorAll('.autocomplete-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                if (filteredData[index]) {
                    selectCampaign(filteredData[index]);
                }
            });
        });
    }
    
    function updateSelection() {
        dropdown.querySelectorAll('.autocomplete-item').forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
    
    function selectCampaign(campaign) {
        // Navigate to event page
        window.location.href = `event.html?creation_id=${campaign.creation_id}`;
    }
    
    function showDropdown() {
        if (filteredData.length > 0) {
            dropdown.style.display = 'block';
        }
    }
    
    function hideDropdown() {
        dropdown.style.display = 'none';
        selectedIndex = -1;
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
    
})();