-- Script to update FOUNDATION table structure
-- 1. Change goal_vision column to description
-- 2. Add suspended to status enum

USE shodesh;

-- Step 1: Add new description column
ALTER TABLE FOUNDATION ADD COLUMN description TEXT AFTER bank_account;

-- Step 2: Copy data from goal_vision to description
UPDATE FOUNDATION SET description = goal_vision;

-- Step 3: Drop the old goal_vision column
ALTER TABLE FOUNDATION DROP COLUMN goal_vision;

-- Step 4: Modify status enum to include suspended
ALTER TABLE FOUNDATION MODIFY COLUMN status ENUM('verified', 'unverified', 'suspended') DEFAULT 'unverified';

-- Display updated table structure
DESCRIBE FOUNDATION;

-- Show current data
SELECT foundation_id, foundation_name, description, status FROM FOUNDATION;

SELECT 'Foundation table updated successfully!' as status;
