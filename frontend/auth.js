// Tabs
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

loginTab.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
});

signupTab.addEventListener('click', () => {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
});

// Login submit
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Login successful!");
    window.location.href = "welcome.html";
});

// Signup submit
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect signup values
    const userData = {
        firstName: document.getElementById('firstName').value,
        middleName: document.getElementById('middleName').value,
        lastName: document.getElementById('lastName').value,
        dob: document.getElementById('dob').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('signupEmail').value,
        password: document.getElementById('signupPassword').value,
        homeAddress: document.getElementById('homeAddress').value,
        workAddress: document.getElementById('workAddress').value
    };

    console.log("Sign Up Data:", userData); // For testing

    alert("Sign Up successful!");
    window.location.href = "welcome.html";
});
