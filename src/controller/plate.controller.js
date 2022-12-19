const {
  getPlate,
  plateTotal,
  delPlateById,
  editPlate,
  addPlate,
} = require('../service/plate.service')
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
      const total = await plateTotal()
      ctx.body = successBody({
        plates: result,
        total,
      })
    } catch (e) {
      console.log(e)
    }
  }

  async delPlate(ctx) {
    const { plateId } = ctx.params
    if (!plateId) return
    try {
      const result = await delPlateById(plateId)
      ctx.body = successBody(result, '删除成功')
    } catch (e) {
      console.log(e)
    }
  }

  async edit(ctx) {
    const { plateId } = ctx.params
    const { description, name } = ctx.request.body
    if ([plateId, description, name].includes(undefined)) return
    try {
      const result = await editPlate(plateId, name, description)
      ctx.body = successBody(result, '编辑成功')
    } catch (e) {
      console.log(e)
    }
  }

  async add(ctx) {
    const { description, name } = ctx.request.body
    if (!description || !name) return
    try {
      const result = await addPlate(name, description)
      ctx.body = successBody(result, '添加成功')
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = new Plate()
