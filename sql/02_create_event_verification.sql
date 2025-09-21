-- Step 2: Create EVENT_VERIFICATION table
DROP TABLE IF EXISTS EVENT_VERIFICATION;
CREATE TABLE EVENT_VERIFICATION (
  log_id       VARCHAR(7)  NOT NULL,
  creation_id  VARCHAR(7)  NOT NULL,
  round_no     TINYINT NOT NULL,
  staff_id     VARCHAR(7) NULL,
  decision     ENUM('approved','rejected','request_staff_verification') NOT NULL,
  target_division VARCHAR(30) NULL,
  verified_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT EVENT_VERIFICATION_PK PRIMARY KEY (log_id),
  CONSTRAINT EV_EVENT_FK FOREIGN KEY (creation_id) REFERENCES EVENT_CREATION(creation_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT EV_STAFF_FK FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  
  INDEX EV_EVENT_IDX (creation_id, round_no, verified_at),
  INDEX EV_STAFF_IDX (staff_id, verified_at),
  INDEX EV_DIVISION_IDX (target_division, decision)
);