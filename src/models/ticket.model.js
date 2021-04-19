const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete');

const ticketSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  },
  status: {
    type: Boolean,
    default: true,
  },
<<<<<<< HEAD
  closedAt: {
    type: String,
    default: '',
  },
=======
  closedAt: String,
>>>>>>> 78643d8b19f13e5c1c3fe46d67e78691a1ae58c0
}, { timestamps: true })

// Add plugin to Schema to use soft delete
ticketSchema.plugin(
  mongooseDelete,
  { deletedAt: true },
  { deletedBy: true },
  { overrideMethods: true },
)

<<<<<<< HEAD
=======
// init empty closed at for new ticket
ticketSchema.methods.initClosedAt = async function () {
  const ticket = this
  ticket.closedAt = ''
  await ticket.save()
}

>>>>>>> 78643d8b19f13e5c1c3fe46d67e78691a1ae58c0
const Ticket = mongoose.model('Ticket', ticketSchema)

module.exports = Ticket