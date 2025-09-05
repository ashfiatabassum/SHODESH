function goBackToProfile() {
  window.location.href = "profilefoundation.html";
}

function toggleField(field) {
  document.getElementById(field + "Field").style.display =
    document.getElementById("update" + capitalize(field)).checked ? "block" : "none";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ✅ Wait until DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM ready, attaching form handler");

  const form = document.getElementById("editFoundationForm");
  if (!form) {
    console.error("❌ editFoundationForm not found in DOM");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("✉️ Intercepted form submit, sending PUT request");

    const foundationId = localStorage.getItem("foundationId");
    if (!foundationId) {
      showMessage("Foundation ID missing. Please sign in again.", "error");
      return;
    }

    const updates = {};

    if (document.getElementById("updateUsername").checked) {
      updates.username = document.getElementById("usernameField").value.trim();
      if (!updates.username) {
        showMessage("Please enter a new username.", "error");
        return;
      }
      // Check username availability before submitting
      const checkRes = await fetch(`/api/foundation/check-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: "username", value: updates.username, foundationId })
      });
      const checkData = await checkRes.json();
      if (!checkData.available) {
        showMessage("Username is already taken. Please choose a different one.", "error");
        return;
      }
    }

    if (document.getElementById("updatePassword").checked) {
      updates.newPassword = document.getElementById("passwordField").value;
      if (!updates.newPassword) {
        showMessage("Please enter a new password.", "error");
        return;
      }
    }

    updates.currentPassword = document.getElementById("currentPasswordField").value;
    if (!updates.currentPassword) {
      showMessage("Please enter your current password to confirm.", "error");
      return;
    }

    if (!updates.username && !updates.newPassword) {
      showMessage("Select at least one field to update.", "error");
      return;
    }



    console.log("➡️ Sending updates:", updates);
console.log("➡️ Endpoint:", `/api/foundation/update/${foundationId}`);

    try {
      const response = await fetch(`http://localhost:3000/api/foundation/update/${foundationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });

      console.log("📡 PUT request sent to /api/foundation/update/", foundationId);

      const result = await response.json();
      if (result.success) {
        showMessage("Profile updated successfully!", "success");
        setTimeout(goBackToProfile, 2000);
      } else {
        showMessage(result.message || "Update failed.", "error");
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      showMessage("Network error. Please try again.", "error");
    }
  });
});

function showMessage(msg, type) {
  const el = document.getElementById("updateMessage");
  el.textContent = msg;
  el.className = type;
}
