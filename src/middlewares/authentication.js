const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const jwtVariable = require('../constants/jwt')
const authMethod = require('../controllers/auth/auth.methods')

const authentication = async (req, res, next) => {
  // !req.header('Authorization') && res.status(401).send({ error: 'Not authenticated to access this resource' })

  // const token = req.header('Authorization').replace('Bearer ', '')

  // Retrieve the access token from the header
  const tokenFromHeader = req.headers.x_authorization;

  const data = jwt.verify(tokenFromHeader, process.env.APP_SECRET)

  console.log(tokenFromHeader)
  if (!tokenFromHeader) {
    return res.status(401).json({ msg: 'Access token not found.' });
  }

  try {
    const user = await User.findOne({ _id: data.id }, { "tokens.token": tokenFromHeader })
    // const user = await User.findById()
    if (!user) {
      throw new Error()
    }
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Not authenticated to access this resource' })
  }

}
module.exports = authentication