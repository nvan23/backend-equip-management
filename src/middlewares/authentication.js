const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const jwtVariable = require('../constants/jwt')
const authMethod = require('../controllers/auth/auth.methods')

const authentication = async (req, res, next) => {
  // !req.header('Authorization') && res.status(401).send({ error: 'Not authenticated to access this resource' })

  // const token = req.header('Authorization').replace('Bearer ', '')
<<<<<<< HEAD

  // Retrieve the access token from the header
  const tokenFromHeader = req.headers.x_authorization;

  const data = jwt.verify(tokenFromHeader, process.env.APP_SECRET)

  console.log(tokenFromHeader)
  if (!tokenFromHeader) {
    return res.status(401).json({ msg: 'Access token not found.' });
  }

  try {
    const user = await User.findOne({ _id: data.id }, { "tokens.token": tokenFromHeader })
=======
  // const data = jwt.verify(token, process.env.APP_SECRET)

  // Retrieve the access token from the header
  const accessTokenFromHeader = req.headers.x_authorization;
  if (!accessTokenFromHeader) {
    return res.status(401).send('Access token not found.');
  }

  const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;

  const verified = await authMethod.verifyToken(
    accessTokenFromHeader,
    accessTokenSecret,
  );

  if (!verified) {
    return res
      .status(401)
      .send('You do not have access to this feature');
  }

  try {
    const user = await User.findOne({ _id: verified.payload.id, 'tokens.accessToken': accessTokenFromHeader })
>>>>>>> 78643d8b19f13e5c1c3fe46d67e78691a1ae58c0
    // const user = await User.findById()
    if (!user) {
      throw new Error()
    }
    req.user = user
    next()
  } catch (error) {
<<<<<<< HEAD
    res.status(401).json({ error: 'Not authenticated to access this resource' })
=======
    res.status(401).send({ error: 'Not authenticated to access this resource' })
>>>>>>> 78643d8b19f13e5c1c3fe46d67e78691a1ae58c0
  }

}
module.exports = authentication