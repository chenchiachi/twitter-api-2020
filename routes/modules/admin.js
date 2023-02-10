const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const adminController = require('../../controllers/admin-controller')

router.get('/users', adminController.getUsers)
router.delete('/tweets/:id', adminController.deleteTweet)

module.exports = router