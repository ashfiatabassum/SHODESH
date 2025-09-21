-- Step 6: Create views for staff verification
DROP VIEW IF EXISTS v_events_pending_staff_verification;
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
        ELSE f.foundation_name
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