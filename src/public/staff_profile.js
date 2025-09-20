document.addEventListener('DOMContentLoaded', function() {
    // Check if staff is logged in
    const staffData = localStorage.getItem('staffData');
    if (!staffData) {
        window.location.href = "staffsignin.html";
        return;
    }
    const staff = JSON.parse(staffData);

    // Fill profile fields
    document.getElementById('staffName').textContent = `${staff.first_name} ${staff.last_name}`;
    document.getElementById('staffId').textContent = staff.staff_id;
    document.getElementById('staffUsername').textContent = staff.username;
    document.getElementById('staffEmail').textContent = staff.email || 'N/A';
    document.getElementById('staffMobile').textContent = staff.mobile || 'N/A';
    document.getElementById('staffNid').textContent = staff.nid || 'N/A';
    document.getElementById('staffDob').textContent = staff.dob ? staff.dob.split('T')[0] : 'N/A';
    document.getElementById('staffAddress').textContent =
        `${staff.house_no || ''} ${staff.road_no || ''}, ${staff.area || ''}, ${staff.district || ''}, ${staff.administrative_div || ''}, ${staff.zip || ''}`;
    document.getElementById('staffStatus').textContent = staff.status;

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('staffId');
        localStorage.removeItem('staffData');
        localStorage.removeItem('userType');
        window.location.href = "staffsignin.html";
    });
    document.getElementById('createIndividualBtn').addEventListener('click', function() {
    // Store assisting staff info in localStorage/sessionStorage for use in individual.html
    const staffData = localStorage.getItem('staffData');
    if (staffData) {
        sessionStorage.setItem('assistingStaff', staffData);
    }
    window.location.href = "individual.html";
});
});