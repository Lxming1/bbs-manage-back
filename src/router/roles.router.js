const Router = require('koa-router')
const {
  list,
  create,
  del,
  editRole,
  search,
  rights,
  setRights,
} = require('../controller/roles.controller')
const { verifyAuth, verifyRights } = require('../middleware/auth.middleware')
const roleRouter = new Router({ prefix: '/roles' })

// 获取角色列表
roleRouter.get('/', verifyAuth, verifyRights(7, 16, 17, 18, 19), list)
// 添加角色
roleRouter.post('/', verifyAuth, verifyRights(16), create)
// 删除角色
roleRouter.del('/:roleId', verifyAuth, verifyRights(17), del)
// 编辑角色
roleRouter.put('/:roleId', verifyAuth, verifyRights(19), editRole)
// 搜索角色
roleRouter.post('/search', verifyAuth, verifyRights(7, 16, 17, 18, 19), search)
// 获取角色权限
roleRouter.get('/:roleId/rights', verifyAuth, verifyRights(18), rights)
// 分配权限
roleRouter.post('/:roleId/rights', verifyAuth, verifyRights(18), setRights)
module.exports = roleRouter
