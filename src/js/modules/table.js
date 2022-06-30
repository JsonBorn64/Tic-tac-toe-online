export default function table(db, ref, get, query, orderByChild, limitToLast ) {
    const table = document.querySelector('.leaders_table tbody')
    const playerStats = document.querySelectorAll('.player_stats_item_value')
    const playerStatsPopup = document.querySelector('.player_stats')
    const loginInfo = document.querySelector('.login_info')
    // const morePlayersBtn = document.querySelector('#get_more_players')

    function renderTableTopPlayers(snap) {
        // Get the top players and push them to common array
        const users = [];
        snap.forEach(childSnap => {users.push(childSnap.val())})
        // Sort the array by wins and render the table
        table.innerHTML = ''
        users.reverse().forEach((user, idx) => {
            table.innerHTML += `<tr>
            <td>${++idx}</td>
            <td class="nick">${user.login}</td>
            <td>${user.wins}</td>
        </tr>`
        })
    }

    function tablePlayersStatsPopup() {
        // Get all cells with class nicknames
        const nickCells = document.querySelectorAll('.nick')
        nickCells.forEach(nickCell => {

            nickCell.onmouseenter = e => {
                // A crutch to make the site less
                if (loginInfo.style.display == 'none') {
                    loginInfo.style.display = 'flex'
                    loginInfo.style.visibility = 'hidden'
                }
                // Set popup position and show it
                playerStatsPopup.style.visibility = 'visible'
                playerStatsPopup.style.opacity = '1'
                playerStatsPopup.style.top = 50 + e.target.getBoundingClientRect().top + 'px'
                playerStatsPopup.style.right = 0 + e.target.getBoundingClientRect().left + 'px'
                // Get player stats and render them
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

            function resetPopup() {
                playerStats.forEach(item => item.innerHTML = '-')
                playerStatsPopup.style.visibility = ''
                playerStatsPopup.style.opacity = ''
                playerStatsPopup.style.top = ''
                playerStatsPopup.style.right = ''
            }

            nickCell.onmouseleave = () => {
                resetPopup()
            }

            window.addEventListener('scroll', resetPopup)
        })

    }

    function getSortedByWinsPlayers(limit = 10) {
        const usersList = query(
            ref(db, `tictac/registeredUsers/`),
            orderByChild('wins'),
            limitToLast(limit)
        )
        get(usersList).then(snap => {
            renderTableTopPlayers(snap)
            tablePlayersStatsPopup()
        })
    }
    getSortedByWinsPlayers()

    // morePlayersBtn.addEventListener('click', () => {
    //     getSortedByWinsPlayers(6)
    // })

}