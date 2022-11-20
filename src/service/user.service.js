const { getOffset } = require('../utils/common')
const connection = require('../utils/database')

const sqlFragment = `
  select 
    u.id, u.email, ud.name, ud.birthday, ud.gender,
    if(ud.address_id=null, null, (select JSON_OBJECT(
      'id', a1.id,
      'children', a1.name,
      'parent', a2.name
    ) from address a1 left join address a2 on a1.pid = a2.id where a1.id = ud.address_id)) address,
    (select count(*) from care_fans where to_uid = id) fansCount,
    (select count(*) from care_fans where from_uid = id) careCount,
    ud.introduction, ud.avatar_url, u.create_at createTime, u.update_at updateTime
  from 
    users u 
  join 
    user_detail ud 
  on 
    u.id = ud.user_id
`

class User {
  async getUserByEmail(email) {
    const statement = `
      select id, email, password, status
      from users 
      where email = ? and role_id != '2'
    `
    const result = await connection.execute(statement, [email])
    return result[0]
  }

  async getUserInfo(id) {
    const statement = `${sqlFragment} where u.id = ?`
    try {
      const result = (await connection.execute(statement, [id]))[0]
      return result[0]
    } catch (e) {
      console.log(e)
    }
  }

  async getAvatarInfo(userId) {
    const statement = `select * from avatar where user_id = ?`
    const [result] = await connection.execute(statement, [userId])
    return result
  }

  async createDeatilForUser(uid, addressId, name, birthday, gender, introduction) {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    let statement
    let result
    try {
      statement = `insert into user_detail (name, birthday, gender, introduction, address_id) values(?,?,?,?,?)`
      result = await connection.execute(statement, [
        name,
        birthday,
        gender,
        introduction,
        addressId,
      ])
    } catch (e) {
      console.log(e)
      return await conn.rollback()
    }

    const detailId = result[0].insertId
    try {
      statement = `update users set detail_id = ? where id = ?`
      result = await connection.execute(statement, [detailId, uid])
    } catch (e) {
      console.log(e)
      return await conn.rollback()
    }
    try {
      await conn.commit()
    } catch (e) {
      console.log(e)
      return await conn.rollback()
    }
    return [result]
  }

  async updateDetailInfo(detailId, addressId, name, birthday, gender, introduction) {
    const statement = `
      update 
        user_detail 
      set 
        name = ?, birthday = ?, gender = ?, 
        introduction = ?, address_id = ? 
      where 
        id = ?
    `
    const [result] = await connection.execute(statement, [
      name,
      birthday,
      gender,
      introduction,
      addressId,
      detailId,
    ])
    return result
  }

  async userList(pagenum, pagesize) {
    const statement = `${sqlFragment} limit ?, ?`
    const [result] = await connection.execute(statement, [getOffset(pagenum, pagesize), pagesize])
    result.filter((item) => item.adress !== null)
    return result
  }

  async delUser(userId) {
    const statement = `delete from users where id = ?`
    const [result] = await connection.execute(statement, [userId])
    return result
  }

  async searchUser(user, pagenum, pagesize, type) {
    let statement = `
      ${sqlFragment} where ${type} like ? limit ?, ?
    `
    let [result] = await connection.execute(statement, [
      `%${user}%`,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result
  }

  async create({ email, password }) {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    let statement, result
    try {
      statement = `insert into users (email, password) values (?, ?)`
      result = await connection.execute(statement, [email, password])
    } catch (e) {
      console.log(e)
      return await conn.rollback()
    }
    const userId = result[0].insertId
    try {
      statement = `insert into user_detail (name, user_id) values(?, ?)`
      result = await connection.execute(statement, [email, userId])
      await conn.commit()
      return userId
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
  }

  async setRole(userId, roleId) {
    const statement = `update users set role_id = ? where id = ?`
    const [result] = await connection.execute(statement, [roleId, userId])
    return result
  }

  async editUser(userId, name, intro) {
    const statement = `update user_detail set name = ?, introduction = ? where user_id = ?`
    const [result] = await connection.execute(statement, [name, intro, userId])
    return result
  }

  async role(userId) {
    const statement = `select r.* from roles r join users u on u.id = ? and u.role_id = r.id`
    const [result] = await connection.execute(statement, [userId])
    return result
  }
}

module.exports = new User()
