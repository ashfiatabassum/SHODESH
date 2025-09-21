-- Step 5: Create staff verification procedure
DELIMITER //
DROP PROCEDURE IF EXISTS sp_staff_verify_event //
CREATE PROCEDURE sp_staff_verify_event(
    IN p_staff_id VARCHAR(7),
    IN p_creation_id VARCHAR(7),
    IN p_decision ENUM('approved','rejected')
)
BEGIN
    DECLARE v_log_id VARCHAR(7);
    DECLARE v_can_verify BOOLEAN;
    DECLARE v_staff_division VARCHAR(30);
    DECLARE v_event_division VARCHAR(30);
    DECLARE v_creator_type ENUM('individual','foundation');
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Check if event is created by individual (staff verification only for individuals)
    SELECT creator_type INTO v_creator_type
    FROM EVENT_CREATION WHERE creation_id = p_creation_id;
    
    IF v_creator_type != 'individual' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Staff verification is only applicable for individual-created events';
    END IF;
    
    SET v_can_verify = fn_can_staff_verify_event(p_staff_id, p_creation_id);
    
    IF NOT v_can_verify THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Staff cannot verify events for individuals they assisted';
    END IF;
    
    SELECT s.administrative_div, ec.division 
    INTO v_staff_division, v_event_division
    FROM STAFF s, EVENT_CREATION ec
    WHERE s.staff_id = p_staff_id AND ec.creation_id = p_creation_id;
    
    IF v_staff_division != v_event_division THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Staff can only verify events from their own division';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM EVENT_CREATION 
                   WHERE creation_id = p_creation_id 
                   AND verification_status = 'pending' 
                   AND second_verification_required = 1) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Event is not pending staff verification';
    END IF;
    
    SELECT CONCAT('VL', LPAD((COUNT(*) + 1), 5, '0')) INTO v_log_id
    FROM EVENT_VERIFICATION;
    
    INSERT INTO EVENT_VERIFICATION (
        log_id, creation_id, round_no, staff_id, decision
    ) VALUES (
        v_log_id, p_creation_id, 2, p_staff_id, p_decision
    );
    
    CASE p_decision
        WHEN 'approved' THEN
            UPDATE EVENT_CREATION 
            SET verification_status = 'pending',
                second_verification_required = 0
            WHERE creation_id = p_creation_id;
            
        WHEN 'rejected' THEN
            UPDATE EVENT_CREATION 
            SET verification_status = 'rejected',
                lifecycle_status = 'inactive'
            WHERE creation_id = p_creation_id;
    END CASE;
    
    COMMIT;
END //
DELIMITER ;