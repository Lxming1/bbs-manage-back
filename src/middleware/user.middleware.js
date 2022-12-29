const { userList, userTotal } = require('../service/user.service')
const { md5handle, isMyNaN } = require('../utils/common')

// 验证邮箱密码
const verifyPass = async (ctx, next) => {
  // 抽取数据
  const { password } = ctx.request.body
  // 判断邮箱密码是否为空
  if (!password) return
  await next()
}

// 加密密码
const handlePassword = async (ctx, next) => {
  const { password } = ctx.request.body
  ctx.request.body.password = md5handle(password)
  await next()
}

const getInfo = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  try {
    const result = await userList(pagenum, pagesize)
    const total = await userTotal()
    ctx.total = total
    ctx.result = result
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  verifyPass,
  handlePassword,
  getInfo,
}
