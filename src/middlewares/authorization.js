<<<<<<< HEAD
const { ROLES } = require('../constants/auth')
=======
const USER_ROLE = 'user'
const ADMIN_ROLE = 'admin'
>>>>>>> 78643d8b19f13e5c1c3fe46d67e78691a1ae58c0

const User = require('../models/user.model')
const authorization = async (req, res, next) => {

  User.findById(req.user._id)
    .then(user => {
<<<<<<< HEAD
      user.role === ROLES.admin
=======
      user.role === ADMIN_ROLE
>>>>>>> 78643d8b19f13e5c1c3fe46d67e78691a1ae58c0
        ? next()
        : res.status(400).send({ error: 'Not authorized to access this resource' })
    })
    .catch(error => res.status(400).send(error))

}

module.exports = authorization