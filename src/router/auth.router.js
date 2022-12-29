const Router = require('koa-router')
const { login, menus } = require('../controller/auth.controller')
const { verifyLogin, verifyAuth } = require('../middleware/auth.middleware')

const authRouter = new Router()

authRouter.post('/login', verifyLogin, login)
authRouter.get('/menus', verifyAuth, menus)

module.exports = authRouter
