const {
  delUser,
  searchUser,
  setRole,
  editUser,
  create,
  role,
  searchUserTotal,
  changeStatue,
} = require('../service/user.service')
const { successBody, isMyNaN } = require('../utils/common')

class User {
  async create(ctx) {
    const { email, password } = ctx.request.body
    const result = await create({ email, password })
    ctx.body = successBody(result, '添加用户成功')
  }

  async list(ctx) {
    const result = ctx.result
    const total = ctx.total
    ctx.body = successBody(
      {
        total,
        users: result,
      },
      '获取用户列表成功'
    )
  }

  async del(ctx) {
    const { userId } = ctx.params
    if (parseInt(userId) === 1) return
    const result = await delUser(userId)
    ctx.body = successBody(result, '删除成功')
  }

  async search(ctx) {
    const { pagenum, pagesize } = ctx.query
    if (isMyNaN(pagenum, pagesize)) return
    if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
      const err = new Error(FORMAT_ERROR)
      return ctx.app.emit('error', err, ctx)
    }
    const { user } = ctx.request.body
    if (!user) return
    try {
      const result = await searchUser(user, pagenum, pagesize)
      const total = await searchUserTotal(user)
      ctx.body = successBody({
        users: result,
        total,
      })
    } catch (e) {
      console.log(e)
    }
  }

  async role(ctx) {
    const { userId, roleId } = ctx.params
    if (parseInt(userId) === 1) return
    try {
      const result = await setRole(userId, roleId)
      ctx.body = successBody(result, '分配角色成功')
    } catch (e) {
      console.log(e)
    }
  }

  async edit(ctx) {
    const { userId } = ctx.params
    const { id } = ctx.user
    const { name, status } = ctx.request.body
    if (status !== undefined) {
      const result = await changeStatue(userId, status)
      ctx.body = successBody(result, '修改状态成功')
    }
    if (!name) return
    let result
    if (parseInt(userId) === id) {
      const { password } = ctx.request.body
      if (!password) return
      const newPassword = md5handle(password)
      try {
        result = await editUser(userId, name, newPassword)
      } catch (e) {
        console.log(e)
      }
    } else {
      try {
        result = await editUser(userId, name)
      } catch (e) {
        console.log(e)
      }
    }
    ctx.body = successBody(result, '编辑成功')
  }

  async getRole(ctx) {
    const { userId } = ctx.params
    const result = await role(userId)
    ctx.body = successBody(result[0])
  }
}

module.exports = new User()
