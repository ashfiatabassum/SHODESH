const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadDir = "src/uploads/cv/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for CV upload
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: function (req, file, cb) {
    crypto.randomBytes(16, (err, buf) => {
      if (err) return cb(err);
      cb(null, buf.toString("hex") + path.extname(file.originalname));
    });
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Check if file exists
    if (!file) {
      return cb(new Error("CV file is required"), false);
    }

    // Check file type
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (!extname) {
      return cb(
        new Error("Only PDF, Word documents, and TXT files are allowed"),
        false
      );
    }

    return cb(null, true);
  },
});

// Check if username exists
router.post("/check-username", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res
      .status(400)
      .json({ success: false, message: "Username is required" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT username FROM staff WHERE username = ?",
      [username]
    );
    return res.json({
      success: true,
      exists: rows.length > 0,
      message:
        rows.length > 0 ? "Username is already taken" : "Username is available",
    });
  } catch (error) {
    console.error("Error checking username:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Staff signup
router.post(
  "/signup",
  (req, res, next) => {
    console.log("📥 Staff signup request initiated");
    console.log("Headers:", req.headers);
    console.log("Request body keys:", Object.keys(req.body || {}));
    console.log("Request files:", req.files);

    upload.single("cv")(req, res, (err) => {
      if (err) {
        console.error("❌ File upload error:", err);
        // Handle multer errors
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "CV file is too large. Maximum file size is 10MB.",
          });
        }
        return res.status(400).json({
          success: false,
          message: "CV upload error: " + err.message,
        });
      }

      console.log("✅ File upload processed:", req.file);
      if (!req.file) {
        console.error("❌ No file was received in the request");
        return res.status(400).json({
          success: false,
          message: "CV file is required but was not received",
        });
      }

      console.log("📄 File details:", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      });

      // Continue to the next middleware/handler
      next();
    });
  },
  async (req, res) => {
    console.log("📥 Staff signup request received:", req.body);

    try {
      // Extract data from the form submission
      const {
        firstName,
        lastName,
        username,
        password,
        mobileNumber,
        gmail: email,
        nid,
        birthDay,
        birthMonth,
        birthYear,
        houseNo,
        roadNo,
        area,
        district,
        administrativeDiv,
        zipCode,
      } = req.body;

      // Check required fields
      if (
        !firstName ||
        !lastName ||
        !username ||
        !password ||
        !mobileNumber ||
        !email ||
        !nid
      ) {
        console.log("❌ Missing required fields");
        return res.status(400).json({
          success: false,
          message: "Please fill in all required fields",
        });
      }
      console.log("📋 Required fields checked: All present");

      // Validate username format
      const usernamePattern = /^[a-zA-Z0-9._]+$/;
      if (!usernamePattern.test(username)) {
        console.log("❌ Invalid username format");
        return res.status(400).json({
          success: false,
          message:
            "Username can only contain letters, numbers, dots, and underscores",
        });
      }
      console.log("🔍 Validating username format: Valid");

      // Validate mobile number
      const mobileRegex = /^01[3-9]\d{8}$/;
      if (!mobileRegex.test(mobileNumber)) {
        console.log("❌ Invalid mobile number format");
        return res.status(400).json({
          success: false,
          message: "Please provide a valid Bangladeshi mobile number",
        });
      }
      console.log("🔍 Validating mobile number format: Valid");

      // Validate email format
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
      if (!emailRegex.test(email)) {
        console.log("❌ Invalid email format");
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }
      console.log("🔍 Validating email format: Valid");

      // Validate name formats
      const nameRegex = /^[A-Za-z\s.-]{2,50}$/;
      if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        console.log("❌ Invalid name format");
        return res.status(400).json({
          success: false,
          message: "Names can only contain letters, spaces, dots, and hyphens",
        });
      }
      console.log("🔍 Validating name formats: Valid");

      // Format date of birth
      let dob = null;
      try {
        if (birthYear && birthMonth && birthDay) {
          const monthPadded = birthMonth.toString().padStart(2, "0");
          const dayPadded = birthDay.toString().padStart(2, "0");
          dob = `${birthYear}-${monthPadded}-${dayPadded}`;
        }
      } catch (error) {
        console.log("❌ Error formatting date of birth:", error);
        return res.status(400).json({
          success: false,
          message: "Invalid date of birth",
        });
      }
      console.log("🔍 Validating date of birth: Valid");

      // Validate age (minimum 18 years)
      if (dob) {
        const dobDate = new Date(dob);
        const today = new Date();
        const ageDiff = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();

        const age =
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < dobDate.getDate())
            ? ageDiff - 1
            : ageDiff;

        if (age < 18) {
          console.log("❌ Staff must be at least 18 years old");
          return res.status(400).json({
            success: false,
            message: "You must be at least 18 years old to register as staff",
          });
        }
        console.log("🔍 Validating age (minimum 18): Valid");
      }

      // Validate NID
      const nidRegex = /^\d{10,17}$/;
      if (!nidRegex.test(nid)) {
        console.log("❌ Invalid NID format");
        return res.status(400).json({
          success: false,
          message: "NID must be 10-17 digits",
        });
      }
      console.log("🔍 Validating NID format: Valid");

      // Validate road number
      if (roadNo && !/^[A-Za-z0-9\s./-]{1,10}$/.test(roadNo)) {
        console.log("❌ Invalid road number format");
        return res.status(400).json({
          success: false,
          message: "Invalid road number format",
        });
      }
      console.log("🔍 Validating road number: Valid");

      // Validate zip code
      if (zipCode && !/^\d{4}$/.test(zipCode)) {
        console.log("❌ Invalid zip code format");
        return res.status(400).json({
          success: false,
          message: "Zip code must be 4 digits",
        });
      }
      console.log("🔍 Validating zip code: Valid");

      // Validate district and administrative division
      const validDistricts = [
        "Dhaka",
        "Chittagong",
        "Sylhet",
        "Rajshahi",
        "Khulna",
        "Barisal",
        "Rangpur",
        "Mymensingh",
        "Other",
      ];
      const validDivisions = [
        "Dhaka",
        "Chittagong",
        "Sylhet",
        "Rajshahi",
        "Khulna",
        "Barisal",
        "Rangpur",
        "Mymensingh",
      ];

      if (district && !validDistricts.includes(district)) {
        console.log("❌ Invalid district");
        return res.status(400).json({
          success: false,
          message: "Please select a valid district",
        });
      }

      if (administrativeDiv && !validDivisions.includes(administrativeDiv)) {
        console.log("❌ Invalid administrative division");
        return res.status(400).json({
          success: false,
          message: "Please select a valid administrative division",
        });
      }
      console.log("🔍 Validating district and administrative division: Valid");

      console.log("✅ All validations passed");

      // Check for existing username, email, mobile, or NID one by one to give more specific error messages
      console.log("🔍 Checking for existing username...");
      const [existingUsernames] = await db.execute(
        "SELECT username FROM STAFF WHERE username = ?",
        [username]
      );

      if (existingUsernames.length > 0) {
        console.log(`❌ Username '${username}' already exists`);
        return res.status(409).json({
          success: false,
          message:
            "This username is already taken. Please choose a different username.",
          field: "username",
        });
      }

      console.log("🔍 Checking for existing email...");
      const [existingEmails] = await db.execute(
        "SELECT email FROM STAFF WHERE email = ?",
        [email]
      );

      if (existingEmails.length > 0) {
        console.log(`❌ Email '${email}' already registered`);
        return res.status(409).json({
          success: false,
          message:
            "An account with this email address already exists. Please use a different email or try signing in.",
          field: "email",
        });
      }

      console.log("🔍 Checking for existing mobile number...");
      const [existingMobiles] = await db.execute(
        "SELECT mobile FROM STAFF WHERE mobile = ?",
        [mobileNumber]
      );

      if (existingMobiles.length > 0) {
        console.log(`❌ Mobile number '${mobileNumber}' already registered`);
        return res.status(409).json({
          success: false,
          message:
            "This mobile number is already registered. Please use a different mobile number.",
          field: "mobile",
        });
      }

      console.log("� Checking for existing NID...");
      const [existingNIDs] = await db.execute(
        "SELECT nid FROM STAFF WHERE nid = ?",
        [nid]
      );

      if (existingNIDs.length > 0) {
        console.log(`❌ NID '${nid}' already registered`);
        return res.status(409).json({
          success: false,
          message:
            "This NID is already registered. Each person can only have one staff account.",
          field: "nid",
        });
      }

      console.log("✅ No duplicate records found");

      // We've already checked for duplicates above with individual queries
      console.log("✅ No duplicate records found");

      // Generate staff ID
      const staffId = "STF" + Math.floor(1000 + Math.random() * 9000);
      console.log("🆔 Generated staff ID:", staffId);

      // Insert into staff table
      // Check if CV file is uploaded
      if (!req.file) {
        console.log("❌ CV file is required but not provided");
        return res.status(400).json({
          success: false,
          message: "CV file is required. Please upload your CV.",
        });
      }

      // Make sure upload directory exists
      try {
        if (!fs.existsSync("uploads")) {
          fs.mkdirSync("uploads");
        }
        if (!fs.existsSync("uploads/cv")) {
          fs.mkdirSync("uploads/cv");
        }
        console.log("✅ Upload directories verified");
      } catch (dirError) {
        console.error("❌ Error creating upload directories:", dirError);
        throw new Error(
          "Could not create upload directories: " + dirError.message
        );
      }

      // Process the CV file
      let cvData = null;
      try {
        console.log("📄 File details:", req.file);
        cvData = fs.readFileSync(req.file.path);
        console.log(
          `✅ CV file read successfully: ${req.file.filename} (${cvData.length} bytes)`
        );

        // Validate file size
        if (cvData.length > 10 * 1024 * 1024) {
          // 10MB limit
          return res.status(400).json({
            success: false,
            message: "CV file is too large. Maximum file size is 10MB.",
          });
        }
      } catch (fileError) {
        console.error("❌ Error reading CV file:", fileError);
        throw new Error(
          "Could not read uploaded CV file: " + fileError.message
        );
      }

      const insertQuery = `
  INSERT INTO STAFF (
    staff_id,
    first_name,
    last_name,
    username,
    password,
    mobile,
    email,
    nid,
    dob,
    house_no,
    road_no,
    area,
    district,
    administrative_div,
    zip,
    CV,
    status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unverified')
`;

      const insertValues = [
        staffId,
        firstName,
        lastName,
        username,
        password,
        mobileNumber,
        email,
        nid,
        dob,
        houseNo || null,
        roadNo || null,
        area || null,
        district || null,
        administrativeDiv || null,
        zipCode || null,
        cvData, // <- BLOB goes here
      ];

      console.log("💾 Insert values:", insertValues);

      await db.execute(insertQuery, insertValues);
      console.log("✅ Staff inserted successfully");

      console.log("🎉 Registration successful for staff:", staffId);
      res.status(201).json({
        success: true,
        message:
          "Staff account created successfully! Please sign in to continue.",
        staffId: username,
        staffIdNum: staffId,
      });
    } catch (error) {
      console.error("❌ Error creating staff account:", error);

      if (error.code === "ER_DUP_ENTRY") {
        // Handle duplicate entry errors
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes("username")) {
          return res.status(409).json({
            success: false,
            message:
              "This username is already taken. Please choose a different username.",
          });
        } else if (errorMessage.includes("email")) {
          return res.status(409).json({
            success: false,
            message: "This email is already registered.",
          });
        } else {
          return res.status(409).json({
            success: false,
            message: "Some of the information provided is already registered.",
          });
        }
      } else if (error.code === "ER_NO_SUCH_TABLE") {
        return res.status(500).json({
          success: false,
          message:
            "Database table not found. Please ensure the STAFF table exists.",
        });
      } else if (error.code === "ER_BAD_NULL_ERROR") {
        return res.status(400).json({
          success: false,
          message: "Required field missing: " + error.message,
        });
      } else if (error.code === "ENOENT") {
        return res.status(400).json({
          success: false,
          message: "File upload error: Could not read file",
        });
      } else if (error.sqlMessage) {
        return res.status(400).json({
          success: false,
          message: "Database error: " + error.sqlMessage,
        });
      }

      // Show the specific error message for debugging
      res.status(500).json({
        success: false,
        message: "Error creating your account: " + error.message,
      });
    }
  }
);

// Staff signin
router.post("/signin", async (req, res) => {
  console.log("📥 Staff signin request received:", req.body);

  try {
    const { username, password } = req.body;
    console.log(`🔍 Attempting to find staff with username: ${username}`);

    // First check if the username exists
    const [userCheck] = await db.execute(
      "SELECT username FROM staff WHERE username = ?",
      [username]
    );

    console.log(
      `🔎 Username check result: ${
        userCheck.length > 0 ? "Found" : "Not found"
      }`
    );

    const [rows] = await db.execute(
      "SELECT staff_id, username, first_name, last_name, email, mobile, nid, house_no, road_no, area, district, administrative_div, zip, status FROM staff WHERE username = ? AND password = ?",
      [username, password] // In production, implement proper password hashing
    );

    console.log(
      `🔐 Authentication result: ${rows.length > 0 ? "Success" : "Failed"}`
    );

    if (rows.length === 0) {
      // Check if the username exists but the password is wrong
      const [userExists] = await db.execute(
        "SELECT username FROM staff WHERE username = ?",
        [username]
      );

      if (userExists.length > 0) {
        console.log(
          `⚠️ Username '${username}' found but password is incorrect`
        );
        return res.status(401).json({
          success: false,
          message: "Incorrect password. Please try again.",
        });
      } else {
        console.log(`❌ Username '${username}' not found`);
        return res.status(401).json({
          success: false,
          message: "Username not found. Please check your username or sign up.",
        });
      }
    }

    const staff = rows[0];
    console.log(
      `✅ Staff authenticated successfully: ${staff.username} (${staff.staff_id})`
    );
    console.log(`📊 Staff status: ${staff.status || "unverified"}`);

    // Send back staff info for profile
    res.json({
      success: true,
      staffId: staff.staff_id,
      staffStatus: staff.status || "unverified",
      staffData: {
        first_name: staff.first_name,
        last_name: staff.last_name,
        username: staff.username,
        email: staff.email,
        mobile: staff.mobile,
        nid: staff.nid,
        house_no: staff.house_no,
        road_no: staff.road_no,
        area: staff.area,
        district: staff.district,
        administrative_div: staff.administrative_div,
        zip: staff.zip,
      },
      profile: {
        firstName: staff.first_name,
        lastName: staff.last_name,
        username: staff.username,
        email: staff.email,
        mobile: staff.mobile,
        nid: staff.nid,
        address: {
          houseNo: staff.house_no,
          roadNo: staff.road_no,
          area: staff.area,
          district: staff.district,
          administrativeDiv: staff.administrative_div,
          zipCode: staff.zip,
        },
      },
    });
  } catch (error) {
    console.error("Error during signin:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get staff profile data
router.get("/profile/:staffId", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT staff_id, first_name, last_name, username, email, mobile, nid, house_no, road_no, area, district, administrative_div, zip FROM staff WHERE staff_id = ?",
      [req.params.staffId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    const staff = rows[0];
    res.json({
      success: true,
      profile: {
        firstName: staff.first_name,
        lastName: staff.last_name,
        username: staff.username,
        email: staff.email,
        mobile: staff.mobile,
        nid: staff.nid,
        address: {
          houseNo: staff.house_no,
          roadNo: staff.road_no,
          area: staff.area,
          district: staff.district,
          administrativeDiv: staff.administrative_div,
          zipCode: staff.zip,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update staff profile
router.put("/update/:staffId", async (req, res) => {
  try {
    console.log("🔄 Processing staff profile update request");

    const { staffId } = req.params;
    console.log("Staff ID from params:", staffId);

    const {
      username,
      mobile,
      email,
      birthDate,
      houseNo,
      roadNo,
      area,
      district,
      administrativeDiv,
      zipCode,
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    console.log(
      "Update request body:",
      JSON.stringify(
        {
          username,
          mobile,
          email,
          birthDate: birthDate ? "provided" : undefined,
          houseNo,
          roadNo,
          area,
          district,
          administrativeDiv,
          zipCode,
          hasCurrentPassword: !!currentPassword,
          hasNewPassword: !!newPassword,
          hasConfirmPassword: !!confirmPassword,
        },
        null,
        2
      )
    );

    // First check if username is taken by another user
    if (username) {
      const [existing] = await db.execute(
        "SELECT staff_id FROM staff WHERE username = ? AND staff_id != ?",
        [username, staffId]
      );
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
      }
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];

    if (username) {
      updates.push("username = ?");
      values.push(username);
    }
    if (mobile) {
      updates.push("mobile = ?");
      values.push(mobile);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (houseNo) {
      updates.push("house_no = ?");
      values.push(houseNo);
    }
    if (roadNo) {
      updates.push("road_no = ?");
      values.push(roadNo);
    }
    if (area) {
      updates.push("area = ?");
      values.push(area);
    }
    if (district) {
      updates.push("district = ?");
      values.push(district);
    }
    if (administrativeDiv) {
      updates.push("administrative_div = ?");
      values.push(administrativeDiv);
    }
    if (zipCode) {
      updates.push("zip = ?");
      values.push(zipCode);
    }
    if (birthDate) {
      // Make sure birthDate is in the correct format: YYYY-MM-DD
      let formattedDate = birthDate;
      if (!(birthDate instanceof Date) && !isNaN(Date.parse(birthDate))) {
        formattedDate = new Date(birthDate).toISOString().split("T")[0];
      }

      updates.push("dob = ?");
      values.push(formattedDate);
      console.log("Updating DOB to:", formattedDate);
    }

    // Log the district and administrative division being updated
    console.log("Updating district:", district);
    console.log("Updating administrative division:", administrativeDiv);

    // Handle password change if requested
    if (currentPassword && newPassword && confirmPassword) {
      console.log("Password change requested");

      // Verify passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New password and confirmation do not match",
        });
      }

      // Verify password complexity (at least 8 characters)
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters long",
        });
      }

      // Verify current password
      console.log("Verifying current password for staff ID:", staffId);

      const [userRows] = await db.execute(
        "SELECT password FROM staff WHERE staff_id = ?",
        [staffId]
      );

      if (userRows.length === 0) {
        console.error("Staff not found for password verification:", staffId);
        return res.status(404).json({
          success: false,
          message: "Staff not found",
        });
      }

      const storedPassword = userRows[0].password;
      console.log(
        "Retrieved stored password. Current password match?",
        storedPassword === currentPassword
      );

      // For simplicity, we're assuming passwords are stored in plaintext
      // In a real app, you would use bcrypt or similar to compare hashed passwords
      if (storedPassword !== currentPassword) {
        console.error("Current password verification failed");
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Add password to updates
      updates.push("password = ?");
      values.push(newPassword);

      console.log("Password verification successful, will update password");
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    // Add staffId to values array
    values.push(staffId);

    const query = `
            UPDATE staff 
            SET ${updates.join(", ")}
            WHERE staff_id = ?
        `;

    console.log("Executing update query:", query);
    console.log("With values:", values);

    // Use transaction to ensure data integrity

    // ✅ Use a single connection for the transaction
    let result;
    const conn = await db.getConnection();
    try {
      // optional: set isolation level on THIS connection
      // await conn.query('SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED');

      await conn.beginTransaction();

      const [queryResult] = await conn.execute(query, values);
      result = queryResult;

      await conn.commit();
      console.log("Transaction committed successfully");
    } catch (dbError) {
      console.error("Database error during update:", dbError);
      try {
        await conn.rollback();
      } catch (rbErr) {
        console.error("Rollback error:", rbErr);
      }
      return res.status(500).json({
        success: false,
        message: "Database error: " + dbError.message,
      });
    } finally {
      conn.release();
    }

    // Fetch updated staff data
    try {
      const [rows] = await db.execute(
        "SELECT * FROM staff WHERE staff_id = ?",
        [staffId]
      );

      if (!rows || rows.length === 0) {
        console.error("Could not fetch updated staff data after update");
        return res.status(500).json({
          success: false,
          message:
            "Update may have succeeded but could not retrieve updated data",
        });
      }

      const updatedStaff = rows[0];
      console.log("Successfully retrieved updated staff data:", updatedStaff);

      // Return complete staff data (except password)
      const staffData = {
        staff_id: updatedStaff.staff_id,
        username: updatedStaff.username,
        first_name: updatedStaff.first_name,
        last_name: updatedStaff.last_name,
        email: updatedStaff.email,
        mobile: updatedStaff.mobile,
        nid: updatedStaff.nid,
        birth_date: updatedStaff.dob, // Map dob to birth_date for client compatibility
        dob: updatedStaff.dob,
        house_no: updatedStaff.house_no,
        road_no: updatedStaff.road_no,
        area: updatedStaff.area,
        district: updatedStaff.district,
        administrative_div: updatedStaff.administrative_div,
        zip: updatedStaff.zip,
        status: updatedStaff.status,
      };

      console.log("Successfully updated staff profile:", staffData);

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: staffData,
        staffData: staffData, // Add this for consistent response format
      });
    } catch (fetchError) {
      console.error("Error fetching updated staff data:", fetchError);
      res.status(500).json({
        success: false,
        message: "Update succeeded but could not retrieve updated data",
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
