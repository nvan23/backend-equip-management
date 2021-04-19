const express = require('express')
const userController = require('../controllers/user.controller')
const authentication = require('../middlewares/authentication')
const authorization = require('../middlewares/authorization')

const router = express.Router()

// Register
router.post('/register', userController.register)

//Login a registered user
router.post('/login', userController.login)

// Get all equipments of an employee who assigned
router.get('/equipments', authentication, userController.getAllEquipmentsOnUser)

// View logged in user profile
router.get('/me', authentication, userController.getProfile)

// View logged in user profile
router.get('/me/authenticated', authentication, userController.isAuthenticated)

// Refresh token
router.post('/me/refresh', authentication, userController.refreshToken)

// Log user out of the application
router.post('/me/logout', authentication, userController.logout)

// Log user out of all devices
router.post('/me/logout-all', authentication, userController.logoutAllDevices)

// Change role of user
router.patch('/role/:id/', authentication, authorization, userController.changeRole)

module.exports = router