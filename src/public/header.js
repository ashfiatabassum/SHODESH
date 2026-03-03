// Header loading and navigation management
// Loads partials/header.html and sets active navigation link based on current page

async function loadHeader() {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  try {
    const res = await fetch("partials/header.html", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load header");
    mount.innerHTML = await res.text();
    setActiveNav();
  } catch (error) {
    console.error("Error loading header:", error);
  }
}

function setActiveNav() {
  // Get current page filename
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  // Map file names to navigation data attributes
  const map = {
    "index.html": "home",
    "": "home",
    "about.html": "about",
    "contact.html": "contact",
    "resources.html": "resources",
    "search.html": "search",
    "browse.html": "categories",
    "signin.html": "signin",
    "volunteer.html": "join",
  };

  const key = map[path] || null;
  if (!key) return;

  // Find and highlight the active link
  const link = document.querySelector(`.nav-links a[data-nav="${key}"]`);
  if (link) {
    link.classList.add("active");
  }
}

// Load header when DOM is ready
document.addEventListener("DOMContentLoaded", loadHeader);
