document.addEventListener("DOMContentLoaded", () => {
  // Function to fetch and display staff data
  const loadStaffProfile = () => {
    // In a real application, you would fetch this data from a server
    // For now, we'll use mock data, potentially from localStorage if the user "signed in"
    const staffData = getMockStaffData();

    if (staffData) {
      document.getElementById("staff-name-header").textContent =
        staffData.name.split(" ")[0];
      document.getElementById("staff-name").textContent = staffData.name;
      document.getElementById("staff-email").textContent = staffData.email;
      document.getElementById("staff-phone").textContent = staffData.phone;
      document.getElementById("staff-location").textContent =
        staffData.location;
      document.getElementById("staff-join-date").textContent =
        staffData.joinDate;
    } else {
      // Handle case where no staff data is found (e.g., redirect to sign-in)
      window.location.href = "signin.html";
    }
  };

  // Mock function to get staff data
  // This would be replaced by an API call
  const getMockStaffData = () => {
    // For demonstration, let's create some fake data.
    // In a real scenario, you might get this from localStorage after sign-in
    // or from a session managed on the server.
    return {
      id: "STF12345",
      name: "Zeaul Alam",
      email: "staff.member@shodesh.org",
      phone: "+880 1712 345 679",
      location: "Dhaka, Bangladesh",
      joinDate: "2025-08-19",
      role: "Field Staff",
    };
  };

  // Event Listeners for buttons
  const editProfileBtn = document.querySelector(".edit-profile-btn");
  const viewTasksBtn = document.querySelector(".view-tasks-btn");

  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      alert("Edit Profile functionality is not yet implemented.");
      // Here you would typically open a modal or redirect to an edit page
    });
  }

  if (viewTasksBtn) {
    viewTasksBtn.addEventListener("click", () => {
      alert("View Assigned Tasks functionality is not yet implemented.");
      // Here you would redirect to a tasks page
    });
  }

  // Initial load of the profile
  loadStaffProfile();
});
