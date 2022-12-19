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
const { verifyAuth } = require('../middleware/auth.middleware')
const roleRouter = new Router({ prefix: '/roles' })

// 获取角色列表
roleRouter.get('/', verifyAuth, list)
// 添加角色
roleRouter.post('/', verifyAuth, create)
// 删除角色
roleRouter.del('/:roleId', verifyAuth, del)
// 编辑角色
roleRouter.put('/:roleId', verifyAuth, editRole)
// 搜索角色
roleRouter.post('/search', verifyAuth, search)
// 获取角色权限
roleRouter.get('/:roleId/rights', verifyAuth, rights)
// 分配权限
roleRouter.post('/:roleId/rights', verifyAuth, setRights)
module.exports = roleRouter
