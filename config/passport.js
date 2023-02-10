const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')

const bcrypt = require('bcrypt')
const { User } = require('../models')

const JWTstrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

// set up Passport strategy
passport.use(new LocalStrategy(
  //設定客製化選項
  {
    usernameField: 'account',
    passwordField: 'password',
    passReqToCallback: true
  },
  //callback function驗證使用者
  (req, account, password, cb) => {
    User.findOne({ where: { account } })
      .then(user => {
        if (!user) return cb("Account didn't exit!", false)
        bcrypt.compare(password, user.password).then(res => {
          if (!res) return cb('Password incorrect!', false)
          return cb(null, user)
        })
      })
  }
))

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}
passport.use(new JWTstrategy(jwtOptions, (jwtPayload, cb) => {
  User.findByPk(jwtPayload.id, {
    include: [
      { model: User, as: 'Followings' },
      { model: User, as: 'Followers' },
    ]
  })
    .then(user => cb(null, user))
    .catch(err => cb(err))
}))

module.exports = passport