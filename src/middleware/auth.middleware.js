const jwt = require('jsonwebtoken')
const { PUBLIC_KEY } = require('../app/config')
const errorTypes = require('../constants/error-types')
const { getRightsByRole } = require('../service/rights.service')
const { getUserByEmail } = require('../service/user.service')
const { md5handle } = require('../utils/common')

const verifyLogin = async (ctx, next) => {
  const user = ctx.request.body

  // 判断邮箱或密码是否为空
  if (!user.email || !user.password) return
  // 判断用户是否存在
  let result = (await getUserByEmail(user.email))[0]
  // 判断密码是否正确
  if (!result || result.password !== md5handle(user.password)) {
    const err = new Error(errorTypes.EMAIL_PASSWORD_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  ctx.user = result
  await next()
}

const verifyAuth = async (ctx, next) => {
  try {
    const authorization = ctx.headers.authorization
    if (!authorization) throw new Error()
    const token = authorization.replace('Bearer ', '')
    const result = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ['RS256'],
    })
    ctx.user = result
  } catch (error) {
    // 捕获token过期
    console.log(error)
    const err = new Error(errorTypes.UNAUTHORIZATION)
    return ctx.app.emit('error', err, ctx)
  }
  try {
    await next()
  } catch (error) {
    // 捕获其他错误
    console.log(error)
    const err = new Error()
    return ctx.app.emit('error', err, ctx)
  }
}

const verifyRights = (...rightsId) => {
  return async (ctx, next) => {
    const { role_id } = ctx.user
    try {
      const result = await getRightsByRole(role_id)
      const hasRights = result
        .split(',')
        .map((item) => parseInt(item))
        .some((item) => rightsId.includes(item))
      if (!hasRights) {
        const err = new Error(errorTypes.UNPERMISSION)
        return ctx.app.emit('error', err, ctx)
      }
      await next()
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = {
  verifyLogin,
  verifyAuth,
  verifyRights,
}
