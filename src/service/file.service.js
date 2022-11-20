const connection = require('../utils/database')
class FileService {
  async currentAvatar(userId) {
    const statement = `select * from avatar where user_id = ?`
    const [result] = await connection.execute(statement, [userId])
    return result
  }

  async savePicInfo(filename, mimetype, size, momentId, userId) {
    const statement = `
      insert into file 
      (filename, mimetype, size, moment_id, user_id) 
      values (?,?,?,?,?)
    `
    const [result] = await connection.execute(statement, [
      filename,
      mimetype,
      size,
      momentId,
      userId,
    ])
    return result
  }
}

module.exports = new FileService()
