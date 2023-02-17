const sequelize = require('sequelize')
const { getUser } = require('../_helpers')
const { User, Tweet, Like, Reply } = require('../models')

const tweetController = {
  postTweet: async (req, res, next) => {
    try {
      const { description } = req.body
      const UserId = getUser(req).dataValues.id
      if (!description) throw new Error('Description is required!')
      if (description.length > 140) throw new Error('Description must be less than 140 characters!')
      await Tweet.create({
        description,
        UserId
      })
      return res.json('Success')
    } catch (err) {
      next(err)
    }
  },
  getTweets: async (req, res, next) => {
    try {
      const currentUserId = getUser(req).dataValues.id
      const userTweets = await Tweet.findAll({
        where: { UserId: currentUserId },
        order: [['createdAt', 'DESC']],
        include: {
          model: User,
          attributes: ['id', 'account', 'name', 'avatar', 'cover']
        },
        attributes: {
          include: [
            [sequelize.literal('(SELECT COUNT(id) FROM Replies WHERE Replies.TweetId = Tweet.id)'), 'repliesCount'],
            [sequelize.literal('(SELECT COUNT(id) FROM Likes WHERE Likes.TweetId = Tweet.id)'), 'likesCount'],
            [sequelize.literal(`EXISTS (SELECT id FROM Likes WHERE Likes.TweetId = Tweet.id AND Likes.UserId = ${currentUserId})`), 'isLiked']
          ]
        }
      })
      return res.json(userTweets)
    } catch (err) {
      next(err)
    }
  },
  getTweet: async (req, res, next) => {
    try {
      const tweetId = req.params.id
      const userTweet = await Tweet.findByPk(tweetId, {
        include: [
          { model: User, attributes: ['id', 'account', 'name', 'avatar', 'cover'] },
          { model: Reply },
          { model: Like }],
        attributes: {
          include: [
            [sequelize.literal('(SELECT COUNT(id) FROM Replies WHERE Replies.TweetId = Tweet.id)'), 'repliesCount'],
            [sequelize.literal('(SELECT COUNT(id) FROM Likes WHERE Likes.TweetId = Tweet.id)'), 'likesCount'],
            [sequelize.literal(`EXISTS (SELECT id FROM Likes WHERE Likes.TweetId = Tweet.id AND Likes.UserId = ${getUser(req).dataValues.id})`), 'isLiked']
          ]
        }
      })
      return res.json(userTweet)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = tweetController