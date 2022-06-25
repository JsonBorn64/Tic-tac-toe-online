// Overwrite default alert
let timerId
const alertBlock = document.getElementById('alert')
export default function myAlert(message, red) {
    alertBlock.innerHTML = message
    alertBlock.style.top = '40px'
    alertBlock.style.backgroundColor = red ? '#dfc9c9' : '#ccdfc9'
    clearTimeout(timerId)
    timerId = setTimeout(() => alertBlock.style.top = '-100px', 3000)
}

// Mobile browsers top placeholder fix
window.addEventListener('resize', () => {
    document.body.style.height = window.innerHeight + 'px'
})
document.body.style.height = window.innerHeight + 'px'