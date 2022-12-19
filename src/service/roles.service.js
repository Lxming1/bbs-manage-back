const { getOffset } = require('../utils/common')
const connection = require('../utils/database')
class Roles {
  async roleList(pagenum, pagesize) {
    const statement = `select * from roles limit ?, ?`
    const [result] = await connection.execute(statement, [getOffset(pagenum, pagesize), pagesize])
    return result
  }

  async create(name, desc) {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    let statement, res
    try {
      statement = 'insert into roles (`name`, `desc`) values(?, ?)'
      res = await connection.execute(statement, [name, desc])
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
    try {
      statement = 'insert into role_rights (`role_id`) values(?)'
      await connection.execute(statement, [res[0].insertId])
      await conn.commit()
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
    return res[0]
  }

  async deleteRole(roleId) {
    const statement = 'delete from roles where id = ?'
    const [result] = await connection.execute(statement, [roleId])
    return result
  }

  async edit(roleId, { name, desc }) {
    let statement, result
    if (isNaN(parseInt(roleId)) || [1, 2, 3].includes(parseInt(roleId))) {
      statement = 'update roles set `desc` = ? where id = ?'
      result = await connection.execute(statement, [desc, roleId])
    } else {
      statement = 'update roles set `name` = ?, `desc` = ? where id = ?'
      result = await connection.execute(statement, [name, desc, roleId])
    }
    return result[0]
  }

  async search(role, pagenum, pagesize) {
    const statement = `select * from roles where name like ? limit ?, ?`
    const [result] = await connection.execute(statement, [
      `%${role}%`,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result
  }

  async searchRoleTotal(role) {
    const statement = `select count(*) count from roles where name like ?`
    const [result] = await connection.execute(statement, [`%${role}%`])
    return result
  }

  async getRightsByRole(roleId) {
    const statement = `
      select 
        rights_list list
      from 
        role_rights
      where 
        role_id = ?
    `
    const [result] = await connection.execute(statement, [roleId])
    return result[0].list
  }

  async setRights(roleId, rightsList) {
    const statement = `
      update role_rights set rights_list = ? where role_id = ?
    `
    const [result] = await connection.execute(statement, [rightsList, roleId])
    return result
  }

  async roleTotal() {
    const statement = `select count(*) count from roles`
    const [result] = await connection.execute(statement)
    return result[0].count
  }
}

module.exports = new Roles()
