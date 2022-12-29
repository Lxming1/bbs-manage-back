const Router = require('koa-router')
const { status, list } = require('../controller/comment.controller')
const { verifyAuth, verifyRights } = require('../middleware/auth.middleware')
const { handleComment } = require('../middleware/comment.middleware')

const commentRouter = new Router({ prefix: '/comment' })

// 修改评论状态
commentRouter.put('/:commentId', verifyAuth, status)
// 获取评论列表
commentRouter.get('/:momentId', verifyAuth, verifyRights(20), handleComment, list)

module.exports = commentRouter
