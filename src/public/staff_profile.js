document.addEventListener("DOMContentLoaded", () => {
  // Check for staff data in localStorage first (from sign-in)
  const staffId = localStorage.getItem("staffId");
  const username = localStorage.getItem("staffUsername");

  // Setup sign out button
  const signoutBtn = document.getElementById("signout-btn");
  if (signoutBtn) {
    signoutBtn.addEventListener("click", handleSignOut);
  }

  // Function to generate initials from name
  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0) : "";
    const lastInitial = lastName ? lastName.charAt(0) : "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Function to generate a consistent color based on name
  const getColorFromName = (name) => {
    // Using predefined professional gradient
    return "linear-gradient(135deg, #3a7bd5, #00d2ff)";
  };

  // Render all visible profile fields from a data object
  function renderProfile(staffData, opts = { setHeader: true }) {
    if (!staffData) return;

    console.log(
      "Rendering profile with data:",
      JSON.stringify(staffData, null, 2)
    );

    const byId = (id) => document.getElementById(id);
    const set = (id, val, fallback = "Not provided") => {
      const el = byId(id);
      if (el) {
        const displayValue = (val ?? "").toString().trim() || fallback;
        console.log(`Setting ${id} to: ${displayValue}`);
        el.textContent = displayValue;
      } else {
        console.warn(`Element with ID ${id} not found in the DOM`);
      }
    };
    const first = staffData.first_name || staffData.firstName || "";
    const last = staffData.last_name || staffData.lastName || "";
    const fullName = `${first} ${last}`.trim();
    const usernameNow =
      staffData.username || localStorage.getItem("staffUsername") || "";

    if (opts.setHeader) {
      set("staff-name-header", fullName || usernameNow, usernameNow);
    }
    set("staff-name", fullName || usernameNow, usernameNow);
    set("staff-username", usernameNow, "");
    set("staff-email", staffData.email);
    set("staff-phone", staffData.mobile);
    set("staff-nid", staffData.nid);

    // DOB formatting
    if (staffData.dob) {
      set("staff-dob", staffData.dob);
    } else if (staffData.birth_date) {
      set("staff-dob", staffData.birth_date);
    }

    // Enhanced address handling for compatibility with both nested and flat structures
    // First check if we have a nested address structure
    if (staffData.address) {
      const address = staffData.address;
      set("staff-area", address.area);
      // Use the correct ID for administrative division (staff-division)
      set(
        "staff-division",
        address.administrativeDiv || address.administrative_div
      );
      set("staff-district", address.district);
      set("staff-house-no", address.houseNo || address.house_no);
      set("staff-road-no", address.roadNo || address.road_no);
      set("staff-zip", address.zipCode || address.zip);
    }

    // Then check for flat structure (this will override nested values if both exist)
    // This ensures we get the data regardless of which format it's in
    set(
      "staff-area",
      staffData.area || (staffData.address && staffData.address.area)
    );

    // Add debug logging for administrative division
    console.log("Administrative Division Data:", {
      direct: staffData.administrative_div,
      fromAddressNested:
        staffData.address && staffData.address.administrativeDiv,
      fromAddressFlat:
        staffData.address && staffData.address.administrative_div,
    });

    // Use the correct ID for administrative division (staff-division)
    set(
      "staff-division",
      staffData.administrative_div ||
        (staffData.address &&
          (staffData.address.administrativeDiv ||
            staffData.address.administrative_div))
    );
    set(
      "staff-district",
      staffData.district || (staffData.address && staffData.address.district)
    );
    set(
      "staff-house-no",
      staffData.house_no ||
        (staffData.address &&
          (staffData.address.houseNo || staffData.address.house_no))
    );
    set(
      "staff-road-no",
      staffData.road_no ||
        (staffData.address &&
          (staffData.address.roadNo || staffData.address.road_no))
    );
    set(
      "staff-zip",
      staffData.zip ||
        (staffData.address &&
          (staffData.address.zipCode || staffData.address.zip))
    );
    const dobElement = byId("staff-dob");
    const birthDate =
      staffData.birth_date || staffData.birthDate || staffData.dob;
    if (dobElement) {
      if (birthDate) {
        if (typeof birthDate === "string" && birthDate.includes("-")) {
          try {
            const d = new Date(birthDate);
            dobElement.textContent = isNaN(d.getTime())
              ? birthDate
              : d.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
          } catch {
            dobElement.textContent = birthDate;
          }
        } else {
          dobElement.textContent = birthDate;
        }
      } else {
        dobElement.textContent = "Not provided";
      }
    }

    // Address fields - these are the actual HTML element IDs
    set("staff-house", staffData.house_no);
    set("staff-road", staffData.road_no);
    set("staff-area", staffData.area);
    set("staff-district", staffData.district);

    // Special handling for division field to ensure it always gets populated
    const adminDiv =
      staffData.administrative_div ||
      (staffData.address &&
        (staffData.address.administrativeDiv ||
          staffData.address.administrative_div));
    console.log("Administrative Division final value:", adminDiv);
    const divisionElement = document.getElementById("staff-division");
    if (divisionElement) {
      divisionElement.textContent = adminDiv || "Not provided";
    }

    set("staff-zip", staffData.zip);

    // Initials
    const initialsDiv = byId("profile-initials");
    if (initialsDiv) {
      const initials = (first ? first[0] : "") + (last ? last[0] : "");
      initialsDiv.textContent = initials.toUpperCase();
    }
  }

  // Function to fetch and display staff data - commented out old version
  // Original loadStaffProfile commented out
  //     console.log(
  //       "Loading staff profile with staffId:",
  //       staffId,
  //       "and username:",
  //       username
  //     );
  //     console.log("Force refresh?", forceRefresh);

  //     // Try to get staff data from sessionStorage first (unless force refresh is enabled)
  //     let staffData = forceRefresh
  //       ? null
  //       : JSON.parse(sessionStorage.getItem("staffData") || "null");
  //     console.log("Initial staff data from sessionStorage:", staffData);

  //     // If no data in sessionStorage but we have it in localStorage, use that
  //     if (!staffData) {
  //       const localStorageData = JSON.parse(
  //         localStorage.getItem("staffSignupData") || "null"
  //       );
  //       if (localStorageData) {
  //         console.log("Found staff data in localStorage:", localStorageData);
  //         staffData = localStorageData;
  //         // Store in sessionStorage for future use
  //         sessionStorage.setItem("staffData", JSON.stringify(staffData));
  //       }
  //     }

  //     // If still no data, fetch from the server
  //     if (!staffData && username) {
  //       try {
  //         console.log("No cached data found, fetching staff data from API");

  //         // Try to fetch from the actual API - always use username for profile lookup
  //         // This fixes the issue where staffId might be a database ID not matching username
  //         const response = await fetch(`/api/staff/profile/${username}`, {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("staffToken") || ""}`,
  //           },
  //         });

  //         if (response.ok) {
  //           const result = await response.json();
  //           console.log("API response:", result);

  //           // Determine the profile data
  //           let profileData = result.profile || result.data || staffData;

  //           // Normalize address fields if necessary
  //           if (profileData.address && !profileData.house_no) {
  //             profileData = {
  //               first_name: profileData.firstName || profileData.first_name,
  //               last_name: profileData.lastName || profileData.last_name,
  //               username: profileData.username,
  //               email: profileData.email,
  //               mobile: profileData.mobile,
  //               nid: profileData.nid,
  //               house_no: profileData.address.houseNo,
  //               road_no: profileData.address.roadNo,
  //               area: profileData.address.area,
  //               district: profileData.address.district,
  //               administrative_div: profileData.address.administrativeDiv,
  //               zip: profileData.address.zipCode,
  //               birth_date: profileData.birthDate || profileData.birth_date,
  //             };
  //           }

  //           // Update frontend with fetched profile
  //           document.getElementById("staff-email").textContent =
  //             profileData.email || "Not provided";
  //           document.getElementById("staff-phone").textContent =
  //             profileData.mobile || "Not provided";
  //           document.getElementById("staff-house").textContent =
  //             profileData.house_no || "Not provided";
  //           document.getElementById("staff-road").textContent =
  //             profileData.road_no || "Not provided";
  //           document.getElementById("staff-area").textContent =
  //             profileData.area || "Not provided";
  //           document.getElementById("staff-district").textContent =
  //             profileData.district || "Not provided";
  //           document.getElementById("staff-division").textContent =
  //             profileData.administrative_div || "Not provided";
  //           document.getElementById("staff-zip").textContent =
  //             profileData.zip || "Not provided";

  //           // Cache and store for session/local storage
  //           staffData = profileData;
  //           sessionStorage.setItem("staffData", JSON.stringify(staffData));
  //           localStorage.setItem("staffSignupData", JSON.stringify(staffData));

  //           // Close modal if it was open
  //           document.getElementById("editProfileModal").style.display = "none";

  //           showMessage("Profile loaded successfully", "success");
  //         } else {
  //           console.error("API request failed with status:", response.status);
  //           showMessage("Failed to load profile", "error");
  //         }

  //         // If API fetch failed, try to use data from username
  //         if (!staffData) {
  //           console.log("API fetch failed, creating minimal data from username");

  //           // Generate capitalized first and last name based on username
  //           const names = username
  //             .split(/[._-]/)
  //             .map((name) => name.charAt(0).toUpperCase() + name.slice(1));

  //           // Create minimal placeholder data - but this should not happen
  //           // Log an error since we shouldn't be using placeholders
  //           console.error(
  //             "⚠️ Warning: Using placeholder data. API fetch failed."
  //           );

  //           staffData = {
  //             first_name: names[0] || "[First Name]",
  //             last_name: names[1] || "[Last Name]",
  //             username: username,
  //             email: `${username}@example.com`,
  //             mobile: "[Mobile Number]",
  //             nid: "[NID Number]",
  //             birth_date: "",
  //             house_no: "[House No]",
  //             road_no: "[Road No]",
  //             area: "[Area - Neighborhood/Location]",
  //             district: "[District]",
  //             administrative_div: "[Administrative Division]",
  //             zip: "[Zip Code]",
  //           };

  //           // Save data to sessionStorage for this session
  //           sessionStorage.setItem("staffData", JSON.stringify(staffData));
  //         }
  //       } catch (error) {
  //         console.error("Error fetching staff data:", error);
  //         // Don't redirect, instead use whatever data we can get
  //         console.log("Using fallback approach due to error");
  //       }
  //     }

  //     if (staffData) {
  //       // Update profile information
  //       const fullName = `${staffData.first_name || ""} ${
  //         staffData.last_name || ""
  //       }`.trim();

  //       document.getElementById("staff-name-header").textContent =
  //         fullName || username;
  //       document.getElementById("staff-name").textContent = fullName || username;
  //       document.getElementById("staff-username").textContent =
  //         staffData.username || "";
  //       document.getElementById("staff-email").textContent =
  //         staffData.email || "Not provided";
  //       document.getElementById("staff-phone").textContent =
  //         staffData.mobile || "";
  //       document.getElementById("staff-nid").textContent = staffData.nid || "";

  //       // Display date of birth if available
  //       const dobElement = document.getElementById("staff-dob");
  //       if (dobElement) {
  //         const birthDate = staffData.birth_date || staffData.dob;
  //         console.log("Birth date found:", birthDate);

  //         if (birthDate) {
  //           // Format date if it's in ISO format (YYYY-MM-DD)
  //           if (birthDate.includes("-")) {
  //             try {
  //               const date = new Date(birthDate);
  //               const formattedDate = date.toLocaleDateString("en-US", {
  //                 year: "numeric",
  //                 month: "long",
  //                 day: "numeric",
  //               });
  //               dobElement.textContent = formattedDate;
  //             } catch (e) {
  //               console.error("Error formatting date:", e);
  //               dobElement.textContent = birthDate;
  //             }
  //           } else {
  //             dobElement.textContent = birthDate;
  //           }
  //         } else {
  //           dobElement.textContent = "Not provided";
  //         }
  //       }

  //       // Set profile initials
  //       const initialsDiv = document.getElementById("profile-initials");
  //       initialsDiv.textContent = getInitials(
  //         staffData.first_name,
  //         staffData.last_name
  //       );

  //       // Display all address fields separately
  //       document.getElementById("staff-area").textContent =
  //         staffData.area || "Not provided";

  //       // Handle administrative division specifically
  //       const adminDivElement = document.getElementById("staff-division");
  //       if (adminDivElement) {
  //         const adminDiv = staffData.administrative_div;
  //         console.log("Administrative Division found:", adminDiv);
  //         adminDivElement.textContent = adminDiv || "Not provided";
  //       }

  //       document.getElementById("staff-district").textContent =
  //         staffData.district || "Not provided";
  //       document.getElementById("staff-house").textContent =
  //         staffData.house_no || "Not provided";
  //       document.getElementById("staff-road").textContent =
  //         staffData.road_no || "Not provided";
  //       document.getElementById("staff-zip").textContent =
  //         staffData.zip || "Not provided";
  //     } else {
  //       // Redirect to signin if no staff data found
  //       window.location.href = "volunteer_signin.html";
  //     }
  //   };

  // Enhanced function to fetch and display staff data with improved address handling
  const loadStaffProfile = async (forceRefresh = false) => {
    const staffId = localStorage.getItem("staffId"); // recompute each call
    const username = localStorage.getItem("staffUsername"); // recompute each call
    const token = localStorage.getItem("staffToken") || "";

    console.log("Loading staff profile for:", username || staffId);

    let staffData = forceRefresh
      ? null
      : JSON.parse(sessionStorage.getItem("staffData") || "null");

    // Fallback to localStorage cache (but only if not forcing refresh)
    if (!staffData && !forceRefresh) {
      const localStorageData = JSON.parse(
        localStorage.getItem("staffSignupData") || "null"
      );
      if (localStorageData) {
        staffData = localStorageData;
        sessionStorage.setItem("staffData", JSON.stringify(staffData));
      }
    }

    // If still nothing, fetch from API using current username
    if (!staffData && username) {
      try {
        const res = await fetch(`/api/staff/profile/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const result = await res.json();
          let profileData = result.profile || result.data;

          console.log(
            "Profile data received from API:",
            JSON.stringify(profileData, null, 2)
          );

          // Specifically check for administrative division values
          console.log("Administrative Division from API:", {
            flatValue: profileData.administrative_div,
            nestedValue:
              profileData.address && profileData.address.administrativeDiv,
            nestedFlatValue:
              profileData.address && profileData.address.administrative_div,
          });

          // Our updated API provides both nested and flat structure
          // So we don't need to normalize, but we'll ensure we have a complete profile object
          // by checking if important fields are present
          if (profileData && (!profileData.house_no || !profileData.road_no)) {
            // Log the situation for debugging
            console.log("Enhancing profile data with address information");

            // Create a complete profile object with all necessary fields
            profileData = {
              // Personal info
              staff_id: profileData.staffId || profileData.staff_id || "",
              first_name: profileData.firstName || profileData.first_name || "",
              last_name: profileData.lastName || profileData.last_name || "",
              username: profileData.username || "",
              email: profileData.email || "",
              mobile: profileData.mobile || "",
              nid: profileData.nid || "",
              dob: profileData.dob || "",
              status: profileData.status || "",

              // Address info - try both nested and flat structures
              house_no:
                profileData.house_no ||
                (profileData.address && profileData.address.houseNo) ||
                "",
              road_no:
                profileData.road_no ||
                (profileData.address && profileData.address.roadNo) ||
                "",
              area:
                profileData.area ||
                (profileData.address && profileData.address.area) ||
                "",
              district:
                profileData.district ||
                (profileData.address && profileData.address.district) ||
                "",
              administrative_div:
                profileData.administrative_div ||
                (profileData.address &&
                  (profileData.address.administrativeDiv ||
                    profileData.address.administrative_div)) ||
                "",
              zip:
                profileData.zip ||
                (profileData.address &&
                  (profileData.address.zipCode || profileData.address.zip)) ||
                "",

              // Preserve address field for compatibility
              address: profileData.address || {
                houseNo: profileData.house_no || "",
                roadNo: profileData.road_no || "",
                area: profileData.area || "",
                district: profileData.district || "",
                administrativeDiv: profileData.administrative_div || "",
                zipCode: profileData.zip || "",
              },
            };
          }

          staffData = profileData || null;
          if (staffData) {
            sessionStorage.setItem("staffData", JSON.stringify(staffData));
            localStorage.setItem("staffSignupData", JSON.stringify(staffData));
          }
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    }

    if (staffData) {
      renderProfile(staffData);
    } else {
      window.location.href = "volunteer_signin.html";
    }
  };

  // Function to open edit profile modal
  const openEditModal = () => {
    const staffData = JSON.parse(sessionStorage.getItem("staffData"));
    if (!staffData) return;

    // Populate edit form with current values
    document.getElementById("edit-username").value = staffData.username || "";
    document.getElementById("edit-email").value = staffData.email || "";
    document.getElementById("edit-phone").value = staffData.mobile || "";
    document.getElementById("edit-house-no").value = staffData.house_no || "";
    document.getElementById("edit-road-no").value = staffData.road_no || "";
    document.getElementById("edit-area").value = staffData.area || "";

    // Set selected value for district dropdown
    const districtDropdown = document.getElementById("edit-district");
    if (districtDropdown && staffData.district) {
      for (let i = 0; i < districtDropdown.options.length; i++) {
        if (districtDropdown.options[i].value === staffData.district) {
          districtDropdown.selectedIndex = i;
          break;
        }
      }
    }

    // Set selected value for division dropdown
    const divisionDropdown = document.getElementById("edit-division");
    if (divisionDropdown && staffData.administrative_div) {
      for (let i = 0; i < divisionDropdown.options.length; i++) {
        if (
          divisionDropdown.options[i].value === staffData.administrative_div
        ) {
          divisionDropdown.selectedIndex = i;
          break;
        }
      }
    }

    document.getElementById("edit-zip").value = staffData.zip || "";

    // Set date of birth if available
    const dobInput = document.getElementById("edit-dob");
    if (dobInput) {
      const birthDate = staffData.birth_date || staffData.dob;
      if (birthDate) {
        // If date is in ISO format (YYYY-MM-DD), use it directly
        if (birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dobInput.value = birthDate;
        } else {
          // Try to parse other date formats
          try {
            const date = new Date(birthDate);
            if (!isNaN(date.getTime())) {
              // Format as YYYY-MM-DD for input[type="date"]
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              dobInput.value = `${year}-${month}-${day}`;
            }
          } catch (e) {
            console.error("Error parsing date:", e);
          }
        }
      }
    }

    // Add class to body to prevent background scrolling
    document.body.classList.add("modal-open");

    // Show modal
    document.getElementById("editProfileModal").style.display = "block";

    // Scroll modal to top
    const modalContent = document.querySelector(".modal-content");
    if (modalContent) modalContent.scrollTop = 0;
  };

  // Function to close edit profile modal
  const closeEditModal = () => {
    // Remove class from body to re-enable background scrolling
    document.body.classList.remove("modal-open");

    // Ensure the save button is reset
    const saveButton = document.getElementById("saveProfileBtn");
    if (saveButton) {
      saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';
      saveButton.disabled = false;
    }

    document.getElementById("editProfileModal").style.display = "none";
  };

  // Function to save profile changes
  const saveProfileChanges = async (e) => {
    e.preventDefault();

    const staffData = JSON.parse(sessionStorage.getItem("staffData"));
    if (!staffData) return;

    // Validate password fields if any are filled
    const passwordValidation = validatePasswordFields();
    if (!passwordValidation.valid) {
      showMessage(passwordValidation.message, "error");
      return;
    }

    // Show loading indicator
    const submitButton = document.querySelector("#saveProfileBtn");
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitButton.disabled = true;

    // Collect form data values and log them
    const email = document.getElementById("edit-email").value;
    const mobile = document.getElementById("edit-phone").value;
    const house_no = document.getElementById("edit-house-no").value;
    const road_no = document.getElementById("edit-road-no").value;
    const area = document.getElementById("edit-area").value;
    const district = document.getElementById("edit-district").value;
    const administrative_div = document.getElementById("edit-division").value;
    const zip = document.getElementById("edit-zip").value;

    console.log("Form field values:", {
      email,
      mobile,
      house_no,
      road_no,
      area,
      district,
      administrative_div,
      zip,
    });

    const formData = {
      // Keep existing username (cannot be changed)
      username: staffData.username,
      email: email || staffData.email,
      mobile: mobile || staffData.mobile,
      house_no: house_no || staffData.house_no,
      road_no: road_no || staffData.road_no,
      area: area || staffData.area,
      district: district || staffData.district,
      administrative_div: administrative_div || staffData.administrative_div,
      zip: zip || staffData.zip,
      // Keep existing birth date (cannot be changed)
      birth_date: staffData.birth_date || staffData.dob,
    };

    // Extra debug output for the final form data we're using
    console.log("Final form data with fallbacks:", formData);

    // Add password fields if they're filled
    const currentPassword = document.getElementById(
      "edit-current-password"
    ).value;
    const newPassword = document.getElementById("edit-new-password").value;
    const confirmPassword = document.getElementById(
      "edit-confirm-password"
    ).value;

    if (currentPassword && newPassword && confirmPassword) {
      formData.currentPassword = currentPassword;
      formData.newPassword = newPassword;
      formData.confirmPassword = confirmPassword;
    }

    // Always use the backend API (disable local development mode)
    const isLocalDevelopment = false; // Force API mode

    if (isLocalDevelopment) {
      // This block will never execute now
      try {
        console.log("Development mode: Updating profile locally");

        // Keep first_name and last_name from original data
        const updatedData = {
          ...staffData,
          ...formData,
        };

        // Update session storage with new data
        sessionStorage.setItem("staffData", JSON.stringify(updatedData));

        // Store username in localStorage too
        if (formData.username !== staffData.username) {
          localStorage.setItem("staffUsername", formData.username);
        }

        // Reload profile display
        loadStaffProfile();

        // Close modal
        closeEditModal();

        // Show success message
        showMessage("Profile updated successfully! (DEV MODE)", "success");
      } catch (error) {
        console.error("Error updating profile:", error);
        showMessage("Error updating profile. Please try again.", "error");
      }
      return;
    }

    // If not in development mode, try the actual API
    try {
      console.log(
        "Sending update request for staff ID:",
        staffData.staff_id || staffId
      );
      console.log("Update data:", formData);

      // Try to get the staff_id from various sources
      let staffIdToUse = staffData.staff_id;

      // If not found in staffData, try localStorage
      if (!staffIdToUse) {
        staffIdToUse = localStorage.getItem("staffId");
        console.log("Retrieved staffId from localStorage:", staffIdToUse);
      }

      // If still not found, try the staffId parameter
      if (!staffIdToUse) {
        staffIdToUse = staffId;
        console.log("Using staffId from parameter:", staffIdToUse);
      }

      // Final check
      if (!staffIdToUse) {
        console.error("Staff ID not found in any source:", {
          "staffData.staff_id": staffData.staff_id,
          "localStorage.staffId": localStorage.getItem("staffId"),
          "staffId parameter": staffId,
        });
        throw new Error("Staff ID is required but not found in any source");
      }

      console.log("Final staff ID to use for update:", staffIdToUse);

      // Log the current field values
      console.log("Sending form data with these values:", {
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        birthDate: formData.birth_date,
        houseNo: formData.house_no,
        roadNo: formData.road_no,
        area: formData.area,
        district: formData.district,
        administrativeDiv: formData.administrative_div,
        zipCode: formData.zip,
      });

      const requestBody = {
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        birthDate: formData.birth_date || formData.dob, // Support both field names
        houseNo: formData.house_no,
        roadNo: formData.road_no,
        area: formData.area,
        district: formData.district,
        administrativeDiv: formData.administrative_div,
        zipCode: formData.zip,
      };

      console.log("Birthdate being sent:", requestBody.birthDate);

      // Add password fields if they exist
      if (
        formData.currentPassword &&
        formData.newPassword &&
        formData.confirmPassword
      ) {
        requestBody.currentPassword = formData.currentPassword;
        requestBody.newPassword = formData.newPassword;
        requestBody.confirmPassword = formData.confirmPassword;
      }

      console.log("Updating profile for staff ID:", staffIdToUse);
      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(`/api/staff/update/${staffIdToUse}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("staffToken") || ""}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Update response status:", response.status);

      const result = await response.json();
      console.log("Update response:", result);

      if (!response.ok) {
        throw new Error(
          result.message || `Server responded with status: ${response.status}`
        );
      }

      if (result.success) {
        const updatedStaffData = result.data || result.staffData;
        if (!updatedStaffData) {
          throw new Error("Server did not return updated staff data");
        }

        // Preserve fields you know are valid if backend omits them
        if (!updatedStaffData.birth_date && formData.birth_date) {
          updatedStaffData.birth_date = formData.birth_date;
        }
        if (
          !updatedStaffData.administrative_div &&
          formData.administrative_div
        ) {
          updatedStaffData.administrative_div = formData.administrative_div;
        }

        // 1) Cache the fresh object (becomes your source of truth)
        sessionStorage.setItem("staffData", JSON.stringify(updatedStaffData));
        localStorage.setItem(
          "staffSignupData",
          JSON.stringify(updatedStaffData)
        );

        // 2) If username were allowed to change, keep LS in sync:
        if (updatedStaffData.username) {
          localStorage.setItem("staffUsername", updatedStaffData.username);
        }

        // 3) Update the UI immediately from the same object
        renderProfile(updatedStaffData);

        // 4) Close modal & notify
        closeEditModal();
        showMessage("Profile updated successfully!", "success");

        // 5) Optional: also re-validate from server without clearing cache
        //    (use as a background re-sync if you want)
        // loadStaffProfile(true);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage("Error updating profile. Please try again.", "error");
    } finally {
      // Restore button state
      submitButton.innerHTML = originalButtonText;
      submitButton.disabled = false;
      console.log("Button restored to:", originalButtonText);
    }
  };

  // Function to handle sign out
  function handleSignOut() {
    // Clear all stored staff data
    localStorage.removeItem("staffId");
    localStorage.removeItem("staffUsername");
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffSignupData");
    localStorage.removeItem("staffStatus");

    sessionStorage.removeItem("staffData");

    // Show message
    alert("You have been signed out successfully.");

    // Redirect to sign in page
    window.location.href = "volunteer_signin.html";
  }

  // Function to show messages
  const showMessage = (message, type) => {
    const messageDiv = document.getElementById("message");

    // Add icon based on message type
    const icon = type === "success" ? "✅" : "❌";
    messageDiv.innerHTML = `<strong>${icon}</strong> ${message}`;

    messageDiv.className = `message ${type}`;
    messageDiv.style.display = "block";

    // Scroll to top to ensure message is visible
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 5000);
  };

  // Setup password toggle functionality
  const setupPasswordToggles = () => {
    document.querySelectorAll(".toggle-password").forEach((btn) => {
      if (btn.dataset.bound === "1") return; // prevent duplicate binding
      btn.dataset.bound = "1";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const container = this.closest(".password-container");
        if (!container) return;
        const input = container.querySelector("input");
        if (!input) return;
        const showing = input.type === "text";
        input.type = showing ? "password" : "text";
        const icon = this.querySelector("i");
        const label = this.querySelector("small");
        if (icon) icon.className = showing ? "fas fa-eye" : "fas fa-eye-slash";
        if (label) label.textContent = showing ? "Show" : "Hide";
        this.setAttribute("title", showing ? "Show password" : "Hide password");
        this.setAttribute(
          "aria-label",
          showing ? "Show password" : "Hide password"
        );
      });
    });
  };

  // Validate password fields
  const validatePasswordFields = () => {
    const currentPassword = document.getElementById(
      "edit-current-password"
    ).value;
    const newPassword = document.getElementById("edit-new-password").value;
    const confirmPassword = document.getElementById(
      "edit-confirm-password"
    ).value;

    // If all fields are empty, no password change is attempted
    if (!currentPassword && !newPassword && !confirmPassword) {
      return { valid: true };
    }

    // If any password field is filled, all must be filled
    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        valid: false,
        message:
          "To change your password, you must fill all three password fields.",
      };
    }

    // Check if new password meets minimum length
    if (newPassword.length < 8) {
      return {
        valid: false,
        message: "New password must be at least 8 characters long.",
      };
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return {
        valid: false,
        message: "New password and confirmation do not match.",
      };
    }

    // All checks passed
    return { valid: true };
  };

  // Event Listeners
  document.querySelector(".edit-profile-btn").addEventListener("click", () => {
    openEditModal();
    setupPasswordToggles();
  });

  // Add event listener for the "Help Create Individual Account" button
  document
    .querySelector(".create-individual-btn")
    .addEventListener("click", () => {
      window.location.href = "/individual.html";
    });

  // Load staff-assisted accounts
  fetchStaffAssistedAccounts();

  document
    .querySelector(".close-modal")
    .addEventListener("click", closeEditModal);

  // Function to fetch staff-assisted accounts and update the counter
  async function fetchStaffAssistedAccounts() {
    const staffId = localStorage.getItem("staffId");
    console.log("🔍 Attempting to fetch staff-assisted accounts");
    console.log("Staff ID from localStorage:", staffId);

    if (!staffId) {
      console.log(
        "❌ No staff ID found in localStorage, cannot fetch assisted accounts"
      );
      return;
    }

    try {
      console.log(
        `🔄 Fetching assisted accounts for staff ${staffId} from /api/individual/assisted-by/${staffId}`
      );
      const response = await fetch(`/api/individual/assisted-by/${staffId}`);
      const data = await response.json();
      console.log("📊 Assisted accounts data received:", data);

      if (data.success) {
        // Update the counter
        document.getElementById("accounts-count").textContent = data.count;

        // Update the list of accounts
        const accountsList = document.getElementById("created-accounts-list");

        if (data.count > 0) {
          // Clear any existing content
          accountsList.innerHTML = "";

          // Add each account to the list
          data.individuals.forEach((individual) => {
            const accountItem = document.createElement("div");
            accountItem.className = "account-item";

            const formattedDate = new Date(
              individual.assist_date
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            accountItem.innerHTML = `
              <div class="account-details">
                <div class="account-name">${individual.first_name} ${individual.last_name}</div>
                <div class="account-username">@${individual.username}</div>
                <div class="account-date">Created on: ${formattedDate}</div>
              </div>
            `;

            accountsList.appendChild(accountItem);
          });
        } else {
          accountsList.innerHTML =
            '<div class="no-accounts-message">No accounts created yet</div>';
        }
      } else {
        console.error("Failed to fetch assisted accounts:", data.message);
      }
    } catch (error) {
      console.error("Error fetching assisted accounts:", error);
    }
  }
  document
    .getElementById("editProfileForm")
    .addEventListener("submit", saveProfileChanges);

  // Close modal if clicking outside
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("editProfileModal");
    if (e.target === modal) {
      closeEditModal();
    }
  });

  // Function to fetch events that need verification
  async function fetchEventsForVerification() {
    try {
      // Simulate data until backend is implemented
      // Replace this with actual API call when backend is ready
      const mockEvents = [
        {
          id: 1,
          title: "Community Cleanup Drive",
          description:
            "Join us for a community cleanup event at Gulshan Lake Park. Bring gloves and water.",
          location: "Gulshan Lake Park, Dhaka",
          event_date: "2025-10-15",
          event_time: "09:00 AM - 12:00 PM",
          organizer_name: "Green Bangladesh Initiative",
          created_at: "2025-09-10",
        },
        {
          id: 2,
          title: "Education Workshop for Rural Children",
          description:
            "A workshop to teach basic computer skills to underprivileged children in rural areas.",
          location: "Manikganj Community Center",
          event_date: "2025-10-20",
          event_time: "10:00 AM - 03:00 PM",
          organizer_name: "Digital Bangladesh Foundation",
          created_at: "2025-09-12",
        },
        {
          id: 3,
          title: "Health Camp for Elderly",
          description:
            "Free medical checkups and medicines for elderly people in the community.",
          location: "Baridhara DOHS Community Center",
          event_date: "2025-10-25",
          event_time: "08:00 AM - 04:00 PM",
          organizer_name: "Care for Seniors NGO",
          created_at: "2025-09-15",
        },
      ];

      // Display the mock events
      displayEventsForVerification(mockEvents);

      // Uncomment the code below when backend is ready
      /*
      const response = await fetch("/api/staff/events-for-verification", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const events = await response.json();
      displayEventsForVerification(events);
      */
    } catch (error) {
      console.error("Failed to fetch events for verification:", error);
      showMessage(
        "Failed to load events for verification. Please try again.",
        "error"
      );
    }
  }

  // Function to display events that need verification
  function displayEventsForVerification(events) {
    const container = document.getElementById("events-verification-container");
    container.innerHTML = "";

    if (events.length === 0) {
      container.innerHTML = `<div class="no-events-message">No events pending verification.</div>`;
      return;
    }

    events.forEach((event) => {
      const eventCard = document.createElement("div");
      eventCard.className = "event-card";
      eventCard.innerHTML = `
        <h3>${event.title || "Untitled Event"}</h3>
        <p><strong>Description:</strong> ${
          event.description || "No description"
        }</p>
        <p><strong>Location:</strong> ${
          event.location || "No location specified"
        }</p>
        <p><strong>Date:</strong> ${new Date(
          event.event_date
        ).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${event.event_time || "Not specified"}</p>
        <p><strong>Organizer:</strong> ${event.organizer_name || "Unknown"}</p>
        <p><strong>Submitted on:</strong> ${new Date(
          event.created_at
        ).toLocaleDateString()}</p>
        <div class="verification-actions">
          <button class="verify-btn" data-id="${event.id}">Verify Event</button>
          <button class="reject-btn" data-id="${event.id}">Reject Event</button>
        </div>
      `;
      container.appendChild(eventCard);

      // Add event listeners for verify and reject buttons
      eventCard
        .querySelector(".verify-btn")
        .addEventListener("click", () => verifyEvent(event.id));
      eventCard
        .querySelector(".reject-btn")
        .addEventListener("click", () => rejectEvent(event.id));
    });
  }

  // Function to verify an event
  async function verifyEvent(eventId) {
    try {
      // Simulate API call until backend is implemented
      console.log(`Verifying event with ID: ${eventId}`);
      showMessage("Event successfully verified", "success");

      // Remove the verified event from the list
      const eventCard = document
        .querySelector(`.verify-btn[data-id="${eventId}"]`)
        .closest(".event-card");
      if (eventCard) {
        eventCard.style.opacity = "0";
        setTimeout(() => {
          eventCard.remove();

          // Check if there are no more events
          const container = document.getElementById(
            "events-verification-container"
          );
          if (container.children.length === 0) {
            container.innerHTML = `<div class="no-events-message">No events pending verification.</div>`;
          }
        }, 300);
      }

      // Uncomment when backend is ready
      /*
      const response = await fetch(`/api/staff/verify-event/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "verified" }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      showMessage("Event successfully verified", "success");
      fetchEventsForVerification(); // Refresh the list
      */
    } catch (error) {
      console.error("Failed to verify event:", error);
      showMessage("Failed to verify event. Please try again.", "error");
    }
  }

  // Function to reject an event
  async function rejectEvent(eventId) {
    const reason = prompt("Please provide a reason for rejecting this event:");
    if (!reason) return; // User cancelled

    try {
      // Simulate API call until backend is implemented
      console.log(`Rejecting event with ID: ${eventId}. Reason: ${reason}`);
      showMessage("Event rejected", "success");

      // Remove the rejected event from the list
      const eventCard = document
        .querySelector(`.reject-btn[data-id="${eventId}"]`)
        .closest(".event-card");
      if (eventCard) {
        eventCard.style.opacity = "0";
        setTimeout(() => {
          eventCard.remove();

          // Check if there are no more events
          const container = document.getElementById(
            "events-verification-container"
          );
          if (container.children.length === 0) {
            container.innerHTML = `<div class="no-events-message">No events pending verification.</div>`;
          }
        }, 300);
      }

      // Uncomment when backend is ready
      /*
      const response = await fetch(`/api/staff/reject-event/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          status: "rejected",
          rejection_reason: reason
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      showMessage("Event rejected", "success");
      fetchEventsForVerification(); // Refresh the list
      */
    } catch (error) {
      console.error("Failed to reject event:", error);
      showMessage("Failed to reject event. Please try again.", "error");
    }
  }

  // Load staff-assisted accounts and events for verification
  fetchStaffAssistedAccounts();
  fetchEventsForVerification();

  // Initial load of the profile
  loadStaffProfile();
});
