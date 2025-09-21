# Complete Event Verification System Logic

## **Database Objects Created:**

### **Tables:**
- **EVENT_VERIFICATION** - Tracks all verification rounds (admin invisible, only staff_id stored)

### **Views:**
- **v_events_pending_staff_verification** - Events waiting for staff review
- **v_events_pending_admin_final** - Events waiting for final admin approval after staff approval  
- **v_available_staff_for_verification** - Eligible staff for each event (same division, no conflicts)

### **Procedures:**
- **sp_admin_verify_event()** - Admin makes verification decisions
- **sp_staff_verify_event()** - Staff verifies events with validation
- **sp_get_event_verification_history()** - Get complete verification audit trail

### **Functions:**
- **fn_can_staff_verify_event()** - Prevents conflict of interest (staff can't verify individuals they assisted)
- **fn_get_verification_status_summary()** - Human-readable status description

### **Triggers:**
- **tr_prevent_manual_verification_update** - Forces use of procedures for verification updates

---

## **Complete Workflow:**

### **Step 1: Admin Initial Review**
```sql
-- Admin approves directly
CALL sp_admin_verify_event('EVT0001', 'approved');
-- Result: verification_status='verified', lifecycle_status='active', second_verification_required=0

-- Admin rejects
CALL sp_admin_verify_event('EVT0001', 'rejected'); 
-- Result: verification_status='rejected', lifecycle_status='inactive', second_verification_required=0

-- Admin requests staff verification (only for individual events)
CALL sp_admin_verify_event('EVT0001', 'request_staff_verification');
-- Result: verification_status='pending', second_verification_required=1
```

### **Step 2: Staff Review (if requested)**
```sql
-- Staff approves
CALL sp_staff_verify_event('STF0001', 'EVT0001', 'approved');
-- Result: verification_status='pending', second_verification_required=0

-- Staff rejects  
CALL sp_staff_verify_event('STF0001', 'EVT0001', 'rejected');
-- Result: verification_status='rejected', lifecycle_status='inactive', second_verification_required=1
```

### **Step 3: Admin Final Review (after staff approval)**
```sql
-- Admin final approval
CALL sp_admin_verify_event('EVT0001', 'approved');
-- Result: verification_status='verified', lifecycle_status='active', second_verification_required=0

-- Admin final rejection
CALL sp_admin_verify_event('EVT0001', 'rejected');
-- Result: verification_status='rejected', lifecycle_status='inactive', second_verification_required=0
```

---

## **Frontend Filtering Logic:**

### **For Admin Dashboard:**
```sql
-- Events needing initial review
SELECT * FROM EVENT_CREATION WHERE verification_status = 'unverified';

-- Events pending staff verification (admin requested)
SELECT * FROM v_events_pending_staff_verification;

-- Events pending final admin approval (after staff approval)
SELECT * FROM v_events_pending_admin_final;
```

### **For Staff Dashboard:**
```sql
-- Events pending staff verification for specific division
SELECT * FROM v_events_pending_staff_verification WHERE target_division = 'Dhaka';

-- Available staff for specific event (excluding conflicts)
SELECT * FROM v_available_staff_for_verification WHERE creation_id = 'EVT0001';
```

### **For Public (Donors):**
```sql
-- Only show fully approved and active events
SELECT * FROM EVENT_CREATION 
WHERE verification_status = 'verified' AND lifecycle_status = 'active';
```

---

## **Key Business Rules Enforced:**

1. **Division Matching**: Staff can only verify events from their own division
2. **Conflict Prevention**: Staff cannot verify events for individuals they assisted in registering
3. **Individual Only**: Staff verification only requested for individual-created events (not foundations)
4. **Sequential Process**: Must follow admin → staff → admin final sequence
5. **Procedure-Only Updates**: Direct database updates to verification fields blocked by triggers

---

## **Exception Handling:**

- **Invalid Division**: "Staff can only verify events from their own division"  
- **Conflict of Interest**: "Staff cannot verify events for individuals they assisted"
- **Wrong Event Type**: "Staff verification only allowed for individual events"
- **Invalid State**: "Event is not pending staff verification"
- **Manual Updates**: "Verification status must be updated through stored procedures only"

---

## **Audit Trail:**

Every verification action is logged in EVENT_VERIFICATION with:
- **Round 1**: Admin initial decision (staff_id = NULL)
- **Round 2**: Staff decision (staff_id populated)  
- **Round 3**: Admin final decision (staff_id = NULL)

Use `sp_get_event_verification_history('EVT0001')` to see complete timeline.

---

## **Status Summary Function:**
```sql
SELECT fn_get_verification_status_summary('EVT0001');
-- Returns: "Pending staff verification" or "Pending final admin approval" etc.
```

This system is now complete with proper logic, error handling, and audit trails!