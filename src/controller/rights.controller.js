const { ROLE_EXIST } = require('../constants/error-types')
const { list } = require('../service/rights.service')
const { successBody, isMyNaN } = require('../utils/common')

class rights {
  async list(ctx) {
    const result = ctx.result
    ctx.body = successBody({
      total: result.length,
      rights: result,
    })
  }
}

module.exports = new rights()
