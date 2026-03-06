// Get creatorType from URL parameters
function getCreatorTypeFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('creatorType') || 'foundation';
}

// Set back button to appropriate profile
document.addEventListener('DOMContentLoaded', () => {
  const creatorType = getCreatorTypeFromURL();
  const backBtn = document.getElementById('backBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const confirmCancelBtn = document.getElementById('confirmCancel');
  
  // Determine profile URL based on creator type
  const profileURL = creatorType === 'individual' ? 'profileindividual.html' : 'profilefoundation.html';
  
  // Set back button href
  backBtn.href = profileURL;
  
  // Cancel button
  cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = profileURL;
  });
  
  // Confirmation modal cancel
  confirmCancelBtn.addEventListener('click', () => {
    document.getElementById('confirmationModal').classList.add('hidden');
  });

  const categorySelect = document.getElementById('category');
  const eventTypeSelect = document.getElementById('eventType');

  // Load categories
  fetch('/api/categories')
    .then(res => res.json())
    .then(categories => {
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.category_id;
        option.textContent = cat.category_name;
        categorySelect.appendChild(option);
      });
    })
    .catch(err => console.error('Error loading categories:', err));

  // Load event types when category changes
  categorySelect.addEventListener('change', () => {
    const categoryId = categorySelect.value;
    eventTypeSelect.innerHTML = '<option value="">Select Event Type</option>';
    eventTypeSelect.disabled = true;

    if (!categoryId) return;

    fetch(`/api/event-types?categoryId=${encodeURIComponent(categoryId)}`)
      .then(res => res.json())
      .then(eventTypes => {
        eventTypeSelect.innerHTML = '<option value="">Select Event Type</option>';
        eventTypes.forEach(ev => {
          const option = document.createElement('option');
          option.value = ev.ebc_id;
          option.textContent = ev.event_type_name;
          eventTypeSelect.appendChild(option);
        });
        eventTypeSelect.disabled = eventTypes.length === 0;
      })
      .catch(err => console.error('Error loading event types:', err));
  });

  // Form submission with confirmation
  document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show confirmation modal
    document.getElementById('confirmationModal').classList.remove('hidden');
    
    // Confirm button in modal
    const confirmYesBtn = document.getElementById('confirmYes');
    confirmYesBtn.onclick = async () => {
      await submitEvent();
    };
  });

  async function submitEvent() {
    const form = document.getElementById('eventForm');
    const formData = new FormData(form);

    // Build clean form data
    const finalFD = new FormData();

    finalFD.append('creatorType', creatorType);
    finalFD.append('individualId', localStorage.getItem('individualId') || '');
    finalFD.append('foundationId', localStorage.getItem('foundationId') || '');
    finalFD.append('ebcId', document.getElementById('eventType').value || '');
    finalFD.append('title', document.getElementById('title').value || '');
    finalFD.append('description', document.getElementById('description').value || '');
    finalFD.append('amountNeeded', document.getElementById('amountNeeded').value || '');
    finalFD.append('division', document.getElementById('division').value || '');
    finalFD.append('createdAt', new Date().toISOString().slice(0, 19).replace('T', ' '));

    const docInput = document.getElementById('doc');
    const coverInput = document.getElementById('coverPhoto');

    if (docInput && docInput.files && docInput.files[0]) {
      finalFD.append('doc', docInput.files[0]);
    }

    if (coverInput && coverInput.files && coverInput.files[0]) {
      finalFD.append('coverPhoto', coverInput.files[0]);
    }

    try {
      const resp = await fetch('/api/events', {
        method: 'POST',
        body: finalFD
      });
      const json = await resp.json();
      
      // Close confirmation modal
      document.getElementById('confirmationModal').classList.add('hidden');
      
      if (resp.ok && json.success) {
        // Get user email for notification
        let userEmail = '';
        if (creatorType === 'foundation') {
          const foundationId = localStorage.getItem('foundationId');
          if (foundationId) {
            userEmail = await getFoundationEmail(foundationId);
          }
        } else {
          const individualId = localStorage.getItem('individualId');
          if (individualId) {
            userEmail = await getIndividualEmail(individualId);
          }
        }

        // Send verification email notification
        if (userEmail) {
          await sendEventVerificationEmail(
            userEmail,
            document.getElementById('title').value,
            creatorType
          );
        }

        // Show success modal
        document.getElementById('successModal').classList.remove('hidden');
        
        // Back to dashboard button
        document.getElementById('backToDashboard').addEventListener('click', () => {
          window.location.href = profileURL;
        });
      } else {
        alert(json.message || 'Error creating event');
      }
    } catch (err) {
      console.error('Error submitting event:', err);
      alert('Network error. Please try again.');
      document.getElementById('confirmationModal').classList.add('hidden');
    }
  }

  // Helper function to get foundation email
  async function getFoundationEmail(foundationId) {
    try {
      const res = await fetch(`/api/foundation/profile/${foundationId}`);
      const data = await res.json();
      if (data.success && data.foundationData && data.foundationData.foundationInfo) {
        return data.foundationData.foundationInfo.email;
      }
    } catch (err) {
      console.error('Error fetching foundation email:', err);
    }
    return '';
  }

  // Helper function to get individual email
  async function getIndividualEmail(individualId) {
    try {
      const res = await fetch(`/api/individual/profile/${individualId}`);
      const data = await res.json();
      if (data.success && data.individualData && data.individualData.email) {
        return data.individualData.email;
      }
    } catch (err) {
      console.error('Error fetching individual email:', err);
    }
    return '';
  }

  // Send event verification email to user
  async function sendEventVerificationEmail(email, eventTitle, userType) {
    try {
      await fetch('/api/send-event-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          eventTitle: eventTitle,
          userType: userType
        })
      });
    } catch (err) {
      console.error('Error sending verification email:', err);
      // Don't fail the flow if email fails
    }
  }
});

