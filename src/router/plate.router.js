const Router = require('koa-router')
const { showPlateList, delPlate, edit, add } = require('../controller/plate.controller')
const { verifyAuth, verifyRights } = require('../middleware/auth.middleware')
const palteRouter = new Router({ prefix: '/plate' })

// 获取分类列表
palteRouter.get('/', verifyAuth, verifyRights(10, 21, 23, 22), showPlateList)
// 删除分类
palteRouter.del('/:plateId', verifyAuth, verifyRights(21), delPlate)
// 编辑分类
palteRouter.put('/:plateId', verifyAuth, verifyRights(23), edit)
// 添加分类
palteRouter.post('/', verifyAuth, verifyRights(22), add)

module.exports = palteRouter
