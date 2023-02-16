const jwt = require('jsonwebtoken')
const sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const { User, Tweet, Reply, Like, Followship } = require('../models')
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
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
        role: 'user'
      })
      return res.json({ status: 'SignUp success.' })
    } catch (err) {
      next(err)
    }
  },
  getUser: async (req, res, next) => {
    try {
      const id = getUser(req).id || getUser(req).dataValues.id
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
            [sequelize.literal(`EXISTS (SELECT true FROM Followships WHERE Followships.followerId = ${getUser(req).dataValues.id} AND Followships.followingId = User.id)`), 'isFollowing'],
          ],
          exclude: ['password', 'createdAt', 'updatedAt']
        }
      })
      return res.json(userData)
    } catch (err) {
      next(err)
    }
  },
  getTopUser: async (req, res, next) => {
    const TopUserNum = 10
    try {
      const topUser = await User.findAll({
        raw: true,
        nest: true,
        where: { role: 'user' },
        attributes: {
          exclude: ['password', 'createdAt', 'updatedAt'],
          include: [
            [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM Followships WHERE Followships.followingId = User.id)'), 'followersCount'],
            [sequelize.literal(`EXISTS (SELECT true FROM Followships WHERE Followships.followerId = ${getUser(req).dataValues.id} AND Followships.followingId = User.id)`), 'isFollowing'],
          ],
        },
        order: [[sequelize.literal('followersCount'), 'DESC']],
        limit: TopUserNum
      })
      if (!userData) throw Error('User not found.')
      return res.json(topUser)
    } catch (err) {
      next(err)
    }
  },
  getUserTweets: async (req, res, next) => {
    try {
      const id = req.params.id
      const user = await User.findByPk(id)
      const userTweets = await Tweet.findAll({
        raw: true,
        nest: true,
        where: { userId: id },
        attributes: {
          include: [
            [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM Replies WHERE Replies.TweetId = Tweet.id )'), 'repliesCount'],
            [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM Likes WHERE Likes.TweetId = Tweet.id )'), 'likesCount'],
            [sequelize.literal(`EXISTS (SELECT true FROM Likes WHERE Likes.UserId = ${getUser(req).dataValues.id} AND Likes.TweetId = Tweet.id)`), 'isLiked'],
          ]
        },
        order: [['CreatedAt', 'DESC']]
      })
      if (!user) throw Error('User not found.')
      return res.json(userTweets)
    } catch (err) {
      next(err)
    }
  },
  getUserReplies: async (req, res, next) => {
    try {
      const id = req.params.id
      const user = await User.findByPk(id)
      if (!user) throw Error('User not found.')
      const replies = await Reply.findAll({
        where: { UserId: id },
        include: [
          { model: User, attributes: ['id', 'account', 'name', 'avatar'] },
        ],
        order: [['createdAt', 'DESC']]
      })
      return res.json(replies)
    } catch (err) {
      next(err)
    }
  },
  getUserLikes: async (req, res, next) => {
    try {
      const id = req.params.id
      const user = await User.findByPk(id)
      if (!user) throw Error('User not found.')
      const likes = await Like.findAll({
        where: { UserId: id },
        include: [
          { model: Tweet, include: [{ model: User, attributes: ['id', 'account', 'name', 'avatar'] }] },
        ],
        attributes: {
          include: [
            [sequelize.literal('(SELECT COUNT(*) FROM Replies WHERE Replies.TweetId = Like.TweetId)'), 'repliesCount'],
            [sequelize.literal('(SELECT COUNT(*) FROM Likes AS l1 WHERE l1.TweetId = Like.TweetId)'), 'likesCount'],
            [sequelize.literal(`EXISTS (SELECT true FROM Likes AS l1 WHERE l1.UserId = ${getUser(req).dataValues.id} AND l1.TweetId = Like.TweetId)`), 'isLiked'],
          ]
        },
        order: [['createdAt', 'DESC']]
      })
      return res.json(likes)
    } catch (err) {
      next(err)
    }
  },
  getFollowings: async (req, res, next) => {
    try {
      const id = req.params.id
      const user = await User.findByPk(id)
      if (!user) throw Error('User not found.')
      const followings = await Followship.findAll({
        where: { followerId: id },
        order: [['createdAt', 'DESC']],
        attributes: {
          include: [
            [sequelize.literal(`EXISTS(SELECT true FROM Followships AS l1 WHERE l1.followerId= ${getUser(req).dataValues.id} AND l1.followingId = Followship.followingId)`), 'isFollowing']
          ]
        }
      })
      return res.json(followings)
    } catch (err) {
      next(err)
    }
  },
  getFollowers: async (req, res, next) => {
    try {
      const id = req.params.id
      const user = await User.findByPk(id)
      if (!user) throw Error('User not found.')
      const followers = await Followship.findAll({
        where: { followingId: id },
        order: [['createdAt', 'DESC']],
        attributes: {
          include: [
            [sequelize.literal(`EXISTS(SELECT true FROM Followships AS l1 WHERE l1.followerId= ${getUser(req).dataValues.id} AND l1.followingId = Followship.followerId)`), 'isFollowing']
          ]
        }
      })
      return res.json(followers)
    } catch (err) {
      next(err)
    }
  },
  editAccount: async (req, res, next) => {
    try {
      const id = req.params.id
      if (getUser(req).dataValues.id !== Number(id)) throw new Error('unauthorized!')
      const user = await User.findByPk(id)
      if (!user) throw Error('User not found.')
      const { account, email, password, checkPassword } = req.body
      if (!account || !email || !password || !checkPassword) throw new Error('All fields are require.')
      if (/\s/.test(account) || /\s/.test(password)) throw new Error('Not allowed space.')
      if (password !== checkPassword) throw new Error('Passwords do not match!')
      const userEmail = await User.findOne({
        where: { email },
        attributes: ['id'],
        raw: true
      })
      const userAccount = await User.findOne({
        where: { account },
        attributes: ['id'],
        raw: true
      })
      if (userEmail) throw new Error('Email already exists!')
      if (userAccount) throw new Error('Account already exists!')
      const hash = await bcrypt.hash(password, 10)
      await user.update({
        account: account,
        email: email,
        password: hash
      })
      return res.json({ status: 'success' })
    } catch (err) {
      next(err)
    }
  },
}

module.exports = userController