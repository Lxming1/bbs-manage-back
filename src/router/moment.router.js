const Router = require('koa-router')
const { verifyAuth } = require('../middleware/auth.middleware')
const {
  search,
  list,
  del,
  update,
  showPicture,
  check,
} = require('../controller/moment.controller.js')
const { getMultiMoment, searchMoment } = require('../middleware/moment.middleware')

const momentRouter = new Router({ prefix: '/moment' })

// 搜索动态
momentRouter.get('/search', searchMoment, search)
// 查询所有动态
momentRouter.get('/', verifyAuth, getMultiMoment, list)
// 修改一条动态
momentRouter.patch('/:momentId', verifyAuth, update)
// 删除一条动态
momentRouter.delete('/:momentId', verifyAuth, del)
// 获取动态图片
momentRouter.get('/image/:filename', verifyAuth, showPicture)
// 审核动态
momentRouter.put('/:momentId/check/:status', verifyAuth, check)

module.exports = momentRouter
