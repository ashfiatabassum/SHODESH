// Volunteer Sign In Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("volunteerSigninForm");
  const formWrapper = document.querySelector(".form-wrapper");

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    handleVolunteerSignin();
  });

  // Add input validation styling
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("blur", validateInput);
    input.addEventListener("input", clearValidationError);
  });

  // Setup password toggle functionality
  const togglePassword = document.querySelector(".toggle-password");
  const passwordInput = document.getElementById("password");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const currentlyPassword = passwordInput.type === "password";
      passwordInput.type = currentlyPassword ? "text" : "password";
      const icon = this.querySelector("i");
      const textSpan = this.querySelector("span");
      if (icon)
        icon.className =
          passwordInput.type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
      if (textSpan)
        textSpan.textContent =
          passwordInput.type === "password" ? "Show" : "Hide";
      this.setAttribute(
        "aria-label",
        passwordInput.type === "password" ? "Show password" : "Hide password"
      );
    });
  }

  // Check if user just signed up and show a welcome message
  const newStaffUsername = sessionStorage.getItem("newStaffUsername");
  if (newStaffUsername) {
    const usernameInput = document.getElementById("username");
    if (usernameInput) {
      usernameInput.value = newStaffUsername;
    }

    showWelcomeMessage(
      "Welcome! Your account has been created. Please sign in with your password."
    );
    // Clear the session storage after using it
    sessionStorage.removeItem("newStaffUsername");
  }
});

function handleVolunteerSignin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Basic validation
  if (!username || !password) {
    showError("Please fill in all fields");
    return;
  }

  // Show loading state
  showLoading(true);

  // Always use the real API (no more development mode simulation)
  console.log("Sending login request to API");

  // For production - Send credentials to the backend
  fetch("/api/staff/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      console.log("Sign-in response status:", response.status);

      // Clone the response before reading its body
      const responseClone = response.clone();

      // Parse the JSON regardless of response status
      return response
        .json()
        .then((data) => {
          // Add status to the data object
          data._responseStatus = response.status;
          console.log("Sign-in response data:", data);
          return data;
        })
        .catch((err) => {
          // If we can't parse JSON, try to get the text content
          console.error("Error parsing JSON response:", err);
          return responseClone
            .text()
            .then((textContent) => {
              console.log("Raw server response:", textContent);
              return {
                success: false,
                _responseStatus: response.status,
                message: `Server error: ${textContent.substring(0, 100)}...`,
              };
            })
            .catch((textErr) => {
              // If even text parsing fails
              console.error("Error getting response text:", textErr);
              return {
                success: false,
                _responseStatus: response.status,
                message: "Server error: Unable to parse response",
              };
            });
        });
    })
    .then((data) => {
      console.log("Sign-in response data:", data);

      // Check if response was not ok (status >= 400)
      if (data._responseStatus >= 400) {
        throw new Error(data.message || "Server error occurred");
      }

      return data;
    })
    .then((data) => {
      if (data.success) {
        // Store staff authentication data
        localStorage.setItem("staffId", data.staffId);
        localStorage.setItem("staffUsername", username);

        // Store staff data
        if (data.staffData) {
          localStorage.setItem("staffData", JSON.stringify(data.staffData));
          sessionStorage.setItem("staffData", JSON.stringify(data.staffData));
        }

        // If we received a token, store it for authenticated requests
        if (data.token) {
          localStorage.setItem("staffToken", data.token);
        }

        // Clear any existing staff data first
        localStorage.removeItem("staffSignupData");
        sessionStorage.removeItem("staffData");

        // If we received staff data, store it for the profile page
        if (data.staffData) {
          console.log("Storing staff data:", data.staffData);
          localStorage.setItem(
            "staffSignupData",
            JSON.stringify(data.staffData)
          );
          sessionStorage.setItem("staffData", JSON.stringify(data.staffData));
        } else {
          console.warn("No staff data received from server");
        }

        // Store staff status
        if (data.staffStatus) {
          localStorage.setItem("staffStatus", data.staffStatus);
        }

        // Show success message and redirect
        showSuccess("Sign in successful! Redirecting to your profile...");
        setTimeout(() => {
          window.location.href = "staff_profile.html"; // Note: removed the leading slash
        }, 1500);
      } else {
        showError(data.message || "Invalid username or password");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showError("An error occurred. Please try again.");
    })
    .finally(() => {
      showLoading(false);
    });
}

function authenticateVolunteer(username, password) {
  // This is a placeholder authentication function
  // In a real application, you would send credentials to your backend

  // For demonstration, we'll accept any username with password "staff123"
  // You should replace this with actual authentication logic
  return password === "staff123";
}

function handleSignup() {
  // Redirect to the volunteer signup page
  window.location.href = "volunteer_signup.html";
}

function validateInput(e) {
  const input = e.target;
  const value = input.value.trim();

  // Remove existing error styling
  clearValidationError(e);

  if (!value) {
    showInputError(input, "This field is required");
  } else if (input.type === "password" && value.length < 6) {
    showInputError(input, "Password must be at least 6 characters");
  }
}

function clearValidationError(e) {
  const input = e.target;
  const errorMsg = input.parentNode.querySelector(".error-message");
  if (errorMsg) {
    errorMsg.remove();
  }
  input.classList.remove("error");
}

function showInputError(input, message) {
  input.classList.add("error");

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  errorDiv.style.color = "#e74c3c";
  errorDiv.style.fontSize = "14px";
  errorDiv.style.marginTop = "5px";

  input.parentNode.appendChild(errorDiv);
}

function showError(message) {
  removeExistingMessages();

  const errorDiv = document.createElement("div");
  errorDiv.className = "message error-msg";
  errorDiv.innerHTML = `
        <div style="background: #f8d7da; color: #721c24; padding: 12px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #f5c6cb;">
            ❌ ${message}
        </div>
    `;

  const form = document.getElementById("volunteerSigninForm");
  form.insertBefore(errorDiv, form.firstChild);
}

function showSuccess(message) {
  removeExistingMessages();

  const successDiv = document.createElement("div");
  successDiv.className = "message success-msg";
  successDiv.innerHTML = `
        <div style="background: #d4edda; color: #155724; padding: 12px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #c3e6cb;">
            ✅ ${message}
        </div>
    `;

  const form = document.getElementById("volunteerSigninForm");
  form.insertBefore(successDiv, form.firstChild);
}

function showWelcomeMessage(message) {
  removeExistingMessages();

  const welcomeDiv = document.createElement("div");
  welcomeDiv.className = "message welcome-msg";
  welcomeDiv.innerHTML = `
        <div style="background: #cce5ff; color: #004085; padding: 12px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #b8daff;">
            👋 ${message}
        </div>
    `;

  const form = document.getElementById("volunteerSigninForm");
  form.insertBefore(welcomeDiv, form.firstChild);
}

function removeExistingMessages() {
  const existingMessages = document.querySelectorAll(".message");
  existingMessages.forEach((msg) => msg.remove());
}

function showLoading(show) {
  const formWrapper = document.querySelector(".form-wrapper");
  const submitBtn = document.querySelector(".signin-submit-btn");

  if (show) {
    formWrapper.classList.add("loading");
    submitBtn.textContent = "Signing In...";
  } else {
    formWrapper.classList.remove("loading");
    submitBtn.textContent = "Sign In";
  }
}

// Add CSS for input error styling
const style = document.createElement("style");
style.textContent = `
    .input-group input.error {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
    }
    
    .error-message {
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .message {
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
