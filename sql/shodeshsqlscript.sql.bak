CREATE DATABASE shodesh;

USE shodesh;

CREATE TABLE donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL
);

SELECT DATABASE();

SELECT * FROM donations;

CREATE TABLE INDIVIDUAL (
    individual_id VARCHAR(7),
    first_name VARCHAR(30) CHECK (
        first_name REGEXP '^[A-Za-z ]+$'
    ),
    last_name VARCHAR(30) CHECK (
        last_name REGEXP '^[A-Za-z ]+$'
    ),
    username VARCHAR(15),
    password VARCHAR(255) CHECK (LENGTH(password) >= 6),
    mobile VARCHAR(11) CHECK (mobile REGEXP '^0[0-9]{10}$'),
    nid VARCHAR(17) CHECK (nid REGEXP '^[0-9]{10,17}$'),
    dob DATE,
    house_no VARCHAR(7),
    road_no VARCHAR(4) CHECK (road_no REGEXP '^[0-9]{1,4}$'),
    area VARCHAR(30) CHECK (area REGEXP '^[A-Za-z ]+$'),
    district VARCHAR(30) CHECK (
        district REGEXP '^[A-Za-z ]+$'
    ),
    administrative_div VARCHAR(30) CHECK (
        administrative_div REGEXP '^[A-Za-z ]+$'
    ),
    zip VARCHAR(4) CHECK (zip REGEXP '^[0-9]{4}$'),
    bkash VARCHAR(11) CHECK (bkash REGEXP '^0[0-9]{10}$'),
    bank_account VARCHAR(18),
    CONSTRAINT INDIVIDUAL_INDIVIDUAL_ID_PK PRIMARY KEY (individual_id),
    CONSTRAINT INDIVIDUAL_NID_U UNIQUE (nid),
    CONSTRAINT INDIVIDUAL_PASSWORD_NN NOT NULL (password),
    CONSTRAINT INDIVIDUAL_FIRST_NAME_NN NOT NULL (first_name),
    CONSTRAINT INDIVIDUAL_LAST_NAME_NN NOT NULL (last_name),
    CONSTRAINT INDIVIDUAL_USERNAME_NN NOT NULL (username),
    CONSTRAINT INDIVIDUAL_MOBILE_NN NOT NULL (mobile)
);

CREATE TABLE FOUNDATION (
    foundation_id VARCHAR(7),
    foundation_name VARCHAR(50),
    certificate BLOB,
    foundation_license VARCHAR(12),
    mobile VARCHAR(11) CHECK (mobile REGEXP '^0[0-9]{10}$'),
    email VARCHAR(100) CHECK (
        email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'
    ),
    password VARCHAR(255) CHECK (LENGTH(password) >= 6),
    house_no VARCHAR(7),
    road_no VARCHAR(4) CHECK (road_no REGEXP '^[0-9]{1,4}$'),
    area VARCHAR(30) CHECK (area REGEXP '^[A-Za-z ]+$'),
    district VARCHAR(30) CHECK (
        district REGEXP '^[A-Za-z ]+$'
    ),
    administrative_div VARCHAR(30) CHECK (
        administrative_div REGEXP '^[A-Za-z ]+$'
    ),
    zip VARCHAR(4) CHECK (zip REGEXP '^[0-9]{4}$'),
    bkash VARCHAR(11) CHECK (bkash REGEXP '^0[0-9]{10}$'),
    bank_account VARCHAR(18),
    status ENUM('verified', 'unverified') DEFAULT 'unverified',
    CONSTRAINT FOUNDATION_FOUNDATION_ID_PK PRIMARY KEY (foundation_id),
    CONSTRAINT FOUNDATION_FOUNDATION_LICENSE_U UNIQUE (foundation_license),
    CONSTRAINT FOUNDATION_PASSWORD_NN NOT NULL (password),
    CONSTRAINT FOUNDATION_FOUNDATION_NAME_NN NOT NULL (foundation_name),
    CONSTRAINT FOUNDATION_MOBILE_NN NOT NULL (mobile)
);

CREATE TABLE STAFF (
    staff_id VARCHAR(7),
    first_name VARCHAR(30) CHECK (
        first_name REGEXP '^[A-Za-z ]+$'
    ),
    last_name VARCHAR(30) CHECK (
        last_name REGEXP '^[A-Za-z ]+$'
    ),
    username VARCHAR(15),
    password VARCHAR(255) CHECK (LENGTH(password) >= 6),
    mobile VARCHAR(11) CHECK (mobile REGEXP '^0[0-9]{10}$'),
    email VARCHAR(100) CHECK (
        email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'
    ),
    nid VARCHAR(17) CHECK (nid REGEXP '^[0-9]{10,17}$'),
    dob DATE,
    house_no VARCHAR(7),
    road_no VARCHAR(4) CHECK (road_no REGEXP '^[0-9]{1,4}$'),
    area VARCHAR(30) CHECK (area REGEXP '^[A-Za-z ]+$'),
    district VARCHAR(30) CHECK (
        district REGEXP '^[A-Za-z ]+$'
    ),
    administrative_div VARCHAR(30) CHECK (
        administrative_div REGEXP '^[A-Za-z ]+$'
    ),
    zip VARCHAR(4) CHECK (zip REGEXP '^[0-9]{4}$'),
    CV BLOB,
    status ENUM(
        'verified',
        'unverified',
        'suspend'
    ) DEFAULT 'unverified',
    CONSTRAINT STAFF_STAFF_ID_PK PRIMARY KEY (staff_id),
    CONSTRAINT STAFF_NID_U UNIQUE (nid),
    CONSTRAINT STAFF_PASSWORD_NN NOT NULL (password),
    CONSTRAINT STAFF_FIRST_NAME_NN NOT NULL (first_name),
    CONSTRAINT STAFF_LAST_NAME_NN NOT NULL (last_name),
    CONSTRAINT STAFF_USERNAME_NN NOT NULL (username),
    CONSTRAINT STAFF_MOBILE_NN NOT NULL (mobile),
    CONSTRAINT STAFF_CV_NN NOT NULL (CV)
);

CREATE TABLE STAFF_ASSIST (
    staff_assist_id VARCHAR(7),
    staff_id VARCHAR(7),
    individual_id VARCHAR(7),
    date DATE,
    time TIME,
    CONSTRAINT STAFF_ASSIST_STAFF_ASSIST_ID_PK PRIMARY KEY (staff_assist_id),
    CONSTRAINT STAFF_ASSIST_STAFF_ID_FK FOREIGN KEY (staff_id) REFERENCES STAFF (staff_id),
    CONSTRAINT STAFF_ASSIST_INDIVIDUAL_ID_FK FOREIGN KEY (individual_id) REFERENCES INDIVIDUAL (individual_id)
);

CREATE TABLE CATEGORY (
    category_id VARCHAR(7),
    category_type VARCHAR(30),
    CONSTRAINT CATEGORY_CATEGORY_ID_PK PRIMARY KEY (category_id),
    CONSTRAINT CATEGORY_CATEGORY_TYPE_NN NOT NULL (category_type)
);

CREATE TABLE event (
    event_id VARCHAR(7),
    event_type VARCHAR(30),
    CONSTRAINT EVENT_EVENT_ID_PK PRIMARY KEY (event_id),
    CONSTRAINT EVENT_EVENT_TYPE_U UNIQUE (event_type)
);

CREATE TABLE event_based_category (
    category VARCHAR(7),
    event_id VARCHAR(7),
    category_id VARCHAR(7),
    CONSTRAINT EVENT_BASED_CATEGORY_CATEGORY_ID_FK FOREIGN KEY (category_id) REFERENCES CATEGORY (category_id),
    CONSTRAINT EVENT_BASED_CATEGORY_EVENT_ID_FK FOREIGN KEY (event_id) REFERENCES event (event_id),
    CONSTRAINT EVENT_BASED_CATEGORY_CATEGORY_PK PRIMARY KEY (category)
);

CREATE TABLE DONOR (
    donor_id VARCHAR(7),
    first_name VARCHAR(30) CHECK (
        first_name REGEXP '^[A-Za-z ]+$'
    ),
    last_name VARCHAR(30) CHECK (
        last_name REGEXP '^[A-Za-z ]+$'
    ),
    username VARCHAR(15),
    password VARCHAR(255) CHECK (LENGTH(password) >= 6),
    mobile VARCHAR(11) CHECK (mobile REGEXP '^0[0-9]{10}$'),
    email VARCHAR(100) CHECK (
        email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'
    ),
    country VARCHAR(30) CHECK (country REGEXP '^[A-Za-z ]+$'),
    DOB DATE,
    CONSTRAINT DONOR_DONOR_ID_PK PRIMARY KEY (donor_id),
    CONSTRAINT DONOR_FIRST_NAME_NN NOT NULL (first_name),
    CONSTRAINT DONOR_LAST_NAME_NN NOT NULL (last_name),
    CONSTRAINT DONOR_USERNAME_NN NOT NULL (username),
    CONSTRAINT DONOR_PASSWORD_NN NOT NULL (password),
    CONSTRAINT DONOR_MOBILE_NN NOT NULL (mobile),
    CONSTRAINT DONOR_COUNTRY_NN NOT NULL (country)
);

CREATE TABLE EVENT_CREATION (
    creation_id VARCHAR(7),
    photo BLOB,
    foundation_id VARCHAR(7),
    individual_id VARCHAR(7),
    category VARCHAR(7),
    title VARCHAR(50),
    description VARCHAR(1000),
    flag INT DEFAULT 0,
    amount_needed DECIMAL(10, 0),
    division VARCHAR(30) CHECK (
        division REGEXP '^[A-Za-z ]+$'
    ),
    doc BLOB,
    status ENUM('verified', 'unverified') DEFAULT 'unverified',
    CONSTRAINT EVENT_CREATION_PK PRIMARY KEY (creation_id, photo),
    CONSTRAINT EVENT_CREATION_FOUNDATION_ID_FK FOREIGN KEY (foundation_id) REFERENCES FOUNDATION (foundation_id),
    CONSTRAINT EVENT_CREATION_INDIVIDUAL_ID_FK FOREIGN KEY (individual_id) REFERENCES INDIVIDUAL (individual_id),
    CONSTRAINT EVENT_CREATION_CATEGORY_FK FOREIGN KEY (category) REFERENCES EVENT_BASED_CATEGORY (category),
    CONSTRAINT EVENT_CREATION_TITLE_NN NOT NULL (title),
    CONSTRAINT EVENT_CREATION_DESCRIPTION_NN NOT NULL (description),
    CONSTRAINT EVENT_CREATION_AMOUNT_NEEDED_NN NOT NULL (amount_needed),
    CONSTRAINT EVENT_CREATION_DIVISION_NN NOT NULL (division),
);