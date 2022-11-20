const connection = require('../utils/database')
const { APP_HOST, APP_PORT } = require('../app/config')
const { getOffset } = require('../utils/common')

const sqlFragment = `
  SELECT 
    m.id id, content, title,
    (select 
      JSON_ARRAYAGG(CONCAT('${APP_HOST}:${APP_PORT}/moment/image/', file.filename)) 
      from file where m.id = file.moment_id
    ) images,
    JSON_OBJECT(
      'id', p.id,
      'name', p.name
    ) plate,
    (select count(*) from comment ml where ml.moment_id = m.id) commentCount,
    m.user_id author, 
    m.create_at createTime, m.update_at updataTime
  FROM moment m
  LEFT JOIN plate p ON m.plate_id = p.id 
`

class Moment {
  async list(pagesize, pagenum) {
    const statement = `
      ${sqlFragment} GROUP BY m.id ORDER BY m.id desc LIMIT ?, ?
    `
    try {
      const [result] = await connection.execute(statement, [getOffset(pagenum, pagesize), pagesize])
      return result
    } catch (e) {
      console.log(e)
    }
  }

  async update(momentId, title, content, plateId, visible) {
    const statement = `update moment set title = ?, content = ?, plate_id = ?, visible = ? where id = ?`
    const [result] = await connection.execute(statement, [
      title,
      content,
      plateId,
      visible,
      momentId,
    ])
    return result
  }

  async del(momentId) {
    const statement = `delete from moment where id = ?`
    const [result] = await connection.execute(statement, [momentId])
    return result
  }

  async getPicInfo(filename) {
    const statement = `select * from file where filename = ?`
    const [result] = await connection.execute(statement, [filename])
    return result
  }

  async search(content, pagenum, pagesize) {
    const statement = `${sqlFragment} where content like ? limit ?, ?`
    const [result] = await connection.execute(statement, [
      `%${content}%`,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result
  }

  async checkMoment(momentId, status) {
    const statement = `
      update moment set status = ? where id = ?
    `
    const [result] = await connection.execute(statement, [status, momentId])
    return result
  }
}

module.exports = new Moment()
