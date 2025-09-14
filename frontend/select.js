const usersBtn = document.getElementById('usersBtn');
const natpacBtn = document.getElementById('natpacBtn');
const natpacModal = document.getElementById('natpacModal');
const natpacSubmit = document.getElementById('natpacSubmit');
const natpacCancel = document.getElementById('natpacCancel');
const natpacCodeInput = document.getElementById('natpacCode');
const natpacError = document.getElementById('natpacError');

// Users button → redirect to login/signup page
usersBtn.addEventListener('click', () => {
    window.location.href = "user-auth.html"; // change this to your login/signup page
});

// NATPAC button → show access code modal
natpacBtn.addEventListener('click', () => {
    natpacModal.style.display = 'flex';
});

// NATPAC submit
natpacSubmit.addEventListener('click', () => {
    const code = natpacCodeInput.value;
    if(code === "NATPAC123"){ // example code
        alert("Access granted!");
        natpacModal.style.display = 'none';
        // redirect to NATPAC dashboard page if needed
        window.location.href = "natpac-dashboard.html"; 
    } else {
        natpacError.style.display = 'block';
    }
});

// NATPAC cancel
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
