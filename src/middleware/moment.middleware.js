const { getUserInfo } = require('../service/user.service')
const { FORMAT_ERROR } = require('../constants/error-types')
const { list, search } = require('../service/moment.service')
const { isMyNaN } = require('../utils/common')

const getMultiMoment = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }

  try {
    let result = await list(pagesize, pagenum)
    if (!result) {
      ctx.result = []
    } else {
      const promissArr = result.map(async (item) => {
        item.author = await getUserInfo(item.author)
        return item
      })
      ctx.result = await Promise.all(promissArr)
    }
    await next()
  } catch (err) {
    console.log(err)
  }
}

const searchMoment = async (ctx, next) => {
  const { content, pagenum, pagesize } = ctx.query
  if (content === undefined) return
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  try {
    const result = await search(content, pagenum, pagesize)
    result.forEach(async (item) => {
      item.author = await getUserInfo(item.author)
    })
    ctx.result = result
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  getMultiMoment,
  searchMoment,
}
