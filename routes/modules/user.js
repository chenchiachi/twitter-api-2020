const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const userController = require('../../controllers/user-controller')

router.get('/current_user', userController.getCurrentUser)
router.get('/top', userController.getTopUser)

module.exports = router