const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete');
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { SALT_ROUNDS } = require('../constants/auth')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: value => {
      if (!validator.isEmail(value)) {
        throw new Error({ error: 'Invalid Email address' })
      }
    }
  },
  password: {
    type: String,
    required: true,
    minLength: 7
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    required: true
  },
<<<<<<< HEAD
=======
  refreshToken: {
    type: String,
    default: null,
  },
>>>>>>> 78643d8b19f13e5c1c3fe46d67e78691a1ae58c0
  equipments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  tokens: [{
<<<<<<< HEAD
    token: {
      type: String,
=======
    accessToken: {
      type: String,
      require: true
>>>>>>> 78643d8b19f13e5c1c3fe46d67e78691a1ae58c0
    }
  }]
}, { timestamps: true })

// Add plugin to Schema to use soft delete
userSchema.plugin(
  mongooseDelete,
  { deletedAt: true },
  { deletedBy: true },
  { overrideMethods: true },
)

userSchema.pre('save', async function (next) {
  // Hash the password before saving the user model
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS)
  }
  next()
})

<<<<<<< HEAD
userSchema.methods.generateAuthToken = async function () {
  // Generate an auth token for the user
  const user = this
  const token = jwt.sign({ id: user._id }, process.env.APP_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE || '10h' })
=======
// init empty equipments for new user
userSchema.methods.initEquipments = async function () {
  const user = this
  user.equipments = []
  await user.save()
}

userSchema.methods.generateAuthToken = async function () {
  // Generate an auth token for the user
  const user = this
  const token = jwt.sign({ _id: user._id }, process.env.APP_SECRET)
>>>>>>> 78643d8b19f13e5c1c3fe46d67e78691a1ae58c0
  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

userSchema.statics.findByCredentials = async (email, password) => {
  try {
    // Search for a user by email and password.
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error({ error: 'Invalid login credentials.' })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      throw new Error({ error: 'Invalid login credentials' })
    }
    return user
  }
  catch {
    return false
  }

}

const User = mongoose.model('User', userSchema)

module.exports = User