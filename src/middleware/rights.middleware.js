const { list } = require('../service/rights.service')
const { listTransTree } = require('../utils/common')

const handleRights = async (ctx, next) => {
  try {
    const { type } = ctx.query
    if (!['tree', 'list'].includes(type)) return
    let result = await list()
    if (type === 'list') {
      ctx.result = result
    } else {
      result = result.map((item) => ({
        key: item.id,
        title: item.name,
        pid: item.pid,
        level: item.level,
      }))
      ctx.result = listTransTree(result, 'pid', 'key')
    }
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  handleRights,
}
