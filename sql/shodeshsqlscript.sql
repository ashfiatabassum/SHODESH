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
  CONSTRAINT INDIVIDUAL_NID_U UNIQUE (nid)
);

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
  status ENUM('verified', 'unverified') DEFAULT 'unverified',
  CONSTRAINT FOUNDATION_FOUNDATION_ID_PK PRIMARY KEY (foundation_id),
  CONSTRAINT FOUNDATION_FOUNDATION_LICENSE_U UNIQUE (foundation_license)
); 

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
  CV BLOB NOT NULL,
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
