document.getElementById("signin").addEventListener("click", async () => {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  
  // Basic validation
  if (!user || !pass) {
    alert("Please enter both username and password");
    return;
  }
  
  // Show loading state
  const signinBtn = document.getElementById("signin");
  const originalText = signinBtn.textContent;
  signinBtn.textContent = "Signing in...";
  signinBtn.disabled = true;
  
  try {
    console.log('🔐 Attempting donor sign in...');
    
    // Send login request to backend
    const response = await fetch('/api/donor/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: user,
        password: pass
      })
    });
    
    const data = await response.json();
    console.log('📋 Sign in response:', data);
    
    if (data.success) {
      // Store donor data for profile page
      localStorage.setItem('donorId', data.donorId);
      localStorage.setItem('donorData', JSON.stringify(data.donorData));
      
      alert(`✅ Welcome back, ${data.donorData.personalInfo.firstName}!`);
      
      // Redirect to donor profile
      window.location.href = 'profiledonor.html';
    } else {
      alert(`❌ Sign in failed: ${data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Sign in error:', error);
    alert('❌ An error occurred during sign in. Please try again.');
  } finally {
    // Reset button state
    signinBtn.textContent = originalText;
    signinBtn.disabled = false;
  }
});

// Optional: Handle Enter key press
document.addEventListener('DOMContentLoaded', function() {
  const passwordField = document.getElementById("password");
  const usernameField = document.getElementById("username");
  
  if (passwordField) {
    passwordField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        document.getElementById("signin").click();
      }
    });
  }
  
  if (usernameField) {
    usernameField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        document.getElementById("signin").click();
      }
    });
  }
});