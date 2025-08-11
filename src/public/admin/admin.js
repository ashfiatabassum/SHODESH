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
        this.categories = []; // Will be populated from API
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        if (this.authToken) {
            this.loadDashboardData();
            this.renderEventsSection();
            this.renderFoundationsSection();
            this.renderVolunteersSection();
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
        // Navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.showSection(section);
            });
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
        document.getElementById(sectionName).classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[onclick="showSection('${sectionName}')"]`).classList.add('active');
        
        this.currentSection = sectionName;
    }
    
    loadDashboardData() {
        // This would typically fetch data from your backend
        // For now, we'll use sample data
    }
    
    renderEventsSection() {
        const eventsGrid = document.querySelector('.events-grid');
        if (!eventsGrid) return;
        
        eventsGrid.innerHTML = this.sampleEvents.map(event => `
            <div class="event-card">
                <div class="event-header">
                    <div class="event-category">
                        <span class="category-badge ${event.category}">${event.category}</span>
                        <span class="status-badge ${event.status}">${event.status}</span>
                    </div>
                    <div class="event-actions">
                        <button class="btn-icon" onclick="adminDashboard.viewEventDetails(${event.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="adminDashboard.editEvent(${event.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
                <h3 class="event-title">${event.title}</h3>
                <p class="event-organizer">by ${event.organizer}</p>
                <p class="event-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${event.location}
                </p>
                <div class="event-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(event.currentAmount / event.targetAmount) * 100}%"></div>
                    </div>
                    <div class="progress-info">
                        <span>৳${event.currentAmount.toLocaleString()} raised</span>
                        <span>৳${event.targetAmount.toLocaleString()} goal</span>
                    </div>
                </div>
                <div class="event-meta">
                    <span>Submitted: ${new Date(event.submittedDate).toLocaleDateString()}</span>
                    ${event.volunteerVerificationNeeded ? 
                        `<span class="volunteer-needed">
                            <i class="fas fa-users"></i>
                            Volunteer verification needed
                        </span>` : ''}
                </div>
                <div class="event-verification-actions">
                    ${event.status === 'pending' ? `
                        <button class="btn-success" onclick="adminDashboard.verifyEvent(${event.id})">
                            <i class="fas fa-check"></i>
                            Approve
                        </button>
                        <button class="btn-warning" onclick="adminDashboard.requestVolunteerVerification(${event.id})">
                            <i class="fas fa-user-check"></i>
                            Request Volunteer Verification
                        </button>
                        <button class="btn-danger" onclick="adminDashboard.rejectEvent(${event.id})">
                            <i class="fas fa-times"></i>
                            Reject
                        </button>
                    ` : event.status === 'verified' ? `
                        <button class="btn-trending" onclick="adminDashboard.addToTrending(${event.id})">
                            <i class="fas fa-fire"></i>
                            Add to Trending
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
    
    renderFoundationsSection() {
        const foundationsSection = document.getElementById('foundations');
        if (!foundationsSection) return;
        
        foundationsSection.innerHTML = `
            <div class="section-header">
                <h2>Foundation Verification</h2>
                <div class="header-actions">
                    <select class="filter-select">
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>
            <div class="foundations-grid">
                ${this.sampleFoundations.map(foundation => `
                    <div class="foundation-card">
                        <div class="foundation-header">
                            <h3>${foundation.name}</h3>
                            <span class="status-badge ${foundation.status}">${foundation.status}</span>
                        </div>
                        <div class="foundation-info">
                            <p><strong>Registration:</strong> ${foundation.registrationNumber}</p>
                            <p><strong>Contact:</strong> ${foundation.contactPerson}</p>
                            <p><strong>Email:</strong> ${foundation.email}</p>
                            <p><strong>Phone:</strong> ${foundation.phone}</p>
                            <p><strong>Years Active:</strong> ${foundation.yearsOfOperation} years</p>
                            <p><strong>Previous Projects:</strong> ${foundation.previousProjects}</p>
                        </div>
                        <div class="foundation-areas">
                            <strong>Focus Areas:</strong>
                            <div class="areas-tags">
                                ${foundation.focusAreas.map(area => `<span class="area-tag">${area}</span>`).join('')}
                            </div>
                        </div>
                        <div class="foundation-documents">
                            <strong>Documents:</strong>
                            <div class="documents-list">
                                ${foundation.documents.map(doc => `
                                    <a href="#" class="document-link">
                                        <i class="fas fa-file-pdf"></i>
                                        ${doc}
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                        <div class="foundation-actions">
                            <button class="btn-success" onclick="adminDashboard.approveFoundation(${foundation.id})">
                                <i class="fas fa-check"></i>
                                Approve
                            </button>
                            <button class="btn-warning" onclick="adminDashboard.requestMoreInfo(${foundation.id})">
                                <i class="fas fa-info-circle"></i>
                                Request Info
                            </button>
                            <button class="btn-danger" onclick="adminDashboard.rejectFoundation(${foundation.id})">
                                <i class="fas fa-times"></i>
                                Reject
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderVolunteersSection() {
        const volunteersSection = document.getElementById('volunteers');
        if (!volunteersSection) return;
        
        volunteersSection.innerHTML = `
            <div class="section-header">
                <h2>Volunteer Verification</h2>
                <div class="header-actions">
                    <select class="filter-select">
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>
            <div class="volunteers-grid">
                ${this.sampleVolunteers.map(volunteer => `
                    <div class="volunteer-card">
                        <div class="volunteer-header">
                            <div class="volunteer-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="volunteer-basic">
                                <h3>${volunteer.name}</h3>
                                <p>${volunteer.location}</p>
                                <span class="status-badge ${volunteer.status}">${volunteer.status}</span>
                            </div>
                        </div>
                        <div class="volunteer-info">
                            <p><strong>Email:</strong> ${volunteer.email}</p>
                            <p><strong>Phone:</strong> ${volunteer.phone}</p>
                            <p><strong>Availability:</strong> ${volunteer.availability}</p>
                            <p><strong>Experience:</strong> ${volunteer.experience}</p>
                        </div>
                        <div class="volunteer-skills">
                            <strong>Skills:</strong>
                            <div class="skills-tags">
                                ${volunteer.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                            </div>
                        </div>
                        <div class="volunteer-references">
                            <strong>References:</strong>
                            ${volunteer.references.map(ref => `
                                <div class="reference-item">
                                    <span>${ref.name} (${ref.relation})</span>
                                    <span>${ref.phone}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="volunteer-documents">
                            <strong>Documents:</strong>
                            <div class="documents-list">
                                ${volunteer.documents.map(doc => `
                                    <a href="#" class="document-link">
                                        <i class="fas fa-file-pdf"></i>
                                        ${doc}
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                        <div class="volunteer-actions">
                            <button class="btn-success" onclick="adminDashboard.approveVolunteer(${volunteer.id})">
                                <i class="fas fa-check"></i>
                                Approve
                            </button>
                            <button class="btn-warning" onclick="adminDashboard.conductBackgroundCheck(${volunteer.id})">
                                <i class="fas fa-search"></i>
                                Background Check
                            </button>
                            <button class="btn-danger" onclick="adminDashboard.rejectVolunteer(${volunteer.id})">
                                <i class="fas fa-times"></i>
                                Reject
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderCategoriesSection() {
        const categoriesGrid = document.querySelector('.categories-grid');
        if (!categoriesGrid) return;
        
        categoriesGrid.innerHTML = this.categories.map(category => `
            <div class="category-card">
                <div class="category-header">
                    <div class="category-icon">
                        <i class="${category.icon}"></i>
                    </div>
                    <div class="category-info">
                        <h3>${category.name}</h3>
                        <p>${category.count} campaigns</p>
                    </div>
                    <div class="category-status">
                        <label class="toggle-switch">
                            <input type="checkbox" ${category.active ? 'checked' : ''} 
                                   onchange="adminDashboard.toggleCategory(${category.id})">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="category-actions">
                    <button class="btn-secondary" onclick="adminDashboard.editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn-danger" onclick="adminDashboard.deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderTrendingSection() {
        const trendingSection = document.getElementById('trending');
        if (!trendingSection) return;
        
        trendingSection.innerHTML = `
            <div class="section-header">
                <h2>Trending Management</h2>
                <div class="header-actions">
                    <button class="btn-primary" onclick="adminDashboard.showAddToTrendingModal()">
                        <i class="fas fa-plus"></i>
                        Add to Trending
                    </button>
                </div>
            </div>
            <div class="trending-content">
                <div class="trending-campaigns">
                    <h3>Current Trending Campaigns</h3>
                    <div class="trending-list">
                        <!-- Trending campaigns will be populated here -->
                    </div>
                </div>
                <div class="trending-analytics">
                    <h3>Trending Performance</h3>
                    <div class="performance-metrics">
                        <!-- Performance metrics will be shown here -->
                    </div>
                </div>
            </div>
        `;
    }
    
    renderDonationAnalytics() {
        // This would typically use a charting library like Chart.js
        const chartContainer = document.getElementById('donationChart');
        if (!chartContainer) return;
        
        // Sample implementation - you would use Chart.js or similar
        chartContainer.innerHTML = `
            <div class="chart-placeholder">
                <h3>Donation Analytics Chart</h3>
                <p>Chart.js implementation would go here</p>
                <div class="sample-chart">
                    <div class="chart-bar" style="height: 60%"></div>
                    <div class="chart-bar" style="height: 80%"></div>
                    <div class="chart-bar" style="height: 45%"></div>
                    <div class="chart-bar" style="height: 90%"></div>
                    <div class="chart-bar" style="height: 70%"></div>
                </div>
            </div>
        `;
    }
    
    // Event Verification Methods
    verifyEvent(eventId) {
        const event = this.sampleEvents.find(e => e.id === eventId);
        if (event) {
            event.status = 'verified';
            this.showNotification('Event verified successfully', 'success');
            this.renderEventsSection();
        }
    }
    
    rejectEvent(eventId) {
        const event = this.sampleEvents.find(e => e.id === eventId);
        if (event) {
            event.status = 'rejected';
            this.showNotification('Event rejected', 'warning');
            this.renderEventsSection();
        }
    }
    
    requestVolunteerVerification(eventId) {
        const event = this.sampleEvents.find(e => e.id === eventId);
        if (event && event.nearbyVolunteers) {
            this.showVolunteerVerificationModal(event);
        }
    }
    
    showVolunteerVerificationModal(event) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Request Volunteer Verification</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
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
    
    // Volunteer Methods
    approveVolunteer(volunteerId) {
        const volunteer = this.sampleVolunteers.find(v => v.id === volunteerId);
        if (volunteer) {
            volunteer.status = 'approved';
            this.showNotification('Volunteer approved successfully', 'success');
            this.renderVolunteersSection();
        }
    }
    
    rejectVolunteer(volunteerId) {
        const volunteer = this.sampleVolunteers.find(v => v.id === volunteerId);
        if (volunteer) {
            volunteer.status = 'rejected';
            this.showNotification('Volunteer application rejected', 'warning');
            this.renderVolunteersSection();
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
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = '../signin.html';
        }
    }
}

// Global functions for onclick handlers
function showSection(sectionName) {
    adminDashboard.showSection(sectionName);
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
    animation: growUp 1s ease;
}

@keyframes growUp {
    from {
        height: 0;
    }
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
