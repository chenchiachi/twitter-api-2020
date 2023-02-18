if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const routes = require('./routes')
const passport =require('./config/passport')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.urlencoded({ extended: true })) //setting body-parser
app.use(express.json()) //解析JSON格式資料
app.use(passport.initialize()) //初始化 Passport
app.use('/api',routes)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
