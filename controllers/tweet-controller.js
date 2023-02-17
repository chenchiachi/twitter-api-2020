const { getUser } = require('../_helpers')
const { Tweet } = require('../models')

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
  }
}

module.exports = tweetController