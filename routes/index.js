const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const admin = require('./modules/admin')

const userController = require('../controllers/user-controller')
const { generalErrorHandler } =require('../middleware/errHandler')

router.post('/login', passport.authenticate('local', { session: false }), userController.login)

router.use('/admin', admin)

router.use('/', generalErrorHandler)
module.exports = router