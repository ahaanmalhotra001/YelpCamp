const express = require('express')
const router = express.Router()

const passport = require('passport')

const catchAsync = require('../utils/catchAsync')

const users = require('../controllers/user')

router.route('/register')
    .get(users.registerForm)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.loginForm)
    .post( passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}), catchAsync(users.login)) //authenitcate logs in as well

router.get('/logout', users.logout)

module.exports = router