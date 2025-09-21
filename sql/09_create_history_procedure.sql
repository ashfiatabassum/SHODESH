-- Step 9: Create additional procedures
DELIMITER //
DROP PROCEDURE IF EXISTS sp_get_event_verification_history //
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