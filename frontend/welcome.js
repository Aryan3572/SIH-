const logoContainer = document.getElementById('logoContainer');
const refreshModal = document.getElementById('refreshModal');
const confirmRefresh = document.getElementById('confirmRefresh');
const cancelRefresh = document.getElementById('cancelRefresh');

logoContainer.addEventListener('click', () => {
    refreshModal.style.display = 'flex';
});

confirmRefresh.addEventListener('click', () => {
    window.location.reload();
});

cancelRefresh.addEventListener('click', () => {
    refreshModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if(e.target == refreshModal){
        refreshModal.style.display = 'none';
    }
});
