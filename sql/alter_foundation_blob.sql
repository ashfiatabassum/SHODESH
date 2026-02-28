-- Alter FOUNDATION table to increase certificate column size
-- This allows storing larger files (PDFs, images, etc.)

ALTER TABLE FOUNDATION MODIFY COLUMN certificate LONGBLOB;

-- Similarly for STAFF table CV column
ALTER TABLE STAFF MODIFY COLUMN CV LONGBLOB;

-- Verify the changes
DESCRIBE FOUNDATION;
DESCRIBE STAFF;
