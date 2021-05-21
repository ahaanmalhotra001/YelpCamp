const User = require('../models/user')

module.exports.registerForm = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ email, username })
        const newUser = await User.register(user, password)

        req.login(newUser, err => {
            if (err) return next(err)
            req.flash('success', 'User created !!')
            res.redirect('/')
        })

    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.loginForm = (req, res) => {
    res.render('users/login')
}

module.exports.login = async (req, res) => {
    req.flash('success', 'Logged In')
    const redir = req.session.returnTo || '/'
    delete req.session.returnTo

    res.redirect(redir)
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!')
    res.redirect('/')
}