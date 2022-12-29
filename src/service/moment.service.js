const connection = require('../utils/database')
const { APP_HOST, IMG_PORT } = require('../app/config')
const { getOffset } = require('../utils/common')

const sqlFragment = `
  SELECT 
    m.id, m.content, m.title,
    (select 
      JSON_ARRAYAGG(CONCAT('${APP_HOST}:${IMG_PORT}/moment/image/', file.filename)) 
      from file where m.id = file.moment_id
    ) images,
    JSON_OBJECT(
      'id', p.id,
      'name', p.name
    ) plate,
    m.user_id author, m.status,
    m.create_at createTime, m.update_at updateTime
  FROM moment m
  LEFT JOIN plate p ON m.plate_id = p.id 
`

class Moment {
  async list(pagesize, pagenum, type) {
    const arr = ['await', 'pass', 'failed']
    let statement, result
    try {
      if (type === 'all') {
        statement = `
          ${sqlFragment} GROUP BY m.id ORDER BY m.id desc LIMIT ?, ?
        `
        result = await connection.execute(statement, [getOffset(pagenum, pagesize), pagesize])
      } else {
        statement = `
          ${sqlFragment} where m.status = ? GROUP BY m.id ORDER BY m.id desc LIMIT ?, ?
        `
        result = await connection.execute(statement, [
          arr.findIndex((item) => item === type),
          getOffset(pagenum, pagesize),
          pagesize,
        ])
      }
    } catch (e) {
      console.log(e)
    }
    return result[0]
  }

  async detail(momentId) {
    const statement = `
      ${sqlFragment} where m.id = ?
    `
    try {
      const [result] = await connection.execute(statement, [momentId])
      return result
    } catch (e) {
      console.log(e)
    }
  }

  async total(type) {
    const arr = ['await', 'pass', 'failed']
    let statement, result
    try {
      if (type === 'all') {
        statement = `
          select count(*) count from moment
        `
        result = (await connection.execute(statement))[0]
      } else {
        statement = `
          select count(*) count from moment where status = ?
        `
        result = (await connection.execute(statement, [arr.findIndex((item) => item === type)]))[0]
      }
      return result[0].count
    } catch (e) {
      console.log(e)
    }
  }

  async getPicInfo(filename) {
    const statement = `select * from file where filename = ?`
    const [result] = await connection.execute(statement, [filename])
    return result
  }

  async search(content, pagenum, pagesize, type) {
    const arr = ['await', 'pass', 'failed']
    let statement, result
    if (type === 'all') {
      statement = `${sqlFragment} where m.content like ? or m.title like ? limit ?, ?`
      result = (
        await connection.execute(statement, [
          `%${content}%`,
          `%${content}%`,
          getOffset(pagenum, pagesize),
          pagesize,
        ])
      )[0]
    } else {
      statement = `${sqlFragment} where (m.content like ? or m.title like ?) and status = ? limit ?, ?`
      console.log(arr.findIndex((item) => item === type))
      result = (
        await connection.execute(statement, [
          `%${content}%`,
          `%${content}%`,
          arr.findIndex((item) => item === type),
          getOffset(pagenum, pagesize),
          pagesize,
        ])
      )[0]
    }

    return result
  }

  async searchTotal(content, type) {
    const arr = ['await', 'pass', 'failed']
    let statement, result
    try {
      if (type === 'all') {
        statement = `select count(*) count from moment where content like ?`
        result = (await connection.execute(statement, [`%${content}%`]))[0]
      } else {
        statement = `select count(*) count from moment where content like ? and status = ?`
        result = (
          await connection.execute(statement, [
            `%${content}%`,
            arr.findIndex((item) => item === type),
          ])
        )[0]
      }
      return result[0].count
    } catch (e) {
      console.log(e)
    }
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
