'use strict'

const User = require("../models/user.model")
const jwtVariable = require('./../constants/jwt')
const authMethod = require('./auth/auth.methods')
const randToken = require('rand-token')

exports.register = async (req, res) => {
  try {
    const { email } = req.body
    const isUser = await User.findOne({ email })

    if (isUser) return res.status(406).json({ msg: "Email already exists." })

    const user = new User(req.body)
    await user.save()

    res.status(200).json({ msg: 'Register successfully.' })

  } catch (error) {
    res.status(400).json(error)
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findByCredentials(email, password)

  if (!user) {
    return res.status(404).json({ error: 'Login failed.' })
  }

  const token = await user.generateAuthToken()

  return res.json({
    msg: 'Logged in successfully.',
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      equipments: user.equipments,
    },
  })
}

exports.isAuthenticated = async (req, res) => {
  const accessTokenFromHeader = req.headers.x_authorization;
  if (!accessTokenFromHeader) {
    return res.status(404).json({ msg: 'Access token not found.' });
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
      .json({ msg: 'You do not have access to this feature' });
  }

  const user = await User.findOne({ _id: verified.payload.id })
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated to access this resource' })
  }

  return res.status(200).json({ authenticated: true })
}

exports.refreshToken = async (req, res) => {
  try {
    // Retrieve the access token from the header
    const accessTokenFromHeader = req.headers.x_authorization;
    if (!accessTokenFromHeader) {
      return res.status(404).json({ msg: 'Access token could not be found.' });
    }

    // Get token refresh from body
    const refreshTokenFromBody = req.body.refreshToken;
    if (!refreshTokenFromBody) {
      return res.status(404).json({ msg: 'No refresh token found.' });
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
      return res.status(406).json({ msg: 'Invalid Access token.' });
    }

    const id = decoded.payload.id; // Get ID user from payload

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: 'User does not exist.' });
    }

    if (refreshTokenFromBody !== user.refreshToken) {
      return res.status(406).json({ msg: 'Invalid token refresh.' });
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
        .status(404)
        .json({ msg: 'Access token creation failed, please try again.' });
    }
    return res.json(accessToken)

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
    .sort({ createdAt: 'desc' })
    .then(user => {
      res.status(200).json({
        amount: user.equipments.length,
        equipments: user.equipments.map(equipment => {
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
      res.status(400).json(error)
    })
}

exports.getProfile = (req, res) => {
  User
    .findById(req.user?._id, '_id name email role')
    .then(user => {
      res.status(200).json(user)
    })
    .catch(error => res.status(404).json(error))
}

exports.logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token
    })
    await req.user.save()
    res.status(200).json({ msg: 'Sign out success.' })
  } catch (error) {
    res.status(500).json(error)
  }
}

exports.logoutAllDevices = async (req, res) => {
  try {
    req.user.tokens.splice(0, req.user.tokens.length)
    await req.user.save()
    res.json()
  } catch (error) {
    res.status(500).json(error)
  }
}

exports.changeRole = (req, res) => {
  User
    .findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    )
    .then(user => res.status(200).json(user))
    .catch(error => res.status(400).json(error))
}

exports.getAllUsersWithUserAndId = async (req, res) => {
  User
    .find({ deleted: false })
    .sort({ createdAt: 'desc' })
    .then(users => {
      res.status(200).json(users.map(user => {
        return {
          key: user._id,
          id: user._id,
          value: user.name,
        }
      }))
    })
    .catch(error => {
      res.status(400).json(error)
    })
}
