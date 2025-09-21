-- Step 1: Update EVENT_CREATION table to add pending status
ALTER TABLE EVENT_CREATION MODIFY COLUMN verification_status 
  ENUM('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified';