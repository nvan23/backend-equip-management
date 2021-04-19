const express = require('express')
const authentication = require('../middlewares/authentication')
const authController = require('../controllers/auth.controller')

const router = express.Router()

// Refresh token
router.post('/token', authentication, authController.refreshToken)

module.exports = router