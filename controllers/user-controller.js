const jwt = require('jsonwebtoken')
const sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const { User } = require('../models')
const { getUser } = require('../_helpers')

const userController = {
  login: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password //避免密碼傳入前端
      const token = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: '30d'
      })
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  },
  signUp: async (req, res, next) => {
    try {
      const { account, name, email, password, checkPassword } = req.body
      if (!account || !name || !email || !password || !checkPassword) throw Error('All fields are require.')
      if (/\s/.test(account) || /\s/.test(password)) throw Error('Not allowed space.')
      if (name.length > 50) throw Error('Name is too long!')
      if (password !== checkPassword) throw Error('Passwords do not match!')
      const userEmail = await User.findOne({ where: { email } })
      const userAccount = await User.findOne({ where: { account } })
      if (userEmail) throw Error('Email already existed!')
      if (userAccount) throw Error('Account already existed!')
      await User.create({
        account,
        name,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
      })
      return res.json({ status: 'SignUp success.' })
    } catch (err) {
      next(err)
    }
  },
  getCurrentUser: async (req, res, next) => {
    try {
      const id = getUser(req).dataValues.id
      console.log("id", id)
      const userData = await User.findByPk(id, {
        raw: true,
        nest: true,
        attributes: {
          include: [
            [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM Followships WHERE Followships.followingId = User.id)'), 'followersCount'],
            [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM Followships WHERE Followships.followingId = User.id)'), 'followingsCount'],
            [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM Tweets WHERE Tweets.UserId = User.id)'), 'tweetsCount'],
            [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM Replies WHERE Replies.UserId = User.id)'), 'repliesCount'],
            [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM Likes WHERE Likes.UserId = User.id)'), 'likesCount'],
          ],
          exclude: ['password', 'createdAt', 'updatedAt']
        }
      })
      return res.json(userData)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController