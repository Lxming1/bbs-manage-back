const { FORMAT_ERROR } = require('../constants/error-types')
const { list, search, total, detail, searchTotal } = require('../service/moment.service')
const { getUserInfo } = require('../service/user.service')
const { isMyNaN } = require('../utils/common')

const getMultiMoment = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  const { type } = ctx.params
  if (!['pass', 'await', 'failed', 'all'].includes(type)) return
  try {
    let result = await list(pagesize, pagenum, type)
    result = await Promise.all(
      result.map(async (item) => {
        item.author = await getUserInfo(item.author)
        return item
      })
    )
    const len = await total(type)
    ctx.result = result
    ctx.total = len
    await next()
  } catch (err) {
    console.log(err)
  }
}

const getSingleMoment = async (ctx, next) => {
  const { momentId } = ctx.params
  try {
    const result = (await detail(momentId))[0]
    ctx.result = result
    await next()
  } catch (err) {
    console.log(err)
  }
}

const searchMoment = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  const { content } = ctx.request.body
  if (content === undefined) return
  const { type } = ctx.params
  if (!['pass', 'await', 'failed', 'all'].includes(type)) return
  try {
    let result = await search(content, pagenum, pagesize, type)
    result = await Promise.all(
      result.map(async (item) => {
        item.author = await getUserInfo(item.author)
        return item
      })
    )
    const total = await searchTotal(content, type)
    ctx.total = total
    ctx.result = result
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  getMultiMoment,
  searchMoment,
  getSingleMoment,
}
