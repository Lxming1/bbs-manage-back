const { del, update, getPicInfo, checkMoment } = require('../service/moment.service')
const { successBody, isMyNaN } = require('../utils/common')
const { PICTURE_PATH } = require('../constants/file-types')
const fs = require('fs')

class Moment {
  // 查询多条动态
  async list(ctx, next) {
    const result = ctx.result
    const total = ctx.total
    ctx.body = successBody({
      total,
      moments: result,
    })
  }

  async detail(ctx, next) {
    const result = ctx.result
    ctx.body = successBody(result)
  }

  // 修改动态
  async update(ctx, next) {
    const { momentId } = ctx.params
    const { title, content, plateId, visible } = ctx.request.body
    const result = await update(momentId, title, content, plateId, visible)
    ctx.body = successBody(result, '编辑成功')
  }

  // 删除动态
  async del(ctx, next) {
    const { momentId } = ctx.params
    const result = await del(momentId)
    ctx.body = successBody(result, '删除成功')
  }

  async showPicture(ctx) {
    let { filename } = ctx.params
    const { type } = ctx.query
    const types = ['large', 'middle', 'small']
    let realFileName = ''
    if (type) {
      if (types.some((item) => item === type)) {
        realFileName = filename + '-' + type
      } else return
    }
    try {
      const result = await getPicInfo(filename)
      ctx.response.set('content-type', result[0].mimetype)
      ctx.body = fs.createReadStream(`${PICTURE_PATH}/${realFileName}`)
    } catch (error) {
      console.log(e)
    }
  }

  async check(ctx) {
    const { momentId, status } = ctx.params
    if (isMyNaN(momentId, status) && !['1', '2', '3'].includes(status)) return
    try {
      const result = await checkMoment(momentId, status)
      ctx.body = successBody(result)
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = new Moment()
