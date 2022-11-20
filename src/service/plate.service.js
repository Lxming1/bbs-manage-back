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

class Plate {
  async getPlate(pagenum, pagesize) {
    const statement = `select * from plate limit ?, ?`
    let result = await connection.execute(statement, [getOffset(pagenum, pagesize), pagesize])
    return result[0]
  }

  async getMomentListByPlate(plateId, pagenum, pagesize) {
    const statement = `${sqlFragment} where m.plate_id = ? limit ?, ?`
    let result = await connection.execute(statement, [
      plateId,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result[0]
  }
}

module.exports = new Plate()
