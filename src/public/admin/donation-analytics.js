// Donation Analytics Dashboard JavaScript
let analytics = {
    overview: null,
    trends: null,
    donors: null,
    campaigns: null,
    geographic: null,
    charts: {}
};

// Global variables
let currentDateRange = { start: null, end: null };
let refreshInterval = null;
let isLoading = false;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

async function initializeDashboard() {
    console.log('Initializing donation analytics dashboard...');
    
    // Set default date range (last 6 months)
    setDefaultDateRange();
    
    // Load initial data
    await loadAllData();
    
    // Set up auto-refresh (every 5 minutes)
    setupAutoRefresh();
}

function setDefaultDateRange() {
    // Set to actual donation data period (September 1-19, 2025)
    const startDate = new Date('2025-09-01');
    const endDate = new Date('2025-09-19');
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    
    currentDateRange = {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
    };
}

async function loadAllData() {
    if (isLoading) return;
    
    isLoading = true;
    updateRefreshButton(true);
    
    try {
        // Load overview data and KPIs
        await Promise.all([
            loadOverviewData(),
            loadTrendsData(),
            loadDonorsData(),
            loadCampaignsData(),
            loadGeographicData()
        ]);
        
        console.log('All analytics data loaded successfully');
    } catch (error) {
        console.error('Error loading analytics data:', error);
        showErrorMessage('Failed to load analytics data. Please try refreshing.');
    } finally {
        isLoading = false;
        updateRefreshButton(false);
    }
}

async function loadOverviewData() {
    try {
        const response = await fetch(`/api/admin/analytics/overview?start_date=${currentDateRange.start}&end_date=${currentDateRange.end}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const responseData = await response.json();
        analytics.overview = responseData.success ? responseData.data : {};
        
        console.log('Overview data received:', analytics.overview);
        console.log('Overview data structure:', JSON.stringify(analytics.overview, null, 2));
        
        renderKPIs(analytics.overview);
        renderTrendsChart(analytics.overview.trends || []);
        
    } catch (error) {
        console.error('Error loading overview data:', error);
        throw error;
    }
}

async function loadTrendsData() {
    try {
        const response = await fetch(`/api/admin/analytics/trends?start_date=${currentDateRange.start}&end_date=${currentDateRange.end}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const responseData = await response.json();
        analytics.trends = responseData.success ? responseData.data : [];
        renderDetailedTrendsChart(analytics.trends);
        
    } catch (error) {
        console.error('Error loading trends data:', error);
        throw error;
    }
}

async function loadDonorsData() {
    try {
        const response = await fetch(`/api/admin/analytics/donors?start_date=${currentDateRange.start}&end_date=${currentDateRange.end}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const responseData = await response.json();
        analytics.donors = responseData.success ? responseData.data : {};
        renderDonorSegmentChart(analytics.donors.segments || []);
        renderTopDonorsTable(analytics.donors.top_donors || []);
        
    } catch (error) {
        console.error('Error loading donors data:', error);
        throw error;
    }
}

async function loadCampaignsData() {
    try {
        const response = await fetch(`/api/admin/analytics/campaigns?start_date=${currentDateRange.start}&end_date=${currentDateRange.end}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const responseData = await response.json();
        analytics.campaigns = responseData.success ? responseData.data : [];
        renderCampaignsTable(analytics.campaigns);
        
    } catch (error) {
        console.error('Error loading campaigns data:', error);
        throw error;
    }
}

async function loadGeographicData() {
    try {
        const response = await fetch(`/api/admin/analytics/geographic?start_date=${currentDateRange.start}&end_date=${currentDateRange.end}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const responseData = await response.json();
        analytics.geographic = responseData.success ? responseData.data : {};
        renderCountryChart(analytics.geographic.countries || []);
        renderDivisionChart(analytics.geographic.divisions || []);
        
    } catch (error) {
        console.error('Error loading geographic data:', error);
        throw error;
    }
}

function renderKPIs(data) {
    const kpiGrid = document.getElementById('kpiGrid');
    
    console.log('renderKPIs called with data:', data);
    console.log('Data structure:', JSON.stringify(data, null, 2));
    
    if (!data || !data.kpis) {
        console.log('No KPI data found, data structure:', JSON.stringify(data, null, 2));
        kpiGrid.innerHTML = '<div class="error-message">No KPI data available</div>';
        return;
    }
    
    const kpis = data.kpis;
    console.log('KPIs:', kpis);
    console.log('KPIs structure:', JSON.stringify(kpis, null, 2));
    
    kpiGrid.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-title">Total Donations</div>
            <div class="kpi-value">৳${formatNumber(kpis.total_amount_raised || kpis.total_amount || 0)}</div>
            <div class="kpi-change ${getChangeClass(kpis.amount_growth || 0)}">
                <i class="fas fa-${getChangeIcon(kpis.amount_growth || 0)}"></i>
                ${Math.abs(kpis.amount_growth || 0).toFixed(1)}% vs last period
            </div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-title">Total Donors</div>
            <div class="kpi-value">${formatNumber(kpis.unique_donors || kpis.total_donors || 0)}</div>
            <div class="kpi-change ${getChangeClass(kpis.donor_growth || 0)}">
                <i class="fas fa-${getChangeIcon(kpis.donor_growth || 0)}"></i>
                ${Math.abs(kpis.donor_growth || 0).toFixed(1)}% vs last period
            </div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-title">Total Transactions</div>
            <div class="kpi-value">${formatNumber(kpis.total_donations || 0)}</div>
            <div class="kpi-change ${getChangeClass(kpis.donation_growth || 0)}">
                <i class="fas fa-${getChangeIcon(kpis.donation_growth || 0)}"></i>
                ${Math.abs(kpis.donation_growth || 0).toFixed(1)}% vs last period
            </div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-title">Average Donation</div>
            <div class="kpi-value">৳${formatNumber(kpis.average_donation || kpis.avg_donation || 0)}</div>
            <div class="kpi-change ${getChangeClass(kpis.avg_growth || 0)}">
                <i class="fas fa-${getChangeIcon(kpis.avg_growth || 0)}"></i>
                ${Math.abs(kpis.avg_growth || 0).toFixed(1)}% vs last period
            </div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-title">Repeat Donors</div>
            <div class="kpi-value">${formatNumber(kpis.repeat_donors || 0)}</div>
            <div class="kpi-change ${getChangeClass(kpis.repeat_growth)}">
                <i class="fas fa-${getChangeIcon(kpis.repeat_growth)}"></i>
                ${Math.abs(kpis.repeat_growth || 0).toFixed(1)}% vs last period
            </div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-title">Active Campaigns</div>
            <div class="kpi-value">${formatNumber(kpis.active_campaigns || 0)}</div>
            <div class="kpi-change neutral">
                <i class="fas fa-bullseye"></i>
                Currently running
            </div>
        </div>
    `;
}

function renderTrendsChart(trendsData) {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (analytics.charts.trends) {
        analytics.charts.trends.destroy();
    }
    
    if (!trendsData || trendsData.length === 0) {
        ctx.canvas.parentNode.innerHTML = '<div class="loading">No trend data available</div>';
        return;
    }
    
    const labels = trendsData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const amounts = trendsData.map(item => parseFloat(item.total_amount || 0));
    const counts = trendsData.map(item => parseInt(item.donation_count || 0));
    
    analytics.charts.trends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Amount (৳)',
                data: amounts,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y'
            }, {
                label: 'Donation Count',
                data: counts,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                tension: 0.4,
                fill: false,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return `Total Amount: ৳${formatNumber(context.raw)}`;
                            } else {
                                return `Donations: ${formatNumber(context.raw)}`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Month'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Amount (৳)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '৳' + formatNumber(value);
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Count'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function renderDetailedTrendsChart(trendsData) {
    const ctx = document.getElementById('detailedTrendsChart').getContext('2d');
    
    if (analytics.charts.detailedTrends) {
        analytics.charts.detailedTrends.destroy();
    }
    
    if (!trendsData || trendsData.length === 0) {
        ctx.canvas.parentNode.innerHTML = '<div class="loading">No detailed trend data available</div>';
        return;
    }

    const labels = trendsData.map(item => {
        // Handle both monthly aggregated data and daily data
        if (item.month_name) {
            return item.month_name; // Monthly data from trends endpoint
        } else if (item.date) {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return item.month_year || 'Unknown'; // Fallback
    });
    const amounts = trendsData.map(item => parseFloat(item.total_amount || 0));
    const counts = trendsData.map(item => parseInt(item.donation_count || 0));
    const growthRates = trendsData.map(item => parseFloat(item.amount_growth_percent || 0));

    analytics.charts.detailedTrends = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Amount (৳)',
                data: amounts,
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: '#22c55e',
                borderWidth: 1,
                yAxisID: 'y'
            }, {
                label: 'Donation Count',
                data: counts,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3b82f6',
                borderWidth: 1,
                yAxisID: 'y1'
            }, {
                label: 'Growth Rate (%)',
                data: growthRates,
                type: 'line',
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                tension: 0.4,
                fill: false,
                yAxisID: 'y2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return `Amount: ৳${formatNumber(context.raw)}`;
                            } else if (context.datasetIndex === 1) {
                                return `Count: ${formatNumber(context.raw)}`;
                            } else {
                                return `Growth: ${context.raw.toFixed(1)}%`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Amount (৳)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '৳' + formatNumber(value);
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Donation Count'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                y2: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Growth Rate (%)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function renderDonorSegmentChart(segmentsData) {
    const ctx = document.getElementById('donorSegmentChart').getContext('2d');
    
    if (analytics.charts.donorSegment) {
        analytics.charts.donorSegment.destroy();
    }
    
    if (!segmentsData || segmentsData.length === 0) {
        ctx.canvas.parentNode.innerHTML = '<div class="loading">No donor segment data available</div>';
        return;
    }
    
    const labels = segmentsData.map(item => item.segment);
    const counts = segmentsData.map(item => parseInt(item.donor_count || 0));
    const amounts = segmentsData.map(item => parseFloat(item.total_amount || 0));
    
    const colors = {
        'Champion': '#f59e0b',
        'Loyal': '#10b981',
        'Regular': '#3b82f6',
        'Repeat': '#8b5cf6',
        'New': '#6b7280'
    };
    
    const backgroundColors = labels.map(label => colors[label] || '#6b7280');
    
    analytics.charts.donorSegment = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Donor Count',
                data: counts,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const segment = segmentsData[context.dataIndex];
                            return [
                                `${context.label}: ${formatNumber(context.raw)} donors`,
                                `Total: ৳${formatNumber(segment.total_amount)}`,
                                `Avg: ৳${formatNumber(segment.avg_donation)}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

function renderTopDonorsTable(donorsData) {
    const container = document.getElementById('topDonorsTable');
    
    if (!donorsData || donorsData.length === 0) {
        container.innerHTML = '<div class="loading">No top donor data available</div>';
        return;
    }
    
    const tableHTML = `
        <div class="table-responsive">
            <table class="analytics-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Donor Name</th>
                        <th>Email</th>
                        <th>Total Amount</th>
                        <th>Donations</th>
                        <th>Segment</th>
                        <th>Last Donation</th>
                    </tr>
                </thead>
                <tbody>
                    ${donorsData.map((donor, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${donor.donor_name || 'Anonymous'}</td>
                            <td>${donor.email || 'N/A'}</td>
                            <td>৳${formatNumber(donor.total_amount || 0)}</td>
                            <td>${donor.donation_count || 0}</td>
                            <td>
                                <span class="segment-badge ${(donor.segment || 'new').toLowerCase()}">
                                    ${donor.segment || 'New'}
                                </span>
                            </td>
                            <td>${formatDate(donor.last_donation_date)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

function renderCampaignsTable(campaignsData) {
    const container = document.getElementById('campaignsTable');
    
    if (!campaignsData || campaignsData.length === 0) {
        container.innerHTML = '<div class="loading">No campaign data available</div>';
        return;
    }
    
    const tableHTML = `
        <div class="table-responsive">
            <table class="analytics-table">
                <thead>
                    <tr>
                        <th>Campaign</th>
                        <th>Total Raised</th>
                        <th>Donors</th>
                        <th>Donations</th>
                        <th>Avg Donation</th>
                        <th>Success Rate</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${campaignsData.map(campaign => `
                        <tr>
                            <td>${campaign.event_name || 'Unnamed Campaign'}</td>
                            <td>৳${formatNumber(campaign.total_amount || 0)}</td>
                            <td>${campaign.unique_donors || 0}</td>
                            <td>${campaign.total_donations || 0}</td>
                            <td>৳${formatNumber(campaign.avg_donation || 0)}</td>
                            <td>${(campaign.success_rate || 0).toFixed(1)}%</td>
                            <td>
                                <span class="segment-badge ${campaign.event_status === 'active' ? 'loyal' : 'neutral'}">
                                    ${campaign.event_status || 'Unknown'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

function renderCountryChart(countriesData) {
    const ctx = document.getElementById('countryChart').getContext('2d');
    
    if (analytics.charts.country) {
        analytics.charts.country.destroy();
    }
    
    if (!countriesData || countriesData.length === 0) {
        ctx.canvas.parentNode.innerHTML = '<div class="loading">No country data available</div>';
        return;
    }
    
    const labels = countriesData.map(item => item.country || 'Unknown');
    const amounts = countriesData.map(item => parseFloat(item.total_amount || 0));
    
    analytics.charts.country = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Donations (৳)',
                data: amounts,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3b82f6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const item = countriesData[context.dataIndex];
                            return [
                                `Amount: ৳${formatNumber(context.raw)}`,
                                `Donors: ${item.donor_count || 0}`,
                                `Donations: ${item.donation_count || 0}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Amount (৳)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '৳' + formatNumber(value);
                        }
                    }
                }
            }
        }
    });
}

function renderDivisionChart(divisionsData) {
    const ctx = document.getElementById('divisionChart').getContext('2d');
    
    if (analytics.charts.division) {
        analytics.charts.division.destroy();
    }
    
    if (!divisionsData || divisionsData.length === 0) {
        ctx.canvas.parentNode.innerHTML = '<div class="loading">No division data available</div>';
        return;
    }
    
    const labels = divisionsData.map(item => item.division || 'Unknown');
    const amounts = divisionsData.map(item => parseFloat(item.total_amount || 0));
    
    analytics.charts.division = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Donations (৳)',
                data: amounts,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(107, 114, 128, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const item = divisionsData[context.dataIndex];
                            return [
                                `${context.label}: ৳${formatNumber(context.raw)}`,
                                `Donors: ${item.donor_count || 0}`,
                                `Donations: ${item.donation_count || 0}`
                            ];
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '৳' + formatNumber(value);
                        }
                    }
                }
            }
        }
    });
}

// Event handlers
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

async function applyDateFilter() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('Start date must be before end date');
        return;
    }
    
    currentDateRange = { start: startDate, end: endDate };
    await loadAllData();
}

async function refreshAnalytics() {
    console.log('Refreshing analytics data...');
    
    // Call refresh cache endpoint first
    try {
        await fetch('/api/admin/analytics/refresh-cache', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
    } catch (error) {
        console.warn('Cache refresh failed:', error);
    }
    
    // Reload all data
    await loadAllData();
}

// Utility functions
function formatNumber(num) {
    if (num >= 10000000) {
        return (num / 10000000).toFixed(1) + 'Cr';
    } else if (num >= 100000) {
        return (num / 100000).toFixed(1) + 'L';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getChangeClass(change) {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
}

function getChangeIcon(change) {
    if (change > 0) return 'arrow-up';
    if (change < 0) return 'arrow-down';
    return 'minus';
}

function updateRefreshButton(loading) {
    const btn = document.querySelector('.refresh-btn');
    if (loading) {
        btn.classList.add('loading');
        btn.innerHTML = '<i class="fas fa-spinner"></i> Refreshing...';
    } else {
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
    }
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    
    const dashboard = document.querySelector('.analytics-dashboard');
    dashboard.insertBefore(errorDiv, dashboard.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function setupAutoRefresh() {
    // Refresh data every 5 minutes
    refreshInterval = setInterval(async () => {
        console.log('Auto-refreshing analytics data...');
        await loadAllData();
    }, 5 * 60 * 1000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // Destroy all charts
    Object.values(analytics.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
});

// Handle authentication errors
window.addEventListener('fetch', (event) => {
    if (event.response && event.response.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = './login.html';
    }
});

console.log('Donation analytics dashboard script loaded');