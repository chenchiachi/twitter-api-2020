const { User, Followship } = require('../models')
const { getUser } = require('../_helpers')
const followshipController = {
  addFollowship: async (req, res, next) => {
    try {
      const followingId = req.body.id
      const followerId = getUser(req).dataValues.id
      const user = await User.findByPk(followingId)
      if (!user) throw new Error('User not found.')
      if (Number(followingId) === Number(followerId)) throw new Error('You cannot follow yourself.')
      const followship = await Followship.findOne({
        where: { followingId, followerId }
      })
      if (followship) throw new Error('Already followed.')
      await Followship.create({
        followingId,
        followerId
      })
      return res.json('Success')
    } catch (err) {
      next(err)
    }
  }
}

module.exports = followshipController