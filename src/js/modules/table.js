export default function table(db, ref, get, query, orderByChild, limitToLast) {
    const table = document.querySelector('.leaders_table tbody')
    const playerStats = document.querySelectorAll('.player_stats_item_value')
    const playerStatsPopup = document.querySelector('.player_stats')
    const loginInfo = document.querySelector('.login_info')
    let tdNicks

    const list = query(ref(db, `tictac/registeredUsers/`), orderByChild('wins'), limitToLast(10))
    get(list).then(snap => {
        const users = [];
        snap.forEach(childSnap => {users.push(childSnap.val())})
        users.reverse().forEach((user, idx) => {
            table.innerHTML += `<tr>
                <td>${++idx}</td>
                <td class="nick">${user.login}</td>
                <td>${user.wins}</td>
            </tr>`
        })
        tdNicks = document.querySelectorAll('.nick')
        tdNicks.forEach(td => {
            td.onmouseenter = e => {
                if (loginInfo.style.display == 'none') {
                    loginInfo.style.display = 'flex'
                    loginInfo.style.visibility = 'hidden'
                }
                playerStatsPopup.style.visibility = 'visible'
                playerStatsPopup.style.opacity = '1'
                playerStatsPopup.style.top = 40 + e.target.getBoundingClientRect().top + 'px'
                playerStatsPopup.style.right = -110 + e.target.getBoundingClientRect().left + 'px'
                if (e.target.classList.contains('nick')) {
                    let nick = e.target.innerText.toLowerCase()
                    get(ref(db, `tictac/registeredUsers/${nick}`)).then(snap => {
                        let winsPercent = (snap.val().wins/(snap.val().parties/100)).toPrecision(2)
                        if (isNaN(winsPercent)) winsPercent = 0
                        if (snap.exists()) {
                            playerStats[0].innerHTML = snap.val().parties
                            playerStats[1].innerHTML = `${winsPercent}%`
                            playerStats[2].innerHTML = snap.val().wins
                            playerStats[3].innerHTML = snap.val().draws
                            playerStats[4].innerHTML = snap.val().losses
                        } else {
                            playerStats.forEach(item => item.innerHTML = 'error')
                        }
                    })
                }
            }
            td.onmouseleave = () => {
                playerStatsPopup.style.visibility = ''
                playerStatsPopup.style.opacity = ''
                playerStatsPopup.style.top = ''
                playerStatsPopup.style.right = ''
            }
        })
    })

}