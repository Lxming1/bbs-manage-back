const { list } = require('../service/rights.service')

const handleRights = async (ctx, next) => {
  try {
    const { type } = ctx.query
    if (!['tree', 'list'].includes(type)) return
    const result = await list()
    if (type === 'list') {
      ctx.result = result
    } else {
      const res = []
      const map = result.reduce((pre, item) => {
        pre[item.id] = item
        return pre
      }, {})

      for (const item of result) {
        if (item.pid === null) {
          res.push(item)
        }
        if (item.pid in map) {
          const parent = map[item.pid]
          parent.children = parent.children || []
          parent.children.push(item)
        }
      }
      ctx.result = res
    }
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  handleRights,
}
