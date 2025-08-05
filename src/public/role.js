// No interactive behavior was provided in the React component,
// but you can add any JavaScript here if you want to add
// click handlers or other behavior for the buttons/rectangles.

// Example: add click event listeners for each role div to navigate somewhere

document.addEventListener("DOMContentLoaded", () => {
  const roles = [
    { selector: ".overlap-group", name: "SEEKER", url: "individual.html" },
    { selector: ".overlap-2", name: "NON PROFIT ORGANIZATION", url: "foundation.html" },
    { selector: ".overlap-3", name: "DONOR", url: "donor.html" },
  ];

  roles.forEach(({ selector, url }) => {
    const el = document.querySelector(selector);
    if (el) {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => {
        window.location.href = url;
      });
    }
  });
});
