const Router = require('koa-router')
const { list } = require('../controller/rights.controller')
const { verifyAuth } = require('../middleware/auth.middleware')
const { handleRights } = require('../middleware/rights.middleware')
const roleRouter = new Router({ prefix: '/rights' })

// 获取权限列表
roleRouter.get('/', verifyAuth, handleRights, list)

module.exports = roleRouter
