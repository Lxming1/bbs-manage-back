const connection = require('../utils/database')
class Comment {
  async changeStatus(commentId, status) {
    const statement = `update comment set status = ? where id = ?`
    const [result] = await connection.execute(statement, [status, commentId])
    return result
  }

  async list(momentId) {
    const statement = `
      SELECT 
        id, content , comment_id commentId, user_id author,
        status, create_at createTime, update_at updateTime 
      FROM comment 
      where moment_id = ?
    `
    const [result] = await connection.execute(statement, [momentId])
    return result
  }
}

module.exports = new Comment()
