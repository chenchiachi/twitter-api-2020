const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const adminController = require('../../controllers/admin-controller')

router.get('/users', adminController.getUsers)

module.exports = router