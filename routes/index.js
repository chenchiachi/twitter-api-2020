const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const admin = require('./modules/admin')
const user = require('./modules/user')
const tweet = require('./modules/tweet')
const followship = require('./modules/followship')
const userController = require('../controllers/user-controller')
const { authenticated, authenticatedAdmin } = require('../middleware/api-auth')
const { generalErrorHandler } = require('../middleware/errHandler')

router.post('/login', passport.authenticate('local', { session: false }), userController.login)
router.post('/users', userController.signUp)

router.use('/admin', authenticated, authenticatedAdmin, admin)
router.use('/users', authenticated, user)
router.use('/tweets', authenticated, tweet)
router.use('/followships', authenticated, followship)

router.use('/', generalErrorHandler)
module.exports = router