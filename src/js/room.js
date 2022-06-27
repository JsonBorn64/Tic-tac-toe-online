//// Modules ////
import { db, ref, onValue, set, push, get, onDisconnect } from './modules/firebaseConnection';
import header from './modules/header';
import myAlert from './modules/others';
header(db, ref, set, get, myAlert)


const resultPopup = document.querySelector('.result_popup')
const winMessage = resultPopup.querySelector('.win_message')
const nowTurnTip = document.getElementById('now_turn_tip')
const nowTurn = document.querySelector('.now_turn span')
const cells = document.querySelectorAll('.tictac_cell')
const playersCount = document.getElementById('players')
const newGameBtn = document.getElementById('newGame')
const loading = document.getElementById('loading')
const scoreEl = document.querySelector('.score')
let gameOver = false
let score = [0, 0]
let playerRole
let playerCity
let playerIp
let turn
let arr

// Key bindings
cells.forEach(cell => cell.onclick = () => makeTurn(cell))
newGameBtn.onclick = newGame

let roomName = () => decodeURIComponent(location.search).slice(1)

function makeTurn(cell) {
    const cellNum = cell.getAttribute('cell-num')
    if (playersCount.textContent == 'Игроков: 1/2') {
        myAlert('Недостаточно игроков...', true)
    } else if (cell.classList.length == 1 && turn == playerRole) {
        cells.forEach(cell => cell.style.pointerEvents = 'none')
        set(ref(db, `tictac/rooms/${roomName()}/gameState/` + cellNum), turn)
        .then(() => {
            set(ref(db, `tictac/rooms/${roomName()}/gameState/turn`), turn == 'x' ? 'o' : 'x')
            cells.forEach(cell => cell.style.pointerEvents = 'auto')
        })
    } else if (playerRole == 'spectator') {
        myAlert('Вы всего-лишь наблюдатель', true)
    } else if (turn != playerRole) {
        myAlert('Сейчас не Ваш ход', true)
    } else if (cell.classList.length > 1) {
        myAlert('Эта клетка уже занята', true)
    }
}

function listenGameState() {
    onValue(ref(db, `tictac/rooms/${roomName()}/gameState`), (snap) => {
        if (snap.exists()) {
            gameFieldRender(snap.val())
            turnTipRender(snap.val())
            popupKeeper(snap.val())
        }
    })
}
listenGameState()

function gameFieldRender(snap) {
    Object.values(snap).some((sign, idx) => {
        if (idx > 8) return true
        if (sign == 'x') {
            cells[idx].classList.add('cross')
        } else if (sign == 'o') {
            cells[idx].classList.add('circle')
        } else {
            cells[idx].classList.remove('cross', 'circle')
        }
    })
}

function turnTipRender(snap) {
    turn = snap.turn
    nowTurn.innerHTML = turn
    nowTurn.style.color = (turn == 'x') ? 'blue' : 'red'
    nowTurnTip.innerHTML = (turn == playerRole) ? '(Вы)' : '(Не Вы)'
}

function popupKeeper(snap) {
    if (snap.gameOver == 'false') {
        resultPopup.style.left = '-100%'
        resultPopup.style.opacity = '0'
        nowTurn.style.opacity = '1'
        nowTurnTip.style.opacity = '1'
        gameOver = false
        winChecking()
    }
}

function winChecking() {
    // Create array of game field signs
    arr = [...cells].map(cell => {
        if (cell.classList.contains('cross')) {
            return 'x'
        } else if (cell.classList.contains('circle')) {
            return 'o'
        } else {
            return NaN
        }
    })
    const winCombs = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ]
    // Check if someone won
    winCombs.some(i => {
        if ( (arr[i[0]] == arr[i[1]] && arr[i[1]] == arr[i[2]]) && gameOver == false ) {
            set(ref(db, `tictac/rooms/${roomName()}/gameState/gameOver`), 'true')
            popupResultRender(turn)
            return gameOver = true
        }
    })
    // Check if nobody won
    if ( (arr.every(cell => (cell == 'x' || cell == 'o'))) && gameOver == false ) {
        popupResultRender('ничья')
    }
}

function popupResultRender(turn) {
    playerStatsUpdate(turn)
    nowTurn.style.opacity = '0'
    nowTurnTip.style.opacity = '0'
    resultPopup.style.left = '50%'
    resultPopup.style.opacity = '1'
    if (turn == 'x') {
        winMessage.innerHTML = 'Крестики победили!'
        winMessage.style.color = 'blue'
        scoreEl.innerHTML = `Счёт<span>${++score[0]}</span>:<span>${score[1]}</span>`
    } else if (turn == 'o') {
        winMessage.innerHTML = 'Нолики победили!'
        winMessage.style.color = 'red'
        scoreEl.innerHTML = `Счёт<span>${score[0]}</span>:<span>${++score[1]}</span>`
    } else {
        winMessage.innerHTML = 'Ничья!'
        winMessage.style.color = 'black'
        scoreEl.innerHTML = `Счёт<span>${score[0]}</span>:<span>${score[1]}</span>`
    }
}

function playerStatsUpdate(turn) {
    const nick = localStorage.getItem('login').toLowerCase()
    get(ref(db, `tictac/registeredUsers/${nick}`)).then(snap => {
        set(ref(db, `tictac/registeredUsers/${nick}/parties`), ++snap.val().parties)
        if (turn == 'x' && playerRole == 'x') {
            set(ref(db, `tictac/registeredUsers/${nick}/wins`), ++snap.val().wins)
        } else if (turn == 'o' && playerRole == 'o') {
            set(ref(db, `tictac/registeredUsers/${nick}/wins`), ++snap.val().wins)
        } else if (turn != playerRole) {
            set(ref(db, `tictac/registeredUsers/${nick}/losses`), ++snap.val().losses)
        } else {
            set(ref(db, `tictac/registeredUsers/${nick}/draws`), ++snap.val().draws)
        }
    })    
}

function newGame() {
    if (playerRole != 'spectator') {
        set(ref(db, `tictac/rooms/${roomName()}/gameState`), {
            0: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '',
            turn: 'x',
            gameOver: 'false'
        })
        nowTurn.style.opacity = '1'
        resultPopup.style.left = '-100%'
        gameOver = false
    } else {
        myAlert('Вы всего-лишь наблюдатель', true)
    }
}

// detecting connection status
const title = document.querySelector('.tictac_title')
function detectingConnectionState() {
    onValue(ref(db, ".info/connected"), (snap) => {
        if (snap.val() === true) {
            title.innerHTML = `Крестики-нолики онлайн <br> ${roomName()}`
        } else {
            title.innerHTML = 'Крестики-нолики оффлайн'
        }
    })
}
detectingConnectionState()

//// Room players ////
function listenPlayers() {
    onValue(ref(db, `tictac/rooms/${roomName()}/players`), (snap) => {
        if (snap.exists()) {
            playersCount.textContent = `Игроков: ${snap.size}/2`
            chatRemover(snap)
            distributePlayerRoles(snap)
            score = [0, 0]
        } else {
            playerPresserve()
        }
    })
}

function playerAuthCheck() {
    if (localStorage.getItem('login')) {
        localStorage.removeItem('City')
        localStorage.removeItem('Ip')
        playerIp = null
        playerCity = null
        listenPlayers()
    } else if (localStorage.getItem('City')) {
        playerIp = localStorage.getItem('Ip')
        playerCity = localStorage.getItem('City')
        listenPlayers()
    } else if (!localStorage.getItem('login') && !localStorage.getItem('City')) {
        getIpCity()
    }
}
playerAuthCheck()

function getIpCity() {
    fetch('https://api.db-ip.com/v2/free/self')
    .then(res => res.json())
    .then(data => {
        localStorage.setItem('Ip', data.ipAddress)
        localStorage.setItem('City', data.city)
        playerAuthCheck()
    }).catch(err => console.log('Не удается получить айпи адрес: ', err))
}

function distributePlayerRoles(snap) {
    // Players roles
    Object.keys(snap.val()).some((key, idx) => {
        if (idx > 2) return true
        if (snap.val()[key] == playerIp && idx == 0 && snap.size > 1) {
            nowTurnTip.innerHTML = '(Вы)'
            playerRole = 'x'
            myAlert('Вы играете крестиками')
        } else if (snap.val()[key] == playerIp && idx == 1 && snap.size > 1) {
            nowTurnTip.innerHTML = '(Не Вы)'
            playerRole = 'o'
            myAlert('Вы играете ноликами')
            newGame()
        }
    })
    // Other distribution
    const dblCon = Object.values(snap.val()).find(i => i == (localStorage.getItem('login') || playerIp))
    if (!dblCon && snap.size == 1) {
        playerPresserve()
    } else if (!dblCon && snap.size >= 2) {
        loading.style.display = 'none'
        playerRole = 'spectator'
        myAlert('Вы будете наблюдателем')
    } else if (dblCon) {
        loading.textContent = 'Вы уже подключены'
    }
}

function chatRemover(snap) {
    // Remove chat then the last player left
    if (snap.size === 1) {
        onDisconnect(ref(db, `tictac/rooms/${roomName()}/chat`)).remove()
        onDisconnect(ref(db, `tictac/rooms/${roomName()}/gameState`)).remove()
    } else {
        onDisconnect(ref(db, `tictac/rooms/${roomName()}/chat`)).cancel()
        onDisconnect(ref(db, `tictac/rooms/${roomName()}/gameState`)).cancel()
    }
}

function playerPresserve() {
    push(ref(db, `tictac/rooms/${roomName()}/players/`), (localStorage.getItem('login') || playerIp))
        .then(res => {
            onDisconnect(ref(db, `tictac/rooms/${roomName()}/players/${res.key}`)).remove()
            loading.style.display = 'none'
        })
}

window.addEventListener('unload', () => {
    if (playerRole == 'x' || playerRole == 'o') newGame()
})

//// Room chat ////
// Push chat messages
const chatInputBtn = document.querySelector('.chat_input')
const chatInput = chatInputBtn.querySelector('input')
const chatBtn = chatInputBtn.querySelector('button')
function writeChatMessage() {
    if (chatInput.value.trim() != '') {
        chatBtn.disabled = true
        push(ref(db, `tictac/rooms/${roomName()}/chat`), {
            message: chatInput.value,
            time: new Date().toTimeString().slice(0, 8),
            ip: `${playerIp || localStorage.getItem('login')} ${playerCity || ''}`
        }).then(() => {
            chatBtn.disabled = false
            chatInput.value = ''
        })
    } else {
        chatInput.value = ''
        myAlert('Введите сообщение', true)
    }
}
chatBtn.addEventListener('click', (e) => { e.preventDefault(), writeChatMessage() })

// Get chat messages
const chatWindow = document.querySelector('.chat_window')
function getChatMessages() {
    onValue(ref(db, `tictac/rooms/${roomName()}/chat`), (snap) => {
        if (snap.exists()) {
            renderChatMessages(snap.val())
        } else {
            chatWindow.innerHTML = 'Нет сообщений'
        }
    })
}
getChatMessages()

function renderChatMessages(messages) {
    chatWindow.innerHTML = ''
    for (let key in messages) {
        chatWindow.innerHTML += `
            <div class="message">
                <div class="message_ip">${messages[key].ip}</div>
                <div class="message_time">${messages[key].time}</div>
                <div class="message_text">${messages[key].message}</div>
            </div>
        `
    }
    chatWindow.scrollTop = chatWindow.scrollHeight
}
