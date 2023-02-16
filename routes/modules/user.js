const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user-controller')

router.get('/top', userController.getTopUser)
router.get('/:id/tweets', userController.getUserTweets)
router.get('/:id/replied_tweets', userController.getUserReplies)
router.get('/:id/likes', userController.getUserLikes)
router.get('/:id/followings', userController.getFollowings)
router.get('/:id/followers', userController.getFollowers)
router.get('/:id', userController.getUser)
router.put('/:id/edit', userController.editAccount)
router.put('/:id', userController.editProfile)

module.exports = router