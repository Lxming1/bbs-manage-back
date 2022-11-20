const { create, reply, del, praise, cancelPraise } = require('../service/comment.service')
const { successBody, isMyNaN } = require('../utils/common')

class Comment {
  async del(ctx) {
    const { commentId } = ctx.params
    const result = await del(commentId)
    ctx.body = successBody(result, '删除成功')
  }

  async list(ctx) {
    const result = ctx.result
    ctx.body = successBody({
      total: result.length,
      comments: result,
    })
  }
}

module.exports = new Comment()
