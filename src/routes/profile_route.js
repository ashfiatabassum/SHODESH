// Get staff profile data
router.get("/profile/:staffId", async (req, res) => {
  try {
    console.log("Getting profile for staffId:", req.params.staffId);
    const staffId = req.params.staffId;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "Staff ID is required",
      });
    }

    // Fetch complete staff information using a proper SQL query with date formatting
    const [rows] = await db.execute(
      `
      SELECT 
        staff_id,
        first_name,
        last_name,
        username,
        email,
        mobile,
        nid,
        DATE_FORMAT(dob, '%Y-%m-%d') as dob,
        house_no,
        road_no,
        area,
        district,
        administrative_div,
        zip,
        status
      FROM STAFF 
      WHERE staff_id = ? OR username = ?`,
      [staffId, staffId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    const staff = rows[0];
    console.log("Fetched staff data:", staff);

    // Send back all the staff information
    res.json({
      success: true,
      profile: {
        staffId: staff.staff_id,
        firstName: staff.first_name,
        lastName: staff.last_name,
        username: staff.username,
        email: staff.email,
        mobile: staff.mobile,
        nid: staff.nid,
        dob: staff.dob,
        status: staff.status,
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
