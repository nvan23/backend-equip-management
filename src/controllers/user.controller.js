'use strict'

const User = require("../models/user.model")
const jwtVariable = require('./../constants/jwt')
const authMethod = require('./auth/auth.methods')
const randToken = require('rand-token')

exports.register = async (req, res) => {
  try {
    const { email } = req.body
    const findUser = await User.findOne({ email })

    if (findUser) return res.status(400).send({ error: "Email already exists." })

    const user = new User(req.body)
    await user.save()

    // const token = await user.generateAuthToken()
    await user.initEquipments()

    res.status(200).json({ user })

  } catch (error) {
    res.status(400).send(error)
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findByCredentials(email, password)

  if (!user) {
    return res.status(400).send({ error: 'Login failed.' })
  }

  const accessTokenLife =
    process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife
  const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret

  const dataForAccessToken = {
    id: user._id,
  }

  const accessToken = await authMethod.generateToken(
    dataForAccessToken,
    accessTokenSecret,
    accessTokenLife,
  )

  if (!accessToken) {
    return res
      .status(401)
      .send('Login failed, please try again.')
  }


  user.tokens = user.tokens.concat({ accessToken })
  await user.save()

  // Generates a random token refresh
  let refreshToken = randToken.generate(jwtVariable.refreshTokenSize)

  if (!user.refreshToken) {
    user.refreshToken = refreshToken
    await user.save()
  } else {
    refreshToken = user.refreshToken
  }

  return res.json({
    msg: 'Logged in successfully.',
    accessToken,
    refreshToken,
    user,
  })
}

exports.isAuthenticated = async (req, res) => {
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
    if (!user) {
      throw new Error()
    }
    res.status(200).json({ authenticated: true })
  } catch (error) {
    res.status(401).send({ error: 'Not authenticated to access this resource' })
  }
}

exports.refreshToken = async (req, res) => {
  try {
    // Retrieve the access token from the header
    const accessTokenFromHeader = req.headers.x_authorization;
    if (!accessTokenFromHeader) {
      return res.status(400).send('Access token could not be found.');
    }

    // Get token refresh from body
    const refreshTokenFromBody = req.body.refreshToken;
    if (!refreshTokenFromBody) {
      return res.status(400).send('No refresh token found.');
    }

    const accessTokenSecret =
      process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
    const accessTokenLife =
      process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;

    // Decode access token
    const decoded = await authMethod.decodeToken(
      accessTokenFromHeader,
      accessTokenSecret,
    );
    if (!decoded) {
      return res.status(400).send('Invalid Access token.');
    }

    const id = decoded.payload.id; // Get ID user from payload

    const user = await User.findById(id);
    if (!user) {
      return res.status(401).send('User does not exist.');
    }

    if (refreshTokenFromBody !== user.refreshToken) {
      return res.status(400).send('Invalid token refresh.');
    }

    // Create a new access token
    const dataForAccessToken = {
      id,
    };

    const accessToken = await authMethod.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife,
    );
    if (!accessToken) {
      return res
        .status(400)
        .send('Access token creation failed, please try again.');
    }
    return res.json({
      accessToken,
    })

  } catch (error) {
    res.json(error)
  }
};

exports.getAllEquipmentsOnUser = async (req, res) => {
  User
    .findById(req.user._id)
    .populate({
      path: 'equipments',
    })
    .then(user => {
      res.status(200).send({
        amount: user.equipments.length,
        equipments: user.equipments.reverse().map(equipment => {
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

exports.getProfile = async (req, res) => {
  const {
    _id,
    email,
    name,
    role,
    equipments
  } = req.user

  const data = {
    id: _id,
    email,
    name,
    role,
    equipments,
  }
  res.send(data)
}

exports.logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token
    })
    await req.user.save()
    res.status(200).json({ msg: 'Sign out success.' })
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.logoutAllDevices = async (req, res) => {
  try {
    req.user.tokens.splice(0, req.user.tokens.length)
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.changeRole = (req, res) => {
  User
    .findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    )
    .then(user => res.status(200).send(user))
    .catch(error => res.status(400).send(error))
}

exports.getAllUsersWithUserAndId = async (req, res) => {
  User
    .find({ deleted: false })
    .sort({ createdAt: 'desc' })
    .then(users => {
      res.status(200).send(users.map(user => {
        return {
          key: user._id,
          id: user._id,
          value: user.name,
        }
      }))
    })
    .catch(error => {
      res.status(400).send(error)
    })
}
