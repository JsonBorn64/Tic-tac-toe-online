export default function header(db, ref, set, get, myAlert) {
    
    const loginWrapper = document.querySelector('.login_wrapper')
    const loginBtn = document.querySelector('.login_button')
    const registerBtn = document.querySelector('.register_button')
    const formsOverlay = document.querySelector('.forms_overlay')
    const loginForm = document.querySelector('.login_form')
    const registerForm = document.querySelector('.register_form')
    const passRecoveryBtn = document.getElementById('pass_recovery')
    const passRecoveryForm = document.querySelector('.pass_recovery_form')
    const loginInfo = document.querySelector('.login_info')
    const loginInfoNick = loginInfo.querySelector('.nickname')
    const logoutBtn = loginInfo.querySelector('.logout')
    const backBtn = document.querySelector('.back_button')
    const playerStats = loginInfo.querySelectorAll('.player_stats_item_value')

    function authCheck() {
        const login = localStorage.getItem('login')
        if (login) {
            loginWrapper.style.display = 'none'
            loginInfo.style.display = 'flex'
            loginInfoNick.innerHTML = login
        } else {
            loginWrapper.style.display = 'flex'
            loginInfo.style.display = 'none'
            loginInfoNick.innerHTML = ''
        }
    }
    authCheck()
    window.addEventListener('storage', authCheck)

    function backBtnVisibility() {
        if (window.location.pathname === '/1/') {
            backBtn.style.visibility = 'hidden'
        } else {
            backBtn.style.visibility = 'visible'
        }
    }
    backBtnVisibility()

    function formData(form) {
        const data = {}
        new FormData(form).forEach((val, key) => data[key] = val.trim())
        return data
    }

    function successSubmitActions(form, login) {
        localStorage.setItem('login', login)
        if (window.location.pathname.includes('room.html')) window.location.reload()
        form.submit.disabled = false
        loginInfo.style.display = 'flex'
        loginInfo.style.visibility = 'visible'
        formsOverlay.style.visibility = 'hidden'
        form.style.visibility = 'hidden'
        form.style.opacity = '0'
        form.reset()
        authCheck()
    }

    function renderPlayerStats() {
        if (!localStorage.getItem('login')) return
        const nick = localStorage.getItem('login').toLowerCase()
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

    loginInfo.addEventListener('mouseenter', () => {
        renderPlayerStats()
    })

    loginBtn.addEventListener('click', () => {
        formsOverlay.classList.add('form_active')
        loginForm.classList.add('form_active')
        registerForm.classList.remove('form_active')
        passRecoveryForm.classList.remove('form_active')
        setTimeout(() => loginForm.querySelector('input').focus(), 300)
    })

    registerBtn.addEventListener('click', () => {
        formsOverlay.classList.add('form_active')
        registerForm.classList.add('form_active')
        loginForm.classList.remove('form_active')
        passRecoveryForm.classList.remove('form_active')
        setTimeout(() => registerForm.querySelector('input').focus(), 300)
    })

    formsOverlay.addEventListener('click', () => {
        formsOverlay.classList.remove('form_active')
        loginForm.classList.remove('form_active')
        registerForm.classList.remove('form_active')
        passRecoveryForm.classList.remove('form_active')
    })

    passRecoveryBtn.addEventListener('click', () => {
        formsOverlay.classList.add('form_active')
        passRecoveryForm.classList.add('form_active')
        loginForm.classList.remove('form_active')
        setTimeout(() => passRecoveryForm.querySelector('input').focus(), 300)
    })

    logoutBtn.addEventListener('click', () => {
        if (window.location.pathname.includes('room.html')) window.location.reload()
        localStorage.removeItem('login')
        authCheck()
        myAlert('Вы успешно вышли')
    })

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault()
        const data = formData(this)
        data.parties = 0
        data.wins = 0
        data.draws = 0
        data.losses = 0
        this.submit.disabled = true
        get(ref(db, `tictac/registeredUsers/${data.login.toLowerCase()}`)).then(snap => {
            if (snap.exists()) {
                this.submit.disabled = false
                myAlert('Такой ник уже занят', true)
            } else {
                set(ref(db, `tictac/registeredUsers/${data.login.toLowerCase()}`), data)
                .then(() => {
                    successSubmitActions(this, data.login)
                    myAlert('Вы успешно зарегистрировались!')
                })
                .catch(err => {
                    this.submit.disabled = false
                    console.log('Ошибка регистрации ', err)
                    myAlert('Что-то пошло не так', true)
                })
            }
        })
    })

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault()
        const data = formData(this)
        this.submit.disabled = true
        get(ref(db, `tictac/registeredUsers/${data.login.toLowerCase()}`)).then(snap => {
            if (snap.exists()) {
                if (snap.val().password == data.password) {
                    successSubmitActions(this, snap.val().login)
                    myAlert('Вы успешно вошли!')
                } else {
                    this.submit.disabled = false
                    myAlert('Неверный пароль', true)
                }
            } else {
                this.submit.disabled = false
                myAlert('Такого пользователя не существует', true)
            }
        })
    })

    passRecoveryForm.addEventListener('submit', function (e) {
        e.preventDefault()
        this.submit.disabled = true
        const nickName = this.login.value.trim()
        const mailTimeOut = +localStorage.getItem('mailTimeOut')
        get(ref(db, `tictac/registeredUsers/${nickName.toLowerCase()}`)).then(snap => {
            if (snap.exists() && snap.val().email) {
                if (Date.now() > mailTimeOut) {
                    Email.send({
                        SecureToken : "6c3d7ad6-0ad0-418d-833e-07b4885f5490",
                        To : snap.val().email,
                        From : "xaker6444@gmail.com",
                        Subject : 'Восстановление пароля в "Крестики-нолики"',
                        Body : `<h1>Ваш пароль: ${snap.val().password}</h1>`
                    }).then(message => {
                        if (message == 'OK') {
                            passRecoveryForm.classList.remove('form_active')
                            this.submit.disabled = false
                            localStorage.setItem('mailTimeOut', new Date().getTime() + 120 * 1000)
                            myAlert('Пароль успешно отправлен на почту')
                        } else {
                            this.submit.disabled = false
                            console.log('Ошибка отправки пароля', message)
                            myAlert('Ошибка отправки пароля', true)
                        }
                    })
                } else {
                    this.submit.disabled = false
                    myAlert('Вы уже отправляли письмо менее 2-х минут назад', true)
                }
            } else if (snap.exists() && !snap.val().email) {
                this.submit.disabled = false
                myAlert('Почтовый адрес не был указан при регистрации', true)
            } else if (!snap.exists()) {
                this.submit.disabled = false
                myAlert('Такого пользователя не существует', true)
            }
        })
    })

    /* SmtpJS.com - v3.0.0 */
    var Email = {
      send: function (a) {
        return new Promise(function (n, e) {
          (a.nocache = Math.floor(1e6 * Math.random() + 1)),
            (a.Action = "Send");
          var t = JSON.stringify(a);
          Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, function (e) {
            n(e);
          });
        });
      },
      ajaxPost: function (e, n, t) {
        var a = Email.createCORSRequest("POST", e);
        a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"),
          (a.onload = function () {
            var e = a.responseText;
            null != t && t(e);
          }),
          a.send(n);
      },
      ajax: function (e, n) {
        var t = Email.createCORSRequest("GET", e);
        (t.onload = function () {
          var e = t.responseText;
          null != n && n(e);
        }),
          t.send();
      },
      createCORSRequest: function (e, n) {
        var t = new XMLHttpRequest();
        return (
          "withCredentials" in t
            ? t.open(e, n, !0)
            : "undefined" != typeof XDomainRequest
            ? (t = new XDomainRequest()).open(e, n)
            : (t = null),
          t
        );
      },
    };

}
