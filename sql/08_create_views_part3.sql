-- Step 8: Create view for available staff
DROP VIEW IF EXISTS v_available_staff_for_verification;
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
  AND (s.administrative_div = ec.division OR s.administrative_div = CONCAT(ec.division, ' Division'))
  AND fn_can_staff_verify_event(s.staff_id, ec.creation_id) = TRUE;