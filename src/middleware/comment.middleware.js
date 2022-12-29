const { list } = require('../service/comment.service')
const { getUserInfo } = require('../service/user.service')
const { listTransTree } = require('../utils/common')

const handleComment = async (ctx, next) => {
  const { momentId } = ctx.params
  if (!momentId) return
  try {
    let result = await list(momentId)
    const promiseArr = result.map(async (item) => {
      item.author = await getUserInfo(item.author)
      return item
    })
    result = await Promise.all(promiseArr)
    result = result.map((item) => ({
      ...item,
      key: item.id,
    }))
    ctx.result = result
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  handleComment,
}
