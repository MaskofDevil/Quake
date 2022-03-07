document.getElementById('toggle-menu').addEventListener('click', () => {
    document.getElementById('full-menu').classList.replace('inactive', 'active')
    document.getElementById('toggle-menu').classList.replace('active', 'inactive')
    document.getElementById('close').classList.replace('inactive', 'active')
})

document.getElementById('close').addEventListener('click', () => {
    document.getElementById('full-menu').classList.replace('active', 'inactive')
    document.getElementById('close').classList.replace('active', 'inactive')
    document.getElementById('toggle-menu').classList.replace('inactive', 'active')
})