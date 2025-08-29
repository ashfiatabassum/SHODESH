function goBackToProfile() {
  window.location.href = "profileindividual.html";
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

  const form = document.getElementById("editIndividualForm");
  if (!form) {
    console.error("❌ editIndividualForm not found in DOM");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("✉️ Intercepted form submit, sending PUT request");

    const individualId = localStorage.getItem("individualId");
    if (!individualId) {
      showMessage("individual ID missing. Please sign in again.", "error");
      return;
    }

    const updates = {};

    if (document.getElementById("updateUsername").checked) {
      updates.username = document.getElementById("usernameField").value.trim();
      if (!updates.username) {
        showMessage("Please enter a new username.", "error");
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

    console.log("🟢 Debug Check: individualId =", individualId);

if (!individualId) {
  console.error("❌ individualId is missing in localStorage!");
  console.log("👉 Current localStorage keys:", Object.keys(localStorage));
  showMessage("individual ID missing. Please sign in again.", "error");
  return;
}

console.log("➡️ Final Endpoint will be:", `http://localhost:3000/api/individual/update/${individualId}`);




    console.log("➡️ Sending updates:", updates);
console.log("➡️ Endpoint:", `/api/individual/update/${individualId}`);

    try {
      const response = await fetch(`http://localhost:3000/api/individual/update/${individualId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });

      console.log("📡 PUT request sent to /api/individual/update/", individualId);

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
