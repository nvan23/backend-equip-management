'use strict'
const express = require('express')
const router = express.Router()
const userRouter = require('./user.route')
const usersRouter = require('./users.route')
const equipmentRouter = require('./equipment.route')
const ticketRouter = require('./ticket.route')
const trashRouter = require('./trash.route')

router.use('/user', userRouter) // mount user paths
router.use('/users', usersRouter) // mount user paths
router.use('/equipments', equipmentRouter) // mount equipment paths
router.use('/tickets', ticketRouter) // mount ticket paths
router.use('/trash', trashRouter) // mount trash paths

module.exports = router