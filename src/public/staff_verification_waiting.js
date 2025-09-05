document.addEventListener('DOMContentLoaded', function() {
    // Check if we were redirected here after signup or if user manually navigated
    const urlParams = new URLSearchParams(window.location.search);
    const fromSignup = urlParams.get('from') === 'signup';
    const staffId = urlParams.get('staffId');
    
    if (fromSignup && staffId) {
        // User was redirected here after signup - we can use staffId for future API calls
        console.log('Redirected from signup. Staff ID:', staffId);
        
        // Store staff ID in localStorage to remember this user's state
        localStorage.setItem('pending_staff_id', staffId);
        
        // We could potentially poll for verification status here
        // For now, we'll just update the UI to show confirmation
        document.querySelector('.status').textContent = 'Status: Awaiting Admin Verification';
    } else {
        // Check if we have a pending staff ID in localStorage
        const pendingStaffId = localStorage.getItem('pending_staff_id');
        
        if (pendingStaffId) {
            console.log('Returning user with pending verification. Staff ID:', pendingStaffId);
            // We could check verification status from API
            // For now just show the waiting message
        } else {
            // User navigated here directly without signing up
            console.log('User navigated directly to waiting page');
            document.querySelector('.status').textContent = 'Status: No Pending Registration';
        }
    }
    
    // Add event listener for the sign-in button
    const signInButton = document.querySelector('.button');
    if (signInButton) {
        signInButton.addEventListener('click', function() {
            // Clear the pending staff ID when navigating to sign in
            // This is optional - you might want to keep it to auto-fill username
            // localStorage.removeItem('pending_staff_id');
        });
    }
});
