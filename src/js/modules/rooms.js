export default function rooms(db, ref, set, onValue, off) {

    const rooms = document.querySelector('.rooms')
    const createRoomBtn = document.getElementById('create_room')
    const createRoomPopup = document.querySelector('.create_room_popup')
    const createRoomOverlay = document.querySelector('.create_room_overlay')
    const roomName = createRoomPopup.querySelector('input')
    const onlineBtn = document.querySelector('.game_mod:last-child')
    const onlineModeBtn = document.querySelector('.online_mod')

    function listenRooms() {
        onValue(ref(db, 'tictac/rooms'), (snap) => {
            rooms.innerHTML = ''
            Object.keys(snap.val()).forEach(key => {
                let plAmount = 0
                if (snap.val()[key].players) plAmount = Object.keys(snap.val()[key].players).length
                rooms.innerHTML += `
                    <a class="room" href="room.html?${key}">
                        <div>${key}</div>
                        <div>Игроков: ${plAmount}/2</div>
                    </a>
                `
            })
        })
    }

    function roomPopupSwitch(state) {
        if (state == 'open') {
            createRoomPopup.style.opacity = '1'
            createRoomPopup.style.left = '50%'
            createRoomOverlay.style.visibility = 'visible'
        } else if (state == 'close') {
            createRoomPopup.style.opacity = '0'
            createRoomPopup.style.left = '-100%'
            createRoomOverlay.style.visibility = 'hidden'
            setTimeout(() => roomName.value = '', 300)
        }
    }

    createRoomBtn.addEventListener('click', () => {
        roomPopupSwitch('open')
        roomName.focus()
    })

    createRoomOverlay.addEventListener('click', () => {
        roomPopupSwitch('close')
    })

    createRoomPopup.addEventListener('submit', (e) => {
        e.preventDefault()
        let roomNameTrimed = roomName.value.trim()
        if (roomNameTrimed) {
            set(ref(db, `tictac/rooms/${roomNameTrimed}/gameState`), {
                0: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '',
                turn: 'x',
                gameOver: 'false'
            })
        }
        roomPopupSwitch('close')
    })

    onlineBtn.addEventListener('click', () => {
        if (onlineModeBtn.style.maxHeight != '240px') {
            onlineModeBtn.style.maxHeight = '240px'
            listenRooms()
        } else {
            setTimeout(() => rooms.innerHTML = 'Загрузка...', 600)
            onlineModeBtn.style.maxHeight = '0px'
            off(ref(db, 'tictac/rooms'))
        }
    })

}