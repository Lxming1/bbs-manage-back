const { changeStatus } = require('../service/comment.service')
const { successBody } = require('../utils/common')

class Comment {
  async status(ctx) {
    const { commentId } = ctx.params
    const { status } = ctx.request.body
    if (status === undefined) return
    await changeStatus(commentId, status)
    ctx.body = successBody(true)
  }

  async list(ctx) {
    const result = ctx.result
    ctx.body = successBody(result)
  }
}

module.exports = new Comment()
