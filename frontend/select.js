const natpacBtn = document.getElementById('natpacBtn');
const natpacModal = document.getElementById('natpacModal');
const natpacSubmit = document.getElementById('natpacSubmit');
const natpacCancel = document.getElementById('natpacCancel');
const natpacCodeInput = document.getElementById('natpacCode');
const natpacError = document.getElementById('natpacError');

// When NATPAC button clicked
natpacBtn.addEventListener('click', () => {
    natpacModal.style.display = 'flex';
});

// Submit NATPAC code
natpacSubmit.addEventListener('click', () => {
    const code = natpacCodeInput.value;
    if(code === "NATPAC123"){ // Example access code
        alert("Access granted!");
        natpacModal.style.display = 'none';
        // redirect to NATPAC dashboard page here if needed
    } else {
        natpacError.style.display = 'block';
    }
});

// Cancel button
natpacCancel.addEventListener('click', () => {
    natpacModal.style.display = 'none';
    natpacCodeInput.value = "";
    natpacError.style.display = 'none';
});

// Close modal if click outside
window.addEventListener('click', (e) => {
    if(e.target === natpacModal){
        natpacModal.style.display = 'none';
        natpacCodeInput.value = "";
        natpacError.style.display = 'none';
    }
});
