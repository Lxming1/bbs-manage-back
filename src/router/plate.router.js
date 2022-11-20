const Router = require('koa-router')
const { showPlateList, showMomentByPlage } = require('../controller/plate.controller')
const { verifyAuth } = require('../middleware/auth.middleware')
const { getMomentByPlateId } = require('../middleware/plate.middleware')
const palteRouter = new Router({ prefix: '/plate' })

// 获取分类列表
palteRouter.get('/', verifyAuth, showPlateList)
// 根据分类获取动态
palteRouter.get('/:plateId/moment', getMomentByPlateId, showMomentByPlage)

module.exports = palteRouter
