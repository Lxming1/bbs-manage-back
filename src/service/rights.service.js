const connection = require('../utils/database')
class Rights {
  async list() {
    const statement = `select * from rights`
    const [result] = await connection.execute(statement)
    return result
  }

  async getRightsByRole(id) {
    const statement = `
      select rights_list rightsList
      from role_rights 
      where role_id = ?
    `
    const [result] = await connection.execute(statement, [id])
    return result[0].rightsList
  }

  async getRightsById(id) {
    const statement = `select * from rights where id = ?`
    const [result] = await connection.execute(statement, [id])
    return result[0]
  }
}

module.exports = new Rights()
