# Updated Event Verification Workflow

## Key Changes Made:

### 1. EVENT_CREATION Table Updates:
- **Added 'pending' status**: `verification_status ENUM('unverified','pending','verified','rejected')`
- Events requiring staff verification will have 'pending' status
- Only 'verified' events with 'active' lifecycle are shown to donors

### 2. EVENT_VERIFICATION Table Enhancements:
- **Two verification rounds**: Round 1 (admin), Round 2 (staff if requested)
- **Admin and Staff IDs**: Separate columns for admin_id and staff_id
- **Decision types**: 'verified', 'rejected', 'pending_staff'
- **Division targeting**: `requested_division` field for staff assignment

### 3. Conflict of Interest Prevention:
- **Function `fn_can_staff_verify_event()`**: Checks if staff assisted the individual
- **Prevents verification**: Staff who helped create individual profiles cannot verify their events
- **Database constraint**: Built into verification procedures

## New Workflow:

### Step 1: Admin Initial Verification
```sql
CALL sp_admin_verify_event(
    'ADM0001',              -- admin_id
    'EVT0001',              -- creation_id  
    'pending_staff',        -- decision (request staff verification)
    1,                      -- request_staff_verification = YES
    'Dhaka',               -- requested_division
    'Requires local staff verification for authenticity'  -- notes
);
```

### Step 2: Staff Verification (if requested)
```sql
CALL sp_staff_verify_event(
    'STF0001',              -- staff_id
    'EVT0001',              -- creation_id
    'verified',             -- decision
    'Verified through local investigation. Event is legitimate.'  -- notes
);
```

## Event Status Flow:

1. **Individual creates event** → `verification_status = 'unverified'`
2. **Admin reviews**:
   - **Direct approval** → `verification_status = 'verified'`, `lifecycle_status = 'active'` (shown to donors)
   - **Request staff verification** → `verification_status = 'pending'` (NOT shown to donors)
   - **Reject** → `verification_status = 'rejected'` (NOT shown to donors)
3. **Staff reviews** (only if requested):
   - **Staff approves** → `verification_status = 'verified'`, `lifecycle_status = 'active'` (shown to donors)
   - **Staff rejects** → `verification_status = 'rejected'` (NOT shown to donors)

## Key Business Rules:

### Foundation Events:
- **No staff verification required** (foundations are pre-verified entities)
- Admin can approve directly without staff involvement

### Individual Events:
- **Can request staff verification** from specific division
- **Conflict prevention**: Staff cannot verify individuals they assisted
- **Two-step approval** ensures authenticity for high-risk events

### Staff Assignment:
- Only verified staff from the event's division can be assigned
- System prevents staff who assisted individual registration from verifying their events
- View `v_available_staff_for_verification` shows eligible staff

## Views for Frontend:

### For Donors (Public):
- Only show events where `verification_status = 'verified' AND lifecycle_status = 'active'`

### For Admin Dashboard:
- Pending staff verification: `v_events_pending_staff_verification`
- All events with their verification history

### For Staff Dashboard:
- Events awaiting their division's verification
- Cannot see events from individuals they assisted

This system ensures authenticity while preventing conflicts of interest!