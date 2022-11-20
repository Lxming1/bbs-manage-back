const Router = require('koa-router')
const { list, del, search, create, role, edit, getRole } = require('../controller/user.controller')
const { getInfo, handlePassword } = require('../middleware/user.middleware')
const { verifyAuth } = require('../middleware/auth.middleware')

const userRouter = new Router({ prefix: '/users' })

// 获取用户列表
userRouter.get('/', verifyAuth, getInfo, list)
// 删除用户
userRouter.delete('/:userId', verifyAuth, del)
// 搜索用户
userRouter.get('/search/:type', verifyAuth, search)
// 添加用户
userRouter.post('/', verifyAuth, handlePassword, create)
// 分配角色
userRouter.put('/:userId/role/:roleId', verifyAuth, role)
// 编辑用户信息
userRouter.put('/:userId', verifyAuth, edit)
// 获取用户角色
userRouter.get('/:userId/role', verifyAuth, getRole)

module.exports = userRouter
