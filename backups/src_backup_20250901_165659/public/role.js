// Simple loading animation function
// Global flag to track if user is returning from another page
let isReturningFromPage = false;

// Function to hide loading screens
function hideLoadingScreens() {
    const loadingElements = document.querySelectorAll('[style*="position: fixed"][style*="z-index: 9999"]');
    loadingElements.forEach(element => {
        element.remove();
    });
}

// Detect if user is returning from another page
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // User used back button
        isReturningFromPage = true;
        hideLoadingScreens();
    }
});

// Check referrer on page load
document.addEventListener('DOMContentLoaded', function() {
    const referrer = document.referrer;
    if (referrer.includes('individual.html') || 
        referrer.includes('foundation.html') || 
        referrer.includes('donor.html')) {
        isReturningFromPage = true;
    }
});

// Simple loading animation function (your existing function stays here)
function showSimpleLoading(buttonText) {
    // ... your existing code ...
}
function showSimpleLoading(buttonText) {
    // Create simple loading overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
        font-family: Arial, sans-serif;
    `;
    
    // Loading text
    const loadingText = document.createElement('div');
    loadingText.style.cssText = `
        font-size: 24px;
        margin-bottom: 20px;
        font-weight: bold;
    `;
    loadingText.textContent = `Loading ${buttonText}...`;
    
    // Simple spinner
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;
    
    // Add CSS animation
    if (!document.querySelector('#simple-loading-style')) {
        const style = document.createElement('style');
        style.id = 'simple-loading-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    overlay.appendChild(loadingText);
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    
    return overlay;
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("Role selection page loaded");
    
    // Seeker button
    const seekerButton = document.querySelector('.overlap-group');
    if (seekerButton) {
        seekerButton.addEventListener('click', function() {
            console.log("Seeker button clicked");
            
            // Only show loading if NOT returning from another page
            if (!isReturningFromPage) {
                const loadingOverlay = showSimpleLoading("Seeker");
                setTimeout(() => {
                    window.location.href = "individual.html";
                }, 1000);
            } else {
                // Direct navigation without loading
                window.location.href = "individual.html";
                isReturningFromPage = false; // Reset flag
            }
        });
        seekerButton.style.cursor = "pointer";
        
        // Hover effect
        seekerButton.addEventListener('mouseenter', function() {
            this.style.transform = "scale(1.05)";
            this.style.transition = "transform 0.2s ease";
        });
        seekerButton.addEventListener('mouseleave', function() {
            this.style.transform = "scale(1)";
        });
    }
    
    // Non-Profit Organization button
    const nonProfitButton = document.querySelector('.overlap-2');
    if (nonProfitButton) {
        nonProfitButton.addEventListener('click', function() {
            console.log("Non-Profit Organization button clicked");
            
            // Only show loading if NOT returning from another page
            if (!isReturningFromPage) {
                const loadingOverlay = showSimpleLoading("Non-Profit Organization");
                setTimeout(() => {
                    window.location.href = "foundation.html";
                }, 1000);
            } else {
                // Direct navigation without loading
                window.location.href = "foundation.html";
                isReturningFromPage = false; // Reset flag
            }
        });
        nonProfitButton.style.cursor = "pointer";
        
        // Hover effect
        nonProfitButton.addEventListener('mouseenter', function() {
            this.style.transform = "scale(1.05)";
            this.style.transition = "transform 0.2s ease";
        });
        nonProfitButton.addEventListener('mouseleave', function() {
            this.style.transform = "scale(1)";
        });
    }
    
    // Donor button
    const donorButton = document.querySelector('.overlap-3');
    if (donorButton) {
        donorButton.addEventListener('click', function() {
            console.log("Donor button clicked");
            
            // Only show loading if NOT returning from another page
            if (!isReturningFromPage) {
                const loadingOverlay = showSimpleLoading("Donor");
                setTimeout(() => {
                    window.location.href = "donor.html";
                }, 1000);
            } else {
                // Direct navigation without loading
                window.location.href = "donor.html";
                isReturningFromPage = false; // Reset flag
            }
        });
        donorButton.style.cursor = "pointer";
        
        // Hover effect
        donorButton.addEventListener('mouseenter', function() {
            this.style.transform = "scale(1.05)";
            this.style.transition = "transform 0.2s ease";
        });
        donorButton.addEventListener('mouseleave', function() {
            this.style.transform = "scale(1)";
        });
    }
});