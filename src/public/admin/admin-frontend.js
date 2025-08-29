// Admin Dashboard JavaScript - Frontend Only Version (No Backend Required)
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        
        // Sample data for frontend testing - no backend required
        this.sampleEvents = [
            {
                id: 1,
                title: "Emergency Medical Aid for Flood Victims",
                category: "medical",
                organizer: "Dhaka Medical Foundation",
                location: "Sylhet, Bangladesh",
                targetAmount: 500000,
                currentAmount: 125000,
                status: "pending",
                submittedDate: "2025-08-10",
                description: "Urgent medical assistance needed for flood victims in Sylhet district.",
                documents: ["medical_cert.pdf", "ngo_license.pdf"],
                volunteerVerificationNeeded: true,
                nearbyVolunteers: ["john_doe", "sarah_ahmed", "rahman_ali"]
            },
            {
                id: 2,
                title: "Education Support for Rural Children",
                category: "education",
                organizer: "Rural Education Initiative",
                location: "Rangpur, Bangladesh",
                targetAmount: 300000,
                currentAmount: 45000,
                status: "pending",
                submittedDate: "2025-08-09",
                description: "Providing books, uniforms, and school supplies for underprivileged children.",
                documents: ["project_proposal.pdf", "budget_breakdown.xlsx"],
                volunteerVerificationNeeded: true,
                nearbyVolunteers: ["fatima_khatun", "karim_hassan"]
            },
            {
                id: 3,
                title: "Clean Water Initiative",
                category: "sanitation",
                organizer: "Water for All Foundation",
                location: "Barisal, Bangladesh",
                targetAmount: 750000,
                currentAmount: 320000,
                status: "verified",
                submittedDate: "2025-08-08",
                description: "Installing tube wells and water purification systems in rural areas.",
                documents: ["engineering_report.pdf", "environmental_clearance.pdf"]
            }
        ];
        
        this.sampleFoundations = [
            {
                id: 1,
                name: "Dhaka Children's Foundation",
                registrationNumber: "DCF-2024-001",
                contactPerson: "Dr. Rashida Ahmed",
                email: "info@dhakachildren.org",
                phone: "+880-2-9876543",
                address: "123 Dhanmondi, Dhaka-1205",
                focusAreas: ["Education", "Healthcare", "Child Welfare"],
                status: "pending",
                submittedDate: "2025-08-10",
                documents: ["ngo_certificate.pdf", "tax_clearance.pdf", "bank_statement.pdf"],
                yearsOfOperation: 5,
                previousProjects: 12,
                website: "www.dhakachildren.org"
            },
            {
                id: 2,
                name: "Green Bangladesh Initiative",
                registrationNumber: "GBI-2024-002",
                contactPerson: "Md. Karim Rahman",
                email: "contact@greenbangladesh.org",
                phone: "+880-1712-345678",
                address: "456 Gulshan Avenue, Dhaka-1212",
                focusAreas: ["Environment", "Climate Change", "Reforestation"],
                status: "pending",
                submittedDate: "2025-08-09",
                documents: ["registration_cert.pdf", "project_portfolio.pdf"],
                yearsOfOperation: 3,
                previousProjects: 8,
                website: "www.greenbangladesh.org"
            }
        ];
        
        this.sampleVolunteers = [
            {
                id: 1,
                name: "Ahmed Hassan",
                email: "ahmed.hassan@email.com",
                phone: "+880-1987-654321",
                location: "Dhaka, Bangladesh",
                skills: ["Medical Assistance", "Emergency Response", "Translation"],
                availability: "Weekends",
                experience: "2 years volunteering with Red Crescent",
                status: "pending",
                submittedDate: "2025-08-11",
                documents: ["cv.pdf", "id_copy.pdf", "certificates.pdf"],
                backgroundCheck: "pending",
                references: [
                    {name: "Dr. Fatima Ali", relation: "Previous Supervisor", phone: "+880-1234-567890"},
                    {name: "Md. Rahim", relation: "Colleague", phone: "+880-1345-678901"}
                ]
            },
            {
                id: 2,
                name: "Fatima Begum",
                email: "fatima.begum@email.com",
                phone: "+880-1876-543210",
                location: "Chittagong, Bangladesh",
                skills: ["Education", "Women's Rights", "Community Organizing"],
                availability: "Flexible",
                experience: "3 years with local NGOs",
                status: "pending",
                submittedDate: "2025-08-10",
                documents: ["resume.pdf", "testimonials.pdf"],
                backgroundCheck: "pending",
                references: [
                    {name: "Rashida Khatun", relation: "NGO Director", phone: "+880-1432-567890"}
                ]
            }
        ];
        
        this.categories = [
            {id: 1, name: "Medical", icon: "fas fa-heartbeat", count: 45, active: true},
            {id: 2, name: "Education", icon: "fas fa-graduation-cap", count: 32, active: true},
            {id: 3, name: "Emergency", icon: "fas fa-exclamation-triangle", count: 18, active: true},
            {id: 4, name: "Food Aid", icon: "fas fa-utensils", count: 25, active: true},
            {id: 5, name: "Environment", icon: "fas fa-leaf", count: 12, active: true},
            {id: 6, name: "Sanitation", icon: "fas fa-tint", count: 15, active: true}
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.renderEventsSection();
        this.renderFoundationsSection();
        this.renderVolunteersSection();
        this.renderCategoriesSection();
        this.renderTrendingSection();
        this.renderDonationAnalytics();
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
        const addCategoryForm = document.getElementById('addCategoryForm');
        if (addCategoryForm) {
            addCategoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addCategory();
            });
        }
    }
    
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeMenuItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
        
        this.currentSection = sectionName;
    }
    
    loadDashboardData() {
        // Load dashboard statistics (frontend only)
        const statsCards = document.querySelectorAll('.stat-card .stat-number');
        if (statsCards.length >= 4) {
            statsCards[0].textContent = this.sampleEvents.length;
            statsCards[1].textContent = this.sampleFoundations.length;
            statsCards[2].textContent = this.sampleVolunteers.length;
            statsCards[3].textContent = '৳' + (1250000).toLocaleString();
        }
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

        // Calculate stats from the full dataset
        const total = this.sampleFoundations.length;
        const pending = this.sampleFoundations.filter(f => f.status === 'pending' || f.status === 'unverified').length;
        const verified = this.sampleFoundations.filter(f => f.status === 'verified').length;

        foundationsSection.innerHTML = `
            <div class="stats-cards" style="display: flex; gap: 20px; margin-bottom: 30px;">
                <div class="stat-card total">
                    <div class="icon"><i class="fas fa-building"></i></div>
                    <h3 class="stat-number">${total}</h3>
                    <p>Total Foundations</p>
                </div>
                <div class="stat-card pending">
                    <div class="icon"><i class="fas fa-clock"></i></div>
                    <h3 class="stat-number">${pending}</h3>
                    <p>Pending Verification</p>
                </div>
                <div class="stat-card verified">
                    <div class="icon"><i class="fas fa-check-circle"></i></div>
                    <h3 class="stat-number">${verified}</h3>
                    <p>Verified Foundations</p>
                </div>
            </div>
            <div class="section-header">
                <h2>Foundation Verification</h2>
                <div class="header-actions">
                    <select id="foundationStatusFilter" class="filter-select">
                        <option value="unverified">Unverified</option>
                        <option value="verified">Verified</option>
                        <option value="suspended">Suspended</option>
                        <option value="all">All</option>
                    </select>
                    <button class="btn-primary" onclick="refreshFoundations()">
                        <i class="fas fa-sync-alt"></i>
                        Refresh
                    </button>
                </div>
            </div>
            <div id="foundationsList" class="foundations-grid">
                <!-- Foundations will be populated here -->
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
                        <p>No trending campaigns currently set.</p>
                    </div>
                </div>
                <div class="trending-analytics">
                    <h3>Trending Performance</h3>
                    <div class="performance-metrics">
                        <p>Performance metrics will be displayed here.</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderDonationAnalytics() {
        const chartContainer = document.getElementById('donationChart');
        if (!chartContainer) return;
        
        chartContainer.innerHTML = `
            <div class="chart-placeholder">
                <h3>Donation Analytics Chart</h3>
                <p>Chart visualization would go here</p>
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
    
    // Event Verification Methods (Frontend Only)
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
    
    requestMoreInfo(foundationId) {
        this.showNotification('Information request sent to foundation', 'info');
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
        const name = document.getElementById('categoryName')?.value;
        const icon = document.getElementById('categoryIcon')?.value;
        
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
    
    editCategory(categoryId) {
        this.showNotification('Edit category functionality would open here', 'info');
    }
    
    // Modal Methods
    showAddCategoryModal() {
        const modal = document.getElementById('addCategoryModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // View Methods
    viewEventDetails(eventId) {
        const event = this.sampleEvents.find(e => e.id === eventId);
        if (event) {
            this.showNotification(`Viewing details for: ${event.title}`, 'info');
        }
    }
    
    editEvent(eventId) {
        const event = this.sampleEvents.find(e => e.id === eventympactId);
        if (event) {
            this.showNotification(`Edit mode for: ${event.title}`, 'info');
        }
    }
    
    // Utility Methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'login.html';
        }
    }
}

// Foundation Verification System
class FoundationVerification {
    constructor() {
        this.foundations = [];
        this.currentFoundation = null;
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        this.init();
    }

    init() {
        // Set up event listeners
        const statusFilter = document.getElementById('foundationStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.loadFoundations(e.target.value);
            });
        }

        // Load unverified foundations by default
        this.loadFoundations('unverified');
    }

    async loadFoundations(status = 'unverified') {
        console.log('🔧 DEBUG: loadFoundations called with status:', status);
        this.showNotification(`Loading ${status} foundations...`, 'info');

        const timestamp = new Date().getTime();
        const url = status === 'all'
            ? `/api/admin/foundations?_=${timestamp}`
            : `/api/admin/foundations?status=${status}&_=${timestamp}`;

        console.log('🔧 DEBUG: Fetching from API:', url);

        try {
            const headers = { 'Content-Type': 'application/json' };
            const response = await fetch(url, { headers, credentials: 'include' });

            if (response.status === 401) {
                console.log('🔐 API returned 401 — redirecting to login');
                window.location.href = '/admin/login.html';
                return;
            }

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                const foundations = data.data.map(f => ({
                    foundation_id: f.foundation_id,
                    foundation_name: f.foundation_name,
                    foundation_license: f.foundation_license,
                    certificate: f.certificate,
                    email: f.email,
                    mobile: f.mobile,
                    house_no: f.house_no,
                    road_no: f.road_no,
                    area: f.area,
                    district: f.district,
                    administrative_div: f.administrative_div,
                    zip: f.zip,
                    bkash: f.bkash,
                    bank_account: f.bank_account,
                    description: f.description,
                    status: f.status
                }));

                this.foundations = foundations;
                this.displayFoundations(this.foundations);
                this.showNotification(`✅ Loaded ${foundations.length} foundation(s)`, 'success');
                console.log('🔧 DEBUG: Displaying foundations from API:', this.foundations.length);
                return;
            }

            // No data case
            this.foundations = [];
            this.displayFoundations([]);
            this.showNotification('No foundations found', 'warning');
            console.log('🔧 DEBUG: API returned empty data array');
        } catch (error) {
            console.error('🔧 DEBUG: Failed to load foundations:', error.message);
            // Optional: could implement retry logic here
            this.foundations = [];
            this.displayFoundations([]);
            this.showNotification('No foundations found or API unavailable', 'warning');
        }
    }

    async fetchFoundationsWithRetry(status, retryCount = 0) {
        try {
                // Retry logic remains unchanged
        } catch (error) {
            console.error('🔧 DEBUG: API fetch failed:', error.message);
            if (retryCount < this.maxRetries) {
                console.log(`🔧 DEBUG: Retrying API call (${retryCount + 1}/${this.maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.fetchFoundationsWithRetry(status, retryCount + 1);
            }
            console.log('🔧 DEBUG: Max retries reached, returning null');
            return null;
        }
    }

    filterFoundations(status) {
        if (status === 'all') {
            this.displayFoundations(this.foundations);
        } else {
            const filteredFoundations = this.foundations.filter(f => f.status === status);
            this.displayFoundations(filteredFoundations);
        }
    }

    displayFoundations(foundations) {
        const container = document.getElementById('foundationsList');
        if (!container) return;

        if (foundations.length === 0) {
            container.innerHTML = `
                <div class="no-foundations">
                    <div style="text-align: center; padding: 40px; color: #718096;">
                        <i class="fas fa-building" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                        <h3>No Foundations Found</h3>
                        <p>No foundations match the current filter criteria.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = foundations.map(foundation => `
            <div class="foundation-card ${foundation.status}" onclick="foundationVerifier.showFoundationDetails('${foundation.foundation_id}')">
                <div class="foundation-header">
                    <div>
                        <div class="foundation-name">${foundation.foundation_name}</div>
                        <div class="foundation-id">${foundation.foundation_id}</div>
                    </div>
                    <div class="foundation-status ${foundation.status}">${foundation.status}</div>
                </div>
                
                <div class="foundation-info">
                    <div class="foundation-info-item">
                        <i class="fas fa-envelope"></i>
                        <span>${foundation.email}</span>
                    </div>
                    <div class="foundation-info-item">
                        <i class="fas fa-phone"></i>
                        <span>${foundation.mobile}</span>
                    </div>
                    <div class="foundation-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${foundation.area}, ${foundation.district}</span>
                    </div>
                    <div class="foundation-info-item">
                        <i class="fas fa-id-card"></i>
                        <span>License: ${foundation.foundation_license}</span>
                    </div>
                </div>

                <div class="foundation-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-view" onclick="foundationVerifier.showFoundationDetails('${foundation.foundation_id}')">
                        <i class="fas fa-eye"></i>
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    async showFoundationDetails(foundationId) {
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`/api/admin/foundations/${foundationId}/details?_=${timestamp}`, {
                headers: {
                    'Authorization': 'Bearer test-admin-token',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                this.currentFoundation = data.data;
                this.displayFoundationDetails(data.data);
                document.getElementById('foundationDetailsModal').style.display = 'flex';
                this.showNotification('Foundation details loaded', 'success');
            } else {
                throw new Error(data.message || 'Invalid API response');
            }
        } catch (error) {
            console.error('Error showing foundation details:', error);
            this.showNotification('Error loading foundation details. Please try again.', 'error');

            // Check if foundation exists in local cache
            const foundation = this.foundations.find(f => f.foundation_id === foundationId);
            if (foundation) {
                this.currentFoundation = foundation;
                this.displayFoundationDetails(foundation);
                document.getElementById('foundationDetailsModal').style.display = 'flex';
                this.showNotification('Loaded foundation details from local cache', 'warning');
            } else {
                this.showNotification('Foundation not found', 'error');
            }
        }
    }

    displayFoundationDetails(foundation) {
        const container = document.getElementById('foundationDetails');
        if (!container) return;

        container.innerHTML = `
            <div class="detail-section">
                <h4><i class="fas fa-building"></i>Foundation Information</h4>
                <div class="detail-item">
                    <div class="detail-label">Foundation Name</div>
                    <div class="detail-value">${foundation.foundation_name}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Foundation ID</div>
                    <div class="detail-value">${foundation.foundation_id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">License Number</div>
                    <div class="detail-value">${foundation.foundation_license}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">
                        <span class="foundation-status ${foundation.status}">${foundation.status}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-phone"></i>Contact Information</h4>
                <div class="detail-item">
                    <div class="detail-label">Email Address</div>
                    <div class="detail-value">${foundation.email}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Mobile Number</div>
                    <div class="detail-value">${foundation.mobile}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">bKash Number</div>
                    <div class="detail-value">${foundation.bkash || 'Not provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Bank Account</div>
                    <div class="detail-value">${foundation.bank_account || 'Not provided'}</div>
                </div>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-map-marker-alt"></i>Address Information</h4>
                <div class="detail-item">
                    <div class="detail-label">House Number</div>
                    <div class="detail-value">${foundation.house_no || 'Not provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Road Number</div>
                    <div class="detail-value">${foundation.road_no || 'Not provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Area</div>
                    <div class="detail-value">${foundation.area || 'Not provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">District</div>
                    <div class="detail-value">${foundation.district || 'Not provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Division</div>
                    <div class="detail-value">${foundation.administrative_div || 'Not provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">ZIP Code</div>
                    <div class="detail-value">${foundation.zip || 'Not provided'}</div>
                </div>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-info-circle"></i>Description</h4>
                <div class="detail-item">
                    <div class="detail-value long-text">${foundation.description || 'No description provided'}</div>
                </div>
            </div>

            <div class="certificate-preview">
                <div class="certificate-placeholder">
                    <i class="fas fa-file-pdf"></i>
                    <span>${foundation.certificate ? 'Certificate Available' : 'No certificate uploaded'}</span>
                    ${foundation.certificate ? '<button class="btn btn-view" onclick="foundationVerifier.viewCertificate()">View Certificate</button>' : ''}
                </div>
            </div>

            <div class="detail-actions" style="display:flex; gap:12px; margin-top:18px;">
                <button id="foundationApproveBtn" class="btn btn-success" onclick="verifyFoundation('approve')">
                    <i class="fas fa-check"></i>
                    Approve
                </button>
                <button id="foundationSuspendBtn" class="btn btn-danger" onclick="verifyFoundation('suspend')">
                    <i class="fas fa-times"></i>
                    Suspend
                </button>
                <button class="btn btn-secondary" onclick="closeFoundationModal()">Close</button>
            </div>
        `;
    }

    async verifyFoundation(action) {
        if (!this.currentFoundation) {
            this.showNotification('No foundation selected', 'error');
            return;
        }

        try {
            const foundationId = this.currentFoundation.foundation_id;
            const response = await fetch(`/api/admin/foundations/${foundationId}/verify`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer test-admin-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                // Update local cache
                const foundationIndex = this.foundations.findIndex(f => f.foundation_id === foundationId);
                if (foundationIndex !== -1) {
                    this.foundations[foundationIndex].status = action === 'approve' ? 'verified' : 'suspended';
                }
                this.showNotification(`Foundation ${action === 'approve' ? 'verified' : 'suspended'} successfully`, 'success');
                this.closeFoundationModal();
                this.filterFoundations(document.getElementById('foundationStatusFilter')?.value || 'unverified');
            } else {
                throw new Error(data.message || 'Failed to update foundation status');
            }
        } catch (error) {
            console.error('Error verifying foundation:', error);
            this.showNotification('Error updating foundation status. Please try again.', 'error');
        }
    }

    viewCertificate() {
        this.showNotification('Certificate viewing functionality would be implemented here', 'info');
    }

    closeFoundationModal() {
        const modal = document.getElementById('foundationDetailsModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentFoundation = null;
    }

    refreshFoundations() {
        const status = document.getElementById('foundationStatusFilter')?.value || 'unverified';
        this.loadFoundations(status);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : type === 'warning' ? '#d69e2e' : '#3182ce'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize foundation verification system
const foundationVerifier = new FoundationVerification();

// Global functions for HTML onclick events
function refreshFoundations() {
    foundationVerifier.refreshFoundations();
}

function closeFoundationModal() {
    foundationVerifier.closeFoundationModal();
}

async function verifyFoundation(action) {
    // Disable buttons to show processing state
    const approveBtn = document.getElementById('foundationApproveBtn');
    const suspendBtn = document.getElementById('foundationSuspendBtn');
    if (approveBtn) approveBtn.disabled = true;
    if (suspendBtn) suspendBtn.disabled = true;

    await foundationVerifier.verifyFoundation(action);

    // Re-enable buttons after processing
    if (approveBtn) approveBtn.disabled = false;
    if (suspendBtn) suspendBtn.disabled = false;
}

// Update the showSection function to load foundations when the section is shown
const originalShowSection = window.showSection;
window.showSection = function(sectionId) {
    originalShowSection(sectionId);
    
    if (sectionId === 'foundations') {
        const status = document.getElementById('foundationStatusFilter')?.value || 'unverified';
        foundationVerifier.loadFoundations(status);
    }
};

// Add CSS for notifications and other components
const additionalCSS = `
/* Event Card Styles */
.event-card {
    border-left: 4px solid #4a7c59;
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

.btn-success, .btn-warning, .btn-danger, .btn-trending, .btn-secondary, .btn-primary, .btn-view {
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

.btn-secondary {
    background: #e2e8f0;
    color: #4a5568;
}

.btn-secondary:hover {
    background: #cbd5e0;
}

.btn-primary, .btn-view {
    background: #4a7c59;
    color: white;
}

.btn-primary:hover, .btn-view:hover {
    background: #3d6b47;
}

/* Foundation Card Styles */
.foundations-grid, .volunteers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 24px;
}

.foundation-card, .volunteer-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    border-left: 4px solid #3182ce;
    cursor: pointer;
}

.foundation-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.foundation-header, .volunteer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.foundation-header h3, .volunteer-header h3 {
    color: #1a202c;
    font-size: 18px;
    font-weight: 600;
}

.foundation-info, .volunteer-info {
    margin-bottom: 16px;
}

.foundation-info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
    color: #4a5568;
}

.foundation-status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
}

.foundation-status.unverified {
    background: #fef5e7;
    color: #d69e2e;
}

.foundation-status.verified {
    background: #c6f6d5;
    color: #22543d;
}

.foundation-status.suspended {
    background: #fed7d7;
    color: #c53030;
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

/* Volunteer specific styles */
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

.notification.error {
    border-left-color: #c53030;
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

/* Modal Styles */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal.active {
    display: flex;
}

.modal-content {
    background: white;
    border-radius: 12px;
    padding: 0;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    color: #1a202c;
}

.close-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #718096;
    padding: 4px;
}

.modal-body {
    padding: 24px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    color: #4a5568;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
}

.form-group textarea {
    min-height: 80px;
    resize: vertical;
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
}

.volunteer-option {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    cursor: pointer;
}

.volunteer-option input {
    margin: 0;
    width: auto;
}

/* Additional Foundation Styles */
.detail-section {
    margin-bottom: 24px;
}

.detail-section h4 {
    color: #1a202c;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
}

.detail-label {
    color: #4a5568;
    font-weight: 600;
    flex: 1;
}

.detail-value {
    color: #1a202c;
    flex: 2;
    text-align: right;
}

.detail-value.long-text {
    text-align: left;
}

.certificate-placeholder {
    text-align: center;
    padding: 20px;
    background: #f7fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.certificate-placeholder i {
    font-size: 24px;
    color: #718096;
    margin-bottom: 8px;
}

.certificate-placeholder span {
    display: block;
    color: #4a5568;
    font-size: 14px;
}
`;

// Initialize admin dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.adminDashboard = new AdminDashboard();
});

// Add the additional CSS to the document
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);