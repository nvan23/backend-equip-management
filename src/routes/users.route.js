const express = require('express')
const userController = require('../controllers/user.controller')
const authentication = require('../middlewares/authentication')
const authorization = require('../middlewares/authorization')

const router = express.Router()

// Get all users with Username and Id
router.get('/', authentication, authorization, userController.getUsernameAndIdOfAllUsers)

module.exports = router