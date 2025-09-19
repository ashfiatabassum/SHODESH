-- ==================================================================
-- DONATION ANALYTICS VIEWS
-- Advanced SQL with Joins, Subqueries, Window Functions, and CTEs
-- ==================================================================

USE shodesh;

-- Drop existing analytics views if they exist
DROP VIEW IF EXISTS v_donation_overview;
DROP VIEW IF EXISTS v_donation_trends_monthly;
DROP VIEW IF EXISTS v_donor_analytics;
DROP VIEW IF EXISTS v_geographic_distribution;
DROP VIEW IF EXISTS v_campaign_performance;
DROP VIEW IF EXISTS v_top_performers;

-- ==================================================================
-- 1. DONATION OVERVIEW - Comprehensive KPIs with Complex Joins
-- ==================================================================
CREATE VIEW v_donation_overview AS
SELECT 
    -- Total Statistics
    COUNT(d.donation_id) as total_donations,
    COUNT(DISTINCT d.donor_id) as unique_donors,
    SUM(d.amount) as total_amount_raised,
    AVG(d.amount) as average_donation,
    
    -- Time-based Statistics (Current Month)
    SUM(CASE 
        WHEN YEAR(d.paid_at) = YEAR(CURDATE()) 
        AND MONTH(d.paid_at) = MONTH(CURDATE()) 
        THEN d.amount 
        ELSE 0 
    END) as current_month_raised,
    
    COUNT(CASE 
        WHEN YEAR(d.paid_at) = YEAR(CURDATE()) 
        AND MONTH(d.paid_at) = MONTH(CURDATE()) 
        THEN d.donation_id 
    END) as current_month_donations,
    
    -- Previous Month for Growth Calculation
    SUM(CASE 
        WHEN YEAR(d.paid_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND MONTH(d.paid_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        THEN d.amount 
        ELSE 0 
    END) as previous_month_raised,
    
    -- Active Events Statistics
    (SELECT COUNT(DISTINCT ec.creation_id) 
     FROM EVENT_CREATION ec 
     WHERE ec.creation_id IN (
         SELECT DISTINCT d2.creation_id 
         FROM DONATION d2 
         WHERE d2.paid_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     )
    ) as active_events_last_30_days,
    
    -- Goal Achievement Rate
    (SELECT 
        AVG(CASE 
            WHEN ec.amount_needed > 0 
            THEN (ec.amount_received / ec.amount_needed) * 100 
            ELSE 0 
        END)
     FROM EVENT_CREATION ec
     WHERE ec.amount_received > 0
    ) as avg_goal_achievement_rate

FROM DONATION d
LEFT JOIN EVENT_CREATION ec ON d.creation_id = ec.creation_id
LEFT JOIN DONOR dr ON d.donor_id = dr.donor_id;

-- ==================================================================
-- 2. MONTHLY TRENDS - Time Series Analysis with Window Functions
-- ==================================================================
CREATE VIEW v_donation_trends_monthly AS
WITH monthly_stats AS (
    SELECT 
        YEAR(d.paid_at) as donation_year,
        MONTH(d.paid_at) as donation_month,
        DATE_FORMAT(d.paid_at, '%Y-%m') as month_year,
        DATE_FORMAT(d.paid_at, '%M %Y') as month_name,
        COUNT(d.donation_id) as donation_count,
        COUNT(DISTINCT d.donor_id) as unique_donors,
        SUM(d.amount) as total_amount,
        AVG(d.amount) as avg_amount
    FROM DONATION d
    WHERE d.paid_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY YEAR(d.paid_at), MONTH(d.paid_at)
),
trend_calculations AS (
    SELECT 
        donation_year,
        donation_month,
        month_year,
        month_name,
        donation_count,
        unique_donors,
        total_amount,
        avg_amount,
        -- Window function for growth calculations
        LAG(total_amount, 1) OVER (ORDER BY donation_year, donation_month) as prev_month_amount,
        LAG(donation_count, 1) OVER (ORDER BY donation_year, donation_month) as prev_month_count,
        -- Running totals
        SUM(total_amount) OVER (ORDER BY donation_year, donation_month ROWS UNBOUNDED PRECEDING) as cumulative_amount,
        -- Moving averages
        AVG(total_amount) OVER (ORDER BY donation_year, donation_month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg_3month
    FROM monthly_stats
)
SELECT 
    donation_year,
    donation_month,
    month_year,
    month_name,
    donation_count,
    unique_donors,
    total_amount,
    avg_amount,
    cumulative_amount,
    moving_avg_3month,
    -- Growth calculations
    CASE 
        WHEN prev_month_amount > 0 
        THEN ROUND(((total_amount - prev_month_amount) / prev_month_amount) * 100, 2)
        ELSE 0 
    END as amount_growth_percent,
    CASE 
        WHEN prev_month_count > 0 
        THEN ROUND(((donation_count - prev_month_count) / prev_month_count) * 100, 2)
        ELSE 0 
    END as count_growth_percent
FROM trend_calculations
ORDER BY donation_year DESC, donation_month DESC;

-- ==================================================================
-- 3. DONOR ANALYTICS - Advanced Donor Segmentation
-- ==================================================================
CREATE VIEW v_donor_analytics AS
WITH donor_stats AS (
    SELECT 
        dr.donor_id,
        CONCAT(dr.first_name, ' ', dr.last_name) as donor_name,
        dr.country,
        dr.division,
        dr.profile_created_at,
        COUNT(d.donation_id) as total_donations,
        SUM(d.amount) as total_donated,
        AVG(d.amount) as avg_donation,
        MIN(d.paid_at) as first_donation_date,
        MAX(d.paid_at) as last_donation_date,
        DATEDIFF(MAX(d.paid_at), MIN(d.paid_at)) as donor_lifespan_days
    FROM DONOR dr
    LEFT JOIN DONATION d ON dr.donor_id = d.donor_id
    WHERE d.donation_id IS NOT NULL
    GROUP BY dr.donor_id
),
donor_segments AS (
    SELECT 
        *,
        -- Donor Value Segmentation
        CASE 
            WHEN total_donated >= 10000 THEN 'High Value'
            WHEN total_donated >= 5000 THEN 'Medium Value'
            WHEN total_donated >= 1000 THEN 'Regular'
            ELSE 'New'
        END as value_segment,
        
        -- Donation Frequency Segmentation
        CASE 
            WHEN total_donations >= 10 THEN 'Frequent'
            WHEN total_donations >= 5 THEN 'Regular'
            WHEN total_donations >= 2 THEN 'Occasional'
            ELSE 'One-time'
        END as frequency_segment,
        
        -- Recency Segmentation
        CASE 
            WHEN DATEDIFF(CURDATE(), last_donation_date) <= 30 THEN 'Recent'
            WHEN DATEDIFF(CURDATE(), last_donation_date) <= 90 THEN 'Active'
            WHEN DATEDIFF(CURDATE(), last_donation_date) <= 365 THEN 'At Risk'
            ELSE 'Inactive'
        END as recency_segment
    FROM donor_stats
)
SELECT 
    *,
    -- Donor Score (weighted combination of segments)
    (CASE value_segment 
        WHEN 'High Value' THEN 4 
        WHEN 'Medium Value' THEN 3 
        WHEN 'Regular' THEN 2 
        ELSE 1 
    END +
    CASE frequency_segment 
        WHEN 'Frequent' THEN 4 
        WHEN 'Regular' THEN 3 
        WHEN 'Occasional' THEN 2 
        ELSE 1 
    END +
    CASE recency_segment 
        WHEN 'Recent' THEN 4 
        WHEN 'Active' THEN 3 
        WHEN 'At Risk' THEN 2 
        ELSE 1 
    END) as donor_score
FROM donor_segments
ORDER BY donor_score DESC, total_donated DESC;

-- ==================================================================
-- 4. GEOGRAPHIC DISTRIBUTION - Location-based Analytics
-- ==================================================================
CREATE VIEW v_geographic_distribution AS
WITH country_stats AS (
    SELECT 
        COALESCE(dr.country, 'Unknown') as country,
        COUNT(DISTINCT dr.donor_id) as donor_count,
        COUNT(d.donation_id) as donation_count,
        SUM(d.amount) as total_donated,
        AVG(d.amount) as avg_donation
    FROM DONOR dr
    LEFT JOIN DONATION d ON dr.donor_id = d.donor_id
    GROUP BY dr.country
),
division_stats AS (
    SELECT 
        COALESCE(dr.division, 'Other') as division,
        COUNT(DISTINCT dr.donor_id) as donor_count,
        COUNT(d.donation_id) as donation_count,
        SUM(d.amount) as total_donated,
        AVG(d.amount) as avg_donation
    FROM DONOR dr
    LEFT JOIN DONATION d ON dr.donor_id = d.donor_id
    WHERE dr.country = 'Bangladesh'
    GROUP BY dr.division
)
SELECT 
    'Country' as geo_type,
    country as location,
    donor_count,
    donation_count,
    total_donated,
    avg_donation,
    ROUND((total_donated / (SELECT SUM(total_donated) FROM country_stats)) * 100, 2) as percentage_of_total
FROM country_stats
WHERE donation_count > 0

UNION ALL

SELECT 
    'Division' as geo_type,
    division as location,
    donor_count,
    donation_count,
    total_donated,
    avg_donation,
    ROUND((total_donated / (SELECT SUM(total_donated) FROM division_stats)) * 100, 2) as percentage_of_total
FROM division_stats
WHERE donation_count > 0

ORDER BY geo_type, total_donated DESC;

-- ==================================================================
-- 5. CAMPAIGN PERFORMANCE - Event Success Analysis
-- ==================================================================
CREATE VIEW v_campaign_performance AS
WITH event_stats AS (
    SELECT 
        ec.creation_id,
        ec.title,
        ec.creator_type,
        COALESCE(f.foundation_name, CONCAT(i.first_name, ' ', i.last_name)) as creator_name,
        ec.amount_needed,
        ec.amount_received,
        COUNT(d.donation_id) as donation_count,
        COUNT(DISTINCT d.donor_id) as unique_donors,
        AVG(d.amount) as avg_donation,
        MIN(d.paid_at) as first_donation,
        MAX(d.paid_at) as last_donation,
        -- Calculate days since event creation (assuming created_at exists or use first donation)
        COALESCE(DATEDIFF(CURDATE(), MIN(d.paid_at)), 0) as days_active
    FROM EVENT_CREATION ec
    LEFT JOIN DONATION d ON ec.creation_id = d.creation_id
    LEFT JOIN FOUNDATION f ON ec.foundation_id = f.foundation_id
    LEFT JOIN INDIVIDUAL i ON ec.individual_id = i.individual_id
    GROUP BY ec.creation_id
    HAVING donation_count > 0
),
performance_metrics AS (
    SELECT 
        *,
        -- Goal achievement rate
        CASE 
            WHEN amount_needed > 0 
            THEN ROUND((amount_received / amount_needed) * 100, 2)
            ELSE 0 
        END as goal_achievement_percent,
        
        -- Performance categories
        CASE 
            WHEN amount_needed > 0 AND (amount_received / amount_needed) >= 1.0 THEN 'Fully Funded'
            WHEN amount_needed > 0 AND (amount_received / amount_needed) >= 0.75 THEN 'Nearly Funded'
            WHEN amount_needed > 0 AND (amount_received / amount_needed) >= 0.5 THEN 'Partially Funded'
            WHEN amount_needed > 0 AND (amount_received / amount_needed) >= 0.25 THEN 'Getting Started'
            ELSE 'New Campaign'
        END as performance_category,
        
        -- Efficiency metrics
        CASE 
            WHEN days_active > 0 
            THEN ROUND(amount_received / days_active, 2)
            ELSE amount_received 
        END as daily_average
    FROM event_stats
)
SELECT 
    creation_id,
    title,
    creator_type,
    creator_name,
    amount_needed,
    amount_received,
    donation_count,
    unique_donors,
    avg_donation,
    goal_achievement_percent,
    performance_category,
    daily_average,
    days_active,
    first_donation,
    last_donation
FROM performance_metrics
ORDER BY goal_achievement_percent DESC, amount_received DESC;

-- ==================================================================
-- 6. TOP PERFORMERS - Leaderboards
-- ==================================================================
CREATE VIEW v_top_performers AS
(
    -- Top Donors by Total Amount
    SELECT 
        'donor' as performer_type,
        'total_amount' as metric_type,
        CONCAT(COALESCE(dr.first_name, ''), ' ', COALESCE(dr.last_name, '')) as name,
        dr.donor_id as id,
        SUM(d.amount) as value,
        COUNT(d.donation_id) as transaction_count,
        MAX(d.paid_at) as last_activity
    FROM DONOR dr
    INNER JOIN DONATION d ON dr.donor_id = d.donor_id
    GROUP BY dr.donor_id, dr.first_name, dr.last_name
    ORDER BY value DESC
    LIMIT 10
)

UNION ALL

(
    -- Top Events by Amount Raised
    SELECT 
        'event' as performer_type,
        'amount_raised' as metric_type,
        COALESCE(ec.title, 'Untitled Event') as name,
        ec.creation_id as id,
        COALESCE(ec.amount_received, 0) as value,
        (SELECT COUNT(*) FROM DONATION WHERE creation_id = ec.creation_id) as transaction_count,
        (SELECT MAX(paid_at) FROM DONATION WHERE creation_id = ec.creation_id) as last_activity
    FROM EVENT_CREATION ec
    WHERE ec.amount_received > 0
    ORDER BY value DESC
    LIMIT 10
)

UNION ALL

(
    -- Top Creators by Total Funds Raised
    SELECT 
        CASE ec.creator_type 
            WHEN 'foundation' THEN 'foundation'
            ELSE 'individual'
        END as performer_type,
        'creator_total' as metric_type,
        CASE ec.creator_type 
            WHEN 'foundation' THEN COALESCE(f.foundation_name, 'Unnamed Foundation')
            ELSE CONCAT(COALESCE(i.first_name, ''), ' ', COALESCE(i.last_name, ''))
        END as name,
        CASE ec.creator_type 
            WHEN 'foundation' THEN CAST(ec.foundation_id as CHAR)
            ELSE CAST(ec.individual_id as CHAR)
        END as id,
        SUM(COALESCE(ec.amount_received, 0)) as value,
        COUNT(ec.creation_id) as transaction_count,
        MAX((SELECT MAX(paid_at) FROM DONATION WHERE creation_id = ec.creation_id)) as last_activity
    FROM EVENT_CREATION ec
    LEFT JOIN FOUNDATION f ON ec.foundation_id = f.foundation_id
    LEFT JOIN INDIVIDUAL i ON ec.individual_id = i.individual_id
    WHERE ec.amount_received > 0
    GROUP BY 
        ec.creator_type,
        CASE ec.creator_type 
            WHEN 'foundation' THEN ec.foundation_id
            ELSE ec.individual_id
        END,
        CASE ec.creator_type 
            WHEN 'foundation' THEN f.foundation_name
            ELSE CONCAT(COALESCE(i.first_name, ''), ' ', COALESCE(i.last_name, ''))
        END
    ORDER BY value DESC
    LIMIT 10
)
ORDER BY performer_type, value DESC;