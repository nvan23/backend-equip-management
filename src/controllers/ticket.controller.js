'use strict'

const User = require('../models/user.model')
const Ticket = require('../models/ticket.model')
const Equipment = require('../models/equipment.model')

/**
 * Gets all Tickets
 */
exports.getAllTickets = async (req, res) => {
  Ticket
    .find({ deleted: false })
    .populate({
      path: 'userId',
      select: 'name role'
    })
    .populate({
      path: 'equipmentId',
      select: 'name type status description'
    })
    .sort({ createdAt: 'desc' })
    .then(tickets => {
      res.status(200).json(tickets.map(ticket => {
        return {
          id: ticket._id,
          userId: ticket.userId._id,
          username: ticket.userId.name,
          role: ticket.userId.role,
          equipmentId: ticket.equipmentId._id,
          equipmentName: ticket.equipmentId.name,
          type: ticket.equipmentId.type,
          status: ticket.status,
          description: ticket.equipmentId.description || '',
          createdAt: new Date(ticket.createdAt).toLocaleDateString('en-US'),
          closedAt: !ticket.closedAt ? '' : new Date(ticket.closedAt).toLocaleDateString('en-US'),
        }
      }))
    })
    .catch(error => {
      res.status(400).json(error)
    })
}

exports.getAllDeletedTickets = (req, res) => {
  Ticket
    .find({ deleted: true })
    .populate({
      path: 'userId',
      select: 'name role'
    })
    .populate({
      path: 'equipmentId',
      select: 'name type status description'
    })
    .sort({ createdAt: 'desc' })
    .then(tickets => {
      res.status(200).json(tickets.map(ticket => {
        return {
          id: ticket._id,
          userId: ticket.userId._id,
          username: ticket.userId.name,
          role: ticket.userId.role,
          equipmentId: ticket.equipmentId._id,
          equipmentName: ticket.equipmentId.name,
          type: ticket.equipmentId.type,
          status: ticket.status,
          description: ticket.equipmentId.description || '',
          createdAt: new Date(ticket.createdAt).toLocaleDateString('en-US'),
          closedAt: !ticket.closedAt ? '' : new Date(ticket.closedAt).toLocaleDateString('en-US'),
        }
      }))
    })
    .catch(error => {
      res.status(400).json(error)
    })
}

exports.getAllTicketsByUser = async (req, res) => {
  Ticket
    .find({ userId: req.body.userId })
    .then(tickets => res.status(200).json(tickets))
    .catch(error => res.status(400).json(error))
}

exports.createTicket = async (req, res) => {
  try {
    const equipmentId = req.body.equipmentId
    const userId = req.body.userId

    const equipment = await Equipment.findById(equipmentId)
    const user = await User.findById(userId)

    if (!equipment) return res.status(400).json({ error: 'Equipment not found.' });

    if (!equipment.status) return res.status(400).json({ error: 'Equipment not available.' })

    if (!user) return res.status(400).json({ error: 'User not found.' });

    const ticket = new Ticket(req.body)
    await ticket.save()

    await Equipment
      .findOneAndUpdate(
        { _id: equipmentId },
        {
          $push: { users: userId },
          status: false,
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

    await ticket.save()

    res.status(200).json(ticket)
  } catch (error) {
    console.log("On error", error)
    res.status(400).json(error)
  }
}

exports.getTicket = async (req, res) => {
  Ticket
    .findById(req.params.id)
    .then(ticket => {
      res.status(200).json(ticket)
    })
    .catch(error => res.status(400).json(error))
}

exports.modifyTicket = (req, res) => {
  try {
    if (Object.entries(req.body).length === 0) throw new Error

    Ticket
      .findById(req.params.id)
      .then(Ticket => {
        Ticket = Object.assign(Ticket, req.body)
        Ticket.save()
        res.status(200).json(Ticket)
      })
      .catch(error => res.status(400).json(error))
  } catch (error) {
    res.status(400).json({ error: 'Error Input.' })
  }
}

exports.softDeleteTicket = (req, res) => {
  Ticket
    .findById(req.params.id)
    .then(ticket => {
      ticket.delete(req.user._id)
      res.status(200).json({ msg: "Deleted successfully" })
    })
    .catch(error => res.status(400).json(error))
}

exports.restoreTicket = async (req, res) => {
  Ticket
    .findOneAndUpdate(
      { _id: req.params.id, deleted: true },
      {
        deleted: false,
      },
      { new: true }
    )
    .exec()
    .then(ticket => { res.status(200).json(ticket) })
    .catch(error => res.status(400).json(error))
}


exports.forceDelete = (req, res) => {
  Ticket
    .deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ msg: "Force Delete Successfully" }))
    .catch(error => res.status(400).json(error))
}
