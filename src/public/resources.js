// Resources Page JavaScript

// Emergency numbers data
const emergencyNumbers = [
  { name: "National Emergency", number: "999", description: "Police, Ambulance, Fire" },
  { name: "Fire Service & Civil Defence", number: "102", description: "Direct fire and rescue" },
  { name: "Violence Against Women & Children", number: "109", description: "Prevention helpline" },
  { name: "Anti-Corruption Commission", number: "106", description: "Report corruption" },
  { name: "National Helpline Centre", number: "333", description: "Public services info" },
  { name: "Bangladesh Railway", number: "131", description: "Railway assistance" },
  { name: "Mobile Customer Service", number: "121", description: "Mobile operators service" },
  { name: "Mobile Complaints", number: "158", description: "Mobile complaints" },
  { name: "Coast Guard Emergency", number: "151", description: "Maritime emergencies" }
];
// >>> in resources.js, right after the emergencyNumbers definition <<<


const bloodBankNumbers = [
  {
    name: "Bangladesh Red Crescent Blood Bank",
    address: "7/5 Aurongzeb Road, Mohammadpur, Dhaka",

    number: "02-223310368"
  },
  {
    name: "Holy Family Red Crescent Blood Center",
    address: "1st Floor, Out-Door, 1 Eskaton Garden Road, Dhaka",

    number: "01811458536"
  },
  {
    name: "Chattogram Fatema Begum Red Crescent Blood Center",
    address: "395 Anderkilla, Chattogram",
    number: "031620926"
  },
  {
    name: "Jashore Ahad Red Crescent Blood Center",
    address: "Munshi Mehabullah Road, Jashore",
    number: "042168882"
  },
  {
    name: "Dinajpur Begum Tayeeba Mojumder Red Crescent Blood Center",
    address: "1 New Town, Dinajpur",
    number: "053161300"
  },
  {
    name: "Chittagong Medical College Hospital Blood Bank",
    address: "Chittagong Medical College Hospital, Chattogram",
    number: "061612251"
  },
  {
    name: "New Bangladesh Pathology & Blood Bank",
    address: "House # 69, Road # 9/A, Dhanmondi R/A, Dhaka-1209",
    number: "01715546807"
  },
  {
    name: "Islami Bank Hospital Blood Bank",
    address: "Islami Bank Hospital, Dhaka",
    number: "028317090"
  },
  {
    name: "Police Blood Bank",
    address: "Central Police Hospital, Rajarbag, Dhaka",
    number: "01713398386"
  },
  {
    name: "Oriental Blood Bank",
    address: "Green Center, 2B/30 Green Road, Dhanmondi, Dhaka",
    number: "01812700053"
  },
  {
    name: "Mukti Blood Bank & Pathology Lab",
    address: "54 (1st Floor), Bir-Uttam A.M. Shafiullah Road, Free School St., Dhaka-1207",
    number: "028624249"
  },
  {
    name: "Thalassemia Blood Bank",
    address: "30 Chamelibag, 1st Lane, Shantinagar, Dhaka-1219",
    number: "028332481"
  },
  {
    name: "Badhan Blood Bank",
    address: "TSC (Ground Floor), University of Dhaka, Dhaka-1000",
    number: "028629042"
  },
  {
    name: "Alif Blood Bank & Transfusion Center",
    address: "44/11 West Panthapath (2nd Fl.), Opp. Shamrita Hospital, Dhaka-1215",
    number: "01712392923"
  },
  {
    name: "Maliha Blood Bank",
    address: "2/13 Humayan Road, Mohammadpur, Dhaka",
    number: "01736989326"
  },
  {
    name: "Quantum Blood Bank",
    address: "(Branch in Asulia) — Quantum Lab, Asulia Highway, Turag, Dhaka",
    number: "029355756"
  },
  {
    name: "Ibn Sina Diagnostic & Consultation Center",
    address: "52 Garib-E-Newaz Avenue, Sector-13, Uttara, Dhaka",
    number: "028953932"
  },
  {
    name: "Famous Blood Bank & Diagnostic Centre",
    address: "1/9 Humayan Road, College Gate, Dhaka",
    number: "029144835"
  },
  {
    name: "Sandhani, Dhaka Medical College Branch",
    address: "Room 35, Tinshed Out-Door Building, BSMMU, Shahbag, Dhaka-1000",
    number: "029668609"
  },
  {
    name: "Sandhani, Dhaka Dental College Branch",
    address: "Dhaka Dental College Campus, Dhaka",
    number: "09011887"
  },
  {
    name: "Sir Salimullah College Blood Bank",
    address: "Sir Salimullah College, Dhaka",
    number: "07319123"
  },
  {
    name: "Thalassemia Foundation Hospital",
    address: "Khulna (Thalassemia Foundation Hospital, Khulna)",
    number: "028332481"
  }
];


// Function to save all emergency numbers
function saveAllNumbers() {
  // Check if the device supports contacts API (limited support)
  if ('contacts' in navigator && 'ContactsManager' in window) {
    try {
      saveContactsUsingAPI();
    } catch (error) {
      console.log("Contacts API not supported, using alternative method");
      downloadVCard();
    }
  } else {
    // Fallback: Create and download vCard file
    downloadVCard();
  }
}

// Function to create and download vCard file
function downloadVCard() {
  let vCardContent = "";
  
  emergencyNumbers.forEach(contact => {
    vCardContent += `BEGIN:VCARD\n`;
    vCardContent += `VERSION:3.0\n`;
    vCardContent += `FN:BD Emergency - ${contact.name}\n`;
    vCardContent += `TEL:${contact.number}\n`;
    vCardContent += `NOTE:${contact.description}\n`;
    vCardContent += `CATEGORIES:Emergency,Bangladesh\n`;
    vCardContent += `END:VCARD\n\n`;
  });

  // Create blob and download
  const blob = new Blob([vCardContent], { type: 'text/vcard' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Bangladesh_Emergency_Contacts.vcf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  // Show success message
  showNotification("Emergency contacts downloaded! Import the file to your phone's contacts.", "success");
}

// Function to show notifications
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notif => notif.remove());
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${type === 'success' ? '✅' : 'ℹ️'}</span>
      <span class="notification-text">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Add notification styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#27ae60' : '#3498db'};
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    z-index: 1000;
    max-width: 400px;
    animation: slideIn 0.3s ease;
  `;
  
  // Add notification to page
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    margin-left: auto;
  }
  
  .notification-close:hover {
    opacity: 0.7;
  }
`;
document.head.appendChild(style);

// Function to handle call button clicks with confirmation
function makeCall(number) {
  if (confirm(`Do you want to call ${number}?`)) {
    window.location.href = `tel:${number}`;
  }
}

// Add click event listeners to call buttons
document.addEventListener('DOMContentLoaded', function() {
  // Add click tracking for analytics (optional)
  const callButtons = document.querySelectorAll('.call-btn');
  callButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const number = this.href.replace('tel:', '');
      console.log(`Emergency call initiated to: ${number}`);
      
      // Optional: Add analytics tracking here
      if (typeof gtag !== 'undefined') {
        gtag('event', 'emergency_call', {
          'event_category': 'Emergency',
          'event_label': number,
          'value': 1
        });
      }
    });
  });
  
  // Add accessibility improvements
  addAccessibilityFeatures();
});

// Function to add accessibility features
function addAccessibilityFeatures() {
  // Add keyboard navigation support
  const callButtons = document.querySelectorAll('.call-btn');
  callButtons.forEach(button => {
    button.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
  
  // Add aria-labels for screen readers
  callButtons.forEach(button => {
    const number = button.href.replace('tel:', '');
    const parentCard = button.closest('.emergency-card');
    const serviceName = parentCard ? parentCard.querySelector('h3, h4').textContent : 'Emergency service';
    button.setAttribute('aria-label', `Call ${number} for ${serviceName}`);
  });
}

// Function to copy number to clipboard (alternative to calling)
function copyNumber(number) {
  navigator.clipboard.writeText(number).then(() => {
    showNotification(`Number ${number} copied to clipboard!`, "success");
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = number;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showNotification(`Number ${number} copied to clipboard!`, "success");
  });
}

// Add right-click context menu for copying numbers
document.addEventListener('contextmenu', function(e) {
  if (e.target.classList.contains('call-btn')) {
    e.preventDefault();
    const number = e.target.href.replace('tel:', '');
    copyNumber(number);
  }
});

// Service Worker registration DISABLED to fix fetch errors
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('SW registered: ', registration);
    }).catch(function(registrationError) {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
*/
// Unregister any service workers instead
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered from resources.js');
    }
  });
}
