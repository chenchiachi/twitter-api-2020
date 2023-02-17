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
      const tweet = await Tweet.findByPk(tweetId, {
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
      if (!tweet) throw new Error('Not tweet found')
      return res.json(tweet)
    } catch (err) {
      next(err)
    }
  },
  getReplies: async (req, res, next) => {
    try {
      const id = req.params.id
      const tweetReplies = await Reply.findAll({
        where: { TweetId: id }
      })
      return res.json(tweetReplies)
    } catch (err) {
      next(err)
    }
  },
  postReply: async (req, res, next) => {
    try {
      const { comment } = req.body
      const tweetId = req.params.id
      const userId = getUser(req).dataValues.id
      if (!comment) throw new Error('Comment is required!')
      if (comment.length > 140) throw new Error('Comment must be less than 140 characters!')
      const tweet = await Tweet.findByPk(tweetId)
      if (!tweet) throw new Error('Not tweet found.')
      await Reply.create({
        comment,
        TweetId: tweetId,
        UserId: userId
      })
      return res.json('Success')
    } catch (err) {
      next(err)
    }
  },
  addLike: async (req, res, next) => {
    try {
      const TweetId = req.params.id
      const tweet = await Tweet.findByPk(TweetId)
      if (!tweet) throw new Error('Not tweet found.')
      const UserId = getUser(req).dataValues.id
      const isLiked = await Like.findOne({
        where: { UserId, TweetId }
      })
      if (isLiked) throw new Error('Already like')
      await Like.create({ TweetId, UserId })
      return res.json('Success')
    } catch (err) {
      next(err)
    }
  }
}

module.exports = tweetController