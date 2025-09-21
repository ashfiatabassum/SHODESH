-- Step 10: Create status summary function
DELIMITER //
DROP FUNCTION IF EXISTS fn_get_verification_status_summary //
CREATE FUNCTION fn_get_verification_status_summary(
    p_creation_id VARCHAR(7)
) RETURNS VARCHAR(100)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE v_second_verification TINYINT;
    DECLARE v_result VARCHAR(100);
    
    SELECT verification_status, second_verification_required
    INTO v_status, v_second_verification
    FROM EVENT_CREATION 
    WHERE creation_id = p_creation_id;
    
    SET v_result = CASE 
        WHEN v_status = 'unverified' THEN 'Awaiting initial admin review'
        WHEN v_status = 'pending' AND v_second_verification = 1 THEN 'Pending staff verification'
        WHEN v_status = 'pending' AND v_second_verification = 0 THEN 'Pending final admin approval'
        WHEN v_status = 'verified' THEN 'Approved and active'
        WHEN v_status = 'rejected' THEN 'Rejected'
        ELSE 'Unknown status'
    END;
    
    RETURN v_result;
END //
DELIMITER ;