// eventcreation.js (replace whole file or the submit handler)
document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category");
  const eventTypeSelect = document.getElementById("eventType");

  // load categories
  fetch("/api/categories")
    .then(res => res.json())
    .then(categories => {
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.category_id;
        option.textContent = cat.category_name;
        categorySelect.appendChild(option);
      });
    })
    .catch(err => console.error("Error loading categories:", err));

  // load event types when category changes
  categorySelect.addEventListener("change", () => {
    const categoryId = categorySelect.value;
    eventTypeSelect.innerHTML = '<option value="">Select Event Type</option>';
    eventTypeSelect.disabled = true;

    if (!categoryId) return;

    fetch(`/api/event-types?categoryId=${encodeURIComponent(categoryId)}`)
      .then(res => res.json())
      .then(eventTypes => {
        eventTypeSelect.innerHTML = '<option value="">Select Event Type</option>';
        eventTypes.forEach(ev => {
          const option = document.createElement("option");
          option.value = ev.ebc_id;                // matches backend
          option.textContent = ev.event_type_name;
          eventTypeSelect.appendChild(option);
        });
        eventTypeSelect.disabled = eventTypes.length === 0;
      })
      .catch(err => console.error("Error loading event types:", err));
  });

  // Submit handler — only append fields DB expects
  document.getElementById("eventForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;

    // Build FormData from the form (this takes all named inputs once)
    const formData = new FormData(form);

    // Ensure we don't have duplicates: remove keys that should NOT be sent if present
    // (FormData doesn't support delete in old browsers — but modern browsers do)
    // We'll create a fresh FormData and append only the allowed keys
    const allowedKeys = [
      "creatorType",
      "individualId",
      "foundationId",
      "ebcId",
      "title",
      "description",
      "amountNeeded",
      "division",
      "doc",
      "coverPhoto",
      "createdAt"
    ];

    const finalFD = new FormData();

    // Append fields from localStorage / selects / inputs explicitly (no duplicates)
    finalFD.append("creatorType", localStorage.getItem("foundationId") ? "foundation" : "individual");
    finalFD.append("individualId", localStorage.getItem("individualId") || "");
    finalFD.append("foundationId", localStorage.getItem("foundationId") || "");
    finalFD.append("ebcId", document.getElementById("eventType").value || "");
    finalFD.append("title", document.getElementById("title").value || "");
    finalFD.append("description", document.getElementById("description").value || "");
    finalFD.append("amountNeeded", document.getElementById("amountNeeded").value || "");
    finalFD.append("division", document.getElementById("division").value || "");

    // createdAt should be current timestamp
    finalFD.append("createdAt", new Date().toISOString().slice(0, 19).replace("T", " "));

    // Files — only append if selected (single file each)
    const docInput = document.getElementById("doc");
    const coverInput = document.getElementById("coverPhoto");

    if (docInput && docInput.files && docInput.files[0]) {
      finalFD.append("doc", docInput.files[0]);
    }

    if (coverInput && coverInput.files && coverInput.files[0]) {
      finalFD.append("coverPhoto", coverInput.files[0]);
    }

    try {
      const resp = await fetch("/api/events", {
        method: "POST",
        body: finalFD
      });
      const json = await resp.json();
      console.log("Event submission response:", json);
      alert(json.message || JSON.stringify(json));
    } catch (err) {
      console.error("Error submitting event:", err);
      alert("Network error. See console.");
    }
  });
});
