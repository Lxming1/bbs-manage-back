const Router = require('koa-router')
const {
  list,
  del,
  search,
  create,
  role,
  edit,
  getRole,
  getUser,
} = require('../controller/user.controller')
const { getInfo, handlePassword, verifyPass } = require('../middleware/user.middleware')
const { verifyAuth, verifyRights } = require('../middleware/auth.middleware')

const userRouter = new Router({ prefix: '/users' })

// 获取用户列表
userRouter.get('/', verifyAuth, verifyRights(5, 11, 12, 13, 14, 15), getInfo, list)
// 用户信息
userRouter.get('/:userId/detail', verifyAuth, verifyRights(5, 11, 12, 13, 14, 15), getUser)
// 删除用户
userRouter.delete('/:userId', verifyAuth, verifyRights(12), del)
// 搜索用户
userRouter.post('/search', verifyAuth, verifyRights(5, 11, 12, 13, 14, 15), search)
// 添加用户
userRouter.post('/', verifyAuth, verifyRights(11), verifyPass, handlePassword, create)
// 分配角色
userRouter.put('/:userId/role/:roleId', verifyAuth, verifyRights(14), role)
// 编辑用户信息
userRouter.put('/:userId', verifyAuth, verifyRights(13), edit)

module.exports = userRouter
