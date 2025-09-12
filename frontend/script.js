// Block click actions
document.querySelectorAll('.block').forEach(block => {
    block.addEventListener('click', () => {
        alert(block.textContent + " clicked!");
    });
});

// Get Started button
document.getElementById('getStarted').addEventListener('click', () => {
    window.location.href = "select.html";
});
