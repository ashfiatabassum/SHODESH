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

  roles.forEach(({ selector, url, name }) => {
    const el = document.querySelector(selector);
    if (el) {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => {
        // Create beautiful loading overlay
        createLoadingOverlay(name);
        
        // Navigate after animation
        setTimeout(() => {
          window.location.href = url;
        }, 1000);
      });
    }
  });
});

// Beautiful loading overlay function
function createLoadingOverlay(roleName) {
  // Create loading overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(45deg, 
      rgba(74, 151, 130, 0.9) 0%, 
      rgba(175, 62, 62, 0.9) 50%,
      rgba(74, 151, 130, 0.9) 100%
    );
    background-size: 400% 400%;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: overlayFadeIn 0.5s ease-out, gradientShift 3s ease-in-out infinite;
  `;
  
  // Create loading text
  const loadingText = document.createElement('div');
  loadingText.style.cssText = `
    color: white;
    font-size: 3vw;
    font-weight: 700;
    font-family: "Roboto Condensed", Helvetica, sans-serif;
    animation: loadingPulse 1s ease-in-out infinite;
    margin-bottom: 20px;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  `;
  loadingText.textContent = `Loading ${roleName}...`;
  
  // Create animated dots
  const dotsContainer = document.createElement('div');
  dotsContainer.style.cssText = `
    display: flex;
    gap: 10px;
  `;
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      width: 15px;
      height: 15px;
      background: white;
      border-radius: 50%;
      animation: dotBounce 1.4s ease-in-out infinite;
      animation-delay: ${i * 0.2}s;
    `;
    dotsContainer.appendChild(dot);
  }
  
  // Create spinning loader
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-top: 30px;
  `;
  
  overlay.appendChild(loadingText);
  overlay.appendChild(dotsContainer);
  overlay.appendChild(spinner);
  document.body.appendChild(overlay);
  
  // Add animation styles if they don't exist
  if (!document.querySelector('#loading-animations')) {
    const style = document.createElement('style');
    style.id = 'loading-animations';
    style.textContent = `
      @keyframes overlayFadeIn {
        0% { opacity: 0; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes loadingPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
      }
      @keyframes dotBounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}
