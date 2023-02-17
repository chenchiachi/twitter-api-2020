const express = require('express')
const router = express.Router()
const tweetController = require('../../controllers/tweet-controller')

router.get('/:id/replies', tweetController.getReplies)
router.post('/:id/replies', tweetController.postReply)
router.post('/:id/like', tweetController.addLike)
router.post('/:id/unlike', tweetController.removeLike)
router.post('/', tweetController.postTweet)
router.get('/', tweetController.getTweets)
router.get('/:id', tweetController.getTweet)

module.exports = router