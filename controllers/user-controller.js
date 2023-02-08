const jwt = require('jsonwebtoken');

const userController = {
  login: (req, res, next) => {
    try {
        const userData = req.user.toJSON()
        console.log('userData', userData)
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
  }
}

module.exports = userController