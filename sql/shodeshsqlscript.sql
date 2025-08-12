CREATE DATABASE shodesh;
USE shodesh;

CREATE TABLE donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL
);

SELECT DATABASE();

SELECT * FROM donations;

CREATE TABLE INDIVIDUAL (
  individual_id VARCHAR(7) NOT NULL,
  first_name VARCHAR(30) NOT NULL CHECK (first_name REGEXP '^[A-Za-z ]+$'),
  last_name VARCHAR(30) NOT NULL CHECK (last_name REGEXP '^[A-Za-z ]+$'),
  username VARCHAR(15) NOT NULL,
  email VARCHAR(100) NOT NULL CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'),
  password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
  mobile VARCHAR(11) NOT NULL CHECK (mobile REGEXP '^0[0-9]{10}$'),
  nid VARCHAR(17) NOT NULL CHECK (nid REGEXP '^[0-9]{10,17}$'),
  dob DATE,
  house_no VARCHAR(7),
  road_no VARCHAR(4) CHECK (road_no REGEXP '^[0-9]{1,4}$'),
  area VARCHAR(30) CHECK (area REGEXP '^[A-Za-z ]+$'),
  district VARCHAR(30) CHECK (district REGEXP '^[A-Za-z ]+$'),
  administrative_div VARCHAR(30) CHECK (administrative_div REGEXP '^[A-Za-z ]+$'),
  zip VARCHAR(4) CHECK (zip REGEXP '^[0-9]{4}$'),
  bkash VARCHAR(11) CHECK (bkash REGEXP '^0[0-9]{10}$'),
  bank_account VARCHAR(18),
  CONSTRAINT INDIVIDUAL_INDIVIDUAL_ID_PK PRIMARY KEY (individual_id),
  CONSTRAINT INDIVIDUAL_NID_U UNIQUE (nid),
  CONSTRAINT INDIVIDUAL_USERNAME_U UNIQUE (username),
  CONSTRAINT INDIVIDUAL_EMAIL_U UNIQUE (email),
  CONSTRAINT INDIVIDUAL_MOBILE_U UNIQUE (mobile)
);
SELECT * FROM INDIVIDUAL;
CREATE TABLE FOUNDATION(
  foundation_id VARCHAR(7) NOT NULL,
  foundation_name VARCHAR(50) NOT NULL,
  certificate BLOB,
  foundation_license VARCHAR(12) NOT NULL,
  mobile VARCHAR(11) NOT NULL CHECK (mobile REGEXP '^0[0-9]{10}$'),
  email VARCHAR(100) NOT NULL CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'),
  password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
  house_no VARCHAR(7),
  road_no VARCHAR(4) CHECK (road_no REGEXP '^[0-9]{1,4}$'),
  area VARCHAR(30) CHECK (area REGEXP '^[A-Za-z ]+$'),
  district VARCHAR(30) CHECK (district REGEXP '^[A-Za-z ]+$'),
  administrative_div VARCHAR(30) CHECK (administrative_div REGEXP '^[A-Za-z ]+$'),
  zip VARCHAR(4) CHECK (zip REGEXP '^[0-9]{4}$'),
  bkash VARCHAR(11) CHECK (bkash REGEXP '^0[0-9]{10}$'),
  bank_account VARCHAR(18),
  goal_vision TEXT,
  status ENUM('verified', 'unverified') DEFAULT 'unverified',
  CONSTRAINT FOUNDATION_FOUNDATION_ID_PK PRIMARY KEY (foundation_id),
  CONSTRAINT FOUNDATION_FOUNDATION_LICENSE_U UNIQUE (foundation_license),
  CONSTRAINT FOUNDATION_EMAIL_U UNIQUE (email),
  CONSTRAINT FOUNDATION_MOBILE_U UNIQUE (mobile)
); 
SELECT * FROM foundation;
CREATE TABLE STAFF(
  staff_id VARCHAR(7) NOT NULL,
  first_name VARCHAR(30) NOT NULL CHECK (first_name REGEXP '^[A-Za-z ]+$'),
  last_name VARCHAR(30) NOT NULL CHECK (last_name REGEXP '^[A-Za-z ]+$'),
  username VARCHAR(15) NOT NULL,
  password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
  mobile VARCHAR(11) NOT NULL CHECK (mobile REGEXP '^0[0-9]{10}$'),
  email VARCHAR(100) CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'),
  nid VARCHAR(17) NOT NULL CHECK (nid REGEXP '^[0-9]{10,17}$'),
  dob DATE,
  house_no VARCHAR(7),
  road_no VARCHAR(4) CHECK (road_no REGEXP '^[0-9]{1,4}$'),
  area VARCHAR(30) CHECK (area REGEXP '^[A-Za-z ]+$'),
  district VARCHAR(30) CHECK (district REGEXP '^[A-Za-z ]+$'),
  administrative_div VARCHAR(30) CHECK (administrative_div REGEXP '^[A-Za-z ]+$'),
  zip VARCHAR(4) CHECK (zip REGEXP '^[0-9]{4}$'),
  CV BLOB NULL,
  status ENUM('verified', 'unverified') DEFAULT 'unverified',
  CONSTRAINT STAFF_STAFF_ID_PK PRIMARY KEY (staff_id),
  CONSTRAINT STAFF_NID_U UNIQUE (nid)
);

CREATE TABLE STAFF_ASSIST(
  staff_assist_id VARCHAR(7) NOT NULL,
  staff_id VARCHAR(7) NOT NULL,
  individual_id VARCHAR(7) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  CONSTRAINT STAFF_ASSIST_STAFF_ASSIST_ID_PK PRIMARY KEY (staff_assist_id),
  CONSTRAINT STAFF_ASSIST_STAFF_ID_FK FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id) ON DELETE CASCADE,
  CONSTRAINT STAFF_ASSIST_INDIVIDUAL_ID_FK FOREIGN KEY (individual_id) REFERENCES INDIVIDUAL(individual_id)
);
CREATE TABLE CATEGORY(
  category_id VARCHAR(7) NOT NULL,
  category_type VARCHAR(30) NOT NULL,
  CONSTRAINT CATEGORY_CATEGORY_ID_PK PRIMARY KEY (category_id)
);

CREATE TABLE event(
  event_id VARCHAR(7) NOT NULL,
  event_type VARCHAR(30) NOT NULL,
  CONSTRAINT EVENT_EVENT_ID_PK PRIMARY KEY (event_id),
  CONSTRAINT EVENT_EVENT_TYPE_U UNIQUE (event_type)
);

CREATE TABLE event_based_category(
  category VARCHAR(7) NOT NULL,
  event_id VARCHAR(7) NOT NULL,
  category_id VARCHAR(7) NOT NULL,
  CONSTRAINT EVENT_BASED_CATEGORY_CATEGORY_ID_FK FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id),
  CONSTRAINT EVENT_BASED_CATEGORY_EVENT_ID_FK FOREIGN KEY (event_id) REFERENCES event(event_id),
  CONSTRAINT EVENT_BASED_CATEGORY_CATEGORY_PK PRIMARY KEY (category)
);

CREATE TABLE DONOR(
  donor_id VARCHAR(7) NOT NULL,
  first_name VARCHAR(30) NOT NULL CHECK (first_name REGEXP '^[A-Za-z ]+$'),
  last_name VARCHAR(30) NOT NULL CHECK (last_name REGEXP '^[A-Za-z ]+$'),
  username VARCHAR(15) NOT NULL,
  password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
  mobile VARCHAR(11) NOT NULL CHECK (mobile REGEXP '^0[0-9]{10}$'),
  email VARCHAR(100) NOT NULL CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'),
  country VARCHAR(30) NOT NULL CHECK (country REGEXP '^[A-Za-z ]+$'),
  division VARCHAR(30) CHECK (division IN ('Barisal', 'Chittagong', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet')),
  DOB DATE NOT NULL,
  CONSTRAINT DONOR_DONOR_ID_PK PRIMARY KEY (donor_id),
  CONSTRAINT DONOR_USERNAME_U UNIQUE (username),
  CONSTRAINT DONOR_EMAIL_U UNIQUE (email),
  CONSTRAINT DONOR_MOBILE_U UNIQUE (mobile),
  CONSTRAINT DONOR_DIVISION_CHECK CHECK (
    (country = 'Bangladesh' AND division IS NOT NULL) OR 
    (country != 'Bangladesh' AND division IS NULL)
  )
);
SELECT * FROM DONOR;
CREATE TABLE EVENT_CREATION(
  creation_id VARCHAR(7) NOT NULL,
  photo BLOB,
  foundation_id VARCHAR(7) NOT NULL,
  individual_id VARCHAR(7) NOT NULL,
  category_id VARCHAR(7) NOT NULL,
  title VARCHAR(50) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  flag INT DEFAULT 0,
  amount_needed DECIMAL(10,0) NOT NULL,
  division VARCHAR(30) NOT NULL CHECK (division REGEXP '^[A-Za-z ]+$'),
  doc BLOB,
  status ENUM('verified', 'unverified') DEFAULT 'unverified',
  CONSTRAINT EVENT_CREATION_PK PRIMARY KEY (creation_id),
  CONSTRAINT EVENT_CREATION_FOUNDATION_ID_FK FOREIGN KEY (foundation_id) REFERENCES FOUNDATION(foundation_id),
  CONSTRAINT EVENT_CREATION_INDIVIDUAL_ID_FK FOREIGN KEY (individual_id) REFERENCES INDIVIDUAL(individual_id),
  CONSTRAINT EVENT_CREATION_CATEGORY_FK FOREIGN KEY (category_id) REFERENCES EVENT_BASED_CATEGORY(category)
);

CREATE TABLE EVENT_VERIFICATION(
  log_id VARCHAR(7) NOT NULL,
  creation_id VARCHAR(7) NOT NULL,
  staff_id VARCHAR(7) NOT NULL,
  staff_ver_timestamp TIMESTAMP,
  status ENUM('verified', 'unverified') DEFAULT 'unverified',
  notes VARCHAR(1000),
  CONSTRAINT EVENT_VERIFICATION_LOG_ID_PK PRIMARY KEY (log_id),
  CONSTRAINT EVENT_VERIFICATION_CREATION_ID_FK FOREIGN KEY (creation_id) REFERENCES EVENT_CREATION(creation_id),
  CONSTRAINT EVENT_VERIFICATION_STAFF_ID_FK FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id)
);

CREATE TABLE DONATION_ELIGIBILITY(
  donation_id VARCHAR(7) NOT NULL,
  log_id VARCHAR(7) NOT NULL,
  donor_id VARCHAR(7) NOT NULL,
  amount DECIMAL(10,0) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  CONSTRAINT DONATION_ELIGIBILITY_DONATION_ID_PK PRIMARY KEY (donation_id),
  CONSTRAINT DONATION_ELIGIBILITY_LOG_ID_FK FOREIGN KEY (log_id) REFERENCES EVENT_VERIFICATION(log_id),
  CONSTRAINT DONATION_ELIGIBILITY_DONOR_ID_FK FOREIGN KEY (donor_id) REFERENCES DONOR(donor_id)
);

INSERT INTO INDIVIDUAL VALUES
('I000001','Rahim','Ahmed','rahim123','rahim@example.com','pass1234','01711111111','1234567890123','1995-05-12','12','34','Banani','Dhaka','Dhaka','1213','01722222222','123456789012345678'),
('I000002','Karim','Hossain','karim_h','karim@example.com','secret12','01733333333','9876543210987','1990-08-20','45','12','Gulshan','Dhaka','Dhaka','1212','01744444444','234567890123456789'),
('I000003','Anika','Sultana','anika_s','anika@example.com','mypwd88','01755555555','1928374650912','1998-01-15','78','56','Dhanmondi','Dhaka','Dhaka','1209','01766666666','345678901234567890');

INSERT INTO FOUNDATION VALUES
('F000001','Helping Hands',NULL,'LIC123456789','01777777777','help@example.com','helpme77','10','1','Tejgaon','Dhaka','Dhaka','1215','01788888888','456789012345678901','Support for needy','verified'),
('F000002','Green Earth',NULL,'LIC987654321','01799999999','green@example.com','green12','22','2','Uttara','Dhaka','Dhaka','1230','01700000000','567890123456789012','Environmental projects','unverified'),
('F000003','Food for All',NULL,'LIC112233445','01712312312','food@example.com','foodpass','30','5','Mirpur','Dhaka','Dhaka','1216','01732132132','678901234567890123','Feeding poor families','verified');

INSERT INTO STAFF VALUES
('S000001','Hasan','Mahmud','hasan_m','staff123','01743243243','hasan@example.com','1234509876543','1985-04-01','11','1','Mohakhali','Dhaka','Dhaka','1212',NULL,'verified'),
('S000002','Farzana','Akter','farzana_a','passfarz','01754354354','farzana@example.com','9876501234567','1992-09-12','22','4','Badda','Dhaka','Dhaka','1214',NULL,'unverified'),
('S000003','Rafiq','Islam','rafiq_i','rafiqpass','01765465465','rafiq@example.com','4567809876543','1988-11-30','33','8','Shyamoli','Dhaka','Dhaka','1207',NULL,'verified');

INSERT INTO STAFF_ASSIST VALUES
('SA00001','S000001','I000001','2025-08-01','10:30:00'),
('SA00002','S000002','I000002','2025-08-02','14:15:00'),
('SA00003','S000003','I000003','2025-08-03','09:45:00');

INSERT INTO CATEGORY VALUES
('C000001','Education'),
('C000002','Healthcare'),
('C000003','Environment');

INSERT INTO event VALUES
('E000001','Fundraising'),
('E000002','Awareness Campaign'),
('E000003','Relief Distribution');

INSERT INTO event_based_category VALUES
('CAT0001','E000001','C000001'),
('CAT0002','E000002','C000002'),
('CAT0003','E000003','C000003');

INSERT INTO DONOR VALUES
('D000001','Imran','Hossain','imran_h','imranpass','01711112222','imran@example.com','Bangladesh','Dhaka','1993-02-11'),
('D000002','Sadia','Khan','sadia_k','sadiapass','01733334444','sadia@example.com','Bangladesh','Chittagong','1995-07-21'),
('D000003','Tanvir','Rahman','tanvir_r','tanvirpass','01755556666','tanvir@example.com','Bangladesh','Khulna','1990-10-05');

INSERT INTO EVENT_CREATION VALUES
('CR00001',NULL,'F000001','I000001','CAT0001','School Supplies for Poor Kids','Providing books and uniforms to underprivileged students',0,50000,'Dhaka',NULL,'unverified'),
('CR00002',NULL,'F000002','I000002','CAT0002','Free Health Camp','Organizing a health checkup camp in rural areas',0,30000,'Chittagong',NULL,'verified'),
('CR00003',NULL,'F000003','I000003','CAT0003','Tree Plantation Drive','Planting 1000 trees in Khulna region',0,20000,'Khulna',NULL,'unverified');

INSERT INTO EVENT_VERIFICATION VALUES
('LOG0001','CR00001','S000001','2025-08-05 09:00:00','verified','Verified successfully'),
('LOG0002','CR00002','S000002','2025-08-06 10:15:00','verified','Documents matched'),
('LOG0003','CR00003','S000003','2025-08-07 11:45:00','unverified','Pending more documents');

INSERT INTO DONATION_ELIGIBILITY VALUES
('DO00001','LOG0001','D000001',5000,'2025-08-08','10:00:00'),
('DO00002','LOG0002','D000002',3000,'2025-08-09','11:15:00'),
('DO00003','LOG0003','D000003',2000,'2025-08-10','12:30:00');









