-- Stored procedure and triggers to support admin event verification

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_admin_verify_event $$
CREATE PROCEDURE sp_admin_verify_event(
    IN p_creation_id VARCHAR(7),
    IN p_decision ENUM('verified','unverified','rejected'),
    IN p_notes VARCHAR(1000),
    IN p_staff_id VARCHAR(7)
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    DECLARE v_round TINYINT DEFAULT 1;

    -- Validate event exists
    SELECT COUNT(*) INTO v_exists FROM EVENT_CREATION WHERE creation_id = p_creation_id;
    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Event not found';
    END IF;

    -- Determine round number (latest + 1 or 1 if none)
    SELECT IFNULL(MAX(round_no), 0) + 1 INTO v_round FROM EVENT_VERIFICATION WHERE creation_id = p_creation_id;

    INSERT INTO EVENT_VERIFICATION(log_id, creation_id, round_no, staff_id, decision, request_staff_verification, notes, verified_at)
    VALUES(CONCAT('EV', RIGHT(HEX(UNIX_TIMESTAMP(NOW())), 5)), p_creation_id, v_round, p_staff_id, p_decision, 0, p_notes, NOW());

    -- Apply to EVENT_CREATION (in case trigger missing)
    -- Update both verification_status and lifecycle_status based on decision
    CASE p_decision
        WHEN 'verified' THEN
            UPDATE EVENT_CREATION SET 
                verification_status = 'verified', 
                lifecycle_status = 'active',
                updated_at = NOW()
            WHERE creation_id = p_creation_id;
        WHEN 'rejected' THEN
            UPDATE EVENT_CREATION SET 
                verification_status = 'rejected', 
                lifecycle_status = 'inactive',
                updated_at = NOW()
            WHERE creation_id = p_creation_id;
        ELSE
            -- unverified or any other case
            UPDATE EVENT_CREATION SET 
                verification_status = 'unverified', 
                lifecycle_status = 'inactive',
                updated_at = NOW()
            WHERE creation_id = p_creation_id;
    END CASE;
END $$

DROP TRIGGER IF EXISTS BI_EVENT_VERIFICATION_ENFORCE $$
CREATE TRIGGER BI_EVENT_VERIFICATION_ENFORCE BEFORE INSERT ON EVENT_VERIFICATION
FOR EACH ROW
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    IF NEW.decision NOT IN ('verified','unverified','rejected') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid decision';
    END IF;
    SELECT COUNT(*) INTO v_exists FROM EVENT_CREATION WHERE creation_id = NEW.creation_id;
    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Referenced event missing';
    END IF;
END $$

DROP TRIGGER IF EXISTS AI_EVENT_VERIFICATION_APPLY $$
CREATE TRIGGER AI_EVENT_VERIFICATION_APPLY AFTER INSERT ON EVENT_VERIFICATION
FOR EACH ROW
BEGIN
    -- Update both verification_status and lifecycle_status based on decision
    CASE NEW.decision
        WHEN 'verified' THEN
            UPDATE EVENT_CREATION SET 
                verification_status = 'verified', 
                lifecycle_status = 'active',
                updated_at = NOW()
            WHERE creation_id = NEW.creation_id;
        WHEN 'rejected' THEN
            UPDATE EVENT_CREATION SET 
                verification_status = 'rejected', 
                lifecycle_status = 'inactive',
                updated_at = NOW()
            WHERE creation_id = NEW.creation_id;
        ELSE
            -- unverified or any other case
            UPDATE EVENT_CREATION SET 
                verification_status = 'unverified', 
                lifecycle_status = 'inactive',
                updated_at = NOW()
            WHERE creation_id = NEW.creation_id;
    END CASE;
END $$

DELIMITER ;
