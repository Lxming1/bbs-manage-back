const { ROLE_EXIST } = require('../constants/error-types')
const {
  roleList,
  create,
  deleteRole,
  edit,
  search,
  getRightsByRole,
  setRights,
} = require('../service/roles.service')
const { successBody, isMyNaN } = require('../utils/common')

class Roles {
  async list(ctx) {
    const { pagenum, pagesize } = ctx.query
    if (isMyNaN(pagenum, pagesize)) return
    if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
      const err = new Error(FORMAT_ERROR)
      return ctx.app.emit('error', err, ctx)
    }
    try {
      const result = await roleList(pagenum, pagesize)
      ctx.body = successBody(result, '获取角色列表成功')
    } catch (e) {
      console.log(e)
    }
  }

  async create(ctx) {
    const { name, desc } = ctx.request.body
    if (!name || !desc) return
    try {
      const result = await create(name, desc)
      ctx.body = successBody(result, '添加角色成功')
    } catch (e) {
      console.log(e)
      const err = new Error(ROLE_EXIST)
      return ctx.app.emit('error', err, ctx)
    }
  }

  async del(ctx) {
    const { roleId } = ctx.params
    if (isNaN(roleId) || [1, 2, 3].includes(parseInt(roleId))) return
    try {
      const result = await deleteRole(roleId)
      ctx.body = successBody(result, '删除成功')
    } catch (e) {
      console.log(e)
    }
  }

  async editRole(ctx) {
    const { roleId } = ctx.params
    try {
      const result = await edit(roleId, ctx.request.body)
      ctx.body = successBody(result, '编辑成功')
    } catch (e) {
      console.log(e)
    }
  }

  async search(ctx) {
    const { role, pagenum, pagesize } = ctx.query
    if (isMyNaN(pagenum, pagesize) || !role) return
    if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
      const err = new Error(FORMAT_ERROR)
      return ctx.app.emit('error', err, ctx)
    }
    try {
      const result = await search(role, pagenum, pagesize)
      ctx.body = successBody(result)
    } catch (e) {
      console.log(e)
    }
  }

  async rights(ctx) {
    const { roleId } = ctx.params
    if (isNaN(roleId)) return
    try {
      const result = await getRightsByRole(roleId)
      const res = []
      const map = result.reduce((pre, item) => {
        pre[item.id] = item
        return pre
      }, {})
      for (const item of result) {
        if (item.pid === null) {
          res.push(item)
        }
        if (item.pid in map) {
          const parent = map[item.pid]
          parent.children = parent.children || []
          parent.children.push(item)
        }
      }
      ctx.body = successBody(res)
    } catch (e) {
      console.log(e)
    }
  }

  async setRights(ctx) {
    const { roleId } = ctx.params
    const { rightsList } = ctx.request.body
    try {
      const result = await setRights(roleId, rightsList)
      ctx.body = successBody(result, '分配权限成功')
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = new Roles()
