-- Step 3: Create function to check staff verification conflicts
DELIMITER //
DROP FUNCTION IF EXISTS fn_can_staff_verify_event //
CREATE FUNCTION fn_can_staff_verify_event(
    p_staff_id VARCHAR(7),
    p_creation_id VARCHAR(7)
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_individual_id VARCHAR(7);
    DECLARE v_assisted_count INT DEFAULT 0;
    
    SELECT individual_id INTO v_individual_id
    FROM EVENT_CREATION 
    WHERE creation_id = p_creation_id AND creator_type = 'individual';
    
    IF v_individual_id IS NULL THEN
        RETURN TRUE;
    END IF;
    
    SELECT COUNT(*) INTO v_assisted_count
    FROM STAFF_ASSIST 
    WHERE staff_id = p_staff_id AND individual_id = v_individual_id;
    
    RETURN v_assisted_count = 0;
END //
DELIMITER ;