const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const admin = require('./modules/admin')

const userController = require('../controllers/user-controller')

router.post('/login', passport.authenticate('local', { session: false }), userController.login)

router.use('/admin', admin)

module.exports = router