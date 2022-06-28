export default function table(db, ref, get, query, orderByChild, limitToLast) {
    const table = document.querySelector('.leaders_table tbody')
    const list = query(ref(db, `tictac/registeredUsers/`), orderByChild('wins'), limitToLast(10))
    get(list).then(snap => {
        const users = [];
        snap.forEach(childSnap => {users.push(childSnap.val())})
        users.reverse().forEach((user, idx) => {
            table.innerHTML += `<tr><td>${++idx}</td><td>${user.login}</td><td>${user.wins}</td></tr>`
        })
    })
}