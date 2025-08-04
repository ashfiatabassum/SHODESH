const headingText = "TOGETHER, WE CREATE THE COMMUNITY WE WANT TO SEE.";
let i = 0;
const headingEl = document.getElementById("headingText");

function typeWriter() {
  if (i < headingText.length) {
    headingEl.innerHTML += headingText.charAt(i);
    i++;
    setTimeout(typeWriter, 80);
  }
}
window.onload = typeWriter;


document.getElementById("createAccountBtn").addEventListener("click", function(e){
  e.preventDefault();
  
  alert("Account created! Redirecting...");
  window.location.href = "success.html"; 
});
