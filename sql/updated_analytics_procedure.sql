DELIMITER //

CREATE PROCEDURE sp_get_donation_analytics(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_include_trends TINYINT
)
BEGIN
    -- Exception handler
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

    -- Validate parameters
    IF p_include_trends IS NULL THEN
        SET p_include_trends = 1;
    END IF;

    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start date and end date are required';
    END IF;

    IF p_start_date > p_end_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start date cannot be greater than end date';
    END IF;

    IF p_end_date > CURDATE() THEN
        SET p_end_date = CURDATE();
    END IF;

    -- Result Set 1: Status
    SELECT
        'success' as status,
        'Analytics data retrieved successfully' as message;
    
    -- Result Set 2: Enhanced KPIs with active campaigns and repeat donors
    SELECT
        COUNT(d.donation_id) as total_donations,
        COUNT(DISTINCT d.donor_id) as unique_donors,
        SUM(d.amount) as total_amount,
        AVG(d.amount) as average_donation,
        MIN(d.amount) as min_donation,
        MAX(d.amount) as max_donation,
        STD(d.amount) as donation_std_dev,
        COUNT(DISTINCT d.creation_id) as campaigns_supported,
        COUNT(DISTINCT DATE(d.paid_at)) as active_days,
        -- New metrics
        COUNT(DISTINCT d.creation_id) as active_campaigns,
        (SELECT COUNT(*) FROM (
            SELECT donor_id FROM DONATION 
            WHERE DATE(paid_at) BETWEEN p_start_date AND p_end_date 
            GROUP BY donor_id HAVING COUNT(*) > 1
        ) as repeat_query) as repeat_donors
    FROM DONATION d
    WHERE DATE(d.paid_at) BETWEEN p_start_date AND p_end_date;

    -- Result Set 3: Daily trends (if requested)
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
            SUM(COALESCE(SUM(d.amount), 0)) OVER (ORDER BY ds.date_val) as cumulative_amount,
            AVG(COALESCE(SUM(d.amount), 0)) OVER (
                ORDER BY ds.date_val
                ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
            ) as moving_avg_7day
        FROM date_series ds
        LEFT JOIN DONATION d ON DATE(d.paid_at) = ds.date_val
        GROUP BY ds.date_val
        ORDER BY ds.date_val;
    END IF;

    -- Result Set 4: Geographic data
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
END//

DELIMITER ;