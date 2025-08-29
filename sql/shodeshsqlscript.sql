USE shodesh;
SHOW VARIABLES LIKE 'secure_file_priv';

-- NOTE: Added use of functions, GROUP BY, CASE expressions, views, JOINs,
--       PL/SQL routines, and exception handling where appropriate.
--       (Grammar fixed for clarity.)

-- ========================
-- Table: INDIVIDUAL
-- ========================
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
-- ========================
-- Table: FOUNDATION
-- ========================
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
  description TEXT,
  status ENUM('verified', 'unverified', 'suspended') DEFAULT 'unverified',
  CONSTRAINT FOUNDATION_FOUNDATION_ID_PK PRIMARY KEY (foundation_id),
  CONSTRAINT FOUNDATION_FOUNDATION_LICENSE_U UNIQUE (foundation_license),
  CONSTRAINT FOUNDATION_EMAIL_U UNIQUE (email),
  CONSTRAINT FOUNDATION_MOBILE_U UNIQUE (mobile)
);
SELECT * FROM FOUNDATION;
CREATE TABLE DONOR (
  donor_id VARCHAR(7) NOT NULL,
  first_name VARCHAR(50) NOT NULL CHECK (first_name REGEXP '^[A-Za-z ]+$'),
  last_name VARCHAR(50) NOT NULL CHECK (last_name REGEXP '^[A-Za-z ]+$'),
  username VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'),
  password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
  country VARCHAR(50) NOT NULL CHECK (country REGEXP '^[A-Za-z ]+$'),
  division VARCHAR(30) NULL CHECK (division IN ('Barisal', 'Chittagong', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet')),
  date_of_birth DATE NOT NULL,
  profile_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT DONOR_DONOR_ID_PK PRIMARY KEY (donor_id),
  CONSTRAINT DONOR_USERNAME_U UNIQUE (username),
  CONSTRAINT DONOR_EMAIL_U UNIQUE (email),
  
  -- Check constraint: division is required only for Bangladesh users
  CONSTRAINT DONOR_DIVISION_CHECK CHECK (
    (country = 'Bangladesh' AND division IS NOT NULL) OR 
    (country != 'Bangladesh' AND division IS NULL)
  )
);

SELECT * FROM DONOR;
-- ========================
-- Sample Data
-- ========================
INSERT INTO INDIVIDUAL VALUES
('I000001','Rahim','Ahmed','rahim123','rahim@example.com','pass1234','01711111111','1234567890123','1995-05-12','12','34','Banani','Dhaka','Dhaka','1213','01722222222','123456789012345678'),
('I000002','Karim','Hossain','karim_h','karim@example.com','secret12','01733333333','9876543210987','1990-08-20','45','12','Gulshan','Dhaka','Dhaka','1212','01744444444','234567890123456789'),
('I000003','Anika','Sultana','anika_s','anika@example.com','mypwd88','01755555555','1928374650912','1998-01-15','78','56','Dhanmondi','Dhaka','Dhaka','1209','01766666666','345678901234567890');

INSERT INTO FOUNDATION VALUES
('F000001','Helping Hands',NULL,'LIC123456789','01777777777','help@example.com','helpme77','10','1','Tejgaon','Dhaka','Dhaka','1215','01788888888','456789012345678901','We provide comprehensive support and assistance to underprivileged communities, focusing on education, healthcare, and basic needs. Our vision is to create a society where everyone has equal opportunities to thrive and succeed.','verified'),
('F000002','Green Earth',NULL,'LIC987654321','01799999999','green@example.com','green12','22','2','Uttara','Dhaka','Dhaka','1230','01700000000','567890123456789012','Dedicated to environmental conservation and sustainability projects. We work on reforestation, clean energy initiatives, waste management, and environmental awareness programs to protect our planet for future generations.','unverified'),
('F000003','Food for All',NULL,'LIC112233445','01712312312','food@example.com','foodpass','30','5','Mirpur','Dhaka','Dhaka','1216','01732132132','678901234567890123','Our mission is to eliminate hunger and malnutrition by providing nutritious meals to underprivileged families, especially children. We also focus on sustainable food programs and nutrition education in rural communities.','verified');

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
  status ENUM('verified','suspended', 'unverified') DEFAULT 'unverified',
  CONSTRAINT STAFF_STAFF_ID_PK PRIMARY KEY (staff_id),
  CONSTRAINT STAFF_NID_U UNIQUE (nid)
);
CREATE TABLE STAFF_ASSIST (
  staff_assist_id                VARCHAR(7)  NOT NULL,
  -- FK fields kept NULLable so rows survive deletes
  staff_id                       VARCHAR(7)  NULL,
  individual_id                  VARCHAR(7)  NULL,

  -- when the assist happened
  created_at                     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- immutable snapshots to preserve attribution
  staff_name_at_creation         VARCHAR(61) NOT NULL,
  staff_username_at_creation     VARCHAR(15) NOT NULL,
  individual_name_at_creation    VARCHAR(61) NOT NULL,

  CONSTRAINT STAFF_ASSIST_PK PRIMARY KEY (staff_assist_id),

  CONSTRAINT STAFF_ASSIST_STAFF_ID_FK
    FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT STAFF_ASSIST_INDIVIDUAL_ID_FK
    FOREIGN KEY (individual_id) REFERENCES INDIVIDUAL(individual_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- Helpful indexes for lookups
CREATE INDEX STAFF_ASSIST_IND_ID_CREATED_AT_IDX ON STAFF_ASSIST (individual_id, created_at);
CREATE INDEX STAFF_ASSIST_STAFF_ID_CREATED_AT_IDX ON STAFF_ASSIST (staff_id, created_at);





/* ============================================================
   SHODESH DONATION DB — ONE-SHOT REBUILD (MySQL 8.0)
   ------------------------------------------------------------
   Objects in this file:
     Tables: CATEGORY, EVENT_TYPE, EVENT_BASED_ON_CATEGORY,
             EVENT_CREATION, EVENT_PHOTO, EVENT_VERIFICATION, DONATION
     Views:  v_event_catalog, v_donation_eligible
     Funcs:  fn_event_remaining, fn_event_is_eligible, fn_event_risk_label
     Procs:  sp_raise_flag, sp_record_donation
     Trigs:  creator XOR, verification enforce/apply,
             donation gating/summing, delete blockers
   Prereqs: INDIVIDUAL, FOUNDATION, STAFF, DONOR tables exist.
   ============================================================ */

/* ---------- Clean up (drop in dependency-safe order) ---------- */
DROP VIEW IF EXISTS v_donation_eligible;
DROP VIEW IF EXISTS v_event_catalog;

DROP TRIGGER IF EXISTS BI_EVENT_CREATION_XOR;
DROP TRIGGER IF EXISTS BU_EVENT_CREATION_XOR;
DROP TRIGGER IF EXISTS BI_EVENT_VERIFICATION_ENFORCE;
DROP TRIGGER IF EXISTS AI_EVENT_VERIFICATION_APPLY;
DROP TRIGGER IF EXISTS BI_DONATION_ENFORCE;
DROP TRIGGER IF EXISTS AI_DONATION_SUM;
DROP TRIGGER IF EXISTS AU_DONATION_SUM;
DROP TRIGGER IF EXISTS AD_DONATION_SUM;
DROP TRIGGER IF EXISTS BD_INDIVIDUAL_BLOCK_IF_EVENTS;
DROP TRIGGER IF EXISTS BD_FOUNDATION_BLOCK_IF_EVENTS;

DROP PROCEDURE IF EXISTS sp_raise_flag;
DROP PROCEDURE IF EXISTS sp_record_donation;

DROP FUNCTION IF EXISTS fn_event_remaining;
DROP FUNCTION IF EXISTS fn_event_is_eligible;
DROP FUNCTION IF EXISTS fn_event_risk_label;

DROP TABLE IF EXISTS DONATION;
DROP TABLE IF EXISTS EVENT_VERIFICATION;
DROP TABLE IF EXISTS EVENT_PHOTO;
DROP TABLE IF EXISTS EVENT_CREATION;
DROP TABLE IF EXISTS EVENT_BASED_ON_CATEGORY;
DROP TABLE IF EXISTS EVENT_TYPE;
DROP TABLE IF EXISTS CATEGORY;

/* ===================== CATEGORY / EVENT_TYPE ===================== */
CREATE TABLE CATEGORY (
  category_id    VARCHAR(7)  NOT NULL,
  category_name  VARCHAR(50) NOT NULL,
  CONSTRAINT CATEGORY_PK PRIMARY KEY (category_id),
  CONSTRAINT CATEGORY_NAME_U UNIQUE (category_name)
);

CREATE TABLE EVENT_TYPE (
  event_type_id   VARCHAR(7)  NOT NULL,
  event_type_name VARCHAR(50) NOT NULL,
  CONSTRAINT EVENT_TYPE_PK PRIMARY KEY (event_type_id),
  CONSTRAINT EVENT_TYPE_NAME_U UNIQUE (event_type_name)
);

/* Junction with its own ID (surrogate key) */
CREATE TABLE EVENT_BASED_ON_CATEGORY (
  ebc_id        VARCHAR(7) NOT NULL,
  category_id   VARCHAR(7) NOT NULL,
  event_type_id VARCHAR(7) NOT NULL,
  CONSTRAINT EBC_PK PRIMARY KEY (ebc_id),
  CONSTRAINT EBC_PAIR_U UNIQUE (category_id, event_type_id),
  CONSTRAINT EBC_CATEGORY_FK   FOREIGN KEY (category_id)   REFERENCES CATEGORY(category_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT EBC_EVENT_TYPE_FK FOREIGN KEY (event_type_id) REFERENCES EVENT_TYPE(event_type_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

/* ===================== EVENT_CREATION ===================== */
CREATE TABLE EVENT_CREATION (
  creation_id   VARCHAR(7)  NOT NULL,

  -- exactly one creator (enforced by triggers)
  creator_type  ENUM('individual','foundation') NOT NULL,
  individual_id VARCHAR(7) NULL,
  foundation_id VARCHAR(7) NULL,

  -- choose a Category×EventType pair via the junction key
  ebc_id        VARCHAR(7) NOT NULL,

  title         VARCHAR(50)   NOT NULL,
  description   VARCHAR(1000) NOT NULL,

  flag          INT NOT NULL DEFAULT 0,

  amount_needed   DECIMAL(12,2) NOT NULL CHECK (amount_needed >= 0),
  amount_received DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (amount_received >= 0),

  division      VARCHAR(30) NOT NULL CHECK (division REGEXP '^[A-Za-z ]+$'),
  doc           LONGBLOB NULL,
  cover_photo   LONGBLOB NULL,

  -- simple verification/lifecycle
  verification_status ENUM('unverified','verified') NOT NULL DEFAULT 'unverified',
  lifecycle_status    ENUM('inactive','active','closed') NOT NULL DEFAULT 'inactive',

  -- if 1 → needs staff round (round_no=2) before it can be verified/active
  second_verification_required TINYINT NOT NULL DEFAULT 0,

  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT EVENT_CREATION_PK PRIMARY KEY (creation_id),

  -- FKs
  CONSTRAINT EC_EBC_FK        FOREIGN KEY (ebc_id)        REFERENCES EVENT_BASED_ON_CATEGORY(ebc_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT EC_INDIVIDUAL_FK FOREIGN KEY (individual_id) REFERENCES INDIVIDUAL(individual_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT EC_FOUNDATION_FK FOREIGN KEY (foundation_id) REFERENCES FOUNDATION(foundation_id)
    ON DELETE SET NULL ON UPDATE CASCADE,

  -- helpful indexes
  INDEX IDX_EVENT_STATE (verification_status, lifecycle_status, second_verification_required),
  INDEX IDX_EVENT_EBC   (ebc_id),
  INDEX IDX_EVENT_DIV   (division)
);

/* ===================== EVENT_PHOTO (many per event) ===================== */
CREATE TABLE EVENT_PHOTO (
  photo_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
  creation_id  VARCHAR(7) NOT NULL,
  photo        LONGBLOB   NOT NULL,
  content_type VARCHAR(100) NULL,
  caption      VARCHAR(140) NULL,
  uploaded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT EVENT_PHOTO_EVENT_FK
    FOREIGN KEY (creation_id) REFERENCES EVENT_CREATION(creation_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX IDX_EVENT_PHOTO (creation_id, uploaded_at)
);

/* ===================== EVENT_VERIFICATION (separate log) ===================== */
CREATE TABLE EVENT_VERIFICATION (
  log_id       VARCHAR(7)  NOT NULL,
  creation_id  VARCHAR(7)  NOT NULL,

  -- 1 = initial verification, 2 = staff follow-up (if requested)
  round_no     TINYINT NOT NULL,

  -- staff_id only for round 2
  staff_id     VARCHAR(7) NULL,

  decision     ENUM('verified','unverified') NOT NULL DEFAULT 'unverified',

  -- only used in round 1: if 1, event waits for staff (round 2)
  request_staff_verification TINYINT NOT NULL DEFAULT 0,

  notes        VARCHAR(1000) NULL,
  verified_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT EVENT_VERIFICATION_PK PRIMARY KEY (log_id),

  CONSTRAINT EV_EVENT_FK FOREIGN KEY (creation_id) REFERENCES EVENT_CREATION(creation_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT EV_STAFF_FK FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  INDEX EV_EVENT_IDX    (creation_id, round_no, verified_at),
  INDEX EV_VERIFIER_IDX (staff_id, verified_at)
);

/* ===================== DONATION (ledger) ===================== */
CREATE TABLE DONATION (
  donation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  creation_id VARCHAR(7) NOT NULL,
  donor_id    VARCHAR(7) NOT NULL,
  amount      DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  paid_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT DON_EVENT_FK FOREIGN KEY (creation_id) REFERENCES EVENT_CREATION(creation_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT DON_DONOR_FK FOREIGN KEY (donor_id)    REFERENCES DONOR(donor_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  INDEX IDX_DON_EVENT (creation_id, paid_at),
  INDEX IDX_DON_DONOR (donor_id, paid_at)
);

/* ===================== Seed taxonomy data ===================== */
INSERT INTO CATEGORY (category_id, category_name) VALUES
('CAT0001','Disaster Relief'),
('CAT0002','Health Care'),
('CAT0003','Education'),
('CAT0004','Livelihood'),
('CAT0005','Seasonal Aid'),
('CAT0006','WASH'),
('CAT0007','Infrastructure'),
('CAT0008','Refugee Support');

INSERT INTO EVENT_TYPE (event_type_id, event_type_name) VALUES
('EVT0001','Flood Relief'),
('EVT0002','Cyclone Relief'),
('EVT0003','Landslide Relief'),
('EVT0004','Fire Victim Support'),
('EVT0101','Dengue Treatment'),
('EVT0102','Cancer Surgery'),
('EVT0103','ICU Support'),
('EVT0201','Tuition Scholarship'),
('EVT0202','School Supplies'),
('EVT0301','Small Business Grant'),
('EVT0302','Rickshaw/Van Purchase'),
('EVT0401','Qurbani'),
('EVT0402','Zakat/Fitra'),
('EVT0403','Winter Clothing'),
('EVT0501','Tube-well Installation'),
('EVT0502','Sanitation/Toilets'),
('EVT0601','House Rebuild'),
('EVT0602','Bridge/Culvert Repair'),
('EVT0701','Rohingya Relief');

INSERT INTO EVENT_BASED_ON_CATEGORY (ebc_id, category_id, event_type_id) VALUES
('EBC0001','CAT0001','EVT0001'),
('EBC0002','CAT0001','EVT0002'),
('EBC0003','CAT0001','EVT0003'),
('EBC0004','CAT0001','EVT0004'),
('EBC0005','CAT0001','EVT0601'),
('EBC0006','CAT0001','EVT0602'),
('EBC0007','CAT0001','EVT0501'),
('EBC0008','CAT0001','EVT0502'),
('EBC0009','CAT0001','EVT0403'),
('EBC0010','CAT0002','EVT0101'),
('EBC0011','CAT0002','EVT0102'),
('EBC0012','CAT0002','EVT0103'),
('EBC0013','CAT0003','EVT0201'),
('EBC0014','CAT0003','EVT0202'),
('EBC0015','CAT0004','EVT0301'),
('EBC0016','CAT0004','EVT0302'),
('EBC0017','CAT0005','EVT0401'),
('EBC0018','CAT0005','EVT0402'),
('EBC0019','CAT0005','EVT0403'),
('EBC0020','CAT0006','EVT0501'),
('EBC0021','CAT0006','EVT0502'),
('EBC0022','CAT0007','EVT0601'),
('EBC0023','CAT0007','EVT0602'),
('EBC0024','CAT0008','EVT0701');

/* ===================== Views ===================== */
CREATE OR REPLACE VIEW v_event_catalog AS
SELECT
  e.creation_id, e.title, e.description, e.division,
  e.amount_needed, e.amount_received,
  (e.amount_needed - e.amount_received) AS amount_remaining,
  e.verification_status, e.lifecycle_status,
  e.second_verification_required,
  e.created_at,
  ebc.ebc_id, c.category_id, c.category_name, et.event_type_id, et.event_type_name,
  e.creator_type, e.individual_id, e.foundation_id, e.flag
FROM EVENT_CREATION e
JOIN EVENT_BASED_ON_CATEGORY ebc ON ebc.ebc_id = e.ebc_id
JOIN CATEGORY c  ON c.category_id  = ebc.category_id
JOIN EVENT_TYPE et ON et.event_type_id = ebc.event_type_id;

CREATE OR REPLACE VIEW v_donation_eligible AS
SELECT *
FROM v_event_catalog
WHERE verification_status = 'verified'
  AND lifecycle_status    = 'active'
  AND amount_received < amount_needed;


/* ===================== Functions ===================== */
DELIMITER $$

DROP FUNCTION IF EXISTS fn_event_remaining $$
CREATE FUNCTION fn_event_remaining(p_creation_id VARCHAR(7))
RETURNS DECIMAL(12,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_need DECIMAL(12,2) DEFAULT 0;
  DECLARE v_recv DECIMAL(12,2) DEFAULT 0;
  SELECT amount_needed, amount_received
    INTO v_need, v_recv
  FROM EVENT_CREATION
  WHERE creation_id = p_creation_id;
  RETURN (v_need - v_recv);
END $$

DROP FUNCTION IF EXISTS fn_event_is_eligible $$
CREATE FUNCTION fn_event_is_eligible(p_creation_id VARCHAR(7))
RETURNS TINYINT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_ok TINYINT DEFAULT 0;
  SELECT CASE
           WHEN verification_status='verified'
            AND lifecycle_status='active'
            AND amount_received < amount_needed
           THEN 1 ELSE 0 END
    INTO v_ok
  FROM EVENT_CREATION
  WHERE creation_id = p_creation_id;
  RETURN v_ok;
END $$

DROP FUNCTION IF EXISTS fn_event_risk_label $$
CREATE FUNCTION fn_event_risk_label(p_flag INT)
RETURNS VARCHAR(10)
DETERMINISTIC
NO SQL
BEGIN
  RETURN CASE
           WHEN p_flag >= 10 THEN 'HIGH'
           WHEN p_flag >= 5  THEN 'MEDIUM'
           WHEN p_flag >= 1  THEN 'LOW'
           ELSE 'NONE'
         END;
END $$

DELIMITER ;

/* ===================== Procedures ===================== */
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_raise_flag $$
CREATE PROCEDURE sp_raise_flag(
  IN p_creation_id VARCHAR(7),
  IN p_delta INT,
  IN p_threshold INT
)
BEGIN
  DECLARE v_new INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Raising flag failed';
  END;

  START TRANSACTION;

  SELECT 1 FROM EVENT_CREATION WHERE creation_id = p_creation_id FOR UPDATE;

  UPDATE EVENT_CREATION
  SET flag = flag + IFNULL(p_delta,1)
  WHERE creation_id = p_creation_id;

  SELECT flag INTO v_new FROM EVENT_CREATION WHERE creation_id = p_creation_id;

  IF v_new >= p_threshold THEN
    -- "suspend": hide + force manual recheck
    UPDATE EVENT_CREATION
    SET lifecycle_status='inactive',
        verification_status='unverified',
        second_verification_required=1
    WHERE creation_id = p_creation_id;
  END IF;

  COMMIT;
END $$

/* NOTE: No double-counting. Let the triggers update totals & close status. */
DROP PROCEDURE IF EXISTS sp_record_donation $$
CREATE PROCEDURE sp_record_donation(
  IN p_creation_id VARCHAR(7),
  IN p_donor_id    VARCHAR(7),
  IN p_amount      DECIMAL(12,2)
)
BEGIN
  DECLARE v_ver  VARCHAR(10);
  DECLARE v_life VARCHAR(10);
  DECLARE v_need DECIMAL(12,2);
  DECLARE v_have DECIMAL(12,2);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Donation failed';
  END;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Invalid donation amount';
  END IF;

  START TRANSACTION;

  SELECT verification_status, lifecycle_status, amount_needed, amount_received
    INTO v_ver, v_life, v_need, v_have
  FROM EVENT_CREATION
  WHERE creation_id = p_creation_id
  FOR UPDATE;

  IF v_ver <> 'verified' OR v_life <> 'active' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Event not eligible for donations';
  END IF;

  IF v_have >= v_need THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Event already fully funded';
  END IF;

  IF v_have + p_amount > v_need THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Donation exceeds remaining target';
  END IF;

  INSERT INTO DONATION (creation_id, donor_id, amount)
  VALUES (p_creation_id, p_donor_id, p_amount);

  COMMIT;
END $$

DELIMITER ;

/* ===================== Triggers ===================== */
DELIMITER $$

/* -----------------------------------------------------------------------
   BI_EVENT_CREATION_XOR  (BEFORE INSERT on EVENT_CREATION)
   Purpose: Enforce EXACTLY ONE creator at creation time.
   ----------------------------------------------------------------------- */
CREATE TRIGGER BI_EVENT_CREATION_XOR
BEFORE INSERT ON EVENT_CREATION
FOR EACH ROW
BEGIN
  IF NOT (
      (NEW.creator_type='individual'  AND NEW.individual_id  IS NOT NULL AND NEW.foundation_id IS NULL) OR
      (NEW.creator_type='foundation' AND NEW.foundation_id IS NOT NULL AND NEW.individual_id  IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT='Provide exactly one creator: individual OR foundation, matching creator_type';
  END IF;
END $$

/* -----------------------------------------------------------------------
   BU_EVENT_CREATION_XOR  (BEFORE UPDATE on EVENT_CREATION)
   Purpose: Enforce XOR on updates (no ownerless state allowed since we block deletes).
   ----------------------------------------------------------------------- */
CREATE TRIGGER BU_EVENT_CREATION_XOR
BEFORE UPDATE ON EVENT_CREATION
FOR EACH ROW
BEGIN
  IF NOT (
      (NEW.creator_type='individual'  AND NEW.individual_id  IS NOT NULL AND NEW.foundation_id IS NULL) OR
      (NEW.creator_type='foundation' AND NEW.foundation_id IS NOT NULL AND NEW.individual_id  IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT='Provide exactly one creator: individual OR foundation, matching creator_type';
  END IF;
END $$

/* -----------------------------------------------------------------------
   BI_EVENT_VERIFICATION_ENFORCE  (BEFORE INSERT on EVENT_VERIFICATION)
   Purpose: Validate round, staff pairing, and staff-needed state.
   ----------------------------------------------------------------------- */
CREATE TRIGGER BI_EVENT_VERIFICATION_ENFORCE
BEFORE INSERT ON EVENT_VERIFICATION
FOR EACH ROW
BEGIN
  DECLARE v_need_staff TINYINT DEFAULT 0;

  IF NEW.round_no NOT IN (1,2) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='round_no must be 1 or 2';
  END IF;

  IF (NEW.round_no = 1 AND NEW.staff_id IS NOT NULL) OR
     (NEW.round_no = 2 AND NEW.staff_id IS NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT='Invalid verifier: round 1 -> no staff_id; round 2 -> staff_id required';
  END IF;

  IF NEW.round_no <> 1 THEN
    SET NEW.request_staff_verification = 0;
  END IF;

  IF NEW.round_no = 2 THEN
    SELECT second_verification_required
      INTO v_need_staff
    FROM EVENT_CREATION
    WHERE creation_id = NEW.creation_id
    FOR UPDATE;

    IF v_need_staff <> 1 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='Staff follow-up was not requested for this event';
    END IF;
  END IF;
END $$

/* -----------------------------------------------------------------------
   AI_EVENT_VERIFICATION_APPLY  (AFTER INSERT on EVENT_VERIFICATION)
   Purpose: Apply decision to EVENT_CREATION status.
   ----------------------------------------------------------------------- */
CREATE TRIGGER AI_EVENT_VERIFICATION_APPLY
AFTER INSERT ON EVENT_VERIFICATION
FOR EACH ROW
BEGIN
  IF NEW.round_no = 1 THEN
    IF NEW.decision = 'verified' THEN
      IF NEW.request_staff_verification = 1 THEN
        UPDATE EVENT_CREATION
        SET second_verification_required = 1,
            verification_status = 'unverified',
            lifecycle_status    = 'inactive'
        WHERE creation_id = NEW.creation_id;
      ELSE
        UPDATE EVENT_CREATION
        SET second_verification_required = 0,
            verification_status = 'verified',
            lifecycle_status    = 'active'
        WHERE creation_id = NEW.creation_id;
      END IF;
    ELSE
      UPDATE EVENT_CREATION
      SET second_verification_required = 0,
          verification_status = 'unverified',
          lifecycle_status    = 'inactive'
      WHERE creation_id = NEW.creation_id;
    END IF;
  END IF;

  IF NEW.round_no = 2 THEN
    UPDATE EVENT_CREATION
    SET second_verification_required = 0,
        verification_status = CASE WHEN NEW.decision='verified' THEN 'verified' ELSE 'unverified' END,
        lifecycle_status    = CASE WHEN NEW.decision='verified' THEN 'active'    ELSE 'inactive'    END
    WHERE creation_id = NEW.creation_id;
  END IF;
END $$

/* -----------------------------------------------------------------------
   BI_DONATION_ENFORCE  (BEFORE INSERT on DONATION)
   Purpose: Validate amount, eligibility, and prevent over-funding.
   ----------------------------------------------------------------------- */
CREATE TRIGGER BI_DONATION_ENFORCE
BEFORE INSERT ON DONATION
FOR EACH ROW
BEGIN
  DECLARE v_ver  VARCHAR(10);
  DECLARE v_life VARCHAR(10);
  DECLARE v_need DECIMAL(12,2);
  DECLARE v_have DECIMAL(12,2);

  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Invalid donation amount';
  END IF;

  SELECT verification_status, lifecycle_status, amount_needed, amount_received
    INTO v_ver, v_life, v_need, v_have
  FROM EVENT_CREATION
  WHERE creation_id = NEW.creation_id
  FOR UPDATE;

  IF v_ver <> 'verified' OR v_life <> 'active' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Donations allowed only for verified & active events';
  END IF;

  IF v_have >= v_need THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Event is already fully funded';
  END IF;

  IF v_have + NEW.amount > v_need THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Donation exceeds remaining required amount';
  END IF;
END $$

/* -----------------------------------------------------------------------
   AI_DONATION_SUM  (AFTER INSERT on DONATION)
   Purpose: Add to amount_received; close when target met.
   ----------------------------------------------------------------------- */
CREATE TRIGGER AI_DONATION_SUM
AFTER INSERT ON DONATION
FOR EACH ROW
BEGIN
  UPDATE EVENT_CREATION
  SET amount_received = amount_received + NEW.amount
  WHERE creation_id = NEW.creation_id;

  UPDATE EVENT_CREATION
  SET lifecycle_status = 'closed'
  WHERE creation_id = NEW.creation_id
    AND verification_status = 'verified'
    AND amount_received >= amount_needed
    AND lifecycle_status <> 'closed';
END $$

/* -----------------------------------------------------------------------
   AU_DONATION_SUM  (AFTER UPDATE on DONATION)
   Purpose: Adjust totals on donation edit; keep status in sync.
   ----------------------------------------------------------------------- */
CREATE TRIGGER AU_DONATION_SUM
AFTER UPDATE ON DONATION
FOR EACH ROW
BEGIN
  UPDATE EVENT_CREATION
  SET amount_received = amount_received - OLD.amount + NEW.amount
  WHERE creation_id = NEW.creation_id;

  UPDATE EVENT_CREATION
  SET lifecycle_status = CASE
      WHEN amount_received >= amount_needed THEN 'closed'
      ELSE 'active'
    END
  WHERE creation_id = NEW.creation_id
    AND verification_status = 'verified';
END $$

/* -----------------------------------------------------------------------
   AD_DONATION_SUM  (AFTER DELETE on DONATION)
   Purpose: Subtract totals on delete; reopen if below target again.
   ----------------------------------------------------------------------- */
CREATE TRIGGER AD_DONATION_SUM
AFTER DELETE ON DONATION
FOR EACH ROW
BEGIN
  UPDATE EVENT_CREATION
  SET amount_received = amount_received - OLD.amount
  WHERE creation_id = OLD.creation_id;

  UPDATE EVENT_CREATION
  SET lifecycle_status = 'active'
  WHERE creation_id = OLD.creation_id
    AND verification_status = 'verified'
    AND amount_received < amount_needed
    AND lifecycle_status = 'closed';
END $$

/* -----------------------------------------------------------------------
   BD_INDIVIDUAL_BLOCK_IF_EVENTS / BD_FOUNDATION_BLOCK_IF_EVENTS
   Purpose: Block deleting a creator while events still reference them.
   ----------------------------------------------------------------------- */
CREATE TRIGGER BD_INDIVIDUAL_BLOCK_IF_EVENTS
BEFORE DELETE ON INDIVIDUAL
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1
    FROM EVENT_CREATION
    WHERE creator_type='individual'
      AND individual_id = OLD.individual_id
    LIMIT 1
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot delete individual: events still reference this account (reassign or deactivate first)';
  END IF;
END $$

CREATE TRIGGER BD_FOUNDATION_BLOCK_IF_EVENTS
BEFORE DELETE ON FOUNDATION
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1
    FROM EVENT_CREATION
    WHERE creator_type='foundation'
      AND foundation_id = OLD.foundation_id
    LIMIT 1
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot delete foundation: events still reference this account (reassign or deactivate first)';
  END IF;
END $$

DELIMITER ;

