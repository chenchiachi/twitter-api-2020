const jwt = require('jsonwebtoken');

const adminController = {
  login: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      if (userData.role === 'admin') {
        delete userData.password
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
      } else {
        res.json({ status: 'error', message: 'Unauthorized.' })
      }
    } catch (err) {
      next(err)
    }
  }
}

module.exports = adminController