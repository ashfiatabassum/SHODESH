const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Using the same db connection as index.js

// Generate individual ID (simple implementation)
function generateIndividualId() {
  const prefix = "IND";
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNum}`;
}

// Validate Bangladesh mobile number format
function validateBangladeshMobile(mobile) {
  // Updated to handle mobile numbers that start with 01 and have 11 digits total
  const bangladeshMobileRegex = /^01[3-9]\d{8}$/;
  const isValid = bangladeshMobileRegex.test(mobile);
  console.log(
    `Mobile validation: ${mobile}, Length: ${
      mobile ? mobile.length : "N/A"
    }, Valid: ${isValid}`
  );
  return isValid;
}

// Validate email format
function validateEmail(email) {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
  return emailRegex.test(email);
}

// Validate name format (only letters and spaces)
function validateName(name) {
  const nameRegex = /^[A-Za-z ]+$/;
  return nameRegex.test(name);
}

// Validate NID format (10-17 digits)
function validateNID(nid) {
  const nidRegex = /^[0-9]{10,17}$/;
  return nidRegex.test(nid);
}

// Middleware to log all requests
router.use((req, res, next) => {
  console.log(
    `📝 [Individual] ${req.method} ${
      req.path
    } received at ${new Date().toISOString()}`
  );
  next();
});

// GET / - Test endpoint
router.get("/", (req, res) => {
  res.json({ message: "Individual API is working" });
});

router.get("/ping", (req, res) => {
  res.json({ ok: true, where: "individual", ts: new Date().toISOString() });
});

// POST /register - Register a new individual
router.post("/register", async (req, res) => {
  console.log("👤 New individual registration request received");
  console.log("Request body:", req.body);

  try {
    // Extract request body
    const {
      firstName,
      lastName,
      username,
      email,
      mobile,
      nid,
      dob,
      houseNo,
      roadNo,
      area,
      district,
      division,
      zipCode,
      bkashNumber,
      bankAccount,
      password,
      // Extract staff assistance data
      assistedByStaffId,
      assistedByStaffUsername,
    } = req.body;

    // Validate staff assistance data if present
    if (assistedByStaffId) {
      console.log(
        `👥 This registration is being assisted by staff: ${assistedByStaffUsername} (${assistedByStaffId})`
      );

      // Verify staff exists and is active
      const [staffResults] = await db.query(
        "SELECT staff_id, status FROM STAFF WHERE staff_id = ? AND username = ?",
        [assistedByStaffId, assistedByStaffUsername]
      );

      if (staffResults.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid staff assistance credentials",
        });
      }

      if (staffResults[0].status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Staff account is not active",
        });
      }
    }

    // Basic validation
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !mobile ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Validate format
    if (!validateName(firstName) || !validateName(lastName)) {
      return res.status(400).json({
        success: false,
        message: "Name can only contain letters and spaces",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!validateBangladeshMobile(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bangladesh mobile number format",
      });
    }

    if (nid && !validateNID(nid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NID format (must be 10-17 digits)",
      });
    }

    // Check if username or email already exists
    const [existingUser] = await db.query(
      "SELECT individual_id, username, email FROM INDIVIDUAL WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUser.length > 0) {
      const exists = existingUser[0];
      if (exists.username === username) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
          field: "username",
        });
      }
      if (exists.email === email) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered",
          field: "email",
        });
      }
    }

    // Check if email already exists
    const [emailResults] = await db.query(
      "SELECT individual_id FROM INDIVIDUAL WHERE email = ?",
      [email]
    );

    if (emailResults.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Check if mobile already exists
    console.log(`Checking if mobile ${mobile} exists in database`);
    const [mobileResults] = await db.query(
      "SELECT individual_id FROM INDIVIDUAL WHERE mobile = ?",
      [mobile]
    );

    console.log(`Found ${mobileResults.length} matches for mobile ${mobile}`);

    if (mobileResults.length > 0) {
      console.log(
        `Mobile number ${mobile} is already registered to user ${mobileResults[0].individual_id}`
      );
      return res.status(400).json({
        success: false,
        message: "Mobile number is already registered",
      });
    }

    // Check if NID already exists (if provided)
    if (nid) {
      const [nidResults] = await db.query(
        "SELECT individual_id FROM INDIVIDUAL WHERE nid = ?",
        [nid]
      );

      if (nidResults.length > 0) {
        return res.status(400).json({
          success: false,
          message: "NID is already registered",
        });
      }
    }

    // Generate individual ID
    const individualId = generateIndividualId();

    // Insert new individual
    await db.query(
      `INSERT INTO INDIVIDUAL (
        individual_id, first_name, last_name, username, email, password,
        mobile, nid, dob, house_no, road_no, area, district,
        administrative_div, zip, bkash, bank_account
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        individualId,
        firstName,
        lastName,
        username,
        email,
        password,
        mobile,
        nid || null,
        dob || null,
        houseNo || null,
        roadNo || null,
        area || null,
        district || null,
        division || null,
        zipCode || null,
        bkashNumber || null,
        bankAccount || null,
      ]
    );

    console.log(`✅ Individual registered successfully: ${individualId}`);

    // If this was a staff-assisted registration, record it in STAFF_ASSIST table
    if (assistedByStaffId) {
      try {
        console.log("📝 Recording staff assistance...");
        // Generate a unique staff_assist_id
        const staffAssistId = `SA${Math.floor(1000 + Math.random() * 9000)}`;
        console.log(`🔑 Generated Staff Assist ID: ${staffAssistId}`);

        // Get staff name for record
        console.log(`🔍 Looking up staff data for ID: ${assistedByStaffId}`);
        const [staffResult] = await db.query(
          "SELECT first_name, last_name, username FROM STAFF WHERE staff_id = ?",
          [assistedByStaffId]
        );
        console.log(`📊 Staff lookup result:`, staffResult);

        // Get individual name for record
        const [individualResult] = await db.query(
          "SELECT first_name, last_name FROM INDIVIDUAL WHERE individual_id = ?",
          [individualId]
        );

        const staffName =
          staffResult.length > 0
            ? `${staffResult[0].first_name} ${staffResult[0].last_name}`.trim()
            : "Unknown Staff";

        const staffUsername =
          staffResult.length > 0
            ? staffResult[0].username
            : assistedByStaffUsername || "unknown";

        const individualName =
          individualResult.length > 0
            ? `${individualResult[0].first_name} ${individualResult[0].last_name}`.trim()
            : `${firstName} ${lastName}`.trim();

        console.log(`📝 Preparing to insert staff assistance record:`, {
          staff_assist_id: staffAssistId,
          staff_id: assistedByStaffId,
          individual_id: individualId,
          staff_name: staffName,
          staff_username: staffUsername,
          individual_name: individualName,
        });

        const insertQuery = `INSERT INTO STAFF_ASSIST (
          staff_assist_id, staff_id, individual_id, 
          staff_name_at_creation, staff_username_at_creation,
          individual_name_at_creation
        ) VALUES (?, ?, ?, ?, ?, ?)`;

        console.log(`🔍 Executing query: ${insertQuery}`);
        await db.query(insertQuery, [
          staffAssistId,
          assistedByStaffId,
          individualId,
          staffName,
          staffUsername,
          individualName,
        ]);
        console.log(
          `✅ Staff assistance recorded: Staff ${assistedByStaffId} assisted Individual ${individualId}`
        );
      } catch (assistError) {
        console.error("❌ Error recording staff assistance:", assistError);
        console.error("❌ Error details:", assistError.message);
        console.error("❌ Error stack:", assistError.stack);
        // We don't want to fail the registration if only the staff assistance record fails
        // But we'll log the error for debugging
      }
    }

    res.status(201).json({
      success: true,
      message: "Individual registered successfully",
      individualId,
      staffAssisted: assistedByStaffId ? true : false,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
});
// GET /assisted-by/:staffId - Get individuals assisted by a specific staff
router.get("/assisted-by/:staffId", async (req, res) => {
  console.log(
    `🔍 Fetching individuals assisted by staff: ${req.params.staffId}`
  );

  try {
    const staffId = req.params.staffId;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "Staff ID is required",
      });
    }

    // First check if this staff ID exists in STAFF table
    const [staffCheck] = await db.query(
      "SELECT staff_id, username FROM STAFF WHERE staff_id = ?",
      [staffId]
    );

    if (staffCheck.length === 0) {
      console.log(
        `⚠️ Warning: Staff ID ${staffId} does not exist in STAFF table`
      );
    } else {
      console.log(
        `✅ Staff ID ${staffId} (${staffCheck[0].username}) exists in STAFF table`
      );
    }

    // Check STAFF_ASSIST table for this staff ID
    const [assistCheck] = await db.query(
      "SELECT COUNT(*) as count FROM STAFF_ASSIST WHERE staff_id = ?",
      [staffId]
    );

    console.log(
      `📊 Found ${assistCheck[0].count} entries in STAFF_ASSIST table for staff ID ${staffId}`
    );

    // Get STAFF_ASSIST table structure
    const [tableStructure] = await db.query("DESCRIBE STAFF_ASSIST");

    console.log("📋 STAFF_ASSIST table structure:");
    console.log(tableStructure);

    // Get individuals assisted by this staff
    const query = `SELECT i.individual_id, i.username, i.first_name, i.last_name, i.email, 
              sa.created_at AS assist_date, sa.staff_assist_id
       FROM INDIVIDUAL i
       INNER JOIN STAFF_ASSIST sa ON i.individual_id = sa.individual_id
       WHERE sa.staff_id = ?
       ORDER BY sa.created_at DESC`;

    console.log("🔍 Executing query:", query);
    console.log("🔑 With parameter:", staffId);

    const [results] = await db.query(query, [staffId]);

    console.log(
      `✅ Found ${results.length} individuals assisted by staff ${staffId}`
    );

    res.status(200).json({
      success: true,
      count: results.length,
      individuals: results,
    });
  } catch (error) {
    console.error("❌ Error fetching assisted individuals:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
});

// POST /signin - Sign in an individual
router.post("/signin", async (req, res) => {
  console.log("🟢 [Individual] /signin hit"); // debug
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const [rows] = await db.query(
      `SELECT individual_id, first_name, last_name, username, email, password,
              mobile, nid, dob, house_no, road_no, area, district,
              administrative_div, zip, bkash, bank_account
         FROM INDIVIDUAL
        WHERE username = ?`,
      [username]
    );

    if (!rows || rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const user = rows[0];

    // NOTE: plain-text compare for now; switch to bcrypt later
    if (String(password) !== String(user.password)) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const individualData = {
      personalInfo: {
        individualId: user.individual_id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        nid: user.nid,
        dob: user.dob,
      },
      address: {
        houseNo: user.house_no,
        roadNo: user.road_no,
        area: user.area,
        district: user.district,
        division: user.administrative_div,
        zipCode: user.zip,
      },
      finance: {
        bkashNumber: user.bkash,
        bankAccount: user.bank_account,
      },
    };

    return res.json({
      success: true,
      message: "Signed in successfully",
      individualId: user.individual_id,
      individualData,
    });
  } catch (err) {
    console.error("❌ Individual signin error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
});

// POST /check-availability - Check if username/email/mobile/nid is available
router.post("/check-availability", (req, res) => {
  const { field, value } = req.body;

  if (!field || !value) {
    return res.status(400).json({
      success: false,
      message: "Field and value are required",
    });
  }

  if (!["username", "email", "mobile", "nid"].includes(field)) {
    return res.status(400).json({
      success: false,
      message: "Invalid field. Must be one of: username, email, mobile, nid",
    });
  }

  // Map field to database column
  const fieldMap = {
    username: "username",
    email: "email",
    mobile: "mobile",
    nid: "nid",
  };

  const dbField = fieldMap[field];

  // Check if the value is available
  console.log(`Checking availability of ${field}: "${value}"`);

  db.query(
    `SELECT individual_id FROM INDIVIDUAL WHERE ${dbField} = ?`,
    [value],
    (err, results) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Error checking availability",
        });
      }

      const isAvailable = results.length === 0;
      console.log(
        `Availability check for ${field}: "${value}" - Available: ${isAvailable}, Matches: ${results.length}`
      );

      if (!isAvailable && results.length > 0) {
        console.log(
          `${field} "${value}" is already taken by user ${results[0].individual_id}`
        );
      }

      res.json({
        success: true,
        available: isAvailable,
        message: isAvailable
          ? `${field.charAt(0).toUpperCase() + field.slice(1)} is available`
          : `${
              field.charAt(0).toUpperCase() + field.slice(1)
            } is already taken`,
        field: field,
      });
    }
  );
});

module.exports = router;
