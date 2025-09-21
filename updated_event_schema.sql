-- UPDATED EVENT_CREATION TABLE
-- Added 'pending' status for events awaiting staff verification
ALTER TABLE EVENT_CREATION MODIFY COLUMN verification_status 
  ENUM('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified';

-- UPDATED EVENT_VERIFICATION TABLE  
-- Enhanced to support admin-to-staff verification workflow (no admin table needed)
DROP TABLE IF EXISTS EVENT_VERIFICATION;
CREATE TABLE EVENT_VERIFICATION (
  log_id       VARCHAR(7)  NOT NULL,
  creation_id  VARCHAR(7)  NOT NULL,

  -- 1 = admin verification, 2 = staff verification, 3 = admin final verification
  round_no     TINYINT NOT NULL,

  -- who performed this verification round (only staff_id used, admins are invisible)
  staff_id     VARCHAR(7) NULL,  -- NULL for admin rounds, populated for staff rounds

  decision     ENUM('approved','rejected','request_staff_verification') NOT NULL,

  -- staff verification only: which division staff should handle it
  target_division VARCHAR(30) NULL,

  verified_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT EVENT_VERIFICATION_PK PRIMARY KEY (log_id),

  CONSTRAINT EV_EVENT_FK FOREIGN KEY (creation_id) REFERENCES EVENT_CREATION(creation_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT EV_STAFF_FK FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  INDEX EV_EVENT_IDX      (creation_id, round_no, verified_at),
  INDEX EV_STAFF_IDX      (staff_id, verified_at),
  INDEX EV_DIVISION_IDX   (target_division, decision)
);

-- VIEW: Get events pending staff verification for a specific division
CREATE VIEW v_events_pending_staff_verification AS
SELECT 
    ec.creation_id,
    ec.title,
    ec.description,
    ec.amount_needed,
    ec.division,
    ec.creator_type,
    CASE 
        WHEN ec.creator_type = 'individual' THEN CONCAT(i.first_name, ' ', i.last_name)
        ELSE f.name
    END as creator_name,
    ec.created_at,
    ev.target_division,
    ev.verified_at as admin_decision_at
FROM EVENT_CREATION ec
JOIN EVENT_VERIFICATION ev ON ec.creation_id = ev.creation_id
LEFT JOIN INDIVIDUAL i ON ec.individual_id = i.individual_id
LEFT JOIN FOUNDATION f ON ec.foundation_id = f.foundation_id
WHERE ec.verification_status = 'pending' 
  AND ec.second_verification_required = 1
  AND ev.round_no = 1 
  AND ev.decision = 'request_staff_verification';

-- VIEW: Get events pending admin final verification (after staff approval)  
CREATE VIEW v_events_pending_admin_final AS
SELECT 
    ec.creation_id,
    ec.title,
    ec.description,
    ec.amount_needed,
    ec.division,
    ec.creator_type,
    CASE 
        WHEN ec.creator_type = 'individual' THEN CONCAT(i.first_name, ' ', i.last_name)
        ELSE f.name
    END as creator_name,
    ec.created_at,
    s.first_name as staff_first_name,
    s.last_name as staff_last_name,
    ev.verified_at as staff_approval_at
FROM EVENT_CREATION ec
JOIN EVENT_VERIFICATION ev ON ec.creation_id = ev.creation_id
LEFT JOIN INDIVIDUAL i ON ec.individual_id = i.individual_id
LEFT JOIN FOUNDATION f ON ec.foundation_id = f.foundation_id
LEFT JOIN STAFF s ON ev.staff_id = s.staff_id
WHERE ec.verification_status = 'pending' 
  AND ec.second_verification_required = 0
  AND ev.round_no = 2
  AND ev.decision = 'approved';

-- FUNCTION: Check if staff can verify an event (prevent conflicts of interest)
DELIMITER //
CREATE FUNCTION fn_can_staff_verify_event(
    p_staff_id VARCHAR(7),
    p_creation_id VARCHAR(7)
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_individual_id VARCHAR(7);
    DECLARE v_assisted_count INT DEFAULT 0;
    
    -- Get the individual_id for this event (if it's individual-created)
    SELECT individual_id INTO v_individual_id
    FROM EVENT_CREATION 
    WHERE creation_id = p_creation_id AND creator_type = 'individual';
    
    -- If this is not an individual event, staff can verify
    IF v_individual_id IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Check if this staff assisted in creating this individual's profile
    SELECT COUNT(*) INTO v_assisted_count
    FROM STAFF_ASSIST 
    WHERE staff_id = p_staff_id AND individual_id = v_individual_id;
    
    -- If staff assisted this individual, they cannot verify their events
    RETURN v_assisted_count = 0;
END //
DELIMITER ;

-- PROCEDURE: Admin initiates event verification
DELIMITER //
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

    START TRANSACTION;
    
    -- Get event details
    SELECT creator_type, division INTO v_creator_type, v_event_division
    FROM EVENT_CREATION WHERE creation_id = p_creation_id;
    
    -- Check if this is a final admin decision (after staff approval)
    IF EXISTS (SELECT 1 FROM EVENT_VERIFICATION 
               WHERE creation_id = p_creation_id AND round_no = 2 AND decision = 'approved') THEN
        SET v_round_no = 3; -- Final admin verification
    END IF;
    
    -- Generate verification log ID
    SELECT CONCAT('VL', LPAD((COUNT(*) + 1), 5, '0')) INTO v_log_id
    FROM EVENT_VERIFICATION;
    
    -- Insert verification record (staff_id is NULL for admin actions)
    INSERT INTO EVENT_VERIFICATION (
        log_id, creation_id, round_no, staff_id, decision, target_division
    ) VALUES (
        v_log_id, p_creation_id, v_round_no, NULL, p_decision,
        CASE 
            WHEN p_decision = 'request_staff_verification' THEN v_event_division
            ELSE NULL 
        END
    );
    
    -- Update event status based on admin decision and round
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
            -- Only allow for individual events
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

-- PROCEDURE: Staff verification of events
DELIMITER //
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
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Validate staff can verify this event (conflict of interest check)
    SET v_can_verify = fn_can_staff_verify_event(p_staff_id, p_creation_id);
    
    IF NOT v_can_verify THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Staff cannot verify events for individuals they assisted';
    END IF;
    
    -- Validate staff is from the same division as the event
    SELECT s.administrative_div, ec.division 
    INTO v_staff_division, v_event_division
    FROM STAFF s, EVENT_CREATION ec
    WHERE s.staff_id = p_staff_id AND ec.creation_id = p_creation_id;
    
    IF v_staff_division != v_event_division THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Staff can only verify events from their own division';
    END IF;
    
    -- Validate event is pending staff verification
    IF NOT EXISTS (SELECT 1 FROM EVENT_CREATION 
                   WHERE creation_id = p_creation_id 
                   AND verification_status = 'pending' 
                   AND second_verification_required = 1) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Event is not pending staff verification';
    END IF;
    
    -- Generate verification log ID  
    SELECT CONCAT('VL', LPAD((COUNT(*) + 1), 5, '0')) INTO v_log_id
    FROM EVENT_VERIFICATION;
    
    -- Insert staff verification record
    INSERT INTO EVENT_VERIFICATION (
        log_id, creation_id, round_no, staff_id, decision
    ) VALUES (
        v_log_id, p_creation_id, 2, p_staff_id, p_decision
    );
    
    -- Update event status based on staff decision
    CASE p_decision
        WHEN 'approved' THEN
            -- Staff approved: now pending admin final decision
            UPDATE EVENT_CREATION 
            SET verification_status = 'pending',
                second_verification_required = 0
            WHERE creation_id = p_creation_id;
            
        WHEN 'rejected' THEN
            -- Staff rejected: event is rejected (second_verification_required stays 1)
            UPDATE EVENT_CREATION 
            SET verification_status = 'rejected',
                lifecycle_status = 'inactive'
            WHERE creation_id = p_creation_id;
    END CASE;
    
    COMMIT;
END //
DELIMITER ;

-- VIEW: Get available staff for event verification (excluding those with conflicts)
CREATE VIEW v_available_staff_for_verification AS
SELECT DISTINCT
    s.staff_id,
    s.first_name,
    s.last_name,
    s.username,
    s.administrative_div as division,
    ec.creation_id,
    ec.title as event_title,
    ec.division as event_division
FROM STAFF s
CROSS JOIN EVENT_CREATION ec
WHERE s.status = 'verified'
  AND ec.verification_status = 'pending'
  AND ec.second_verification_required = 1
  AND ec.creator_type = 'individual'
  AND s.administrative_div = ec.division  -- Same division requirement
  AND fn_can_staff_verify_event(s.staff_id, ec.creation_id) = TRUE;

-- TRIGGER: Prevent direct updates to second_verification_required (must use procedures)
DELIMITER //
CREATE TRIGGER tr_prevent_manual_verification_update
BEFORE UPDATE ON EVENT_CREATION
FOR EACH ROW
BEGIN
    -- Allow updates only if coming from our stored procedures
    -- This is a basic check - in production you might want more sophisticated validation
    IF NEW.second_verification_required != OLD.second_verification_required 
       AND @disable_trigger IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Verification status must be updated through stored procedures only';
    END IF;
END //
DELIMITER ;

-- PROCEDURE: Get verification history for an event
DELIMITER //
CREATE PROCEDURE sp_get_event_verification_history(
    IN p_creation_id VARCHAR(7)
)
BEGIN
    SELECT 
        ev.log_id,
        ev.round_no,
        CASE 
            WHEN ev.staff_id IS NULL THEN 'Admin'
            ELSE CONCAT(s.first_name, ' ', s.last_name, ' (Staff)')
        END as verifier,
        ev.decision,
        ev.verified_at,
        CASE ev.round_no
            WHEN 1 THEN 'Initial Admin Review'
            WHEN 2 THEN 'Staff Review'
            WHEN 3 THEN 'Final Admin Review'
            ELSE 'Unknown'
        END as verification_stage
    FROM EVENT_VERIFICATION ev
    LEFT JOIN STAFF s ON ev.staff_id = s.staff_id
    WHERE ev.creation_id = p_creation_id
    ORDER BY ev.round_no, ev.verified_at;
END //
DELIMITER ;

-- FUNCTION: Get event verification status summary
DELIMITER //
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