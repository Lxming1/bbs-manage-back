const Router = require('koa-router')
const { showPlateList, delPlate, edit, add } = require('../controller/plate.controller')
const { verifyAuth } = require('../middleware/auth.middleware')
const palteRouter = new Router({ prefix: '/plate' })

// 获取分类列表
palteRouter.get('/', verifyAuth, showPlateList)
// 删除分类
palteRouter.del('/:plateId', verifyAuth, delPlate)
// 编辑分类
palteRouter.put('/:plateId', verifyAuth, edit)
// 添加分类
palteRouter.post('/', verifyAuth, add)

module.exports = palteRouter
