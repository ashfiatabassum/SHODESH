-- ==================================================================
-- DONATION ANALYTICS STORED PROCEDURES & FUNCTIONS
-- Advanced PL/SQL with Exception Handling, Complex Logic, and Validation
-- ==================================================================

USE shodesh;

-- Drop existing procedures and functions
DROP FUNCTION IF EXISTS fn_calculate_growth_rate;
DROP FUNCTION IF EXISTS fn_donor_segment_score;
DROP FUNCTION IF EXISTS fn_campaign_health_score;
DROP PROCEDURE IF EXISTS sp_get_donation_analytics;
DROP PROCEDURE IF EXISTS sp_get_donor_insights;
DROP PROCEDURE IF EXISTS sp_get_trend_analysis;
DROP PROCEDURE IF EXISTS sp_refresh_analytics_cache;

DELIMITER $$

-- ==================================================================
-- 1. UTILITY FUNCTIONS
-- ==================================================================

-- Function to calculate growth rate with error handling
CREATE FUNCTION fn_calculate_growth_rate(
    current_value DECIMAL(12,2),
    previous_value DECIMAL(12,2)
) RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE growth_rate DECIMAL(10,2) DEFAULT 0.00;
    
    -- Handle division by zero and null values
    IF previous_value IS NULL OR previous_value = 0 THEN
        IF current_value > 0 THEN
            RETURN 100.00; -- 100% growth from zero
        ELSE
            RETURN 0.00;
        END IF;
    END IF;
    
    IF current_value IS NULL THEN
        SET current_value = 0;
    END IF;
    
    SET growth_rate = ((current_value - previous_value) / previous_value) * 100;
    
    -- Cap extreme values
    IF growth_rate > 1000 THEN
        SET growth_rate = 1000.00;
    ELSEIF growth_rate < -100 THEN
        SET growth_rate = -100.00;
    END IF;
    
    RETURN ROUND(growth_rate, 2);
END$$

-- Function to calculate donor segment score
CREATE FUNCTION fn_donor_segment_score(
    total_donated DECIMAL(12,2),
    donation_count INT,
    days_since_last_donation INT
) RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE value_score INT DEFAULT 0;
    DECLARE frequency_score INT DEFAULT 0;
    DECLARE recency_score INT DEFAULT 0;
    DECLARE total_score INT DEFAULT 0;
    
    -- Value Score (1-4)
    IF total_donated >= 10000 THEN SET value_score = 4;
    ELSEIF total_donated >= 5000 THEN SET value_score = 3;
    ELSEIF total_donated >= 1000 THEN SET value_score = 2;
    ELSE SET value_score = 1;
    END IF;
    
    -- Frequency Score (1-4)
    IF donation_count >= 10 THEN SET frequency_score = 4;
    ELSEIF donation_count >= 5 THEN SET frequency_score = 3;
    ELSEIF donation_count >= 2 THEN SET frequency_score = 2;
    ELSE SET frequency_score = 1;
    END IF;
    
    -- Recency Score (1-4)
    IF days_since_last_donation <= 30 THEN SET recency_score = 4;
    ELSEIF days_since_last_donation <= 90 THEN SET recency_score = 3;
    ELSEIF days_since_last_donation <= 365 THEN SET recency_score = 2;
    ELSE SET recency_score = 1;
    END IF;
    
    SET total_score = value_score + frequency_score + recency_score;
    
    RETURN total_score;
END$$

-- Function to calculate campaign health score
CREATE FUNCTION fn_campaign_health_score(
    amount_needed DECIMAL(12,2),
    amount_received DECIMAL(12,2),
    donation_count INT,
    days_active INT
) RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE health_score DECIMAL(5,2) DEFAULT 0.00;
    DECLARE goal_ratio DECIMAL(5,2) DEFAULT 0.00;
    DECLARE activity_score DECIMAL(5,2) DEFAULT 0.00;
    DECLARE momentum_score DECIMAL(5,2) DEFAULT 0.00;
    DECLARE daily_avg DECIMAL(10,2) DEFAULT 0.00;
    
    -- Handle edge cases
    IF amount_needed <= 0 OR amount_received IS NULL THEN
        RETURN 0.00;
    END IF;
    
    -- Goal achievement ratio (0-40 points)
    SET goal_ratio = LEAST((amount_received / amount_needed) * 40, 40);
    
    -- Activity score based on donation count (0-30 points)
    IF donation_count >= 50 THEN SET activity_score = 30;
    ELSEIF donation_count >= 20 THEN SET activity_score = 25;
    ELSEIF donation_count >= 10 THEN SET activity_score = 20;
    ELSEIF donation_count >= 5 THEN SET activity_score = 15;
    ELSEIF donation_count >= 1 THEN SET activity_score = 10;
    ELSE SET activity_score = 0;
    END IF;
    
    -- Momentum score based on daily average (0-30 points)
    IF days_active > 0 THEN
        SET daily_avg = amount_received / days_active;
        
        IF daily_avg >= 1000 THEN SET momentum_score = 30;
        ELSEIF daily_avg >= 500 THEN SET momentum_score = 25;
        ELSEIF daily_avg >= 100 THEN SET momentum_score = 20;
        ELSEIF daily_avg >= 50 THEN SET momentum_score = 15;
        ELSEIF daily_avg >= 10 THEN SET momentum_score = 10;
        ELSE SET momentum_score = 5;
        END IF;
    ELSE
        SET momentum_score = 0;
    END IF;
    
    SET health_score = goal_ratio + activity_score + momentum_score;
    
    RETURN ROUND(health_score, 2);
END$$

-- ==================================================================
-- 2. MAIN ANALYTICS PROCEDURES
-- ==================================================================

-- Comprehensive donation analytics procedure
CREATE PROCEDURE sp_get_donation_analytics(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_include_trends TINYINT
)
BEGIN
    -- Exception handling
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @sql_state = RETURNED_SQLSTATE,
            @error_message = MESSAGE_TEXT;
        
        SELECT 
            'error' as status,
            @sql_state as sql_state,
            @error_message as message,
            'sp_get_donation_analytics' as procedure_name;
    END;
    
    -- Set default value for p_include_trends
    IF p_include_trends IS NULL THEN
        SET p_include_trends = 1;
    END IF;
    
    -- Validate input parameters
    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start date and end date are required';
    END IF;
    
    IF p_start_date > p_end_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start date cannot be greater than end date';
    END IF;
    
    IF p_end_date > CURDATE() THEN
        SET p_end_date = CURDATE();
    END IF;
    
    -- Main analytics result set
    SELECT 
        'success' as status,
        'Analytics data retrieved successfully' as message;
    
    -- KPI Summary
    SELECT 
        COUNT(d.donation_id) as total_donations,
        COUNT(DISTINCT d.donor_id) as unique_donors,
        SUM(d.amount) as total_amount,
        AVG(d.amount) as average_donation,
        MIN(d.amount) as min_donation,
        MAX(d.amount) as max_donation,
        STD(d.amount) as donation_std_dev,
        COUNT(DISTINCT d.creation_id) as campaigns_supported,
        COUNT(DISTINCT DATE(d.paid_at)) as active_days
    FROM DONATION d
    WHERE DATE(d.paid_at) BETWEEN p_start_date AND p_end_date;
    
    -- Daily trend analysis if requested
    IF p_include_trends = 1 THEN
        WITH RECURSIVE date_series AS (
            SELECT p_start_date as date_val
            UNION ALL
            SELECT DATE_ADD(date_val, INTERVAL 1 DAY)
            FROM date_series
            WHERE date_val < p_end_date
        )
        SELECT 
            ds.date_val as date,
            COALESCE(COUNT(d.donation_id), 0) as donation_count,
            COALESCE(SUM(d.amount), 0) as total_amount,
            COALESCE(COUNT(DISTINCT d.donor_id), 0) as unique_donors,
            -- Running totals using window functions
            SUM(COALESCE(SUM(d.amount), 0)) OVER (ORDER BY ds.date_val) as cumulative_amount,
            -- 7-day moving average
            AVG(COALESCE(SUM(d.amount), 0)) OVER (
                ORDER BY ds.date_val 
                ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
            ) as moving_avg_7day
        FROM date_series ds
        LEFT JOIN DONATION d ON DATE(d.paid_at) = ds.date_val
        GROUP BY ds.date_val
        ORDER BY ds.date_val;
    END IF;
    
    -- Geographic breakdown
    SELECT 
        dr.country,
        dr.division,
        COUNT(d.donation_id) as donation_count,
        SUM(d.amount) as total_amount,
        AVG(d.amount) as avg_amount,
        COUNT(DISTINCT d.donor_id) as unique_donors
    FROM DONATION d
    INNER JOIN DONOR dr ON d.donor_id = dr.donor_id
    WHERE DATE(d.paid_at) BETWEEN p_start_date AND p_end_date
    GROUP BY dr.country, dr.division
    ORDER BY total_amount DESC;
    
END$$

-- Donor insights procedure with segmentation
CREATE PROCEDURE sp_get_donor_insights(
    IN p_limit INT,
    IN p_min_donations INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @sql_state = RETURNED_SQLSTATE,
            @error_message = MESSAGE_TEXT;
        
        SELECT 
            'error' as status,
            @sql_state as sql_state,
            @error_message as message,
            'sp_get_donor_insights' as procedure_name;
    END;
    
    -- Set default values
    IF p_limit IS NULL OR p_limit <= 0 OR p_limit > 1000 THEN
        SET p_limit = 50;
    END IF;
    
    IF p_min_donations IS NULL OR p_min_donations < 1 THEN
        SET p_min_donations = 1;
    END IF;
    
    SELECT 'success' as status, 'Donor insights retrieved successfully' as message;
    
    -- Detailed donor analysis with custom scoring
    SELECT 
        dr.donor_id,
        CONCAT(dr.first_name, ' ', dr.last_name) as donor_name,
        dr.country,
        dr.division,
        COUNT(d.donation_id) as total_donations,
        SUM(d.amount) as total_donated,
        AVG(d.amount) as avg_donation,
        MIN(d.paid_at) as first_donation,
        MAX(d.paid_at) as last_donation,
        DATEDIFF(CURDATE(), MAX(d.paid_at)) as days_since_last_donation,
        DATEDIFF(MAX(d.paid_at), MIN(d.paid_at)) as donor_lifespan_days,
        
        -- Calculate custom scores using our function
        fn_donor_segment_score(
            SUM(d.amount), 
            COUNT(d.donation_id), 
            DATEDIFF(CURDATE(), MAX(d.paid_at))
        ) as donor_score,
        
        -- Donation frequency (donations per month)
        CASE 
            WHEN DATEDIFF(MAX(d.paid_at), MIN(d.paid_at)) > 0
            THEN ROUND(COUNT(d.donation_id) / (DATEDIFF(MAX(d.paid_at), MIN(d.paid_at)) / 30), 2)
            ELSE COUNT(d.donation_id)
        END as donations_per_month,
        
        -- Engagement categories
        CASE 
            WHEN COUNT(d.donation_id) >= 10 AND SUM(d.amount) >= 5000 THEN 'Champion'
            WHEN COUNT(d.donation_id) >= 5 AND SUM(d.amount) >= 2000 THEN 'Loyal'
            WHEN COUNT(d.donation_id) >= 3 AND SUM(d.amount) >= 1000 THEN 'Regular'
            WHEN COUNT(d.donation_id) >= 2 THEN 'Repeat'
            ELSE 'New'
        END as engagement_category
        
    FROM DONOR dr
    INNER JOIN DONATION d ON dr.donor_id = d.donor_id
    GROUP BY dr.donor_id
    HAVING COUNT(d.donation_id) >= p_min_donations
    ORDER BY donor_score DESC, total_donated DESC
    LIMIT p_limit;
    
    -- Donor segmentation summary
    SELECT 
        engagement_category,
        COUNT(*) as donor_count,
        SUM(total_donated) as segment_total,
        AVG(total_donated) as avg_donated_per_donor,
        AVG(donor_score) as avg_score
    FROM (
        SELECT 
            dr.donor_id,
            SUM(d.amount) as total_donated,
            fn_donor_segment_score(
                SUM(d.amount), 
                COUNT(d.donation_id), 
                DATEDIFF(CURDATE(), MAX(d.paid_at))
            ) as donor_score,
            CASE 
                WHEN COUNT(d.donation_id) >= 10 AND SUM(d.amount) >= 5000 THEN 'Champion'
                WHEN COUNT(d.donation_id) >= 5 AND SUM(d.amount) >= 2000 THEN 'Loyal'
                WHEN COUNT(d.donation_id) >= 3 AND SUM(d.amount) >= 1000 THEN 'Regular'
                WHEN COUNT(d.donation_id) >= 2 THEN 'Repeat'
                ELSE 'New'
            END as engagement_category
        FROM DONOR dr
        INNER JOIN DONATION d ON dr.donor_id = d.donor_id
        GROUP BY dr.donor_id
    ) segment_data
    GROUP BY engagement_category
    ORDER BY segment_total DESC;
    
END$$

-- Advanced trend analysis procedure
CREATE PROCEDURE sp_get_trend_analysis(
    IN p_period ENUM('daily', 'weekly', 'monthly'),
    IN p_months_back INT
)
BEGIN
    DECLARE v_start_date DATE;
    DECLARE v_date_format VARCHAR(20);
    DECLARE v_interval_type VARCHAR(10);
    
    -- Exception handling
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @sql_state = RETURNED_SQLSTATE,
            @error_message = MESSAGE_TEXT;
        
        SELECT 
            'error' as status,
            @sql_state as sql_state,
            @error_message as message,
            'sp_get_trend_analysis' as procedure_name;
    END;
    
    -- Validate and set parameters
    IF p_months_back IS NULL OR p_months_back <= 0 OR p_months_back > 24 THEN
        SET p_months_back = 6;
    END IF;
    
    IF p_period IS NULL THEN
        SET p_period = 'daily';
    END IF;
    
    SET v_start_date = DATE_SUB(CURDATE(), INTERVAL p_months_back MONTH);
    
    -- Set formatting based on period
    CASE p_period
        WHEN 'daily' THEN 
            SET v_date_format = '%Y-%m-%d';
            SET v_interval_type = 'DAY';
        WHEN 'weekly' THEN 
            SET v_date_format = '%Y-W%u';
            SET v_interval_type = 'WEEK';
        WHEN 'monthly' THEN 
            SET v_date_format = '%Y-%m';
            SET v_interval_type = 'MONTH';
        ELSE
            SET v_date_format = '%Y-%m-%d';
            SET v_interval_type = 'DAY';
    END CASE;
    
    SELECT 'success' as status, CONCAT('Trend analysis (', p_period, ') retrieved successfully') as message;
    
    -- Dynamic trend analysis query
    SET @sql = CONCAT('
        WITH trend_data AS (
            SELECT 
                DATE_FORMAT(d.paid_at, ''', v_date_format, ''') as period,
                MIN(DATE(d.paid_at)) as period_start,
                MAX(DATE(d.paid_at)) as period_end,
                COUNT(d.donation_id) as donation_count,
                COUNT(DISTINCT d.donor_id) as unique_donors,
                SUM(d.amount) as total_amount,
                AVG(d.amount) as avg_donation,
                COUNT(DISTINCT d.creation_id) as campaigns_count
            FROM DONATION d
            WHERE d.paid_at >= ''', v_start_date, '''
            GROUP BY DATE_FORMAT(d.paid_at, ''', v_date_format, ''')
        ),
        trend_with_growth AS (
            SELECT 
                *,
                LAG(total_amount, 1) OVER (ORDER BY period_start) as prev_period_amount,
                LAG(donation_count, 1) OVER (ORDER BY period_start) as prev_period_count,
                SUM(total_amount) OVER (ORDER BY period_start) as cumulative_amount,
                AVG(total_amount) OVER (ORDER BY period_start ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg
            FROM trend_data
        )
        SELECT 
            period,
            period_start,
            period_end,
            donation_count,
            unique_donors,
            total_amount,
            avg_donation,
            campaigns_count,
            cumulative_amount,
            moving_avg,
            fn_calculate_growth_rate(total_amount, prev_period_amount) as amount_growth_rate,
            fn_calculate_growth_rate(donation_count, prev_period_count) as count_growth_rate
        FROM trend_with_growth
        ORDER BY period_start'
    );
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
END$$

-- Cache refresh procedure for performance optimization
CREATE PROCEDURE sp_refresh_analytics_cache()
BEGIN
    DECLARE v_error_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @sql_state = RETURNED_SQLSTATE,
            @error_message = MESSAGE_TEXT;
        
        SELECT 
            'error' as status,
            @sql_state as sql_state,
            @error_message as message,
            'sp_refresh_analytics_cache' as procedure_name;
    END;
    
    -- Create or refresh materialized view alternatives (using tables for caching)
    DROP TABLE IF EXISTS cache_daily_donations;
    
    CREATE TABLE cache_daily_donations AS
    SELECT 
        DATE(d.paid_at) as donation_date,
        COUNT(d.donation_id) as daily_donations,
        SUM(d.amount) as daily_amount,
        COUNT(DISTINCT d.donor_id) as daily_unique_donors,
        AVG(d.amount) as daily_avg_donation
    FROM DONATION d
    WHERE d.paid_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
    GROUP BY DATE(d.paid_at)
    ORDER BY donation_date;
    
    -- Add index for performance
    ALTER TABLE cache_daily_donations ADD PRIMARY KEY (donation_date);
    
    SELECT 
        'success' as status,
        'Analytics cache refreshed successfully' as message,
        NOW() as refresh_timestamp;
        
END$$

DELIMITER ;