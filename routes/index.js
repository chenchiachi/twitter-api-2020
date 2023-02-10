const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const admin = require('./modules/admin')

const userController = require('../controllers/user-controller')
const { authenticated, authenticatedAdmin } = require('../middleware/api-auth')
const { generalErrorHandler } = require('../middleware/errHandler')

router.use('/admin', authenticated, authenticatedAdmin, admin)

router.post('/login', passport.authenticate('local', { session: false }), userController.login)

router.use('/', generalErrorHandler)
module.exports = router