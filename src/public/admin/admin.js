// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.authToken = localStorage.getItem('adminToken');
        this.apiBase = '/api/admin';
        
        // Check authentication
        if (!this.authToken && !window.location.pathname.includes('login')) {
            this.showLoginModal();
        }
        
    this.sampleEvents = []; // Will be populated from API
    this.sampleFoundations = []; // Will be populated from API
    this.sampleVolunteers = []; // Will be populated from API
    this.volunteerFilter = 'all'; // current volunteers filter
        this.categories = []; // Will be populated from API
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        if (this.authToken) {
            this.loadDashboardData();
            this.renderEventsSection();
            this.renderFoundationsSection();
            // Load volunteers from backend then render
            this.loadVolunteersData(this.volunteerFilter).finally(() => this.renderVolunteersSection());
            this.renderCategoriesSection();
            this.renderTrendingSection();
            this.renderDonationAnalytics();
        }
    }
    
    // Authentication Methods
    showLoginModal() {
        const loginModal = document.createElement('div');
        loginModal.className = 'modal active';
        loginModal.id = 'loginModal';
        loginModal.innerHTML = `
            <div class="modal-content login-modal">
                <div class="modal-header">
                    <h3>Admin Login</h3>
                </div>
                <div class="modal-body">
                    <form id="adminLoginForm">
                        <div class="form-group">
                            <label>Username:</label>
                            <input type="text" id="adminUsername" required>
                        </div>
                        <div class="form-group">
                            <label>Password:</label>
                            <input type="password" id="adminPassword" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Login</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(loginModal);
        
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }
    
    async handleLogin() {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.authToken = result.token;
                localStorage.setItem('adminToken', result.token);
                document.getElementById('loginModal').remove();
                this.init(); // Reinitialize dashboard
                this.showNotification('Login successful', 'success');
            } else {
                this.showNotification('Invalid credentials', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed', 'error');
        }
    }
    
    async logout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await fetch('/api/admin/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': this.authToken
                    }
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
            
            localStorage.removeItem('adminToken');
            window.location.reload();
        }
    }
    
    // API Helper Methods
    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiBase}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.authToken,
                ...options.headers
            },
            ...options
        };
        
        const response = await fetch(url, config);
        
        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            this.showLoginModal();
            return null;
        }
        
        return response.json();
    }
    
    setupEventListeners() {
        // Navigation: bind only items that explicitly call showSection('...')
        document.querySelectorAll('.menu-item').forEach(item => {
            const oc = item.getAttribute('onclick') || '';
            const match = oc.match(/showSection\('([^']+)'\)/);
            if (match) {
                const section = match[1];
                item.addEventListener('click', () => this.showSection(section));
            }
        });
        
        // Form submissions
        document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCategory();
        });
    }
    
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const target = document.getElementById(sectionName);
        if (!target) {
            console.warn('Section not found:', sectionName);
            return;
        }
        target.classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        const navItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
        if (navItem) navItem.classList.add('active');
        
        this.currentSection = sectionName;
    }
    
    loadDashboardData() {
        // This would typically fetch data from your backend
        // For now, we'll use sample data
    }
    
    renderEventsSection() {
        const grid = document.querySelector('.events-grid');
        if (!grid) return;
        const list = Array.isArray(this.sampleEvents) ? this.sampleEvents : [];
        grid.innerHTML = list.map(event => `
            <div class="event-card">
                <div class="event-header">
                    <div class="event-category">
                        <span class="category-badge ${event.category || ''}">${event.category || ''}</span>
                        <span class="status-badge ${event.status || ''}">${event.status || ''}</span>
                    </div>
                    <div class="event-actions">
                        <button class="btn-icon" onclick="adminDashboard.viewEventDetails(${event.id})" title="View details" aria-label="View details" type="button"><i class="fas fa-eye" aria-hidden="true"></i></button>
                        <button class="btn-icon" onclick="adminDashboard.editEvent(${event.id})" title="Edit event" aria-label="Edit event" type="button"><i class="fas fa-edit" aria-hidden="true"></i></button>
                    </div>
                </div>
                <h3 class="event-title">${event.title || ''}</h3>
                <p class="event-organizer">by ${event.organizer || ''}</p>
                <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location || ''}</p>
                <div class="event-progress">
                    <div class="progress-bar"><div class="progress-fill" style="width: ${((event.currentAmount||0) / (event.targetAmount||1)) * 100}%"></div></div>
                    <div class="progress-info"><span>৳${(event.currentAmount||0).toLocaleString()}</span><span>৳${(event.targetAmount||0).toLocaleString()}</span></div>
                </div>
            </div>
        `).join('');
    }

    renderFoundationsSection() {
        const section = document.getElementById('foundations');
        if (!section) return;
        const list = Array.isArray(this.sampleFoundations) ? this.sampleFoundations : [];
        section.innerHTML = `
            <div class="section-header">
                <h2>Foundation Verification</h2>
                <div class="header-actions">
                    <select class="filter-select" aria-label="Filter foundations by status">
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>
            <div class="foundations-grid">
                ${list.map(f => `
                    <div class="foundation-card">
                        <div class="foundation-header">
                            <h3>${f.name || ''}</h3>
                            <span class="status-badge ${f.status || ''}">${f.status || ''}</span>
                        </div>
                        <div class="foundation-info">
                            <p><strong>Email:</strong> ${f.email || ''}</p>
                            <p><strong>Phone:</strong> ${f.phone || ''}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderVolunteersSection() {
        const section = document.getElementById('volunteers');
        if (!section) return;
        const list = Array.isArray(this.sampleVolunteers) ? this.sampleVolunteers : [];
        section.innerHTML = `
            <div class="section-header">
                <h2>Volunteer Verification</h2>
                <div class="header-actions">
                    <label class="sr-only" for="volunteerStatusFilter">Filter volunteers by status</label>
                    <select id="volunteerStatusFilter" class="filter-select" aria-label="Filter volunteers by status">
                        <option value="all">All</option>
                        <option value="unverified">Unverified</option>
                        <option value="verified">Verified</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>
            <div class="volunteers-grid">
                ${list.length === 0 ? '<div class="info-card"><div class="info-content"><p>No volunteers found.</p></div></div>' : list.map(v => `
                    <div class="volunteer-card">
                        <div class="volunteer-header">
                            <div class="volunteer-avatar"><i class="fas fa-user"></i></div>
                            <div class="volunteer-basic">
                                <h3><a href="./staff-profile.html?staff_id=${encodeURIComponent(v.id)}" title="Open staff profile/actions" style="color:inherit; text-decoration:none;">${v.name || ''}</a></h3>
                                <p>${v.location || ''}</p>
                                <span class="status-badge ${v.status || ''}">${v.status || ''}</span>
                            </div>
                        </div>
                        <div class="volunteer-info">
                            <p><strong>Email:</strong> ${v.email || ''}</p>
                            <p><strong>Phone:</strong> ${v.phone || ''}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        const filter = section.querySelector('#volunteerStatusFilter');
        if (filter) {
            filter.value = this.volunteerFilter;
            filter.onchange = async (e) => {
                this.volunteerFilter = e.target.value;
                await this.loadVolunteersData(this.volunteerFilter);
                this.renderVolunteersSection();
            };
        }
    }
    // ===== Volunteers (STAFF) backend wiring =====
    async loadVolunteersData(status = 'all') {
        try {
            this.volunteerFilter = status;
            const res = await this.apiRequest(`/staff?status=${encodeURIComponent(status)}`);
            if (!res || !res.success) return;
            // Map API rows to existing card shape for rendering
            this.sampleVolunteers = (res.data || []).map(r => ({
                id: r.staff_id,
                name: r.full_name || `${r.username}`,
                email: r.email,
                phone: r.mobile,
                location: [r.district, r.administrative_div].filter(Boolean).join(', '),
                skills: [],
                availability: 'N/A',
                experience: 'N/A',
                status: r.status,
                documents: r.has_cv ? [`CV (${r.cv_size} bytes)`] : []
            }));
        } catch (err) {
            console.error('Failed to load volunteers:', err);
        }
    }
    
    renderCategoriesSection() {
        const categoriesGrid = document.querySelector('.categories-grid');
        if (!categoriesGrid) return;
        
        categoriesGrid.innerHTML = (Array.isArray(this.categories) ? this.categories : []).map(category => `
            <div class="category-card">
                <div class="category-header">
                    <div class="category-icon">
                        <i class="${category.icon || 'fas fa-tag'}"></i>
                    </div>
                    <div class="category-info">
                        <h3>${category.name || ''}</h3>
                        <p>${category.count || 0} campaigns</p>
                    </div>
                    <div class="category-status">
                        <label class="toggle-switch">
                            <input type="checkbox" ${category.active ? 'checked' : ''} 
                                   onchange="adminDashboard.toggleCategory(${category.id})">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Placeholder to avoid runtime error until real UI is wired
    renderTrendingSection() {
        const el = document.getElementById('trending');
        if (!el) return;
        el.innerHTML = `
            <div class="info-card">
                <div class="info-content">
                    <p>No trending data yet.</p>
                </div>
            </div>
        `;
    }
    
    // Placeholder to avoid runtime error and quiet console until charts are added
    renderDonationAnalytics() {
        const el = document.getElementById('donation-analytics');
        if (!el) return;
        el.innerHTML = `
            <div class="chart-placeholder">Analytics coming soon.</div>
        `;
    }
    
    showVolunteerVerificationModal(event) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Request Volunteer Verification</h3>
                    <button class="close-btn" title="Close" aria-label="Close dialog" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p><strong>Event:</strong> ${event.title}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                    <h4>Select Nearby Volunteers:</h4>
                    <div class="volunteer-list">
                        ${event.nearbyVolunteers.map(volunteer => `
                            <label class="volunteer-option">
                                <input type="checkbox" value="${volunteer}">
                                <span>${volunteer.replace('_', ' ').toUpperCase()}</span>
                            </label>
                        `).join('')}
                    </div>
                    <div class="form-group">
                        <label>Verification Instructions:</label>
                        <textarea placeholder="Provide specific instructions for verification..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="button" class="btn-primary" onclick="adminDashboard.sendVerificationRequest(${event.id})">
                            Send Request
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    sendVerificationRequest(eventId) {
        this.showNotification('Verification request sent to selected volunteers', 'success');
        document.querySelector('.modal').remove();
    }
    
    addToTrending(eventId) {
        const event = this.sampleEvents.find(e => e.id === eventId);
        if (event) {
            this.showNotification(`"${event.title}" added to trending`, 'success');
        }
    }
    
    // Temporary stubs to avoid console errors from demo buttons
    viewEventDetails(id) {
        this.showNotification(`View event ${id} (not implemented)`, 'info');
    }
    editEvent(id) {
        this.showNotification(`Edit event ${id} (not implemented)`, 'info');
    }
    
    // Foundation Methods
    approveFoundation(foundationId) {
        const foundation = this.sampleFoundations.find(f => f.id === foundationId);
        if (foundation) {
            foundation.status = 'approved';
            this.showNotification('Foundation approved successfully', 'success');
            this.renderFoundationsSection();
        }
    }
    
    rejectFoundation(foundationId) {
        const foundation = this.sampleFoundations.find(f => f.id === foundationId);
        if (foundation) {
            foundation.status = 'rejected';
            this.showNotification('Foundation rejected', 'warning');
            this.renderFoundationsSection();
        }
    }
    
    // Volunteer Methods (mapped to STAFF verify API)
    async approveVolunteer(volunteerId) {
        try {
            const res = await this.apiRequest(`/staff/${encodeURIComponent(volunteerId)}/verify`, {
                method: 'PUT',
                body: JSON.stringify({ action: 'verify', notes: 'Approved by admin' })
            });
            if (res && res.success) {
                this.showNotification('Volunteer verified successfully', 'success');
                await this.loadVolunteersData(this.volunteerFilter);
                this.renderVolunteersSection();
            } else {
                this.showNotification(res?.message || 'Failed to verify volunteer', 'error');
            }
        } catch (e) {
            console.error('Approve volunteer error:', e);
            this.showNotification('Approve failed', 'error');
        }
    }
    
    async rejectVolunteer(volunteerId) {
        // Map UI "reject" to backend "suspend" state for STAFF
        try {
            const res = await this.apiRequest(`/staff/${encodeURIComponent(volunteerId)}/verify`, {
                method: 'PUT',
                body: JSON.stringify({ action: 'suspend', notes: 'Rejected by admin' })
            });
            if (res && res.success) {
                this.showNotification('Volunteer rejected (suspended)', 'warning');
                await this.loadVolunteersData(this.volunteerFilter);
                this.renderVolunteersSection();
            } else {
                this.showNotification(res?.message || 'Failed to reject volunteer', 'error');
            }
        } catch (e) {
            console.error('Reject volunteer error:', e);
            this.showNotification('Reject failed', 'error');
        }
    }
    
    conductBackgroundCheck(volunteerId) {
        this.showNotification('Background check initiated', 'info');
    }
    
    // Category Methods
    addCategory() {
        const name = document.getElementById('categoryName').value;
        const icon = document.getElementById('categoryIcon').value;
        const description = document.getElementById('categoryDescription').value;
        
        if (name && icon) {
            const newCategory = {
                id: this.categories.length + 1,
                name: name,
                icon: icon,
                count: 0,
                active: true
            };
            
            this.categories.push(newCategory);
            this.renderCategoriesSection();
            this.closeModal('addCategoryModal');
            this.showNotification('Category added successfully', 'success');
        }
    }
    
    toggleCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
            category.active = !category.active;
            this.showNotification(`Category ${category.active ? 'activated' : 'deactivated'}`, 'info');
        }
    }
    
    deleteCategory(categoryId) {
        if (confirm('Are you sure you want to delete this category?')) {
            this.categories = this.categories.filter(c => c.id !== categoryId);
            this.renderCategoriesSection();
            this.showNotification('Category deleted', 'warning');
        }
    }
    
    // Modal Methods
    showAddCategoryModal() {
        document.getElementById('addCategoryModal').classList.add('active');
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
    
    // Utility Methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" title="Dismiss notification" aria-label="Dismiss notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    
}

// Global functions for onclick handlers
function showSection(sectionName) {
    const inst = window.adminDashboard || adminDashboard;
    if (inst && typeof inst.showSection === 'function') {
        inst.showSection(sectionName);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            const i2 = window.adminDashboard || adminDashboard;
            if (i2 && typeof i2.showSection === 'function') {
                i2.showSection(sectionName);
            }
        }, { once: true });
    }
}

function showAddCategoryModal() {
    adminDashboard.showAddCategoryModal();
}

function closeModal(modalId) {
    adminDashboard.closeModal(modalId);
}

function logout() {
    adminDashboard.logout();
}

// Initialize admin dashboard when page loads
let adminDashboard;
document.addEventListener('DOMContentLoaded', function() {
    adminDashboard = new AdminDashboard();
    window.adminDashboard = adminDashboard;
});

// Add additional CSS for new components
const additionalCSS = `
/* Event Card Styles */
.event-card {
    border-left: 4px solid #4a7c59;
}

.event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.category-badge {
    background: #e6fffa;
    color: #4a7c59;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
    margin-right: 8px;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
}

.status-badge.pending {
    background: #fef5e7;
    color: #d69e2e;
}

.status-badge.verified {
    background: #c6f6d5;
    color: #22543d;
}

.status-badge.rejected {
    background: #fed7d7;
    color: #c53030;
}

.event-actions {
    display: flex;
    gap: 8px;
}

.btn-icon {
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-icon:hover {
    background: #e2e8f0;
}

.event-title {
    color: #1a202c;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
}

.event-organizer {
    color: #718096;
    font-size: 14px;
    margin-bottom: 8px;
}

.event-location {
    color: #4a5568;
    font-size: 14px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.event-progress {
    margin-bottom: 16px;
}

.progress-bar {
    background: #e2e8f0;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    background: #4a7c59;
    height: 100%;
    transition: width 0.3s;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #718096;
}

.event-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 12px;
    color: #718096;
}

.volunteer-needed {
    color: #d69e2e;
    font-weight: 600;
}

.event-verification-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn-success, .btn-warning, .btn-danger, .btn-trending {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
}

.btn-success {
    background: #c6f6d5;
    color: #22543d;
}

.btn-success:hover {
    background: #9ae6b4;
}

.btn-warning {
    background: #fef5e7;
    color: #d69e2e;
}

.btn-warning:hover {
    background: #faf089;
}

.btn-danger {
    background: #fed7d7;
    color: #c53030;
}

.btn-danger:hover {
    background: #feb2b2;
}

.btn-trending {
    background: #fed7e2;
    color: #b83280;
}

.btn-trending:hover {
    background: #fbb6ce;
}

/* Foundation Card Styles */
.foundations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 24px;
}

.foundation-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    border-left: 4px solid #3182ce;
}

.foundation-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.foundation-header h3 {
    color: #1a202c;
    font-size: 18px;
    font-weight: 600;
}

.foundation-info {
    margin-bottom: 16px;
}

.foundation-info p {
    margin-bottom: 8px;
    font-size: 14px;
    color: #4a5568;
}

.areas-tags, .skills-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
}

.area-tag, .skill-tag {
    background: #e6fffa;
    color: #4a7c59;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.documents-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
}

.document-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #3182ce;
    text-decoration: none;
    font-size: 14px;
    padding: 6px;
    border-radius: 4px;
    transition: background 0.2s;
}

.document-link:hover {
    background: #e6f3ff;
}

.foundation-actions, .volunteer-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    flex-wrap: wrap;
}

/* Volunteer Card Styles */
.volunteers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 24px;
}

.volunteer-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    border-left: 4px solid #d69e2e;
}

.volunteer-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 16px;
}

.volunteer-avatar {
    width: 50px;
    height: 50px;
    background: #d69e2e;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    flex-shrink: 0;
}

.volunteer-basic h3 {
    color: #1a202c;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
}

.volunteer-basic p {
    color: #718096;
    font-size: 14px;
    margin-bottom: 8px;
}

.volunteer-info {
    margin-bottom: 16px;
}

.volunteer-info p {
    margin-bottom: 8px;
    font-size: 14px;
    color: #4a5568;
}

.reference-item {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    background: #f7fafc;
    border-radius: 6px;
    margin-bottom: 6px;
    font-size: 14px;
}

/* Toggle Switch */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e0;
    transition: 0.3s;
    border-radius: 24px;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
}

input:checked + .toggle-slider {
    background-color: #4a7c59;
}

input:checked + .toggle-slider:before {
    transform: translateX(20px);
}

/* Notification Styles */
.notification {
    position: fixed;
    top: 90px;
    right: 20px;
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-left: 4px solid #4a7c59;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 2001;
    min-width: 300px;
    animation: slideInRight 0.3s ease;
}

.notification.success {
    border-left-color: #38a169;
}

.notification.warning {
    border-left-color: #d69e2e;
}

.notification.info {
    border-left-color: #3182ce;
}

.notification button {
    background: none;
    border: none;
    color: #718096;
    cursor: pointer;
    margin-left: auto;
    padding: 4px;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Chart Placeholder */
.chart-placeholder {
    text-align: center;
    padding: 40px;
    color: #718096;
}

.sample-chart {
    display: flex;
    align-items: end;
    justify-content: center;
    gap: 8px;
    height: 200px;
    margin-top: 20px;
}

.chart-bar {
    width: 40px;
    background: #4a7c59;
    border-radius: 4px 4px 0 0;
    transform-origin: bottom;
    transform: scaleY(0);
    animation: scaleUp 600ms ease forwards;
}

@keyframes scaleUp {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
}

/* Volunteer Option Styles */
.volunteer-option {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    cursor: pointer;
}

.volunteer-option input {
    margin: 0;
}
`;

// Add the additional CSS to the document
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);
