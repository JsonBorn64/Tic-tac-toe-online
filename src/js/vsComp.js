//// Modules ////
import { db, ref, set, get } from './modules/firebaseConnection';
import header from './modules/header';
import myAlert from './modules/others';
header(db, ref, set, get, myAlert)

const cells = document.querySelectorAll('.tictac_cell')
const nowTurn = document.querySelector('.now_turn span')
const resetBtn = document.getElementById('newGame')
const popup = document.querySelector('.result_popup')
const winMessage = popup.querySelector('.win_message')
const blocked = document.querySelector('.blocked')
const scoreEl = document.querySelector('.score')
let score = [0, 0]
let turn = 'x'
let progArr

function drawFigure(cell) {
    if (cell.classList.length == 1) {
        if (turn == 'x') {
            cell.classList.add('cross')
            nowTurn.innerHTML = turn = 'o'
            nowTurn.style.color = 'red'
            blocked.style.zIndex = '0'
            setTimeout(compTurn, 500)
        } else {
            cell.classList.add('circle')
            nowTurn.innerHTML = turn = 'x'
            nowTurn.style.color = 'blue'
        }
    }
}

function gameProgressArr() {
    progArr = [...cells].map(cell => {
        if (cell.classList.contains('cross')) {
            return 'x'
        } else if (cell.classList.contains('circle')) {
            return 'o'
        } else {
            return NaN
        }
    })
}

function winChecking() {
    if (
        (progArr[0] == progArr[1] && progArr[1] == progArr[2]) ||
        (progArr[3] == progArr[4] && progArr[4] == progArr[5]) ||
        (progArr[6] == progArr[7] && progArr[7] == progArr[8]) ||
        (progArr[0] == progArr[3] && progArr[3] == progArr[6]) ||
        (progArr[1] == progArr[4] && progArr[4] == progArr[7]) ||
        (progArr[2] == progArr[5] && progArr[5] == progArr[8]) ||
        (progArr[0] == progArr[4] && progArr[4] == progArr[8]) ||
        (progArr[2] == progArr[4] && progArr[4] == progArr[6])
    ) { gameOver(turn) }
    else if (progArr.every(cell => (cell == 'x' || cell == 'o'))) { 
        winMessage.innerHTML = 'Ничья!'
        winMessage.style.color = 'black'
        popup.style.left = '50%'
        popup.style.opacity = '1'
        blocked.style.zIndex = '0'
    }
}

function gameOver(turn) {
    if (turn == 'x') {
        winMessage.innerHTML = 'Нолики победили!'
        winMessage.style.color = 'red'
        popup.style.left = '50%'
        popup.style.opacity = '1'
        blocked.style.zIndex = '0'
        scoreEl.innerHTML = `Счёт<span>${score[0]}</span>:<span>${++score[1]}</span>`
    } else {
        winMessage.innerHTML = 'Крестики победили!'
        winMessage.style.color = 'blue'
        popup.style.left = '50%'
        popup.style.opacity = '1'
        blocked.style.zIndex = '0'
        scoreEl.innerHTML = `Счёт<span>${++score[0]}</span>:<span>${score[1]}</span>`
    }
}

function newGame() {
    cells.forEach(cell => cell.classList.remove('cross', 'circle'))
    nowTurn.innerHTML = turn = 'x'
    nowTurn.style.color = 'blue'
    popup.style.left = '-100%'
    blocked.style.zIndex = '-10'
}

cells.forEach(cell => { cell.onclick = () => { drawFigure(cell), gameProgressArr(), winChecking() } })

resetBtn.onclick = () => { newGame() }

function compTurn() {
    const randNum = Math.floor(Math.random() * 9)
    if (cells[randNum].classList.length == 1 && popup.style.left != '50%') {
        drawFigure(cells[randNum])
        gameProgressArr()
        winChecking()
        blocked.style.zIndex = '-10'
    } else if (popup.style.left == '50%') {
        false
    } else {
        compTurn()
    }
}

