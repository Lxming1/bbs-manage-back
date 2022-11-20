const nodemailer = require('nodemailer')

const errorTypes = require('../constants/error-types')
const redis = require('../utils/redis')
const { getUserByEmail, getCareFansList, userList } = require('../service/user.service')
const { md5handle, verifyEmail, randomFns, isMyNaN } = require('../utils/common')
const { MY_EMAIL, MY_EMAIL_PASS } = require('../app/config.js')
const { getUserInfo } = require('../service/user.service')

// 验证邮箱密码
const verifyPass = async (ctx, next) => {
  // 抽取数据
  const { password } = ctx.request.body

  // 判断邮箱密码是否为空
  if (!password) {
    const err = new Error(errorTypes.EMAIL_OR_PASSWORD_IS_REQUIRED)
    return ctx.app.emit('error', err, ctx)
  }
  await next()
}

// 加密密码
const handlePassword = async (ctx, next) => {
  const { password } = ctx.request.body
  console.log(md5handle(password))
  ctx.request.body.password = md5handle(password)
  await next()
}

const verifyUEmail = async (ctx, next) => {
  const { email } = ctx.request.body

  if (!email) {
    const err = new Error(errorTypes.EMAIL_OR_PASSWORD_IS_REQUIRED)
    return ctx.app.emit('error', err, ctx)
  }
  // 验证邮箱有效性
  if (!verifyEmail(email)) {
    const err = new Error(errorTypes.EMAIL_IS_INCORRECT)
    return ctx.app.emit('error', err, ctx)
  }

  // 判断邮箱是否已存在
  const result = await getUserByEmail(email)
  if (result.length !== 0) {
    const err = new Error(errorTypes.EMAIL_ALREADY_EXIST)
    return ctx.app.emit('error', err, ctx)
  }

  await next()
}

const sendEmail = async (ctx, next) => {
  const { email } = ctx.request.body
  const result = await redis.get(email)

  if (result) {
    const err = new Error(errorTypes.EXIST_CODE)
    return ctx.app.emit('error', err, ctx)
  }
  const code = randomFns()

  const transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    auth: {
      user: MY_EMAIL,
      pass: MY_EMAIL_PASS,
    },
  })

  await redis.set(email, code, 'EX', 60)

  const receiver = {
    from: MY_EMAIL,
    to: email,
    subject: '验证你的电子邮件',
    html: `
      <p>你好！</p>
      <p>您正在注册BBS账号</p>
      <p>你的验证码是：<strong style="color: #ff4e2a;">${code}</strong></p>
      <p>***该验证码1分钟内有效***</p>
    `,
  }

  await transporter.sendMail(receiver, (err, info) => {
    if (err) {
      const err = new Error(errorTypes.EMAIL_ERROR)
      return ctx.app.emit('error', err, ctx)
    }
    transporter.close()
    console.log('发送成功:', info.response)
  })
  await next()
}

const verifyCode = async (ctx, next) => {
  const { email, code } = ctx.request.body
  const rightCode = await redis.get(email)

  if (rightCode !== code) {
    const err = new Error(errorTypes.CODE_IS_INCORRECT)
    return ctx.app.emit('error', err, ctx)
  }

  await next()
}

const setCareFansList = async (ctx, next) => {
  const { url } = ctx.request
  const isFans = url.indexOf('fans') !== -1 && url.indexOf('care') === -1
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  const { userId } = ctx.params
  const fansIdList = await getCareFansList(userId, pagenum, pagesize, isFans)
  const promiseArr = fansIdList.map(async (item) => await getUserInfo(item.id))
  ctx.result = await Promise.all(promiseArr)
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
    ctx.result = result
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  verifyPass,
  verifyUEmail,
  handlePassword,
  sendEmail,
  verifyCode,
  setCareFansList,
  getInfo,
}
