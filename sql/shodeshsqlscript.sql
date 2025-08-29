USE shodesh;
SHOW VARIABLES LIKE 'secure_file_priv';

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



/* ===================== CATEGORY / EVENT TYPE ===================== */
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

DELIMITER //

-- Enforce XOR creator rule via triggers (CHECK + FK hits error 3823)
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
END//

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
END//
DELIMITER ;

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

/* ===== CATEGORY ===== */
INSERT INTO CATEGORY (category_id, category_name) VALUES
('CAT0001','Disaster Relief'),
('CAT0002','Health Care'),
('CAT0003','Education'),
('CAT0004','Livelihood'),
('CAT0005','Seasonal Aid'),
('CAT0006','WASH'),
('CAT0007','Infrastructure'),
('CAT0008','Refugee Support');

/* ===== EVENT_TYPE ===== */
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

/* ===== EVENT_BASED_ON_CATEGORY (junction with surrogate key) ===== */
/* Map each category to relevant event types.
   Some event types appear in multiple categories on purpose (e.g., Winter Clothing, WASH items). */
INSERT INTO EVENT_BASED_ON_CATEGORY (ebc_id, category_id, event_type_id) VALUES
-- Disaster Relief
('EBC0001','CAT0001','EVT0001'), -- Flood Relief
('EBC0002','CAT0001','EVT0002'), -- Cyclone Relief
('EBC0003','CAT0001','EVT0003'), -- Landslide Relief
('EBC0004','CAT0001','EVT0004'), -- Fire Victim Support
('EBC0005','CAT0001','EVT0601'), -- House Rebuild
('EBC0006','CAT0001','EVT0602'), -- Bridge/Culvert Repair
('EBC0007','CAT0001','EVT0501'), -- Tube-well Installation
('EBC0008','CAT0001','EVT0502'), -- Sanitation/Toilets
('EBC0009','CAT0001','EVT0403'), -- Winter Clothing

-- Health Care
('EBC0010','CAT0002','EVT0101'), -- Dengue Treatment
('EBC0011','CAT0002','EVT0102'), -- Cancer Surgery
('EBC0012','CAT0002','EVT0103'), -- ICU Support

-- Education
('EBC0013','CAT0003','EVT0201'), -- Tuition Scholarship
('EBC0014','CAT0003','EVT0202'), -- School Supplies

-- Livelihood
('EBC0015','CAT0004','EVT0301'), -- Small Business Grant
('EBC0016','CAT0004','EVT0302'), -- Rickshaw/Van Purchase

-- Seasonal Aid
('EBC0017','CAT0005','EVT0401'), -- Qurbani
('EBC0018','CAT0005','EVT0402'), -- Zakat/Fitra
('EBC0019','CAT0005','EVT0403'), -- Winter Clothing (also under Disaster Relief)

-- WASH
('EBC0020','CAT0006','EVT0501'), -- Tube-well Installation
('EBC0021','CAT0006','EVT0502'), -- Sanitation/Toilets

-- Infrastructure
('EBC0022','CAT0007','EVT0601'), -- House Rebuild
('EBC0023','CAT0007','EVT0602'), -- Bridge/Culvert Repair

-- Refugee Support
('EBC0024','CAT0008','EVT0701'); -- Rohingya Relief


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


DELIMITER $$

/* Block deleting an INDIVIDUAL that still owns events */
DROP TRIGGER IF EXISTS BD_INDIVIDUAL_BLOCK_IF_EVENTS $$
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

/* Block deleting a FOUNDATION that still owns events */
DROP TRIGGER IF EXISTS BD_FOUNDATION_BLOCK_IF_EVENTS $$
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



DELIMITER $$

/* -----------------------------------------------------------------------
   BI_EVENT_VERIFICATION_ENFORCE  (BEFORE INSERT on EVENT_VERIFICATION)
   Purpose:
     - Validate round_no ∈ {1,2}
     - Enforce pairing:
         round 1 -> staff_id MUST be NULL
         round 2 -> staff_id MUST be NOT NULL
     - If round 2, ensure the event is actually waiting for staff
       (EVENT_CREATION.second_verification_required = 1)
     - Zero out request_staff_verification when not round 1
     - On violation -> raise an error (SIGNAL 45000)
   ----------------------------------------------------------------------- */
DROP TRIGGER IF EXISTS BI_EVENT_VERIFICATION_ENFORCE $$
CREATE TRIGGER BI_EVENT_VERIFICATION_ENFORCE
BEFORE INSERT ON EVENT_VERIFICATION
FOR EACH ROW
BEGIN
  DECLARE v_need_staff TINYINT DEFAULT 0;

  -- round_no must be 1 or 2
  IF NEW.round_no NOT IN (1,2) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='round_no must be 1 or 2';
  END IF;

  -- pairing: round 1 has no staff_id, round 2 requires staff_id
  IF (NEW.round_no = 1 AND NEW.staff_id IS NOT NULL) OR
     (NEW.round_no = 2 AND NEW.staff_id IS NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT='Invalid verifier: round 1 -> no staff_id; round 2 -> staff_id required';
  END IF;

  -- request flag only meaningful for round 1
  IF NEW.round_no <> 1 THEN
    SET NEW.request_staff_verification = 0;
  END IF;

  -- if round 2, ensure the event is waiting for staff
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
   Purpose:
     - Apply the decision to EVENT_CREATION state:
       * Round 1, verified + request_staff=0  -> verified + active
       * Round 1, verified + request_staff=1  -> unverified + inactive + waiting for staff
       * Round 1, unverified                  -> unverified + inactive
       * Round 2, verified                    -> verified + active
       * Round 2, unverified                  -> unverified + inactive
   ----------------------------------------------------------------------- */
DROP TRIGGER IF EXISTS AI_EVENT_VERIFICATION_APPLY $$
CREATE TRIGGER AI_EVENT_VERIFICATION_APPLY
AFTER INSERT ON EVENT_VERIFICATION
FOR EACH ROW
BEGIN
  -- Round 1 (initial)
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

  -- Round 2 (staff follow-up)
  IF NEW.round_no = 2 THEN
    UPDATE EVENT_CREATION
    SET second_verification_required = 0,
        verification_status = CASE WHEN NEW.decision='verified' THEN 'verified' ELSE 'unverified' END,
        lifecycle_status    = CASE WHEN NEW.decision='verified' THEN 'active'    ELSE 'inactive'    END
    WHERE creation_id = NEW.creation_id;
  END IF;
END $$

DELIMITER ;


/* =======================================================================
   TRIGGERS: DONATION  (eligibility gating + running totals)
   ======================================================================= */
DELIMITER $$

/* -----------------------------------------------------------------------
   BI_DONATION_ENFORCE  (BEFORE INSERT on DONATION)
   Purpose:
     - Validate amount > 0
     - Ensure event is donation-eligible:
         verification_status='verified' AND lifecycle_status='active'
     - Prevent over-funding:
         current + NEW.amount <= amount_needed
     - On violation -> raise an error (SIGNAL 45000)
   ----------------------------------------------------------------------- */
DROP TRIGGER IF EXISTS BI_DONATION_ENFORCE $$
CREATE TRIGGER BI_DONATION_ENFORCE
BEFORE INSERT ON DONATION
FOR EACH ROW
BEGIN
  DECLARE v_ver  ENUM('unverified','verified');
  DECLARE v_life ENUM('inactive','active','closed');
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
   Purpose:
     - Add NEW.amount to EVENT_CREATION.amount_received
     - If target met/exceeded, set lifecycle_status='closed'
   ----------------------------------------------------------------------- */
DROP TRIGGER IF EXISTS AI_DONATION_SUM $$
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
   Purpose:
     - Adjust total when a donation row’s amount changes:
         amount_received = amount_received - OLD.amount + NEW.amount
     - Keep lifecycle_status:
         'closed' if target met, else 'active' (when verified)
   ----------------------------------------------------------------------- */
DROP TRIGGER IF EXISTS AU_DONATION_SUM $$
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
   Purpose:
     - Subtract OLD.amount from amount_received
     - If it was 'closed' but now below target, reopen to 'active'
   ----------------------------------------------------------------------- */
DROP TRIGGER IF EXISTS AD_DONATION_SUM $$
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

DELIMITER ;