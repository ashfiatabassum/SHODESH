-- Step 7: Create view for admin final verification
DROP VIEW IF EXISTS v_events_pending_admin_final;
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
        ELSE f.foundation_name
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