// Volunteer Page JavaScript

// Function to handle volunteer application
function applyAsVolunteer() {
    // Check if user is signed in (you can modify this logic based on your authentication system)
    const isSignedIn = checkUserSignInStatus();
    
    if (!isSignedIn) {
        // If not signed in, redirect to volunteer sign in page
        window.location.href = 'volunteer_signin.html';
        return;
    }
    
    // If signed in, show application form
    showVolunteerApplicationForm();
}

// Function to check if user is signed in (placeholder - implement based on your auth system)
function checkUserSignInStatus() {
    // Check if volunteer is signed in
    return localStorage.getItem('volunteerSignedIn') === 'true';
}

// Function to show volunteer application form
function showVolunteerApplicationForm() {
    // Create modal for application form
    const modal = document.createElement('div');
    modal.className = 'application-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Staff Application Form</h2>
                <span class="close-btn" onclick="closeApplicationModal()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="volunteerApplicationForm" onsubmit="submitApplication(event)">
                    <div class="form-group">
                        <label for="fullName">Full Name *</label>
                        <input type="text" id="fullName" name="fullName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Phone Number *</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="location">Your Location (District) *</label>
                        <select id="location" name="location" required>
                            <option value="">Select your district</option>
                            <option value="Dhaka">Dhaka</option>
                            <option value="Chittagong">Chittagong</option>
                            <option value="Sylhet">Sylhet</option>
                            <option value="Rajshahi">Rajshahi</option>
                            <option value="Khulna">Khulna</option>
                            <option value="Barisal">Barisal</option>
                            <option value="Rangpur">Rangpur</option>
                            <option value="Mymensingh">Mymensingh</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="experience">Previous Staff Experience</label>
                        <textarea id="experience" name="experience" placeholder="Tell us about any previous staff work or community involvement..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="motivation">Why do you want to work as staff with Shodesh? *</label>
                        <textarea id="motivation" name="motivation" required placeholder="Share your motivation and what you hope to achieve..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="availability">Availability *</label>
                        <select id="availability" name="availability" required>
                            <option value="">Select your availability</option>
                            <option value="weekends">Weekends only</option>
                            <option value="evenings">Weekday evenings</option>
                            <option value="flexible">Flexible schedule</option>
                            <option value="full-time">Full-time availability</option>
                        </select>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="terms" name="terms" required>
                        <label for="terms">I agree to the terms and conditions and commit to upholding Shodesh's values *</label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="closeApplicationModal()" class="cancel-btn">Cancel</button>
                        <button type="submit" class="submit-btn">Submit Application</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles if not already added
    if (!document.getElementById('modal-styles')) {
        addModalStyles();
    }
}

// Function to close application modal
function closeApplicationModal() {
    const modal = document.querySelector('.application-modal');
    if (modal) {
        modal.remove();
    }
}

// Function to submit volunteer application
function submitApplication(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const applicationData = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    // Simulate API call (replace with actual API endpoint)
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        alert('Thank you for your application! We will review it and contact you within 2-3 business days.');
        
        // Close modal
        closeApplicationModal();
        
        // You can add actual API call here to submit the application
        console.log('Application submitted:', applicationData);
        
        // Optional: Send data to your backend
        // fetch('/api/volunteer-applications', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(applicationData)
        // });
        
    }, 2000);
}

// Function to add modal styles
function addModalStyles() {
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .application-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background: white;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
            background: #18392b;
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h2 {
            margin: 0;
            font-size: 24px;
        }
        
        .close-btn {
            font-size: 28px;
            cursor: pointer;
            line-height: 1;
        }
        
        .close-btn:hover {
            opacity: 0.7;
        }
        
        .modal-body {
            padding: 30px;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #18392b;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        
        .form-group textarea {
            height: 80px;
            resize: vertical;
        }
        
        .checkbox-group {
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        
        .checkbox-group input {
            width: auto;
            margin-top: 2px;
        }
        
        .checkbox-group label {
            margin-bottom: 0;
            font-weight: normal;
        }
        
        .form-actions {
            display: flex;
            gap: 15px;
            justify-content: flex-end;
            margin-top: 30px;
        }
        
        .cancel-btn,
        .submit-btn {
            padding: 12px 25px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        }
        
        .cancel-btn {
            background: #6c757d;
            color: white;
        }
        
        .cancel-btn:hover {
            background: #545b62;
        }
        
        .submit-btn {
            background: #588b76;
            color: white;
        }
        
        .submit-btn:hover {
            background: #4a7763;
        }
        
        .submit-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
    `;
    
    document.head.appendChild(style);
}

// Smooth scrolling for any internal links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add fade-in animation to cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    const cards = document.querySelectorAll('.info-card, .role-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});
