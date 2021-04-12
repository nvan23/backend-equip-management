'use strict'

const User = require('../models/user.model')
const Equipment = require('../models/equipment.model')

exports.getAllEquipments = (req, res) => {
  Equipment
    .find({ deleted: false })
    .then((equipments) => {
      res.status(200).send({
        amount: equipments.length,
        equipments: equipments.reverse().map(equipment => {
          return {
            id: equipment._id,
            name: equipment.name,
            type: equipment.type,
            status: equipment.status,
            description: equipment.description || '',
            createdAt: new Date(equipment.createdAt).toLocaleDateString('en-US'),
          }
        }),
      })
    })
    .catch(error => {
      res.status(400).send(error)
    })
}

exports.getAllEquipmentsWithNameAndId = (req, res) => {
  Equipment
    .find({ status: true, deleted: false, })
    .sort({ createdAt: 'desc' })
    .then((equipments) => {
      res.status(200).send(equipments.map(equipment => {
        return {
          key: equipment._id,
          id: equipment._id,
          value: equipment.name,
        }
      }))
    })
    .catch(error => {
      res.status(400).send(error)
    })
}

exports.getAllEquipmentsByUser = async (req, res) => {
  Equipment
    .find()
    .then(equipments => {
      let newEquipments = equipments.filter(equipment =>
        Object.values(equipment.users).map(
          e => e.toString()
        ).includes(req.query.user)
      )
      res.status(200).send({
        amount: newEquipments.length,
        equipments: newEquipments
      })
    })
    .catch(error => res.status(400).send(error))
}

exports.assignEquipmentToEmployee = async (req, res) => {
  try {
    const equipmentId = req.params.id
    const userId = req.body.userId

    const equipment = await Equipment.findById(equipmentId)
    const user = await User.findById(userId)

    if (!equipment) return res.status(400).send({ error: 'Equipment not found.' });

    if (equipment.status) return res.status(400).send({ error: 'Equipment not available.' })

    if (!user) return res.status(400).send({ error: 'User not found.' });

    const newEquipment = await Equipment
      .findOneAndUpdate(
        { _id: equipmentId },
        {
          $push: { users: userId },
          status: !equipment.status,
        },
        { new: true }
      )

    await User
      .findOneAndUpdate(
        { _id: userId },
        {
          $push: { equipments: equipmentId },
        },
        { new: true }
      )

    res.status(200).send(newEquipment)
  } catch (error) {
    res.status(400).send(error)
  }
}

exports.createEquipment = async (req, res) => {
  try {
    const equipment = new Equipment(req.body)
    await equipment.save()
    await equipment.initEmployees();
    res.status(200).send(equipment)
  } catch (error) {
    res.status(400).send(error)
  }
}

exports.getEquipment = async (req, res) => {
  Equipment
    .findById(req.params.id)
    .then(equipment => {
      res.status(200).send(equipment)
    })
    .catch(error => res.status(400).send(error))
}

exports.modifyEquipment = (req, res) => {

  if (Object.entries(req.body).length === 0) return res.status(400).send({ error: 'Error Input.' })

  Equipment
    .findById(req.params.id)
    .then(equipment => {
      equipment = Object.assign(equipment, req.body)
      equipment.save()
      res.status(200).send(equipment)
    })
    .catch(error => res.status(400).send(error))
}

exports.softDeleteEquipment = (req, res) => {
  Equipment
    .findById(req.params.id)
    .then(equipment => {
      equipment.delete(req.user._id)
      res.status(200).send("Deleted successfully")
    })
    .catch(error => res.status(400).send(error))
}

exports.restoreDeleteEquipment = async (req, res) => {
  Equipment
    .findOneAndUpdate(
      { _id: req.params.id, deleted: true },
      {
        deleted: false,
      },
      { new: true }
    )
    .exec()
    .then(equipment => {
      console.log(equipment)
      res.status(200).send(equipment)
    }
    )
    .catch(error => res.status(400).send(error))
}
