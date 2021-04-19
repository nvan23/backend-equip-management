const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const jwtVariable = require('../constants/jwt')
const authMethod = require('../controllers/auth/auth.methods')

const authentication = async (req, res, next) => {
  // !req.header('Authorization') && res.status(401).send({ error: 'Not authenticated to access this resource' })

  // const token = req.header('Authorization').replace('Bearer ', '')
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
    // const user = await User.findById()
    if (!user) {
      throw new Error()
    }
    req.user = user
    next()
  } catch (error) {
    res.status(401).send({ error: 'Not authenticated to access this resource' })
  }

}
module.exports = authentication