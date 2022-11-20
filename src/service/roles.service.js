const { getOffset } = require('../utils/common')
const connection = require('../utils/database')
class Roles {
  async roleList(pagenum, pagesize) {
    const statement = `select * from roles limit ?, ?`
    const [result] = await connection.execute(statement, [getOffset(pagenum, pagesize), pagesize])
    return result
  }

  async create(name, desc) {
    const statement = 'insert into roles (`name`, `desc`) values(?, ?)'
    const [result] = await connection.execute(statement, [name, desc])
    return result
  }

  async deleteRole(roleId) {
    const statement = 'delete from roles where id = ?'
    const [result] = await connection.execute(statement, [roleId])
    return result
  }

  async edit(roleId, { name, desc }) {
    const statement = 'update roles set `name` = ?, `desc` = ? where id = ?'
    const [result] = await connection.execute(statement, [name, desc, roleId])
    return result
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

  async getRightsByRole(roleId) {
    const statement = `
      select 
        rights.* 
      from 
        role_rights rr
      join 
        rights 
      on 
        rights.id = rr.rights_id 
      where 
        rr.role_id = ?
    `
    const [result] = await connection.execute(statement, [roleId])
    return result
  }

  async setRights(roleId, rightsList) {
    const statement = `
      insert into role_rights (role_id, rights_id) values (?, ?)
    `
    const promiseArr = rightsList.map(async (item) => {
      return await connection.execute(statement, [roleId, item])
    })
    const result = await Promise.allSettled(promiseArr)
    return result.map((item) => item.status)
  }
}

module.exports = new Roles()
