-- Step 4: Create admin verification procedure
DELIMITER //
DROP PROCEDURE IF EXISTS sp_admin_verify_event //
CREATE PROCEDURE sp_admin_verify_event(
    IN p_creation_id VARCHAR(7),
    IN p_decision ENUM('approved','rejected','request_staff_verification')
)
BEGIN
    DECLARE v_log_id VARCHAR(7);
    DECLARE v_creator_type ENUM('individual','foundation');
    DECLARE v_event_division VARCHAR(30);
    DECLARE v_round_no TINYINT DEFAULT 1;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Validate decision
    IF p_decision NOT IN ('approved', 'rejected', 'request_staff_verification') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid decision';
    END IF;

    START TRANSACTION;

    SELECT creator_type, division INTO v_creator_type, v_event_division
    FROM EVENT_CREATION WHERE creation_id = p_creation_id;

    IF EXISTS (SELECT 1 FROM EVENT_VERIFICATION 
               WHERE creation_id = p_creation_id AND round_no = 2 AND decision = 'approved') THEN
        SET v_round_no = 3;
    END IF;

    -- Use MAX to avoid duplicate log_id
    SELECT CONCAT('VL', LPAD(IFNULL(MAX(CAST(SUBSTRING(log_id, 3) AS UNSIGNED)), 0) + 1, 5, '0')) INTO v_log_id
    FROM EVENT_VERIFICATION;

    INSERT INTO EVENT_VERIFICATION (
        log_id, creation_id, round_no, staff_id, decision, target_division
    ) VALUES (
        v_log_id, p_creation_id, v_round_no, NULL, p_decision,
        CASE 
            WHEN p_decision = 'request_staff_verification' THEN v_event_division
            ELSE NULL 
        END
    );

    CASE p_decision
        WHEN 'approved' THEN
            UPDATE EVENT_CREATION 
            SET verification_status = 'verified',
                lifecycle_status = 'active',
                second_verification_required = 0
            WHERE creation_id = p_creation_id;

        WHEN 'rejected' THEN
            UPDATE EVENT_CREATION 
            SET verification_status = 'rejected',
                lifecycle_status = 'inactive',
                second_verification_required = 0
            WHERE creation_id = p_creation_id;

        WHEN 'request_staff_verification' THEN
            IF v_creator_type = 'individual' THEN
                UPDATE EVENT_CREATION 
                SET verification_status = 'pending',
                    second_verification_required = 1
                WHERE creation_id = p_creation_id;
            ELSE
                SIGNAL SQLSTATE '45000' 
                SET MESSAGE_TEXT = 'Staff verification only allowed for individual events';
            END IF;
    END CASE;

    COMMIT;
END //
DELIMITER ;