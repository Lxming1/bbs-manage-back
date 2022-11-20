const Router = require('koa-router')
const { del, list } = require('../controller/comment.controller')
const { verifyAuth } = require('../middleware/auth.middleware')
const { handleComment } = require('../middleware/comment.middleware')

const commentRouter = new Router({ prefix: '/comment' })

// 删除评论
commentRouter.delete('/:commentId', verifyAuth, del)
// 获取评论列表
commentRouter.get('/', handleComment, list)

module.exports = commentRouter
