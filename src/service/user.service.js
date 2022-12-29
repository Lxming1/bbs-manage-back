const { getOffset } = require('../utils/common')
const connection = require('../utils/database')

const sqlFragment = `
  select 
    u.id, u.email, ud.name, ud.birthday, ud.gender, u.status,
    JSON_OBJECT(
      'id', r.id,
      'name', r.name
    ) role,
    if(ud.address_id=null, null, (
      select JSON_OBJECT(
        'children', JSON_OBJECT('id', a1.id, 'name', a1.name),
        'parent', JSON_OBJECT('id', a2.id, 'name', a2.name)
      ) from address a1 left join address a2 on a1.pid = a2.id where a1.id = ud.address_id)
    ) address,
    (select count(*) from moment where user_id = u.id) momentCount,
    (select count(*) from care_fans where to_uid = u.id) fansCount,
    (select count(*) from care_fans where from_uid = u.id) careCount,
    (select count(*) 
      from praise p 
      join moment m on p.moment_id = m.id and comment_id = 0 
      where m.user_id = u.id
    ) momentLike,
    (select count(*) 
      from praise p 
      join comment c on p.comment_id = c.id
      where c.user_id = u.id
    ) commentLike,
    (select count(*) 
      from collect_detail cd 
      join moment m on cd.moment_id = m.id
      where m.user_id = u.id
    ) collectCount,
    ud.introduction, ud.avatar_url, u.create_at createTime, u.update_at updateTime
  from 
    users u
  join 
    user_detail ud 
  on 
    ud.user_id = u.id
  join
    roles r
  on
    r.id = u.role_id
`

const userListSql = `
  select 
    u.id, u.email, ud.name,u.status,
    JSON_OBJECT(
      'id', r.id,
      'name', r.name
    ) role,
    u.create_at createTime
  from 
    users u
  join 
    user_detail ud 
  on 
    ud.user_id = u.id
  join
    roles r
  on
    r.id = u.role_id
`

class User {
  async getUserByEmail(email) {
    const statement = `
      select u.id, u.email, u.password, u.role_id
      from users u join role_rights rr on rr.role_id = u.role_id 
      where email = ? and rr.rights_list is not null
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
    const statement = `${userListSql} order by u.id limit ?, ?`
    const [result] = await connection.execute(statement, [getOffset(pagenum, pagesize), pagesize])
    result.filter((item) => item.adress !== null)
    return result
  }

  async delUser(userId) {
    const statement = `delete from users where id = ?`
    const [result] = await connection.execute(statement, [userId])
    return result
  }

  async searchUser(user, pagenum, pagesize) {
    let statement = `
      ${userListSql} where ud.name like ? or u.email like ? limit ?, ?
    `
    let [result] = await connection.execute(statement, [
      `%${user}%`,
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

  async editUser(userId, name, password) {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    let statement, res
    if (password) {
      try {
        statement = `update users set password = ? where id = ?`
        res = await connection.execute(statement, [password, userId])
      } catch (e) {
        console.log(e)
        await conn.rollback()
      }
    }
    try {
      statement = `update user_detail set name = ? where user_id = ?`
      res = await connection.execute(statement, [name, userId])
      await conn.commit()
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
    return res[0]
  }

  async changeStatue(userId, status) {
    const statement = `update users set status = ? where id = ?`
    const [result] = await connection.execute(statement, [status, userId])
    return result
  }

  async role(userId) {
    const statement = `select r.* from roles r join users u on u.id = ? and u.role_id = r.id`
    const [result] = await connection.execute(statement, [userId])
    return result
  }

  async userTotal() {
    const statement = `select count(*) count from users`
    const [result] = await connection.execute(statement)
    return result[0].count
  }

  async searchUserTotal(user) {
    const statement = `
      select count(*) count 
      from users u 
      join user_detail ud 
      on u.id = ud.user_id
      where ud.name like ? or u.email like ?
    `
    const [result] = await connection.execute(statement, [`%${user}%`, `%${user}%`])
    return result[0].count
  }
}

module.exports = new User()
