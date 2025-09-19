// ==================================================================
// DONATION ANALYTICS API ENDPOINTS
// Advanced SQL Integration with Error Handling and Data Validation
// ==================================================================

// Add these routes to your existing admin.js file

const express = require('express');
const router = express.Router();

// ==================================================================
// ANALYTICS ENDPOINTS
// ==================================================================

// Get comprehensive donation overview
router.get('/analytics/overview', authenticateAdmin, async (req, res) => {
    try {
        console.log('📊 Fetching donation analytics overview...');
        
        // Get basic overview from view
        const [overviewData] = await adminDb.execute('SELECT * FROM v_donation_overview');
        
        // Get monthly trends (last 12 months)
        const [trendsData] = await adminDb.execute(`
            SELECT * FROM v_donation_trends_monthly 
            ORDER BY year DESC, month DESC 
            LIMIT 12
        `);
        
        // Get top performers
        const [topPerformers] = await adminDb.execute(`
            SELECT * FROM v_top_performers
        `);
        
        res.json({
            success: true,
            data: {
                overview: overviewData[0] || {},
                trends: trendsData,
                topPerformers: topPerformers
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Analytics overview error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch analytics overview',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get detailed analytics with custom date range
router.get('/analytics/detailed', authenticateAdmin, async (req, res) => {
    try {
        const { startDate, endDate, includeTrends = 'true' } = req.query;
        
        // Validate date parameters
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate and endDate parameters are required'
            });
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }
        
        if (start > end) {
            return res.status(400).json({
                success: false,
                message: 'startDate cannot be greater than endDate'
            });
        }
        
        console.log(`📊 Fetching detailed analytics: ${startDate} to ${endDate}`);
        
        // Call stored procedure for detailed analytics
        const [results] = await adminDb.execute(
            'CALL sp_get_donation_analytics(?, ?, ?)',
            [startDate, endDate, includeTrends === 'true']
        );
        
        // Extract multiple result sets from stored procedure
        const response = {
            success: true,
            data: {
                status: results[0][0], // Status message
                kpis: results[1][0] || {}, // KPI summary
                dailyTrends: includeTrends === 'true' ? results[2] || [] : [], // Daily trends
                geographic: results[includeTrends === 'true' ? 3 : 2] || [] // Geographic breakdown
            },
            dateRange: { startDate, endDate },
            timestamp: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Detailed analytics error:', error);
        
        // Handle SQL-specific errors
        if (error.sqlState === '45000') {
            return res.status(400).json({
                success: false,
                message: error.sqlMessage || 'Invalid parameters'
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch detailed analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get donor insights and segmentation
router.get('/analytics/donors', authenticateAdmin, async (req, res) => {
    try {
        const { limit = 50, minDonations = 1, segment } = req.query;
        
        // Validate parameters
        const parsedLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 1000);
        const parsedMinDonations = Math.max(parseInt(minDonations) || 1, 1);
        
        console.log(`👥 Fetching donor insights: limit=${parsedLimit}, minDonations=${parsedMinDonations}`);
        
        // Call stored procedure for donor insights
        const [results] = await adminDb.execute(
            'CALL sp_get_donor_insights(?, ?)',
            [parsedLimit, parsedMinDonations]
        );
        
        // Get donor analytics view data
        const [donorAnalytics] = await adminDb.execute(`
            SELECT * FROM v_donor_analytics 
            ${segment ? `WHERE value_segment = ? OR frequency_segment = ? OR recency_segment = ?` : ''}
            ORDER BY donor_score DESC 
            LIMIT ?
        `, segment ? [segment, segment, segment, parsedLimit] : [parsedLimit]);
        
        const response = {
            success: true,
            data: {
                status: results[0][0], // Status message
                donorDetails: results[1] || [], // Detailed donor analysis
                segmentSummary: results[2] || [], // Segmentation summary
                donorAnalytics: donorAnalytics
            },
            filters: { limit: parsedLimit, minDonations: parsedMinDonations, segment },
            timestamp: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Donor insights error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch donor insights',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get trend analysis
router.get('/analytics/trends', authenticateAdmin, async (req, res) => {
    try {
        const { period = 'daily', monthsBack = 6 } = req.query;
        
        // Validate parameters
        const validPeriods = ['daily', 'weekly', 'monthly'];
        const selectedPeriod = validPeriods.includes(period) ? period : 'daily';
        const selectedMonthsBack = Math.min(Math.max(parseInt(monthsBack) || 6, 1), 24);
        
        console.log(`📈 Fetching trend analysis: ${selectedPeriod}, ${selectedMonthsBack} months back`);
        
        // Call stored procedure for trend analysis
        const [results] = await adminDb.execute(
            'CALL sp_get_trend_analysis(?, ?)',
            [selectedPeriod, selectedMonthsBack]
        );
        
        const response = {
            success: true,
            data: {
                status: results[0][0], // Status message
                trends: results[1] || [] // Trend data
            },
            parameters: { period: selectedPeriod, monthsBack: selectedMonthsBack },
            timestamp: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Trend analysis error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch trend analysis',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get geographic distribution
router.get('/analytics/geographic', authenticateAdmin, async (req, res) => {
    try {
        console.log('🌍 Fetching geographic distribution...');
        
        const [geoData] = await adminDb.execute('SELECT * FROM v_geographic_distribution');
        
        // Separate country and division data
        const countryData = geoData.filter(row => row.geo_type === 'Country');
        const divisionData = geoData.filter(row => row.geo_type === 'Division');
        
        res.json({
            success: true,
            data: {
                countries: countryData,
                divisions: divisionData,
                total: geoData
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Geographic analysis error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch geographic distribution',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get campaign performance analysis
router.get('/analytics/campaigns', authenticateAdmin, async (req, res) => {
    try {
        const { status, creatorType, limit = 50 } = req.query;
        
        const parsedLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 500);
        
        console.log('🎯 Fetching campaign performance...');
        
        let query = 'SELECT * FROM v_campaign_performance';
        const params = [];
        const conditions = [];
        
        if (status && ['Fully Funded', 'Nearly Funded', 'Partially Funded', 'Getting Started', 'New Campaign'].includes(status)) {
            conditions.push('performance_category = ?');
            params.push(status);
        }
        
        if (creatorType && ['foundation', 'individual'].includes(creatorType)) {
            conditions.push('creator_type = ?');
            params.push(creatorType);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY goal_achievement_percent DESC, amount_received DESC LIMIT ?';
        params.push(parsedLimit);
        
        const [campaigns] = await adminDb.execute(query, params);
        
        // Get summary statistics
        const [summary] = await adminDb.execute(`
            SELECT 
                COUNT(*) as total_campaigns,
                SUM(amount_received) as total_raised,
                AVG(goal_achievement_percent) as avg_achievement_rate,
                SUM(CASE WHEN performance_category = 'Fully Funded' THEN 1 ELSE 0 END) as fully_funded_count,
                SUM(CASE WHEN creator_type = 'foundation' THEN amount_received ELSE 0 END) as foundation_total,
                SUM(CASE WHEN creator_type = 'individual' THEN amount_received ELSE 0 END) as individual_total
            FROM v_campaign_performance
        `);
        
        res.json({
            success: true,
            data: {
                campaigns: campaigns,
                summary: summary[0] || {}
            },
            filters: { status, creatorType, limit: parsedLimit },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Campaign analysis error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch campaign performance',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Refresh analytics cache
router.post('/analytics/refresh-cache', authenticateAdmin, async (req, res) => {
    try {
        console.log('🔄 Refreshing analytics cache...');
        
        const [result] = await adminDb.execute('CALL sp_refresh_analytics_cache()');
        
        res.json({
            success: true,
            data: result[0][0],
            message: 'Analytics cache refreshed successfully'
        });
        
    } catch (error) {
        console.error('❌ Cache refresh error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to refresh analytics cache',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get real-time statistics
router.get('/analytics/realtime', authenticateAdmin, async (req, res) => {
    try {
        console.log('⚡ Fetching real-time statistics...');
        
        // Today's statistics
        const [todayStats] = await adminDb.execute(`
            SELECT 
                COUNT(d.donation_id) as today_donations,
                COALESCE(SUM(d.amount), 0) as today_amount,
                COUNT(DISTINCT d.donor_id) as today_unique_donors,
                COUNT(DISTINCT d.creation_id) as today_campaigns
            FROM DONATION d
            WHERE DATE(d.paid_at) = CURDATE()
        `);
        
        // This week's statistics
        const [weekStats] = await adminDb.execute(`
            SELECT 
                COUNT(d.donation_id) as week_donations,
                COALESCE(SUM(d.amount), 0) as week_amount,
                COUNT(DISTINCT d.donor_id) as week_unique_donors
            FROM DONATION d
            WHERE YEARWEEK(d.paid_at, 1) = YEARWEEK(CURDATE(), 1)
        `);
        
        // Recent donations (last 10)
        const [recentDonations] = await adminDb.execute(`
            SELECT 
                d.donation_id,
                d.amount,
                d.paid_at,
                CONCAT(dr.first_name, ' ', dr.last_name) as donor_name,
                ec.title as campaign_title,
                CASE ec.creator_type 
                    WHEN 'foundation' THEN f.foundation_name
                    ELSE CONCAT(i.first_name, ' ', i.last_name)
                END as creator_name
            FROM DONATION d
            INNER JOIN DONOR dr ON d.donor_id = dr.donor_id
            INNER JOIN EVENT_CREATION ec ON d.creation_id = ec.creation_id
            LEFT JOIN FOUNDATION f ON ec.foundation_id = f.foundation_id
            LEFT JOIN INDIVIDUAL i ON ec.individual_id = i.individual_id
            ORDER BY d.paid_at DESC
            LIMIT 10
        `);
        
        res.json({
            success: true,
            data: {
                today: todayStats[0] || {},
                thisWeek: weekStats[0] || {},
                recentDonations: recentDonations
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Real-time stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch real-time statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Export analytics data
router.get('/analytics/export', authenticateAdmin, async (req, res) => {
    try {
        const { type = 'overview', format = 'json', startDate, endDate } = req.query;
        
        console.log(`📤 Exporting analytics data: ${type} (${format})`);
        
        let data = {};
        
        switch (type) {
            case 'overview':
                const [overview] = await adminDb.execute('SELECT * FROM v_donation_overview');
                data = overview[0] || {};
                break;
                
            case 'donors':
                const [donors] = await adminDb.execute('SELECT * FROM v_donor_analytics LIMIT 1000');
                data = donors;
                break;
                
            case 'campaigns':
                const [campaigns] = await adminDb.execute('SELECT * FROM v_campaign_performance LIMIT 1000');
                data = campaigns;
                break;
                
            case 'geographic':
                const [geo] = await adminDb.execute('SELECT * FROM v_geographic_distribution');
                data = geo;
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid export type. Use: overview, donors, campaigns, or geographic'
                });
        }
        
        if (format === 'csv') {
            // Convert to CSV format
            const csv = convertToCSV(Array.isArray(data) ? data : [data]);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csv);
        } else {
            // JSON format
            res.json({
                success: true,
                data: data,
                exportType: type,
                exportDate: new Date().toISOString(),
                recordCount: Array.isArray(data) ? data.length : 1
            });
        }
        
    } catch (error) {
        console.error('❌ Export error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to export analytics data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Helper function to convert JSON to CSV
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}

module.exports = router;