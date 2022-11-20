const { getPlate } = require('../service/plate.service')
const { successBody, isMyNaN } = require('../utils/common')

class Plate {
  async showPlateList(ctx) {
    const { pagenum, pagesize } = ctx.query
    if (isMyNaN(pagenum, pagesize)) return
    if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
      const err = new Error(FORMAT_ERROR)
      return ctx.app.emit('error', err, ctx)
    }
    try {
      const result = await getPlate(pagenum, pagesize)
      ctx.body = successBody(result)
    } catch (e) {
      console.log(e)
    }
  }

  async showMomentByPlage(ctx) {
    const result = ctx.result
    ctx.body = successBody({
      total: result.length,
      momentList: result,
    })
  }
}

module.exports = new Plate()
