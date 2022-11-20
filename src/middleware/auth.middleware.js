const jwt = require('jsonwebtoken')
const { PUBLIC_KEY } = require('../app/config')

const errorTypes = require('../constants/error-types')
const { checkResource } = require('../service/auth.service')
const { getUserByEmail, getUserInfo } = require('../service/user.service')
const { md5handle, isMyNaN } = require('../utils/common')

const verifyLogin = async (ctx, next) => {
  const user = ctx.request.body

  // 判断邮箱或密码是否为空
  if (!user.email || !user.password) {
    const err = new Error(errorTypes.EMAIL_OR_PASSWORD_IS_REQUIRED)
    return ctx.app.emit('error', err, ctx)
  }

  // 判断用户是否存在
  let result = (await getUserByEmail(user.email))[0]
  if (!result) return
  //判断密码是否正确
  if (result.password !== md5handle(user.password)) {
    const err = new Error(errorTypes.PASSORD_ERROR)
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

module.exports = {
  verifyLogin,
  verifyAuth,
}
