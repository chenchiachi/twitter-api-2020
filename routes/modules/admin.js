const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const adminController = require('../../controllers/admin-controller')

router.post('/login', passport.authenticate('local', { session: false }), adminController.login)

module.exports = router