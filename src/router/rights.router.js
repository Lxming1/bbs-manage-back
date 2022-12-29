const Router = require('koa-router')
const { list } = require('../controller/rights.controller')
const { verifyAuth, verifyRights } = require('../middleware/auth.middleware')
const { handleRights } = require('../middleware/rights.middleware')
const rightsRouter = new Router({ prefix: '/rights' })

// 获取权限列表
rightsRouter.get('/', verifyAuth, verifyRights(6, 18), handleRights, list)

module.exports = rightsRouter
