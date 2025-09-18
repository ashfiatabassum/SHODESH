USE shodesh;

-- Add the cv_filename column to store the original filename
ALTER TABLE STAFF ADD COLUMN cv_filename VARCHAR(255) NULL AFTER CV;

-- Confirm the change
SHOW CREATE TABLE STAFF;
