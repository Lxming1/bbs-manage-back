const connection = require('../utils/database')
const { getOffset } = require('../utils/common')

class Plate {
  async getPlate(pagenum, pagesize) {
    const statement = `select * from plate limit ?, ?`
    let result = await connection.execute(statement, [getOffset(pagenum, pagesize), pagesize])
    return result[0]
  }

  async plateTotal() {
    const statement = `select count(*) count from plate`
    let result = await connection.execute(statement)
    return result[0].count
  }

  async delPlateById(id) {
    const statement = `delete from plate where id = ?`
    let [result] = await connection.execute(statement, [id])
    return result
  }

  async editPlate(id, name, desc) {
    const statement = `update plate set name = ?, description = ? where id = ?`
    let [result] = await connection.execute(statement, [name, desc, id])
    return result
  }

  async addPlate(name, desc) {
    const statement = `insert into plate (name, description) values(?, ?)`
    let [result] = await connection.execute(statement, [name, desc])
    return result
  }
}

module.exports = new Plate()
