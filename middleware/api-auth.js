//目的為驗證token

const passport = require('../config/passport')
const helpers = require('../_helpers')

const authenticated = (req, res, next) => {
  passport.authenticate('jwt', {
    session: false
  }, (err, user) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: error.toString() })
    }
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized!' })
    }
    req.user = user
    next()
  })(req, res, next)
}

const authenticatedAdmin = (req, res, next) => {
  if (helpers.getUser(req).role === 'admin') return next()
  throw Error('Admin only.')
}


module.exports = {
  authenticated,
  authenticatedAdmin
}

