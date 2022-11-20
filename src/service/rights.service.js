const connection = require('../utils/database')
class Rights {
  async list() {
    const statement = `select * from rights`
    const [result] = await connection.execute(statement)
    return result
  }
}

module.exports = new Rights()
