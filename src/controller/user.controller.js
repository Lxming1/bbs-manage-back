const { delUser, searchUser, setRole, editUser, create, role } = require('../service/user.service')
const service = require('../service/user.service')
const { successMes, successBody, isMyNaN } = require('../utils/common')

class User {
  async create(ctx) {
    const { email, password } = ctx.request.body
    const result = await create({ email, password })
    ctx.body = successMes(result, '添加用户成功')
  }

  async list(ctx) {
    const result = ctx.result
    ctx.body = successBody(
      {
        total: result.length,
        users: result,
      },
      '获取用户列表成功'
    )
  }

  async del(ctx) {
    const { userId } = ctx.params
    if (userId === 1) return
    const result = await delUser(userId)
    ctx.body = successBody(result, '删除成功')
  }

  async search(ctx) {
    const { user, pagenum, pagesize } = ctx.query
    if (isMyNaN(pagenum, pagesize) || !user) return
    if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
      const err = new Error(FORMAT_ERROR)
      return ctx.app.emit('error', err, ctx)
    }
    const { type } = ctx.params
    if (!['name', 'email'].includes(type)) return
    try {
      const result = await searchUser(user, pagenum, pagesize, type)
      ctx.body = successBody(result)
    } catch (e) {
      console.log(e)
    }
  }

  async role(ctx) {
    const { userId, roleId } = ctx.params
    try {
      const result = await setRole(userId, roleId)
      ctx.body = successBody(result, '分配角色成功')
    } catch (e) {
      console.log(e)
    }
  }

  async edit(ctx) {
    const { userId } = ctx.params
    const { name, introduction } = ctx.request.body
    try {
      const result = await editUser(userId, name, introduction)
      ctx.body = successBody(result, '编辑成功')
    } catch (e) {
      console.log(e)
    }
  }

  async getRole(ctx) {
    const { userId } = ctx.params
    const result = await role(userId)
    ctx.body = successBody(result[0])
  }
}

module.exports = new User()
