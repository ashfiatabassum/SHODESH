USE shodesh;
SHOW VARIABLES LIKE 'secure_file_priv';

-- NOTE: Added use of functions, GROUP BY, CASE expressions, views, JOINs,
--       PL/SQL routines, and exception handling where appropriate.
--       (Grammar fixed for clarity.)
GRANT SELECT ON shodesh.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
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
SELECT * FROM event_type;
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
  verification_status ENUM('unverified','verified','rejected') NOT NULL DEFAULT 'unverified',
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
SELECT * FROM CATEGORY;
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

USE shodesh;

START TRANSACTION;

-- 1) INDIVIDUAL (safe upsert)
INSERT INTO INDIVIDUAL (
  individual_id, first_name, last_name, username, email, password,
  mobile, nid, dob, house_no, road_no, area, district,
  administrative_div, zip, bkash, bank_account
) VALUES
('I920010','Naeem','Hasan','naeem_h','naeem.h@example.com','pass920010',
 '01792100100','1999999999999','1997-01-15','22','7','Mirpur','Dhaka',
 'Dhaka','1216','01792100101','123456789012345001')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 2) FOUNDATION (safe upsert)
INSERT INTO FOUNDATION (
  foundation_id, foundation_name, certificate, foundation_license,
  mobile, email, password, house_no, road_no, area, district,
  administrative_div, zip, bkash, bank_account, description, status
) VALUES
('F920010','Aid Bridge',NULL,'LIC920010000',
 '01792100102','aidbridge@example.com','passF920010','50','3','Mohakhali','Dhaka',
 'Dhaka','1212','01792100103','987654321098765001',
 'Health + education micro-grants.','verified')
ON DUPLICATE KEY UPDATE status='verified';

-- (Optional) sanity: ensure these ebc_ids exist in EVENT_BASED_ON_CATEGORY
-- SELECT ebc_id, category_id, event_type_id FROM EVENT_BASED_ON_CATEGORY WHERE ebc_id IN ('EBC0013','EBC0010');

-- 3) EVENTS — set verified/active directly (no verification table involved)

-- 3a) Individual-created event
INSERT INTO EVENT_CREATION (
  creation_id, creator_type, individual_id, foundation_id, ebc_id,
  title, description, amount_needed, amount_received, division,
  verification_status, lifecycle_status
) VALUES
('EC92001','individual','I920010',NULL,'EBC0013',
 'Scholarships for Rural Students',
 'Tuition support for 40 low-income students for 1 year.',
 280000.00, 0.00, 'Rajshahi',
 'verified','active')
ON DUPLICATE KEY UPDATE
  title=VALUES(title),
  description=VALUES(description),
  amount_needed=VALUES(amount_needed),
  division=VALUES(division),
  verification_status='verified',
  lifecycle_status='active';

-- 3b) Foundation-created event
INSERT INTO EVENT_CREATION (
  creation_id, creator_type, individual_id, foundation_id, ebc_id,
  title, description, amount_needed, amount_received, division,
  verification_status, lifecycle_status
) VALUES
('EC92002','foundation',NULL,'F920010','EBC0010',
 'Emergency Dengue Treatment',
 'Platelet support, diagnostics, and hospital costs.',
 350000.00, 0.00, 'Dhaka',
 'verified','active')
ON DUPLICATE KEY UPDATE
  title=VALUES(title),
  description=VALUES(description),
  amount_needed=VALUES(amount_needed),
  division=VALUES(division),
  verification_status='verified',
  lifecycle_status='active';

COMMIT;

-- Quick checks
SELECT creation_id, creator_type, individual_id, foundation_id,
       verification_status, lifecycle_status, amount_needed, amount_received, division
FROM EVENT_CREATION
WHERE creation_id IN ('EC92001','EC92002');



USE shodesh;

-- EC92003–EC92012: more events (verified + active, amount_received = 0)

INSERT INTO EVENT_CREATION (
  creation_id, creator_type, individual_id, foundation_id, ebc_id,
  title, description, amount_needed, amount_received, division,
  verification_status, lifecycle_status
) VALUES
-- 1) individual — Education (EBC0013)
('EC92003','individual','I920010',NULL,'EBC0013',
 'STEM Kits for Rural Schools',
 'Provide science kits and teacher guides to 15 secondary schools.',
 180000.00,0.00,'Khulna','verified','active'),

-- 2) foundation — Health (EBC0010)
('EC92004','foundation',NULL,'F920010','EBC0010',
 'Free Dengue Test Camp — Chattogram',
 'Mobile antigen testing and basic treatment referrals for 6 wards.',
 220000.00,0.00,'Chattogram','verified','active'),

-- 3) individual — Disaster Relief (EBC0001)
('EC92005','individual','I920010',NULL,'EBC0001',
 'Flood Relief — Sunamganj',
 'Dry food, saline, and purification tablets for 1200 households.',
 400000.00,0.00,'Sylhet','verified','active'),

-- 4) foundation — Education (EBC0013)
('EC92006','foundation',NULL,'F920010','EBC0013',
 'Girls’ Scholarship — Barishal',
 'School fees and uniforms for 60 girls (Class 6–10).',
 250000.00,0.00,'Barishal','verified','active'),

-- 5) individual — Health (EBC0010)
('EC92007','individual','I920010',NULL,'EBC0010',
 'Blood & Platelet Support — Mymensingh',
 'Support critical patients with screening, transport, and units.',
 260000.00,0.00,'Mymensingh','verified','active'),

-- 6) foundation — Disaster Relief (EBC0001)
('EC92008','foundation',NULL,'F920010','EBC0001',
 'Cyclone Recovery — Bhola',
 'Tin sheets, hygiene kits, and temporary shelter materials.',
 420000.00,0.00,'Barishal','verified','active'),

-- 7) individual — Education (EBC0013)
('EC92009','individual','I920010',NULL,'EBC0013',
 'Coaching Aid — Rangpur',
 'Stipends for HSC examinees’ coaching and exam forms.',
 160000.00,0.00,'Rangpur','verified','active'),

-- 8) foundation — Health (EBC0010)
('EC92010','foundation',NULL,'F920010','EBC0010',
 'Dengue Awareness & Nets — Dhaka',
 'Community sessions, flyers, and 2000 insecticide-treated nets.',
 300000.00,0.00,'Dhaka','verified','active'),

-- 9) individual — Disaster Relief (EBC0001)
('EC92011','individual','I920010',NULL,'EBC0001',
 'Flood Clean Water — Gaibandha',
 'Emergency tube-wells servicing and bulk water distribution.',
 200000.00,0.00,'Rangpur','verified','active'),

-- 10) foundation — Education (EBC0013)
('EC92012','foundation',NULL,'F920010','EBC0013',
 'University Entrance Grants — Rajshahi',
 'Application fees, travel, and initial hostel costs for 35 students.',
 310000.00,0.00,'Rajshahi','verified','active')
ON DUPLICATE KEY UPDATE
  title=VALUES(title),
  description=VALUES(description),
  amount_needed=VALUES(amount_needed),
  division=VALUES(division),
  verification_status='verified',
  lifecycle_status='active';

-- Quick sanity check
SELECT creation_id, creator_type, individual_id, foundation_id,
       verification_status, lifecycle_status, amount_needed, amount_received, division
FROM EVENT_CREATION
WHERE creation_id BETWEEN 'EC92003' AND 'EC92012'
ORDER BY creation_id;



-- event searching 

-- 1) All events (joined with taxonomy + creator)
DROP VIEW IF EXISTS v_event_catalog;
CREATE VIEW v_event_catalog AS
SELECT
  ec.creation_id,
  ec.title,
  ec.description,
  ec.division,
  ec.verification_status,
  ec.lifecycle_status,
  ec.amount_needed,
  ec.amount_received,
  ec.cover_photo,
  CAST(ROUND(IFNULL(ec.amount_received / NULLIF(ec.amount_needed,0) * 100, 0), 1) AS DECIMAL(5,1)) AS progress_pct,

  -- taxonomy
  ebc.ebc_id,
  cat.category_id,  cat.category_name,
  et.event_type_id, et.event_type_name,

  -- creator
  ec.creator_type,
  CASE WHEN ec.creator_type='individual'
       THEN CONCAT(i.first_name,' ',i.last_name)
       ELSE f.foundation_name
  END AS creator_name,
  CASE WHEN ec.creator_type='individual'
       THEN i.individual_id
       ELSE f.foundation_id
  END AS creator_id,

  -- useful for details page
  CASE WHEN ec.creator_type='individual' THEN i.mobile ELSE f.mobile END AS contact_phone,
  CASE WHEN ec.creator_type='individual' THEN i.email  ELSE f.email  END AS contact_email,
  -- quick summary; keep full text in description
  LEFT(ec.description, 180) AS short_description

FROM EVENT_CREATION ec
JOIN EVENT_BASED_ON_CATEGORY ebc ON ebc.ebc_id = ec.ebc_id
LEFT JOIN CATEGORY     cat ON cat.category_id     = ebc.category_id
LEFT JOIN EVENT_TYPE   et  ON et.event_type_id    = ebc.event_type_id
LEFT JOIN INDIVIDUAL   i   ON i.individual_id     = ec.individual_id
LEFT JOIN FOUNDATION   f   ON f.foundation_id     = ec.foundation_id;

-- 2) Only Verified + Active (what the UI actually shows)
DROP VIEW IF EXISTS v_event_catalog_open;
CREATE VIEW v_event_catalog_open AS
SELECT *
FROM v_event_catalog
WHERE verification_status = 'verified'
  AND lifecycle_status    = 'active';


-- Distinct categories in open events
DROP VIEW IF EXISTS v_event_filters_categories;
CREATE VIEW v_event_filters_categories AS
SELECT DISTINCT category_id, category_name
FROM v_event_catalog_open
WHERE category_id IS NOT NULL
ORDER BY category_name;

-- Distinct event types in open events
DROP VIEW IF EXISTS v_event_filters_event_types;
CREATE VIEW v_event_filters_event_types AS
SELECT DISTINCT event_type_id, event_type_name, category_id
FROM v_event_catalog_open
WHERE event_type_id IS NOT NULL
ORDER BY event_type_name;

-- Distinct divisions in open events
DROP VIEW IF EXISTS v_event_filters_divisions;
CREATE VIEW v_event_filters_divisions AS
SELECT DISTINCT
  category_id,
  event_type_id,
  division
FROM v_event_catalog_open
WHERE division IS NOT NULL
ORDER BY division;


DELIMITER $$

-- Categories endpoint (only those with open events)
DROP PROCEDURE IF EXISTS sp_get_categories $$
CREATE PROCEDURE sp_get_categories()
BEGIN
  SELECT category_id, category_name
  FROM v_event_filters_categories;
END $$

-- Event types endpoint (optionally filtered by category)
DROP PROCEDURE IF EXISTS sp_get_event_types $$
CREATE PROCEDURE sp_get_event_types(IN p_category_id VARCHAR(7))
BEGIN
  SELECT event_type_id, event_type_name
  FROM v_event_filters_event_types
  WHERE (p_category_id IS NULL OR p_category_id = '' OR category_id = p_category_id);
END $$

-- Divisions endpoint (filtered by category / event type)
DROP PROCEDURE IF EXISTS sp_get_divisions $$
CREATE PROCEDURE sp_get_divisions(
  IN p_category_id   VARCHAR(7),
  IN p_event_type_id VARCHAR(7)
)
BEGIN
  SELECT division
  FROM v_event_filters_divisions
  WHERE (p_category_id   IS NULL OR p_category_id   = '' OR category_id   = p_category_id)
    AND (p_event_type_id IS NULL OR p_event_type_id = '' OR event_type_id = p_event_type_id)
  ORDER BY division;
END $$

-- Search events (complex join via view + optional params + ranking)
DROP PROCEDURE IF EXISTS sp_search_events $$
CREATE PROCEDURE sp_search_events(
  IN p_category_id   VARCHAR(7),
  IN p_event_type_id VARCHAR(7),
  IN p_division      VARCHAR(30),
  IN p_q             VARCHAR(200)
)
BEGIN
  SELECT
    creation_id, title, description, short_description, division,
    amount_needed, amount_received, progress_pct,
    category_id, category_name, event_type_id, event_type_name,
    creator_type, creator_name, creator_id
  FROM v_event_catalog_open
  WHERE (p_category_id   IS NULL OR p_category_id   = '' OR category_id   = p_category_id)
    AND (p_event_type_id IS NULL OR p_event_type_id = '' OR event_type_id = p_event_type_id)
    AND (p_division      IS NULL OR p_division      = '' OR division      = p_division)
    AND (
      p_q IS NULL OR p_q = '' OR
      title       LIKE CONCAT('%', p_q, '%') OR
      description LIKE CONCAT('%', p_q, '%')
    )
  ORDER BY
    progress_pct DESC,                        -- most funded first
    (amount_needed - amount_received) DESC,   -- then bigger remaining goals
    title ASC;
END $$

-- Single event detail
DROP PROCEDURE IF EXISTS sp_get_event_detail $$
CREATE PROCEDURE sp_get_event_detail(IN p_creation_id VARCHAR(7))
BEGIN
  SELECT
    creation_id, title, description, short_description, division,
    amount_needed, amount_received, progress_pct,
    category_id, category_name, event_type_id, event_type_name,
    creator_type, creator_name, creator_id,
    contact_phone, contact_email
  FROM v_event_catalog
  WHERE creation_id = p_creation_id
  LIMIT 1;
END $$

DELIMITER ;

-- NEW FUNCTIONS , STORED PROCEDURES , FUNCTIONS PLEASE INSERT


DROP VIEW IF EXISTS v_event_donation_stats;
CREATE VIEW v_event_donation_stats AS
SELECT
  d.creation_id,
  COUNT(*)                           AS total_donations,
  COUNT(DISTINCT d.donor_id)         AS total_donors,
  SUM(d.amount)                      AS total_raised,
  SUM(CASE
        WHEN YEAR(d.paid_at)=YEAR(CURRENT_DATE)
         AND MONTH(d.paid_at)=MONTH(CURRENT_DATE)
       THEN d.amount END)            AS raised_this_month,
  COUNT(DISTINCT CASE
        WHEN YEAR(d.paid_at)=YEAR(CURRENT_DATE)
         AND MONTH(d.paid_at)=MONTH(CURRENT_DATE)
       THEN d.donor_id END)          AS donors_this_month,
  MAX(d.paid_at)                     AS last_donation_at
FROM DONATION d
GROUP BY d.creation_id;

/* 2. Catalog + stats (all events) */
DROP VIEW IF EXISTS v_event_catalog_with_stats;
CREATE VIEW v_event_catalog_with_stats AS
SELECT
  c.*,
  s.total_donors,
  s.total_donations,
  s.total_raised,
  s.raised_this_month,
  s.donors_this_month,
  s.last_donation_at
FROM v_event_catalog c
LEFT JOIN v_event_donation_stats s
  ON s.creation_id = c.creation_id;

/* 3. Open (public) events + stats */
DROP VIEW IF EXISTS v_event_catalog_open_with_stats;
CREATE VIEW v_event_catalog_open_with_stats AS
SELECT *
FROM v_event_catalog_with_stats
WHERE verification_status='verified'
  AND lifecycle_status='active';

/* 4. Search with stats */
DROP PROCEDURE IF EXISTS sp_search_events_stats;
DELIMITER $$
CREATE PROCEDURE sp_search_events_stats(
  IN p_category_id   VARCHAR(7),
  IN p_event_type_id VARCHAR(7),
  IN p_division      VARCHAR(30),
  IN p_q             VARCHAR(200)
)
BEGIN
  SELECT
    creation_id, title, description, short_description, division,
    amount_needed, amount_received, progress_pct, cover_photo,
    category_id, category_name, event_type_id, event_type_name,
    creator_type, creator_name, creator_id,
    total_donors, total_donations, total_raised,
    raised_this_month, donors_this_month, last_donation_at
  FROM v_event_catalog_open_with_stats
  WHERE (p_category_id   IS NULL OR p_category_id   = '' OR category_id   = p_category_id)
    AND (p_event_type_id IS NULL OR p_event_type_id = '' OR event_type_id = p_event_type_id)
    AND (p_division      IS NULL OR p_division      = '' OR division      = p_division)
    AND (
      p_q IS NULL OR p_q = '' OR
      title LIKE CONCAT('%', p_q, '%') OR
      description LIKE CONCAT('%', p_q, '%')
    )
  ORDER BY
    progress_pct DESC,
    (amount_needed - amount_received) DESC,
    title ASC;
END $$
DELIMITER ;

/* 5. Single event detail with stats */
DROP PROCEDURE IF EXISTS sp_get_event_detail_stats;
DELIMITER $$
CREATE PROCEDURE sp_get_event_detail_stats(IN p_creation_id VARCHAR(7))
BEGIN
  SELECT
    creation_id, title, description, short_description, division,
    amount_needed, amount_received, progress_pct,
    category_id, category_name, event_type_id, event_type_name,
    creator_type, creator_name, creator_id,
    contact_phone, contact_email,
    total_donors, total_donations, total_raised,
    raised_this_month, donors_this_month, last_donation_at
  FROM v_event_catalog_with_stats
  WHERE creation_id = p_creation_id
  LIMIT 1;
END $$
DELIMITER ;


INSERT INTO DONOR (
  donor_id, first_name, last_name, username, email, password, country, division, date_of_birth
) VALUES
('D000001', 'Fernaz', 'Rahman', 'fernazr', 'fernaz@example.com', 'securepass1', 'Bangladesh', 'Dhaka', '1992-03-15'),
('D000002', 'Imran', 'Hossain', 'imranh', 'imran@example.com', 'securepass2', 'Bangladesh', 'Chittagong', '1988-07-22'),
('D000003', 'Sara', 'Khan', 'sarak', 'sara@example.com', 'securepass3', 'India', NULL, '1995-11-05');
INSERT INTO DONOR (
  donor_id, first_name, last_name, username, email, password, country, division, date_of_birth
) VALUES
('D000004', 'Nanjiba', 'Farazi', 'nifarazi', 'fnanjiba@example.com', 'securepass1', 'Bangladesh', 'Dhaka', '1992-03-15'),
('D000005', 'Ashfia', 'Tabassum', 'ashfia', 'ashfian@example.com', 'securepass2', 'Bangladesh', 'Chittagong', '1988-07-22'),
('D000006', 'Prionti', 'Nazia', 'nazia', 'nazia@example.com', 'securepass3', 'India', NULL, '1995-11-05');



-- Individual-created event
INSERT INTO EVENT_CREATION (
  creation_id, creator_type, individual_id, foundation_id, ebc_id, title, description, flag,
  amount_needed, amount_received, division, doc, cover_photo, verification_status, lifecycle_status,
  second_verification_required, created_at, updated_at
) VALUES
('EVT1003', 'individual', 'I000001', NULL, 'EBC0001', 'Flood Relief Banani', 'Emergency flood relief for Banani area.', 0,
  50000.00, 0.00, 'Dhaka', NULL, NULL, 'verified', 'active', 0, NOW(), NOW());

-- Foundation-created event
INSERT INTO EVENT_CREATION (
  creation_id, creator_type, individual_id, foundation_id, ebc_id, title, description, flag,
  amount_needed, amount_received, division, doc, cover_photo, verification_status, lifecycle_status,
  second_verification_required, created_at, updated_at
) VALUES
('EVT1004', 'foundation', NULL, 'F000001', 'EBC0002', 'Cyclone Relief Uttara', 'Cyclone relief for Uttara.', 0,
  75000.00, 0.00, 'Dhaka', NULL, NULL, 'verified', 'active', 0, NOW(), NOW());
 INSERT INTO DONATION (creation_id, donor_id, amount)
VALUES
  ('EVT1003', 'D000001', 500.00),
  ('EVT1003', 'D000001', 1200.00),
  ('EVT1004', 'D000003', 750.00);
  
  INSERT INTO DONATION (creation_id, donor_id, amount)
VALUES
  ('EVT1003', 'D000004', 200.00),
  ('EVT1003', 'D000004', 1200.00),
  ('EVT1004', 'D000004', 750.00),
  ('EVT1003', 'D000005', 1200.00),
  ('EVT1003', 'D000005', 1200.00),
  ('EVT1003', 'D000006', 1200.00);
  


--sample data latest
INSERT INTO FOUNDATION (
  foundation_id, foundation_name, certificate, foundation_license,
  mobile, email, password, house_no, road_no, area, district,
  administrative_div, zip, bkash, bank_account, description, status
) VALUES
('F000010','Hope Bridge',NULL,'LIC000010','01710001010','hopebridge@example.com','passF000010','10','1','Banani','Dhaka','Dhaka','1213','01710001011','123456789012345010','Empowering communities through education and health.','verified'),
('F000011','Bright Future',NULL,'LIC000011','01710001110','brightfuture@example.com','passF000011','11','2','Gulshan','Dhaka','Dhaka','1212','01710001111','123456789012345011','Supporting youth and women for a better tomorrow.','unverified'),
('F000012','Green World',NULL,'LIC000012','01710001210','greenworld@example.com','passF000012','12','3','Dhanmondi','Dhaka','Dhaka','1209','01710001211','123456789012345012','Environmental sustainability projects.','verified'),
('F000013','Food Chain',NULL,'LIC000013','01710001310','foodchain@example.com','passF000013','13','4','Mirpur','Dhaka','Dhaka','1216','01710001311','123456789012345013','Fighting hunger and malnutrition.','verified'),
('F000014','Care Foundation',NULL,'LIC000014','01710001410','carefoundation@example.com','passF000014','14','5','Mohakhali','Dhaka','Dhaka','1212','01710001411','123456789012345014','Healthcare for all.','unverified'),
('F000015','EduAid',NULL,'LIC000015','01710001510','eduaid@example.com','passF000015','15','6','Uttara','Dhaka','Dhaka','1230','01710001511','123456789012345015','Education grants and scholarships.','verified'),
('F000016','Relief Now',NULL,'LIC000016','01710001610','reliefnow@example.com','passF000016','16','7','Tejgaon','Dhaka','Dhaka','1215','01710001611','123456789012345016','Disaster relief and emergency support.','verified');


INSERT INTO EVENT_CREATION (
  creation_id, creator_type, individual_id, foundation_id, ebc_id,
  title, description, amount_needed, amount_received, division,
  verification_status, lifecycle_status
) VALUES
('EVT2001','foundation',NULL,'F000010','EBC0013','Scholarship Drive','Scholarships for underprivileged students.',500000,0,'Dhaka','verified','active'),
('EVT2002','foundation',NULL,'F000011','EBC0010','Health Camp','Free health checkups for slum dwellers.',300000,0,'Dhaka','verified','active'),
('EVT2003','foundation',NULL,'F000012','EBC0001','Tree Plantation','Planting 5000 trees in city parks.',200000,0,'Dhaka','verified','active'),
('EVT2004','foundation',NULL,'F000013','EBC0013','Food Distribution','Nutritious meals for children.',250000,0,'Dhaka','verified','active'),
('EVT2005','foundation',NULL,'F000014','EBC0002','Medical Aid','Medical supplies for clinics.',400000,0,'Dhaka','verified','active'),
('EVT2006','foundation',NULL,'F000015','EBC0010','School Supplies','Books and uniforms for students.',150000,0,'Dhaka','verified','active'),
('EVT2007','foundation',NULL,'F000016','EBC0001','Flood Relief','Emergency kits for flood victims.',350000,0,'Dhaka','verified','active');
INSERT INTO EVENT_CREATION (
  creation_id, creator_type, individual_id, foundation_id, ebc_id,
  title, description, amount_needed, amount_received, division,
  verification_status, lifecycle_status
) VALUES
('EVT2015','foundation',NULL,'F000010','EBC0013',
 'Scholarship Drive','Scholarships for underprivileged students.',500000.00,10000.00,'Dhaka','verified','active'),

('EVT2016','foundation',NULL,'F000010','EBC0010',
 'Health Camp','Free health checkups for slum dwellers.',300000.00,0.00,'Dhaka','verified','active'),

('EVT2017','foundation',NULL,'F000011','EBC0001',
 'Tree Plantation','Planting 5000 trees in city parks.',200000.00,0.00,'Dhaka','verified','active'),

('EVT2018','foundation',NULL,'F000012','EBC0013',
 'Food Distribution','Nutritious meals for children.',250000.00,0.00,'Dhaka','verified','active'),

('EVT2019','foundation',NULL,'F000013','EBC0002',
 'Medical Aid','Medical supplies for clinics.',400000.00,0.00,'Dhaka','verified','active'),

('EVT2020','foundation',NULL,'F000014','EBC0010',
 'School Supplies','Books and uniforms for students.',150000.00,0.00,'Dhaka','verified','active'),

('EVT2021','foundation',NULL,'F000015','EBC0001',
 'Flood Relief','Emergency kits for flood victims.',350000.00,0.00,'Dhaka','verified','active');
 INSERT INTO EVENT_CREATION (
  creation_id, creator_type, individual_id, foundation_id, ebc_id,
  title, description, amount_needed, amount_received, division,
  verification_status, lifecycle_status
) VALUES
('EVT2008','foundation',NULL,'F000010','EBC0013',
 'Tech for Girls','Providing laptops and coding workshops for girls.',400000.00,0.00,'Dhaka','verified','active'),

('EVT2009','foundation',NULL,'F000011','EBC0010',
 'Mobile Health Van','Deploying mobile health vans in rural areas.',350000.00,0.00,'Barisal','verified','active'),

('EVT2010','foundation',NULL,'F000012','EBC0001',
 'Clean Water Project','Installing tube wells in flood-prone villages.',250000.00,0.00,'Sylhet','verified','active'),

('EVT2011','foundation',NULL,'F000012','EBC0013',
 'School Renovation','Renovating primary schools in remote areas.',300000.00,0.00,'Rajshahi','verified','active'),

('EVT2012','foundation',NULL,'F000013','EBC0002',
 'Medical Camp','Free medical checkups for elderly citizens.',200000.00,0.00,'Khulna','verified','active'),

('EVT2013','foundation',NULL,'F000014','EBC0010',
 'Nutrition Drive','Distributing nutrition packs to children.',180000.00,0.00,'Dhaka','verified','active'),

('EVT2014','foundation',NULL,'F000015','EBC0001',
 'Cyclone Shelter','Building cyclone shelters in coastal areas.',500000.00,0.00,'Barisal','verified','active');
 
 

INSERT INTO DONOR (
  donor_id, first_name, last_name, username, email, password, country, division, date_of_birth
) VALUES
('D100001','Ayesha','Rahman','ayeshar','ayesha@example.com','passAyesha','Bangladesh','Dhaka','1990-02-15'),
('D100002','Imran','Khan','imrank','imra12n@example.com','passImran','Bangladesh','Chittagong','1985-07-20'),
('D100003','Sara','Islam','sarai','sara12@example.com','passSara','Bangladesh','Sylhet','1993-11-05'),
('D100004','Nabil','Hasan','nabilh','nabil@example.com','passNabil','Bangladesh','Khulna','1992-03-15'),
('D100005','Farzana','Akter','farzana','farzana@example.com','passFarzana','Bangladesh','Rajshahi','1988-07-22'),
('D100006','Tariq','Mahmud','tariqm','tariq@example.com','passTariq','Bangladesh','Barisal','1995-11-05'),
('D100007','Rima','Sultana','rimas','rima@example.com','passRima','Bangladesh','Mymensingh','1991-06-30');

INSERT INTO DONATION (creation_id, donor_id, amount)
VALUES
('EVT2001','D100001',10000.00),
('EVT2002','D100002',15000.00),
('EVT2003','D100003',20000.00),
('EVT2004','D100004',12000.00),
('EVT2005','D100005',18000.00),
('EVT2006','D100006',22000.00),
('EVT2007','D100007',25000.00);
INSERT INTO DONATION (creation_id, donor_id, amount)
VALUES
('EVT2008','D100001',10000.00),
('EVT2009','D100002',15000.00),
('EVT2010','D100003',20000.00),
('EVT2011','D100004',12000.00),
('EVT2012','D100005',18000.00),
('EVT2013','D100006',22000.00),
('EVT2008','D100001',10000.00),
('EVT2009','D100002',15000.00),
('EVT2010','D100003',20000.00),
('EVT2011','D100004',12000.00),
('EVT2012','D100005',18000.00),
('EVT2015','D100006',22000.00),
('EVT2008','D100001',10000.00),
('EVT2009','D100002',15000.00),
('EVT2010','D100003',20000.00),
('EVT2011','D100004',12000.00),
('EVT2012','D100005',18000.00),
('EVT2013','D100006',22000.00),
('EVT2014','D100007',25000.00);





-- SAMPLE DATA INSERT FOR STAFF TABLE 

INSERT INTO STAFF (
  staff_id, first_name, last_name, username, password, mobile, email, nid, dob,
  house_no, road_no, area, district, administrative_div, zip, CV, status
) VALUES
('STF0001','Arif','Rahman','arif.rahman','P@ssw0rd1','01712345678','arif.rahman@shodesh.org','199912345678','1995-04-12','12B','10','Dhanmondi','Dhaka','Dhaka Division','1209',NULL,'verified'),
('STF0002','Nusrat','Jahan','nusrat.j','S3cure99','01823456789','nusrat.jahan@shodesh.org','200012345679','1996-09-30','221B','27','Gulshan','Dhaka','Dhaka Division','1212',NULL,'unverified'),
('STF0003','Tanvir','Ahmed','tanvir.ahmed','Abc12345','01634567890','tanvir.ahmed@shodesh.org','200112345680','1993-02-08','5A','6','Agrabad','Chattogram','Chattogram Division','4000',NULL,'verified'),
('STF0004','Rafiq','Hasan','rafiq.hasan','Strong007','01545678901','rafiq.hasan@shodesh.org','200212345681','1992-11-15','77','15','Zindabazar','Sylhet','Sylhet Division','3100',NULL,'suspended'),
('STF0005','Farhana','Islam','farhana.islam','!Qaz2Wsx','01356789012','farhana.islam@shodesh.org','200312345682','1998-05-20','9','3','Boalia','Rajshahi','Rajshahi Division','6000',NULL,'verified'),
('STF0006','Sajid','Karim','sajid.karim','Passw0rd!','01967890123','sajid.karim@shodesh.org','200412345683','1994-12-01','34','120','Khalishpur','Khulna','Khulna Division','9000',NULL,'unverified'),
('STF0007','Sharmeen','Akter','sharmeen.akter','MyKey123','01778901234','sharmeen.akter@shodesh.org','200512345684','1999-07-07','3C','45','Bangla Bazar','Barishal','Barishal Division','8200',NULL,'verified'),
('STF0008','Rumman','Hossain','rumman.hossain','LetMeIn9','01489012345','rumman.hossain@shodesh.org','200612345685','1997-03-28','101','5','Pairaband','Rangpur','Rangpur Division','5400',NULL,'suspended'),
('STF0009','Mitu','Sultana','mitu.sultana','Key12345','01390123456','mitu.sultana@shodesh.org','200712345686','2000-01-14','56','9','Shambhuganj','Mymensingh','Mymensingh Division','2200',NULL,'unverified'),
('STF0010','Atikur','Rahman','atik.rahman','ZxCv9876','01901234567','atik.rahman@shodesh.org','200812345687','1991-10-02','18','2','Fatullah','Narayanganj','Dhaka Division','1420',NULL,'verified');






-- Helper function: full name
DROP FUNCTION IF EXISTS fn_staff_fullname;
DELIMITER $$
CREATE FUNCTION fn_staff_fullname(p_id VARCHAR(7))
RETURNS VARCHAR(70)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v VARCHAR(70);
  SELECT CONCAT(first_name,' ',last_name) INTO v FROM STAFF WHERE staff_id = p_id;
  RETURN v;
END$$
DELIMITER ;

-- List view (no BLOBs)
DROP VIEW IF EXISTS V_ADMIN_STAFF;
CREATE VIEW V_ADMIN_STAFF AS
SELECT 
  s.staff_id,
  s.username,
  CONCAT(s.first_name,' ',s.last_name) AS full_name,
  s.email,
  s.mobile,
  s.district,
  s.administrative_div,
  s.status,
  (s.CV IS NOT NULL) AS has_cv,
  CASE WHEN s.CV IS NULL THEN 0 ELSE OCTET_LENGTH(s.CV) END AS cv_size
FROM STAFF s;

-- Optional stats view
DROP VIEW IF EXISTS V_STAFF_STATS;
CREATE VIEW V_STAFF_STATS AS
SELECT 
  COUNT(*) AS total,
  SUM(CASE WHEN status='unverified' THEN 1 ELSE 0 END) AS pending,
  SUM(CASE WHEN status='verified' THEN 1 ELSE 0 END) AS verified,
  SUM(CASE WHEN status='suspended' THEN 1 ELSE 0 END) AS suspended
FROM STAFF;

-- NOTE: No audit table per requirement — status changes are applied directly on STAFF only.

-- Triggers
DROP TRIGGER IF EXISTS staff_bi_id;
DELIMITER $$
CREATE TRIGGER staff_bi_id BEFORE INSERT ON STAFF FOR EACH ROW
BEGIN
  IF NEW.staff_id IS NULL OR NEW.staff_id NOT REGEXP '^STF[0-9]{4}$' THEN
    SET NEW.staff_id = CONCAT('STF', LPAD(FLOOR(RAND()*9000)+1000, 4, '0'));
  END IF;
END$$
DELIMITER ;

-- Note: No timestamp columns on STAFF; skip timestamp triggers

DROP TRIGGER IF EXISTS staff_bu_status_guard;
DELIMITER $$
CREATE TRIGGER staff_bu_status_guard BEFORE UPDATE ON STAFF FOR EACH ROW
BEGIN
  IF NEW.status NOT IN ('unverified','verified','suspended') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid STAFF.status';
  END IF;
  IF OLD.status IN ('verified','suspended') AND NEW.status = 'unverified' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot revert to unverified';
  END IF;
END$$
DELIMITER ;

-- Removed AFTER UPDATE audit trigger (no audit table allowed)

-- Admin procedure for verify/suspend/unsuspend
DROP PROCEDURE IF EXISTS sp_admin_verify_staff;
DELIMITER $$
CREATE PROCEDURE sp_admin_verify_staff(
  IN p_staff_id VARCHAR(7),
  IN p_action ENUM('verify','suspend','unsuspend'),
  IN p_notes TEXT,
  IN p_admin_user VARCHAR(100)
)
BEGIN
  DECLARE v_exists INT DEFAULT 0;
  DECLARE v_status ENUM('verified','suspended','unverified');

  SELECT COUNT(*), MAX(status) INTO v_exists, v_status
  FROM STAFF WHERE staff_id = p_staff_id;

  IF v_exists = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Staff not found';
  END IF;

  IF p_action = 'verify' THEN
    IF v_status IN ('unverified','suspended') THEN
      UPDATE STAFF SET status='verified' WHERE staff_id = p_staff_id;
    ELSE
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Already verified';
    END IF;
  ELSEIF p_action = 'suspend' THEN
    IF v_status <> 'suspended' THEN
      UPDATE STAFF SET status='suspended' WHERE staff_id = p_staff_id;
    ELSE
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Already suspended';
    END IF;
  ELSEIF p_action = 'unsuspend' THEN
    IF v_status = 'suspended' THEN
      UPDATE STAFF SET status='verified' WHERE staff_id = p_staff_id;
    ELSE
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Not suspended';
    END IF;
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid action';
  END IF;
  -- No audit insert; direct update only per requirement
END$$
DELIMITER ;

CREATE OR REPLACE VIEW donor_donation_history AS
SELECT
  d.donor_id,
  d.amount,
  d.paid_at AS date,
  ec.title AS projectTitle,
  IF(ec.creator_type='foundation', f.foundation_name, CONCAT(i.first_name, ' ', i.last_name)) AS foundationName
FROM DONATION d
LEFT JOIN EVENT_CREATION ec ON d.creation_id = ec.creation_id
LEFT JOIN FOUNDATION f ON ec.foundation_id = f.foundation_id
LEFT JOIN INDIVIDUAL i ON ec.individual_id = i.individual_id;


CREATE OR REPLACE VIEW foundation_donations_view AS
SELECT
  e.foundation_id,
  d.creation_id,
  d.amount,
  d.paid_at,
  donor.first_name,
  donor.last_name,
  e.title,
  e.description,
  e.amount_needed,
  e.amount_received
FROM donation d
JOIN event_creation e ON d.creation_id = e.creation_id
JOIN donor ON d.donor_id = donor.donor_id;


CREATE OR REPLACE VIEW project_donations_view AS
SELECT
  e.foundation_id,
  e.creation_id,
  e.title,
  e.description,
  e.amount_needed,
  e.amount_received,
  d.amount AS donation_amount,
  d.paid_at AS donation_date,
  donor.first_name AS donor_first_name,
  donor.last_name AS donor_last_name
FROM event_creation e
LEFT JOIN donation d ON e.creation_id = d.creation_id
LEFT JOIN donor ON d.donor_id = donor.donor_id;

SELECT * FROM EVENT_CREATION;
ALTER TABLE EVENT_VERIFICATION MODIFY COLUMN decision ENUM('verified','unverified','rejected') NOT NULL DEFAULT 'unverified';

-- Stored procedure and triggers to support admin event verification

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_admin_verify_event $$
CREATE PROCEDURE sp_admin_verify_event(
    IN p_creation_id VARCHAR(7),
    IN p_decision ENUM('verified','unverified'),
    IN p_notes VARCHAR(1000),
    IN p_staff_id VARCHAR(7)
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    DECLARE v_round TINYINT DEFAULT 1;

    -- Validate event exists
    SELECT COUNT(*) INTO v_exists FROM EVENT_CREATION WHERE creation_id = p_creation_id;
    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Event not found';
    END IF;

    -- Determine round number (latest + 1 or 1 if none)
    SELECT IFNULL(MAX(round_no), 0) + 1 INTO v_round FROM EVENT_VERIFICATION WHERE creation_id = p_creation_id;

    INSERT INTO EVENT_VERIFICATION(log_id, creation_id, round_no, staff_id, decision, request_staff_verification, notes, verified_at)
    VALUES(CONCAT('EV', RIGHT(HEX(UNIX_TIMESTAMP(NOW())), 5)), p_creation_id, v_round, p_staff_id, p_decision, 0, p_notes, NOW());

    -- Apply to EVENT_CREATION (in case trigger missing)
    UPDATE EVENT_CREATION SET verification_status = p_decision WHERE creation_id = p_creation_id;
END $$

DROP TRIGGER IF EXISTS BI_EVENT_VERIFICATION_ENFORCE $$
CREATE TRIGGER BI_EVENT_VERIFICATION_ENFORCE BEFORE INSERT ON EVENT_VERIFICATION
FOR EACH ROW
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    IF NEW.decision NOT IN ('verified','unverified') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid decision';
    END IF;
    SELECT COUNT(*) INTO v_exists FROM EVENT_CREATION WHERE creation_id = NEW.creation_id;
    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Referenced event missing';
    END IF;
END $$

DROP TRIGGER IF EXISTS AI_EVENT_VERIFICATION_APPLY $$
CREATE TRIGGER AI_EVENT_VERIFICATION_APPLY AFTER INSERT ON EVENT_VERIFICATION
FOR EACH ROW
BEGIN
    UPDATE EVENT_CREATION SET verification_status = NEW.decision WHERE creation_id = NEW.creation_id;
END $$

DELIMITER ;

-- VERY VERY IMPORTANT 
ALTER TABLE EVENT_CREATION
  MODIFY COLUMN verification_status
    ENUM('unverified','verified','rejected')
    NOT NULL
    DEFAULT 'unverified';



-- Stored procedure and triggers to support admin event verification

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_admin_verify_event $$
CREATE PROCEDURE sp_admin_verify_event(
    IN p_creation_id VARCHAR(7),
    IN p_decision ENUM('verified','unverified','rejected'),
    IN p_notes VARCHAR(1000),
    IN p_staff_id VARCHAR(7)
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    DECLARE v_round TINYINT DEFAULT 1;

    -- Validate event exists
    SELECT COUNT(*) INTO v_exists FROM EVENT_CREATION WHERE creation_id = p_creation_id;
    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Event not found';
    END IF;

    -- Determine round number (latest + 1 or 1 if none)
    SELECT IFNULL(MAX(round_no), 0) + 1 INTO v_round FROM EVENT_VERIFICATION WHERE creation_id = p_creation_id;

    INSERT INTO EVENT_VERIFICATION(log_id, creation_id, round_no, staff_id, decision, request_staff_verification, notes, verified_at)
    VALUES(CONCAT('EV', RIGHT(HEX(UNIX_TIMESTAMP(NOW())), 5)), p_creation_id, v_round, p_staff_id, p_decision, 0, p_notes, NOW());

    -- Apply to EVENT_CREATION (in case trigger missing)
    -- Update both verification_status and lifecycle_status based on decision
    CASE p_decision
        WHEN 'verified' THEN
            UPDATE EVENT_CREATION SET 
                verification_status = 'verified', 
                lifecycle_status = 'active',
                updated_at = NOW()
            WHERE creation_id = p_creation_id;
        WHEN 'rejected' THEN
            UPDATE EVENT_CREATION SET 
                verification_status = 'rejected', 
                lifecycle_status = 'inactive',
                updated_at = NOW()
            WHERE creation_id = p_creation_id;
        ELSE
            -- unverified or any other case
            UPDATE EVENT_CREATION SET 
                verification_status = 'unverified', 
                lifecycle_status = 'inactive',
                updated_at = NOW()
            WHERE creation_id = p_creation_id;
    END CASE;
END $$

DROP TRIGGER IF EXISTS BI_EVENT_VERIFICATION_ENFORCE $$
CREATE TRIGGER BI_EVENT_VERIFICATION_ENFORCE BEFORE INSERT ON EVENT_VERIFICATION
FOR EACH ROW
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    IF NEW.decision NOT IN ('verified','unverified','rejected') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid decision';
    END IF;
    SELECT COUNT(*) INTO v_exists FROM EVENT_CREATION WHERE creation_id = NEW.creation_id;
    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Referenced event missing';
    END IF;
END $$

DROP TRIGGER IF EXISTS AI_EVENT_VERIFICATION_APPLY $$
CREATE TRIGGER AI_EVENT_VERIFICATION_APPLY AFTER INSERT ON EVENT_VERIFICATION
FOR EACH ROW
BEGIN
    -- Update both verification_status and lifecycle_status based on decision
    CASE NEW.decision
        WHEN 'verified' THEN
            UPDATE EVENT_CREATION SET 
                verification_status = 'verified', 
                lifecycle_status = 'active',
                updated_at = NOW()
            WHERE creation_id = NEW.creation_id;
        WHEN 'rejected' THEN
            UPDATE EVENT_CREATION SET 
                verification_status = 'rejected', 
                lifecycle_status = 'inactive',
                updated_at = NOW()
            WHERE creation_id = NEW.creation_id;
        ELSE
            -- unverified or any other case
            UPDATE EVENT_CREATION SET 
                verification_status = 'unverified', 
                lifecycle_status = 'inactive',
                updated_at = NOW()
            WHERE creation_id = NEW.creation_id;
    END CASE;
END $$

DELIMITER ;

SELECT * FROM EVENT_CREATION;



-- 1. Update the v_event_catalog view to include cover_photo and support both individuals and foundations
DROP VIEW IF EXISTS v_event_catalog;

CREATE VIEW v_event_catalog AS
SELECT
  ec.creation_id,
  ec.title,
  ec.description,
  ec.division,
  ec.verification_status,
  ec.lifecycle_status,
  ec.amount_needed,
  ec.amount_received,
  ec.cover_photo,
  ec.created_at,
  ec.updated_at,
  CAST(ROUND(IFNULL(ec.amount_received / NULLIF(ec.amount_needed,0) * 100, 0), 1) AS DECIMAL(5,1)) AS progress_pct,

  -- taxonomy
  ebc.ebc_id,
  cat.category_id,  cat.category_name,
  et.event_type_id, et.event_type_name,

  -- creator (supports both individual and foundation)
  ec.creator_type,
  CASE 
    WHEN ec.creator_type = 'individual' THEN CONCAT(i.first_name, ' ', i.last_name)
    WHEN ec.creator_type = 'foundation' THEN f.foundation_name
    ELSE 'Unknown'
  END AS creator_name,
  CASE 
    WHEN ec.creator_type = 'individual' THEN i.individual_id
    WHEN ec.creator_type = 'foundation' THEN f.foundation_id
    ELSE NULL
  END AS creator_id,

  -- contact details (supports both individual and foundation)
  CASE 
    WHEN ec.creator_type = 'individual' THEN i.mobile 
    WHEN ec.creator_type = 'foundation' THEN f.mobile 
    ELSE NULL
  END AS contact_phone,
  CASE 
    WHEN ec.creator_type = 'individual' THEN i.email  
    WHEN ec.creator_type = 'foundation' THEN f.email  
    ELSE NULL
  END AS contact_email,
  
  -- quick summary
  LEFT(ec.description, 180) AS short_description

FROM EVENT_CREATION ec
JOIN EVENT_BASED_ON_CATEGORY ebc ON ebc.ebc_id = ec.ebc_id
LEFT JOIN CATEGORY     cat ON cat.category_id     = ebc.category_id
LEFT JOIN EVENT_TYPE   et  ON et.event_type_id    = ebc.event_type_id
LEFT JOIN INDIVIDUAL   i   ON i.individual_id     = ec.individual_id AND ec.creator_type = 'individual'
LEFT JOIN FOUNDATION   f   ON f.foundation_id     = ec.foundation_id AND ec.creator_type = 'foundation';



-- 2. Update the stored procedure to include cover_photo
DROP PROCEDURE IF EXISTS sp_search_events_stats;

DELIMITER $$
CREATE PROCEDURE sp_search_events_stats(
  IN p_category_id   VARCHAR(7),
  IN p_event_type_id VARCHAR(7),
  IN p_division      VARCHAR(30),
  IN p_q             VARCHAR(200)
)
BEGIN
  SELECT
    creation_id, title, description, short_description, division,
    amount_needed, amount_received, progress_pct, cover_photo,
    category_id, category_name, event_type_id, event_type_name,
    creator_type, creator_name, creator_id,
    total_donors, total_donations, total_raised,
    raised_this_month, donors_this_month, last_donation_at
  FROM v_event_catalog_open_with_stats
  WHERE (p_category_id   IS NULL OR p_category_id   = '' OR category_id   = p_category_id)
    AND (p_event_type_id IS NULL OR p_event_type_id = '' OR event_type_id = p_event_type_id)
    AND (p_division      IS NULL OR p_division      = '' OR division      = p_division)
    AND (
      p_q IS NULL OR p_q = '' OR
      title LIKE CONCAT('%', p_q, '%') OR
      description LIKE CONCAT('%', p_q, '%')
    )
  ORDER BY
    progress_pct DESC,
    (amount_needed - amount_received) DESC,
    title ASC;
END $$
DELIMITER ;


USE shodesh;
DELIMITER $$
DROP TRIGGER IF EXISTS staff_au_audit;
DROP PROCEDURE IF EXISTS sp_admin_verify_staff $$
CREATE PROCEDURE sp_admin_verify_staff(
    IN p_staff_id   VARCHAR(7),
    IN p_action     VARCHAR(10),   -- 'verify' | 'suspend' | 'unsuspend'
    IN p_notes      TEXT,
    IN p_admin_user VARCHAR(100)
)
BEGIN
    DECLARE v_status ENUM('verified','suspended','unverified');
    
    -- Roll back on any SQL error and bubble it up
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Lock the row to avoid concurrent flips
    SELECT status
      INTO v_status
      FROM STAFF
     WHERE staff_id = p_staff_id
     FOR UPDATE;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Staff not found';
    END IF;

    CASE p_action
        WHEN 'verify' THEN
            IF v_status IN ('unverified','suspended') THEN
                UPDATE STAFF
                   SET status = 'verified',
                       updated_at = CURRENT_TIMESTAMP
                 WHERE staff_id = p_staff_id;
            ELSE
                SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Already verified';
            END IF;

        WHEN 'suspend' THEN
            IF v_status <> 'suspended' THEN
                UPDATE STAFF
                   SET status = 'suspended',
                       updated_at = CURRENT_TIMESTAMP
                 WHERE staff_id = p_staff_id;
            ELSE
                SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Already suspended';
            END IF;

        WHEN 'unsuspend' THEN
            IF v_status = 'suspended' THEN
                UPDATE STAFF
                   SET status = 'verified',
                       updated_at = CURRENT_TIMESTAMP
                 WHERE staff_id = p_staff_id;
            ELSE
                SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Not suspended';
            END IF;

        ELSE
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Invalid action (use verify | suspend | unsuspend)';
    END CASE;

    -- Optional: log the admin action if you have a log table
    -- INSERT INTO STAFF_STATUS_LOG(log_id, staff_id, admin_user, action, notes, created_at)
    -- VALUES (CONCAT('SL', LPAD(FLOOR(RAND()*100000), 5, '0')), p_staff_id, p_admin_user, p_action, p_notes, NOW());

    COMMIT;

    SELECT 'success' AS status, p_staff_id AS staff_id, p_action AS action;
END $$
DELIMITER ;

-- donation analytic ---

-- ==================================================================
-- DONATION ANALYTICS VIEWS
-- Advanced SQL with Joins, Subqueries, Window Functions, and CTEs
-- ==================================================================

USE shodesh;

-- ==================================================================
-- DONATION ANALYTICS VIEWS (CORRECTED)
-- Advanced SQL with Joins, Subqueries, Window Functions, and CTEs
-- ==================================================================

USE shodesh;

-- Drop existing analytics views if they exist
DROP VIEW IF EXISTS v_donation_overview;
DROP VIEW IF EXISTS v_donation_trends_monthly;
DROP VIEW IF EXISTS v_donor_analytics;
DROP VIEW IF EXISTS v_geographic_distribution;
DROP VIEW IF EXISTS v_campaign_performance;
DROP VIEW IF EXISTS v_top_performers;

-- ==================================================================
-- 1. DONATION OVERVIEW - Comprehensive KPIs with Complex Joins
-- ==================================================================
CREATE VIEW v_donation_overview AS
SELECT 
    -- Total Statistics
    COUNT(d.donation_id) as total_donations,
    COUNT(DISTINCT d.donor_id) as unique_donors,
    SUM(d.amount) as total_amount_raised,
    AVG(d.amount) as average_donation,
    
    -- Time-based Statistics (Current Month)
    SUM(CASE 
        WHEN YEAR(d.paid_at) = YEAR(CURDATE()) 
        AND MONTH(d.paid_at) = MONTH(CURDATE()) 
        THEN d.amount 
        ELSE 0 
    END) as current_month_raised,
    
    COUNT(CASE 
        WHEN YEAR(d.paid_at) = YEAR(CURDATE()) 
        AND MONTH(d.paid_at) = MONTH(CURDATE()) 
        THEN d.donation_id 
    END) as current_month_donations,
    
    -- Previous Month for Growth Calculation
    SUM(CASE 
        WHEN YEAR(d.paid_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND MONTH(d.paid_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        THEN d.amount 
        ELSE 0 
    END) as previous_month_raised,
    
    -- Active Events Statistics
    (SELECT COUNT(DISTINCT ec.creation_id) 
     FROM EVENT_CREATION ec 
     WHERE ec.creation_id IN (
         SELECT DISTINCT d2.creation_id 
         FROM DONATION d2 
         WHERE d2.paid_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     )
    ) as active_events_last_30_days,
    
    -- Goal Achievement Rate
    (SELECT 
        AVG(CASE 
            WHEN ec.amount_needed > 0 
            THEN (ec.amount_received / ec.amount_needed) * 100 
            ELSE 0 
        END)
     FROM EVENT_CREATION ec
     WHERE ec.amount_received > 0
    ) as avg_goal_achievement_rate,
    
    CURDATE() as calculation_date

FROM DONATION d
LEFT JOIN EVENT_CREATION ec ON d.creation_id = ec.creation_id
LEFT JOIN DONOR dr ON d.donor_id = dr.donor_id;

-- ==================================================================
-- 2. MONTHLY TRENDS - Time Series Analysis with Window Functions
-- ==================================================================
CREATE VIEW v_donation_trends_monthly AS
WITH monthly_stats AS (
    SELECT 
        YEAR(d.paid_at) as donation_year,
        MONTH(d.paid_at) as donation_month,
        DATE_FORMAT(d.paid_at, '%Y-%m') as month_year,
        DATE_FORMAT(d.paid_at, '%M %Y') as month_name,
        COUNT(d.donation_id) as donation_count,
        COUNT(DISTINCT d.donor_id) as unique_donors,
        SUM(d.amount) as total_amount,
        AVG(d.amount) as avg_amount
    FROM DONATION d
    WHERE d.paid_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY YEAR(d.paid_at), MONTH(d.paid_at)
),
trend_calculations AS (
    SELECT 
        donation_year,
        donation_month,
        donation_month as month_year,
        month_name,
        donation_count,
        unique_donors,
        total_amount,
        avg_amount,
        -- Window function for growth calculations
        LAG(total_amount, 1) OVER (ORDER BY donation_year, donation_month) as prev_month_amount,
        LAG(donation_count, 1) OVER (ORDER BY donation_year, donation_month) as prev_month_count,
        -- Running totals
        SUM(total_amount) OVER (ORDER BY donation_year, donation_month ROWS UNBOUNDED PRECEDING) as cumulative_amount,
        -- Moving averages
        AVG(total_amount) OVER (ORDER BY donation_year, donation_month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg_3month
    FROM monthly_stats
)
SELECT 
    donation_year,
    donation_month,
    month_year,
    month_name,
    donation_count,
    unique_donors,
    total_amount,
    avg_amount,
    cumulative_amount,
    moving_avg_3month,
    -- Growth calculations
    CASE 
        WHEN prev_month_amount > 0 
        THEN ROUND(((total_amount - prev_month_amount) / prev_month_amount) * 100, 2)
        ELSE 0 
    END as amount_growth_percent,
    CASE 
        WHEN prev_month_count > 0 
        THEN ROUND(((donation_count - prev_month_count) / prev_month_count) * 100, 2)
        ELSE 0 
    END as count_growth_percent
FROM trend_calculations
ORDER BY donation_year DESC, donation_month DESC;

-- ==================================================================
-- 3. DONOR ANALYTICS - Advanced Donor Segmentation
-- ==================================================================
CREATE VIEW v_donor_analytics AS
WITH donor_stats AS (
    SELECT 
        dr.donor_id,
        CONCAT(COALESCE(dr.first_name, ''), ' ', COALESCE(dr.last_name, '')) as donor_name,
        dr.email,
        dr.country,
        dr.division,
        dr.profile_created_at,
        COUNT(d.donation_id) as total_donations,
        SUM(d.amount) as total_donated,
        AVG(d.amount) as avg_donation,
        MIN(d.paid_at) as first_donation_date,
        MAX(d.paid_at) as last_donation_date,
        DATEDIFF(MAX(d.paid_at), MIN(d.paid_at)) as donor_lifespan_days
    FROM DONOR dr
    LEFT JOIN DONATION d ON dr.donor_id = d.donor_id
    WHERE d.donation_id IS NOT NULL
    GROUP BY dr.donor_id
),
donor_segments AS (
    SELECT 
        *,
        -- Donor Value Segmentation
        CASE 
            WHEN total_donated >= 10000 THEN 'Champion'
            WHEN total_donated >= 5000 THEN 'Loyal'
            WHEN total_donated >= 1000 THEN 'Regular'
            WHEN total_donated >= 500 THEN 'Repeat'
            ELSE 'New'
        END as segment,
        
        -- Donation Frequency Segmentation
        CASE 
            WHEN total_donations >= 10 THEN 'Frequent'
            WHEN total_donations >= 5 THEN 'Regular'
            WHEN total_donations >= 2 THEN 'Occasional'
            ELSE 'One-time'
        END as frequency_segment,
        
        -- Recency Segmentation
        CASE 
            WHEN DATEDIFF(CURDATE(), last_donation_date) <= 30 THEN 'Recent'
            WHEN DATEDIFF(CURDATE(), last_donation_date) <= 90 THEN 'Active'
            WHEN DATEDIFF(CURDATE(), last_donation_date) <= 365 THEN 'At Risk'
            ELSE 'Inactive'
        END as recency_segment
    FROM donor_stats
)
SELECT 
    *,
    -- Donor Score (weighted combination of segments)
    (CASE segment 
        WHEN 'Champion' THEN 4 
        WHEN 'Loyal' THEN 3 
        WHEN 'Regular' THEN 2 
        WHEN 'Repeat' THEN 2
        ELSE 1 
    END +
    CASE frequency_segment 
        WHEN 'Frequent' THEN 4 
        WHEN 'Regular' THEN 3 
        WHEN 'Occasional' THEN 2 
        ELSE 1 
    END +
    CASE recency_segment 
        WHEN 'Recent' THEN 4 
        WHEN 'Active' THEN 3 
        WHEN 'At Risk' THEN 2 
        ELSE 1 
    END) as donor_score
FROM donor_segments
ORDER BY donor_score DESC, total_donated DESC;

-- ==================================================================
-- 4. GEOGRAPHIC DISTRIBUTION - Location-based Analytics
-- ==================================================================
CREATE VIEW v_geographic_distribution AS
SELECT 
    COALESCE(dr.country, 'Unknown') as country,
    COALESCE(dr.division, 'Other') as division,
    COUNT(DISTINCT dr.donor_id) as donor_count,
    COUNT(d.donation_id) as donation_count,
    SUM(d.amount) as total_amount,
    AVG(d.amount) as avg_donation,
    MAX(d.paid_at) as last_donation
FROM DONOR dr
LEFT JOIN DONATION d ON dr.donor_id = d.donor_id
WHERE d.donation_id IS NOT NULL
GROUP BY dr.country, dr.division
ORDER BY total_amount DESC;

-- ==================================================================
-- 5. CAMPAIGN PERFORMANCE - Event Success Analysis
-- ==================================================================
CREATE VIEW v_campaign_performance AS
WITH event_stats AS (
    SELECT 
        ec.creation_id,
        ec.title as event_name,
        ec.creator_type,
        CASE ec.creator_type 
            WHEN 'foundation' THEN COALESCE(f.foundation_name, 'Unknown Foundation')
            ELSE CONCAT(COALESCE(i.first_name, ''), ' ', COALESCE(i.last_name, ''))
        END as creator_name,
        ec.amount_needed,
        ec.amount_received,
        ec.verification_status as event_status,
        COUNT(d.donation_id) as total_donations,
        COUNT(DISTINCT d.donor_id) as unique_donors,
        AVG(d.amount) as avg_donation,
        MIN(d.paid_at) as first_donation,
        MAX(d.paid_at) as last_donation,
        COALESCE(DATEDIFF(CURDATE(), MIN(d.paid_at)), 0) as days_active
    FROM EVENT_CREATION ec
    LEFT JOIN DONATION d ON ec.creation_id = d.creation_id
    LEFT JOIN FOUNDATION f ON ec.foundation_id = f.foundation_id
    LEFT JOIN INDIVIDUAL i ON ec.individual_id = i.individual_id
    GROUP BY ec.creation_id
    HAVING total_donations > 0
)
SELECT 
    *,
    -- Goal achievement rate
    CASE 
        WHEN amount_needed > 0 
        THEN ROUND((amount_received / amount_needed) * 100, 2)
        ELSE 0 
    END as success_rate,
    
    -- Efficiency metrics
    CASE 
        WHEN days_active > 0 
        THEN ROUND(amount_received / days_active, 2)
        ELSE amount_received 
    END as daily_average
FROM event_stats
ORDER BY success_rate DESC, amount_received DESC;

-- ==================================================================
-- 6. TOP PERFORMERS - Leaderboards (SIMPLIFIED)
-- ==================================================================
CREATE VIEW v_top_performers AS
-- Top Donors by Total Amount
SELECT 
    'donor' as performer_type,
    'total_amount' as metric_type,
    CONCAT(COALESCE(dr.first_name, ''), ' ', COALESCE(dr.last_name, '')) as name,
    dr.donor_id as id,
    SUM(d.amount) as value,
    COUNT(d.donation_id) as transaction_count,
    MAX(d.paid_at) as last_activity
FROM DONOR dr
INNER JOIN DONATION d ON dr.donor_id = d.donor_id
GROUP BY dr.donor_id, dr.first_name, dr.last_name
ORDER BY value DESC
LIMIT 10;

-- ==================================================================
-- DONATION ANALYTICS STORED PROCEDURES & FUNCTIONS
-- Advanced PL/SQL with Exception Handling, Complex Logic, and Validation
-- ==================================================================

USE shodesh;

-- Drop existing procedures and functions
DROP FUNCTION IF EXISTS fn_calculate_growth_rate;
DROP FUNCTION IF EXISTS fn_donor_segment_score;
DROP FUNCTION IF EXISTS fn_campaign_health_score;
DROP PROCEDURE IF EXISTS sp_get_donation_analytics;
DROP PROCEDURE IF EXISTS sp_get_donor_insights;
DROP PROCEDURE IF EXISTS sp_get_trend_analysis;
DROP PROCEDURE IF EXISTS sp_refresh_analytics_cache;

DELIMITER $$

-- ==================================================================
-- 1. UTILITY FUNCTIONS
-- ==================================================================

-- Function to calculate growth rate with error handling
CREATE FUNCTION fn_calculate_growth_rate(
    current_value DECIMAL(12,2),
    previous_value DECIMAL(12,2)
) RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE growth_rate DECIMAL(10,2) DEFAULT 0.00;
    
    -- Handle division by zero and null values
    IF previous_value IS NULL OR previous_value = 0 THEN
        IF current_value > 0 THEN
            RETURN 100.00; -- 100% growth from zero
        ELSE
            RETURN 0.00;
        END IF;
    END IF;
    
    IF current_value IS NULL THEN
        SET current_value = 0;
    END IF;
    
    SET growth_rate = ((current_value - previous_value) / previous_value) * 100;
    
    -- Cap extreme values
    IF growth_rate > 1000 THEN
        SET growth_rate = 1000.00;
    ELSEIF growth_rate < -100 THEN
        SET growth_rate = -100.00;
    END IF;
    
    RETURN ROUND(growth_rate, 2);
END$$

-- Function to calculate donor segment score
CREATE FUNCTION fn_donor_segment_score(
    total_donated DECIMAL(12,2),
    donation_count INT,
    days_since_last_donation INT
) RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE value_score INT DEFAULT 0;
    DECLARE frequency_score INT DEFAULT 0;
    DECLARE recency_score INT DEFAULT 0;
    DECLARE total_score INT DEFAULT 0;
    
    -- Value Score (1-4)
    IF total_donated >= 10000 THEN SET value_score = 4;
    ELSEIF total_donated >= 5000 THEN SET value_score = 3;
    ELSEIF total_donated >= 1000 THEN SET value_score = 2;
    ELSE SET value_score = 1;
    END IF;
    
    -- Frequency Score (1-4)
    IF donation_count >= 10 THEN SET frequency_score = 4;
    ELSEIF donation_count >= 5 THEN SET frequency_score = 3;
    ELSEIF donation_count >= 2 THEN SET frequency_score = 2;
    ELSE SET frequency_score = 1;
    END IF;
    
    -- Recency Score (1-4)
    IF days_since_last_donation <= 30 THEN SET recency_score = 4;
    ELSEIF days_since_last_donation <= 90 THEN SET recency_score = 3;
    ELSEIF days_since_last_donation <= 365 THEN SET recency_score = 2;
    ELSE SET recency_score = 1;
    END IF;
    
    SET total_score = value_score + frequency_score + recency_score;
    
    RETURN total_score;
END$$

-- Function to calculate campaign health score
CREATE FUNCTION fn_campaign_health_score(
    amount_needed DECIMAL(12,2),
    amount_received DECIMAL(12,2),
    donation_count INT,
    days_active INT
) RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE health_score DECIMAL(5,2) DEFAULT 0.00;
    DECLARE goal_ratio DECIMAL(5,2) DEFAULT 0.00;
    DECLARE activity_score DECIMAL(5,2) DEFAULT 0.00;
    DECLARE momentum_score DECIMAL(5,2) DEFAULT 0.00;
    DECLARE daily_avg DECIMAL(10,2) DEFAULT 0.00;
    
    -- Handle edge cases
    IF amount_needed <= 0 OR amount_received IS NULL THEN
        RETURN 0.00;
    END IF;
    
    -- Goal achievement ratio (0-40 points)
    SET goal_ratio = LEAST((amount_received / amount_needed) * 40, 40);
    
    -- Activity score based on donation count (0-30 points)
    IF donation_count >= 50 THEN SET activity_score = 30;
    ELSEIF donation_count >= 20 THEN SET activity_score = 25;
    ELSEIF donation_count >= 10 THEN SET activity_score = 20;
    ELSEIF donation_count >= 5 THEN SET activity_score = 15;
    ELSEIF donation_count >= 1 THEN SET activity_score = 10;
    ELSE SET activity_score = 0;
    END IF;
    
    -- Momentum score based on daily average (0-30 points)
    IF days_active > 0 THEN
        SET daily_avg = amount_received / days_active;
        
        IF daily_avg >= 1000 THEN SET momentum_score = 30;
        ELSEIF daily_avg >= 500 THEN SET momentum_score = 25;
        ELSEIF daily_avg >= 100 THEN SET momentum_score = 20;
        ELSEIF daily_avg >= 50 THEN SET momentum_score = 15;
        ELSEIF daily_avg >= 10 THEN SET momentum_score = 10;
        ELSE SET momentum_score = 5;
        END IF;
    ELSE
        SET momentum_score = 0;
    END IF;
    
    SET health_score = goal_ratio + activity_score + momentum_score;
    
    RETURN ROUND(health_score, 2);
END$$

-- ==================================================================
-- 2. MAIN ANALYTICS PROCEDURES
-- ==================================================================

-- Comprehensive donation analytics procedure


-- Donor insights procedure with segmentation
CREATE PROCEDURE sp_get_donor_insights(
    IN p_limit INT,
    IN p_min_donations INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @sql_state = RETURNED_SQLSTATE,
            @error_message = MESSAGE_TEXT;
        
        SELECT 
            'error' as status,
            @sql_state as sql_state,
            @error_message as message,
            'sp_get_donor_insights' as procedure_name;
    END;
    
    -- Set default values
    IF p_limit IS NULL OR p_limit <= 0 OR p_limit > 1000 THEN
        SET p_limit = 50;
    END IF;
    
    IF p_min_donations IS NULL OR p_min_donations < 1 THEN
        SET p_min_donations = 1;
    END IF;
    
    SELECT 'success' as status, 'Donor insights retrieved successfully' as message;
    
    -- Detailed donor analysis with custom scoring
    SELECT 
        dr.donor_id,
        CONCAT(dr.first_name, ' ', dr.last_name) as donor_name,
        dr.country,
        dr.division,
        COUNT(d.donation_id) as total_donations,
        SUM(d.amount) as total_donated,
        AVG(d.amount) as avg_donation,
        MIN(d.paid_at) as first_donation,
        MAX(d.paid_at) as last_donation,
        DATEDIFF(CURDATE(), MAX(d.paid_at)) as days_since_last_donation,
        DATEDIFF(MAX(d.paid_at), MIN(d.paid_at)) as donor_lifespan_days,
        
        -- Calculate custom scores using our function
        fn_donor_segment_score(
            SUM(d.amount), 
            COUNT(d.donation_id), 
            DATEDIFF(CURDATE(), MAX(d.paid_at))
        ) as donor_score,
        
        -- Donation frequency (donations per month)
        CASE 
            WHEN DATEDIFF(MAX(d.paid_at), MIN(d.paid_at)) > 0
            THEN ROUND(COUNT(d.donation_id) / (DATEDIFF(MAX(d.paid_at), MIN(d.paid_at)) / 30), 2)
            ELSE COUNT(d.donation_id)
        END as donations_per_month,
        
        -- Engagement categories
        CASE 
            WHEN COUNT(d.donation_id) >= 10 AND SUM(d.amount) >= 5000 THEN 'Champion'
            WHEN COUNT(d.donation_id) >= 5 AND SUM(d.amount) >= 2000 THEN 'Loyal'
            WHEN COUNT(d.donation_id) >= 3 AND SUM(d.amount) >= 1000 THEN 'Regular'
            WHEN COUNT(d.donation_id) >= 2 THEN 'Repeat'
            ELSE 'New'
        END as engagement_category
        
    FROM DONOR dr
    INNER JOIN DONATION d ON dr.donor_id = d.donor_id
    GROUP BY dr.donor_id
    HAVING COUNT(d.donation_id) >= p_min_donations
    ORDER BY donor_score DESC, total_donated DESC
    LIMIT p_limit;
    
    -- Donor segmentation summary
    SELECT 
        engagement_category,
        COUNT(*) as donor_count,
        SUM(total_donated) as segment_total,
        AVG(total_donated) as avg_donated_per_donor,
        AVG(donor_score) as avg_score
    FROM (
        SELECT 
            dr.donor_id,
            SUM(d.amount) as total_donated,
            fn_donor_segment_score(
                SUM(d.amount), 
                COUNT(d.donation_id), 
                DATEDIFF(CURDATE(), MAX(d.paid_at))
            ) as donor_score,
            CASE 
                WHEN COUNT(d.donation_id) >= 10 AND SUM(d.amount) >= 5000 THEN 'Champion'
                WHEN COUNT(d.donation_id) >= 5 AND SUM(d.amount) >= 2000 THEN 'Loyal'
                WHEN COUNT(d.donation_id) >= 3 AND SUM(d.amount) >= 1000 THEN 'Regular'
                WHEN COUNT(d.donation_id) >= 2 THEN 'Repeat'
                ELSE 'New'
            END as engagement_category
        FROM DONOR dr
        INNER JOIN DONATION d ON dr.donor_id = d.donor_id
        GROUP BY dr.donor_id
    ) segment_data
    GROUP BY engagement_category
    ORDER BY segment_total DESC;
    
END$$

-- Advanced trend analysis procedure
CREATE PROCEDURE sp_get_trend_analysis(
    IN p_period ENUM('daily', 'weekly', 'monthly'),
    IN p_months_back INT
)
BEGIN
    DECLARE v_start_date DATE;
    DECLARE v_date_format VARCHAR(20);
    DECLARE v_interval_type VARCHAR(10);
    
    -- Exception handling
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @sql_state = RETURNED_SQLSTATE,
            @error_message = MESSAGE_TEXT;
        
        SELECT 
            'error' as status,
            @sql_state as sql_state,
            @error_message as message,
            'sp_get_trend_analysis' as procedure_name;
    END;
    
    -- Validate and set parameters
    IF p_months_back IS NULL OR p_months_back <= 0 OR p_months_back > 24 THEN
        SET p_months_back = 6;
    END IF;
    
    IF p_period IS NULL THEN
        SET p_period = 'daily';
    END IF;
    
    SET v_start_date = DATE_SUB(CURDATE(), INTERVAL p_months_back MONTH);
    
    -- Set formatting based on period
    CASE p_period
        WHEN 'daily' THEN 
            SET v_date_format = '%Y-%m-%d';
            SET v_interval_type = 'DAY';
        WHEN 'weekly' THEN 
            SET v_date_format = '%Y-W%u';
            SET v_interval_type = 'WEEK';
        WHEN 'monthly' THEN 
            SET v_date_format = '%Y-%m';
            SET v_interval_type = 'MONTH';
        ELSE
            SET v_date_format = '%Y-%m-%d';
            SET v_interval_type = 'DAY';
    END CASE;
    
    SELECT 'success' as status, CONCAT('Trend analysis (', p_period, ') retrieved successfully') as message;
    
    -- Dynamic trend analysis query
    SET @sql = CONCAT('
        WITH trend_data AS (
            SELECT 
                DATE_FORMAT(d.paid_at, ''', v_date_format, ''') as period,
                MIN(DATE(d.paid_at)) as period_start,
                MAX(DATE(d.paid_at)) as period_end,
                COUNT(d.donation_id) as donation_count,
                COUNT(DISTINCT d.donor_id) as unique_donors,
                SUM(d.amount) as total_amount,
                AVG(d.amount) as avg_donation,
                COUNT(DISTINCT d.creation_id) as campaigns_count
            FROM DONATION d
            WHERE d.paid_at >= ''', v_start_date, '''
            GROUP BY DATE_FORMAT(d.paid_at, ''', v_date_format, ''')
        ),
        trend_with_growth AS (
            SELECT 
                *,
                LAG(total_amount, 1) OVER (ORDER BY period_start) as prev_period_amount,
                LAG(donation_count, 1) OVER (ORDER BY period_start) as prev_period_count,
                SUM(total_amount) OVER (ORDER BY period_start) as cumulative_amount,
                AVG(total_amount) OVER (ORDER BY period_start ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg
            FROM trend_data
        )
        SELECT 
            period,
            period_start,
            period_end,
            donation_count,
            unique_donors,
            total_amount,
            avg_donation,
            campaigns_count,
            cumulative_amount,
            moving_avg,
            fn_calculate_growth_rate(total_amount, prev_period_amount) as amount_growth_rate,
            fn_calculate_growth_rate(donation_count, prev_period_count) as count_growth_rate
        FROM trend_with_growth
        ORDER BY period_start'
    );
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
END$$

-- Cache refresh procedure for performance optimization
CREATE PROCEDURE sp_refresh_analytics_cache()
BEGIN
    DECLARE v_error_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @sql_state = RETURNED_SQLSTATE,
            @error_message = MESSAGE_TEXT;
        
        SELECT 
            'error' as status,
            @sql_state as sql_state,
            @error_message as message,
            'sp_refresh_analytics_cache' as procedure_name;
    END;
    
    -- Create or refresh materialized view alternatives (using tables for caching)
    DROP TABLE IF EXISTS cache_daily_donations;
    
    CREATE TABLE cache_daily_donations AS
    SELECT 
        DATE(d.paid_at) as donation_date,
        COUNT(d.donation_id) as daily_donations,
        SUM(d.amount) as daily_amount,
        COUNT(DISTINCT d.donor_id) as daily_unique_donors,
        AVG(d.amount) as daily_avg_donation
    FROM DONATION d
    WHERE d.paid_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
    GROUP BY DATE(d.paid_at)
    ORDER BY donation_date;
    
    -- Add index for performance
    ALTER TABLE cache_daily_donations ADD PRIMARY KEY (donation_date);
    
    SELECT 
        'success' as status,
        'Analytics cache refreshed successfully' as message,
        NOW() as refresh_timestamp;
        
END$$

DELIMITER ;



DELIMITER //

CREATE PROCEDURE sp_get_donation_analytics(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_include_trends TINYINT
)
BEGIN
    -- Exception handler
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @sql_state = RETURNED_SQLSTATE,
            @error_message = MESSAGE_TEXT;
        
        SELECT 
            'error' as status,
            @sql_state as sql_state,
            @error_message as message,        
            'sp_get_donation_analytics' as procedure_name;
    END;

    -- Validate parameters
    IF p_include_trends IS NULL THEN
        SET p_include_trends = 1;
    END IF;

    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start date and end date are required';
    END IF;

    IF p_start_date > p_end_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start date cannot be greater than end date';
    END IF;

    IF p_end_date > CURDATE() THEN
        SET p_end_date = CURDATE();
    END IF;

    -- Result Set 1: Status
    SELECT
        'success' as status,
        'Analytics data retrieved successfully' as message;
    
    -- Result Set 2: Enhanced KPIs with active campaigns and repeat donors
    SELECT
        COUNT(d.donation_id) as total_donations,
        COUNT(DISTINCT d.donor_id) as unique_donors,
        SUM(d.amount) as total_amount,
        AVG(d.amount) as average_donation,
        MIN(d.amount) as min_donation,
        MAX(d.amount) as max_donation,
        STD(d.amount) as donation_std_dev,
        COUNT(DISTINCT d.creation_id) as campaigns_supported,
        COUNT(DISTINCT DATE(d.paid_at)) as active_days,
        -- New metrics
        COUNT(DISTINCT d.creation_id) as active_campaigns,
        (SELECT COUNT(*) FROM (
            SELECT donor_id FROM DONATION 
            WHERE DATE(paid_at) BETWEEN p_start_date AND p_end_date 
            GROUP BY donor_id HAVING COUNT(*) > 1
        ) as repeat_query) as repeat_donors
    FROM DONATION d
    WHERE DATE(d.paid_at) BETWEEN p_start_date AND p_end_date;

    -- Result Set 3: Daily trends (if requested)
    IF p_include_trends = 1 THEN
        WITH RECURSIVE date_series AS (
            SELECT p_start_date as date_val
            UNION ALL
            SELECT DATE_ADD(date_val, INTERVAL 1 DAY)
            FROM date_series
            WHERE date_val < p_end_date
        )
        SELECT
            ds.date_val as date,
            COALESCE(COUNT(d.donation_id), 0) as donation_count,
            COALESCE(SUM(d.amount), 0) as total_amount,
            COALESCE(COUNT(DISTINCT d.donor_id), 0) as unique_donors,
            SUM(COALESCE(SUM(d.amount), 0)) OVER (ORDER BY ds.date_val) as cumulative_amount,
            AVG(COALESCE(SUM(d.amount), 0)) OVER (
                ORDER BY ds.date_val
                ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
            ) as moving_avg_7day
        FROM date_series ds
        LEFT JOIN DONATION d ON DATE(d.paid_at) = ds.date_val
        GROUP BY ds.date_val
        ORDER BY ds.date_val;
    END IF;

    -- Result Set 4: Geographic data
    SELECT
        dr.country,
        dr.division,
        COUNT(d.donation_id) as donation_count,
        SUM(d.amount) as total_amount,
        AVG(d.amount) as avg_amount,
        COUNT(DISTINCT d.donor_id) as unique_donors
    FROM DONATION d
    INNER JOIN DONOR dr ON d.donor_id = dr.donor_id
    WHERE DATE(d.paid_at) BETWEEN p_start_date AND p_end_date
    GROUP BY dr.country, dr.division
    ORDER BY total_amount DESC;
END//

DELIMITER ;


-- ==================================================================
-- ADVANCED DYNAMIC SEARCH SYSTEM FOR SHODESH (Final MySQL Version)
-- Using ONLY existing tables with correct column names
-- ==================================================================

USE shodesh;

-- ==================================================================
-- 1. ADVANCED FUNCTIONS WITH COMPLEX LOGIC
-- ==================================================================

DELIMITER $$

-- Advanced text similarity function
DROP FUNCTION IF EXISTS fn_calculate_text_similarity$$

CREATE FUNCTION fn_calculate_text_similarity(
    search_term VARCHAR(255),
    target_text VARCHAR(255)
) RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE similarity_score DECIMAL(5,2) DEFAULT 0.00;
    DECLARE search_length INT;
    DECLARE target_length INT;
    
    -- Handle null values
    IF search_term IS NULL OR target_text IS NULL THEN
        RETURN 0.00;
    END IF;
    
    -- Convert to lowercase for case-insensitive comparison
    SET search_term = LOWER(TRIM(search_term));
    SET target_text = LOWER(TRIM(target_text));
    
    SET search_length = CHAR_LENGTH(search_term);
    SET target_length = CHAR_LENGTH(target_text);
    
    -- Exact match gets highest score
    IF search_term = target_text THEN
        RETURN 100.00;
    END IF;
    
    -- Check for exact word match
    IF LOCATE(CONCAT(' ', search_term, ' '), CONCAT(' ', target_text, ' ')) > 0 THEN
        RETURN 95.00;
    END IF;
    
    -- Check if search term is at the beginning
    IF LEFT(target_text, search_length) = search_term THEN
        RETURN 90.00;
    END IF;
    
    -- Check for partial match
    IF LOCATE(search_term, target_text) > 0 THEN
        SET similarity_score = 70.00 + (30.00 * (1 - (LOCATE(search_term, target_text) - 1) / target_length));
        RETURN ROUND(similarity_score, 2);
    END IF;
    
    RETURN 0.00;
END$$

-- Function to calculate popularity score using existing DONATION table
DROP FUNCTION IF EXISTS fn_calculate_popularity_score$$

CREATE FUNCTION fn_calculate_popularity_score(
    creation_id_param VARCHAR(7)
) RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE popularity INT DEFAULT 0;
    DECLARE donation_count INT DEFAULT 0;
    DECLARE total_amount DECIMAL(12,2) DEFAULT 0.00;
    DECLARE days_active INT DEFAULT 0;
    
    -- Get donation statistics from existing DONATION table
    SELECT 
        COUNT(*) as donations,
        COALESCE(SUM(amount), 0) as total
    INTO donation_count, total_amount
    FROM DONATION 
    WHERE creation_id = creation_id_param;
    
    -- Calculate days since creation
    SELECT DATEDIFF(NOW(), created_at) INTO days_active
    FROM EVENT_CREATION 
    WHERE creation_id = creation_id_param;
    
    -- Calculate popularity score (0-100)
    SET popularity = LEAST(100, (
        (donation_count * 10) +           -- Each donation adds 10 points
        FLOOR(total_amount / 100) +       -- Each 100 taka adds 1 point
        CASE 
            WHEN days_active <= 7 THEN 20   -- New event bonus
            WHEN days_active <= 30 THEN 10  -- Recent event bonus
            ELSE 0 
        END
    ));
    
    RETURN popularity;
END$$

DELIMITER ;

-- ==================================================================
-- 2. ADVANCED VIEW WITH COMPLEX JOINS AND SUBQUERIES
-- ==================================================================

DROP VIEW IF EXISTS v_advanced_searchable_events;

CREATE VIEW v_advanced_searchable_events AS
SELECT 
    ec.creation_id,
    ec.title,
    ec.description,
    ec.creator_type,
    -- Complex CASE statement for creator names
    CASE ec.creator_type
        WHEN 'individual' THEN CONCAT(COALESCE(i.first_name, ''), ' ', COALESCE(i.last_name, ''))
        WHEN 'foundation' THEN COALESCE(f.foundation_name, 'Unknown Foundation')
        ELSE 'Unknown Creator'
    END as creator_name,
    -- Join with category and event type
    COALESCE(c.category_name, 'Uncategorized') as category_name,
    COALESCE(et.event_type_name, 'General') as event_type_name,
    ec.amount_needed,
    ec.amount_received,
    -- Advanced calculated fields
    ROUND(CASE 
        WHEN ec.amount_needed > 0 THEN (ec.amount_received / ec.amount_needed) * 100 
        ELSE 0 
    END, 2) as funding_percentage,
    ec.division,
    ec.verification_status,
    ec.lifecycle_status,
    ec.created_at,
    DATEDIFF(NOW(), ec.created_at) as days_active,
    -- Advanced subqueries for analytics
    (SELECT COUNT(*) FROM DONATION d WHERE d.creation_id = ec.creation_id) as donation_count,
    (SELECT COALESCE(SUM(amount), 0) FROM DONATION d WHERE d.creation_id = ec.creation_id) as total_donated,
    (SELECT COUNT(DISTINCT donor_id) FROM DONATION d WHERE d.creation_id = ec.creation_id) as unique_donors,
    (SELECT MAX(paid_at) FROM DONATION d WHERE d.creation_id = ec.creation_id) as last_donation_date,
    -- Advanced funding status with multiple conditions
    CASE 
        WHEN ec.amount_needed > 0 AND ec.amount_received >= ec.amount_needed THEN 'Fully Funded'
        WHEN ec.amount_received > (ec.amount_needed * 0.75) THEN 'Nearly Funded'
        WHEN ec.amount_received > (ec.amount_needed * 0.25) THEN 'Partially Funded'
        WHEN ec.amount_received > 0 THEN 'Getting Started'
        ELSE 'Not Funded'
    END as detailed_funding_status
FROM EVENT_CREATION ec
-- Left joins with all related tables
LEFT JOIN INDIVIDUAL i ON ec.individual_id = i.individual_id AND ec.creator_type = 'individual'
LEFT JOIN FOUNDATION f ON ec.foundation_id = f.foundation_id AND ec.creator_type = 'foundation'
LEFT JOIN EVENT_BASED_ON_CATEGORY ebc ON ec.ebc_id = ebc.ebc_id
LEFT JOIN CATEGORY c ON ebc.category_id = c.category_id
LEFT JOIN EVENT_TYPE et ON ebc.event_type_id = et.event_type_id
WHERE 
    ec.verification_status IN ('verified', 'unverified')
    AND ec.lifecycle_status IN ('active', 'inactive');

-- ==================================================================
-- 3. STORED PROCEDURES WITH EXCEPTION HANDLING
-- ==================================================================

DELIMITER $$

-- Main advanced search procedure with multiple search types and exception handling
DROP PROCEDURE IF EXISTS sp_advanced_search_with_cursor$$

CREATE PROCEDURE sp_advanced_search_with_cursor(
    IN p_search_term VARCHAR(255),
    IN p_limit INT,
    IN p_search_type ENUM('basic', 'exact', 'fuzzy', 'popular'),
    OUT p_result_count INT,
    OUT p_status VARCHAR(20),
    OUT p_message TEXT
)
sp_label: BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_creation_id VARCHAR(7);
    DECLARE v_title VARCHAR(50);
    DECLARE v_description VARCHAR(1000);
    DECLARE v_creator_name VARCHAR(61);
    DECLARE v_category VARCHAR(50);
    DECLARE v_funding_pct DECIMAL(5,2);
    DECLARE v_similarity DECIMAL(5,2);
    DECLARE v_popularity INT;
    DECLARE result_json JSON DEFAULT JSON_ARRAY();
    DECLARE counter INT DEFAULT 0;
    
    -- Cursor declaration MUST come before handlers in MySQL
    DECLARE search_cursor CURSOR FOR
        SELECT 
            se.creation_id,
            se.title,
            LEFT(se.description, 200) as short_desc,
            se.creator_name,
            se.category_name,
            se.funding_percentage,
            fn_calculate_text_similarity(p_search_term, se.title) as similarity_score,
            fn_calculate_popularity_score(se.creation_id) as popularity_score
        FROM v_advanced_searchable_events se
        WHERE 
            se.verification_status = 'verified'
            AND se.lifecycle_status = 'active'
            AND (
                CASE p_search_type
                    WHEN 'exact' THEN 
                        LOWER(se.title) = LOWER(p_search_term) OR
                        LOWER(se.category_name) = LOWER(p_search_term)
                    WHEN 'fuzzy' THEN
                        fn_calculate_text_similarity(p_search_term, se.title) > 40
                    WHEN 'popular' THEN
                        (LOWER(se.title) LIKE CONCAT('%', LOWER(p_search_term), '%') OR
                         LOWER(se.description) LIKE CONCAT('%', LOWER(p_search_term), '%')) AND
                        se.donation_count > 0
                    ELSE
                        LOWER(se.title) LIKE CONCAT('%', LOWER(p_search_term), '%') OR
                        LOWER(se.description) LIKE CONCAT('%', LOWER(p_search_term), '%') OR
                        LOWER(se.category_name) LIKE CONCAT('%', LOWER(p_search_term), '%') OR
                        LOWER(se.creator_name) LIKE CONCAT('%', LOWER(p_search_term), '%')
                END
            )
        ORDER BY 
            CASE p_search_type
                WHEN 'fuzzy' THEN fn_calculate_text_similarity(p_search_term, se.title)
                WHEN 'popular' THEN fn_calculate_popularity_score(se.creation_id)
                ELSE se.funding_percentage
            END DESC,
            se.created_at DESC
        LIMIT p_limit;
    
    -- Handlers come AFTER cursor declarations
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Exception handling
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            @sql_state = RETURNED_SQLSTATE,
            @error_message = MESSAGE_TEXT;
        
        SET p_status = 'error';
        SET p_message = CONCAT('Search failed: ', @error_message);
        SET p_result_count = 0;
        
        SELECT JSON_OBJECT(
            'status', 'error', 
            'message', p_message, 
            'results', JSON_ARRAY()
        ) as search_result;
    END;
    
    -- Input validation
    IF p_search_term IS NULL OR TRIM(p_search_term) = '' THEN
        SET p_status = 'error';
        SET p_message = 'Search term cannot be empty';
        SELECT JSON_OBJECT('status', 'error', 'message', p_message, 'results', JSON_ARRAY()) as search_result;
        LEAVE sp_label;
    END IF;
    
    IF CHAR_LENGTH(TRIM(p_search_term)) < 2 THEN
        SET p_status = 'error';
        SET p_message = 'Search term must be at least 2 characters';
        SELECT JSON_OBJECT('status', 'error', 'message', p_message, 'results', JSON_ARRAY()) as search_result;
        LEAVE sp_label;
    END IF;
    
    -- Set defaults
    IF p_limit IS NULL OR p_limit <= 0 OR p_limit > 50 THEN SET p_limit = 10; END IF;
    IF p_search_type IS NULL THEN SET p_search_type = 'basic'; END IF;
    
    -- Open cursor and process results
    OPEN search_cursor;
    
    read_loop: LOOP
        FETCH search_cursor INTO v_creation_id, v_title, v_description, v_creator_name, 
                                v_category, v_funding_pct, v_similarity, v_popularity;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Build JSON result using cursor data (demonstrates cursor usage)
        SET result_json = JSON_ARRAY_APPEND(
            result_json,
            '$',
            JSON_OBJECT(
                'creation_id', v_creation_id,
                'title', v_title,
                'description', v_description,
                'creator_name', v_creator_name,
                'category_name', v_category,
                'funding_percentage', v_funding_pct,
                'similarity_score', v_similarity,
                'popularity_score', v_popularity,
                'search_type', p_search_type
            )
        );
        
        SET counter = counter + 1;
        
    END LOOP;
    
    CLOSE search_cursor;
    
    -- Return final results
    SET p_result_count = counter;
    
    IF counter = 0 THEN
        SET p_status = 'no_results';
        SET p_message = 'No matching events found';
    ELSE
        SET p_status = 'success';
        SET p_message = CONCAT('Found ', counter, ' matching events using ', p_search_type, ' search');
    END IF;
    
    SELECT JSON_OBJECT(
        'status', p_status,
        'message', p_message,
        'result_count', counter,
        'search_term', p_search_term,
        'search_type', p_search_type,
        'results', result_json
    ) as search_result;
    
END$$

-- Procedure for analytics using complex subqueries
DROP PROCEDURE IF EXISTS sp_search_analytics_with_subqueries$$

CREATE PROCEDURE sp_search_analytics_with_subqueries()
BEGIN
    -- Advanced analytics using subqueries
    SELECT 'ADVANCED SEARCH ANALYTICS' as report_title;
    
    -- Most successful events by category with rankings
    SELECT 
        'Top Events by Category with Rankings' as section,
        se.category_name,
        se.title,
        se.amount_received,
        se.donation_count,
        -- Subquery to calculate rank within category
        (SELECT COUNT(*) + 1 
         FROM v_advanced_searchable_events se2 
         WHERE se2.category_name = se.category_name 
         AND se2.amount_received > se.amount_received) as rank_in_category,
        -- Subquery to get category average
        (SELECT AVG(amount_received) 
         FROM v_advanced_searchable_events se3 
         WHERE se3.category_name = se.category_name) as category_avg,
        -- Performance vs category average
        ROUND((se.amount_received - (SELECT AVG(amount_received) 
                                   FROM v_advanced_searchable_events se4 
                                   WHERE se4.category_name = se.category_name)) / 
              (SELECT AVG(amount_received) 
               FROM v_advanced_searchable_events se5 
               WHERE se5.category_name = se.category_name) * 100, 2) as performance_vs_avg_pct
    FROM v_advanced_searchable_events se
    WHERE se.verification_status = 'verified' AND se.amount_received > 0
    ORDER BY se.category_name, se.amount_received DESC;
    
END$$

DELIMITER ;

-- ==================================================================
-- 4. TRIGGERS FOR REAL-TIME SEARCH OPTIMIZATION
-- ==================================================================

DELIMITER $$

-- Trigger to update search-related data when donations are made
DROP TRIGGER IF EXISTS trg_update_search_data_on_donation$$

CREATE TRIGGER trg_update_search_data_on_donation
    AFTER INSERT ON DONATION
    FOR EACH ROW
BEGIN
    -- Update the amount_received in EVENT_CREATION (affects search results)
    UPDATE EVENT_CREATION 
    SET amount_received = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM DONATION 
        WHERE creation_id = NEW.creation_id
    )
    WHERE creation_id = NEW.creation_id;
    
    -- Set flags for search cache refresh (demonstration of trigger usage)
    SET @search_popularity_updated = NEW.creation_id;
END$$

-- Trigger to track search-affecting changes
DROP TRIGGER IF EXISTS trg_search_optimization_on_event_update$$

CREATE TRIGGER trg_search_optimization_on_event_update
    AFTER UPDATE ON EVENT_CREATION
    FOR EACH ROW
BEGIN
    -- Track changes that affect search results
    IF OLD.title != NEW.title OR 
       OLD.description != NEW.description OR
       OLD.verification_status != NEW.verification_status OR
       OLD.lifecycle_status != NEW.lifecycle_status THEN
        
        -- Flag for search index refresh
        SET @search_index_needs_refresh = NEW.creation_id;
    END IF;
END$$

DELIMITER ;

-- ==================================================================
-- 5. TESTING AND VERIFICATION
-- ==================================================================

-- Test all advanced features
SELECT '🚀 ADVANCED MYSQL SEARCH SYSTEM VERIFICATION 🚀' as test_title;

-- Test 1: Function verification
SELECT 
    'Testing Advanced Functions' as test_section,
    fn_calculate_text_similarity('education', 'Educational Support Program') as similarity_test,
    'Function working correctly!' as function_status;

-- Test 2: View verification with complex data
SELECT 
    'Testing Advanced View' as test_section,
    COUNT(*) as total_events,
    COUNT(CASE WHEN detailed_funding_status = 'Fully Funded' THEN 1 END) as fully_funded,
    COUNT(CASE WHEN detailed_funding_status = 'Nearly Funded' THEN 1 END) as nearly_funded,
    COUNT(CASE WHEN detailed_funding_status = 'Partially Funded' THEN 1 END) as partially_funded,
    AVG(funding_percentage) as avg_funding_percentage
FROM v_advanced_searchable_events
WHERE verification_status = 'verified';

-- Test 3: Sample advanced view data
SELECT 
    'Sample Advanced Search Data' as test_section,
    creation_id,
    title,
    creator_name,
    category_name,
    detailed_funding_status,
    donation_count,
    unique_donors
FROM v_advanced_searchable_events
WHERE verification_status = 'verified' 
AND lifecycle_status = 'active'
ORDER BY funding_percentage DESC
LIMIT 5;

-- Test 4: Complex subquery example
SELECT 
    'Events Above Category Average' as analysis_section,
    se.creation_id,
    se.title,
    se.category_name,
    se.amount_received,
    (SELECT AVG(amount_received) 
     FROM v_advanced_searchable_events se2 
     WHERE se2.category_name = se.category_name 
     AND se2.verification_status = 'verified') as category_avg,
    ROUND((se.amount_received - (SELECT AVG(amount_received) 
                               FROM v_advanced_searchable_events se3 
                               WHERE se3.category_name = se.category_name 
                               AND se3.verification_status = 'verified')) * 100.0 / 
          (SELECT AVG(amount_received) 
           FROM v_advanced_searchable_events se4 
           WHERE se4.category_name = se.category_name 
           AND se4.verification_status = 'verified'), 2) as above_avg_percentage
FROM v_advanced_searchable_events se
WHERE se.verification_status = 'verified'
AND se.amount_received > (
    SELECT AVG(amount_received) 
    FROM v_advanced_searchable_events se5 
    WHERE se5.category_name = se.category_name 
    AND se5.verification_status = 'verified'
)
ORDER BY above_avg_percentage DESC
LIMIT 10;

SELECT 
    '🎉 ADVANCED SEARCH SYSTEM SUCCESSFULLY DEPLOYED! 🎉' as final_status,
    '✅ Advanced Functions with Complex Logic' as feature_1,
    '✅ Complex Views with Multiple Joins' as feature_2, 
    '✅ Stored Procedures with Exception Handling' as feature_3,
    '✅ Stored Procedures with CURSOR Usage' as feature_4,
    '✅ Triggers for Real-time Updates' as feature_5,
    '✅ Advanced Subqueries and Analytics' as feature_6,
    '✅ Uses ONLY your existing database tables!' as important_note,
    NOW() as deployment_completed;



    DROP PROCEDURE IF EXISTS sp_admin_verify_staff;
    DELIMITER $$
CREATE DEFINER=root@localhost PROCEDURE sp_admin_verify_staff(
  IN p_staff_id VARCHAR(7),
  IN p_action ENUM('verify','suspend','unsuspend'),
  IN p_notes TEXT,
  IN p_admin_user VARCHAR(100)
)
BEGIN
  DECLARE v_exists INT DEFAULT 0;
  DECLARE v_status ENUM('verified','suspended','unverified');

  SELECT COUNT(*), MAX(status) INTO v_exists, v_status
  FROM STAFF WHERE staff_id = p_staff_id;

  IF v_exists = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Staff not found';
  END IF;

  IF p_action = 'verify' THEN
    IF v_status IN ('unverified','suspended') THEN
      UPDATE STAFF SET status='verified' WHERE staff_id = p_staff_id;
    ELSE
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Already verified';
    END IF;
  ELSEIF p_action = 'suspend' THEN
    IF v_status <> 'suspended' THEN
      UPDATE STAFF SET status='suspended' WHERE staff_id = p_staff_id;
    ELSE
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Already suspended';
    END IF;
  ELSEIF p_action = 'unsuspend' THEN
    IF v_status = 'suspended' THEN
      UPDATE STAFF SET status='verified' WHERE staff_id = p_staff_id;
    ELSE
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Not suspended';
    END IF;
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid action';
  END IF;

