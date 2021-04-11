const express = require('express')
const authentication = require('../middlewares/authentication')
const authorization = require('../middlewares/authorization')
const equipmentController = require('../controllers/equipment.controller')

const router = express.Router()

// Create a new equipment
router.post('/', authentication, authorization, equipmentController.createEquipment);

// Assigning an equipment to an employee
router.post('/:id', authentication, authorization, equipmentController.assignEquipmentToEmployee)

// Get all equipments by user
router.get('/search', authentication, authorization, equipmentController.getAllEquipmentsByUser)

// Get all equipments
router.get('/', authentication, authorization, equipmentController.getAllEquipments)

// Get all equipments
router.get('/name-id', authentication, authorization, equipmentController.getAllEquipmentsWithNameAndId)

// Get an equipment
router.get('/:id', authentication, equipmentController.getEquipment)

// Edit an equipment
router.put('/:id', authentication, authorization, equipmentController.modifyEquipment)

// Soft delete an equipment
router.delete('/:id', authentication, authorization, equipmentController.softDeleteEquipment)

module.exports = router