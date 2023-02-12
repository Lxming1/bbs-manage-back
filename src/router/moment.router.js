const Router = require('koa-router')
const { verifyAuth, verifyRights } = require('../middleware/auth.middleware')
const { list, check, detail } = require('../controller/moment.controller.js')
const { getMultiMoment, searchMoment, getSingleMoment } = require('../middleware/moment.middleware')

const momentRouter = new Router({ prefix: '/moment' })

// 搜索动态
momentRouter.post('/search/:type', verifyAuth, verifyRights(8, 9), searchMoment, list)
// 查询所有动态
momentRouter.get('/:type', verifyAuth, verifyRights(8, 9), getMultiMoment, list)
// 查询某一条动态
momentRouter.get('/:momentId/detail', verifyAuth, verifyRights(8, 9), getSingleMoment, detail)
// 审核动态
momentRouter.put('/:momentId/check/:status', verifyAuth, verifyRights(9), check)

module.exports = momentRouter
