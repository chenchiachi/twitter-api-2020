const sequelize = require('sequelize')
const { User, Tweet, Like } = require('../models')
const adminController = {
  getUsers: async (req, res, next) => {
    try {
      const userData = await User.findAll({
        nest: true,
        raw: true,
        attributes: ['id', 'account', 'name', 'cover', 'avatar',
          [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM Tweets WHERE Tweets.UserId = User.id)'), 'tweetsCount'],
          [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM Followships WHERE Followships.followingId = User.id)'), 'followersCount'],
          [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM Followships WHERE Followships.followerId = User.id)'), 'followingsCount'],
          [sequelize.literal('(SELECT COUNT(DISTINCT id) FROM Likes WHERE Likes.UserId = User.id)'), 'likesCount'],
        ],
        order: [[sequelize.col('tweetsCount'), 'DESC'], ['createdAt']]
      })
      res.json(userData)
    } catch (err) {
      next(err)
    }
  },
  deleteTweet: async (req, res, next) => {
    try {
      const tweet = await Tweet.findByPk(req.params.id)
      if (!tweet) throw Error("Tweet didn't exist!")
      await tweet.destroy()
      await Like.destroy({ where: { TweetId: req.params.id }})
      return res.json({ status: "success", message: "Tweet was deleted." })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = adminController