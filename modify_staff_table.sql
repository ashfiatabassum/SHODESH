
USE shodesh;

-- First check if the CV column has NOT NULL constraint
SHOW CREATE TABLE STAFF;

-- Modify the CV column to allow NULL values
ALTER TABLE STAFF MODIFY CV BLOB NULL;

-- Confirm the change
SHOW CREATE TABLE STAFF;

