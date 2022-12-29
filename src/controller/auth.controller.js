const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../app/config')
const { getRightsByRole, getRightsById } = require('../service/rights.service')
const { getUserInfo } = require('../service/user.service')
const { successBody, listTransTree } = require('../utils/common')

class Auth {
  async login(ctx) {
    const { id, email, role_id } = ctx.user
    const token = jwt.sign({ id, email, role_id }, PRIVATE_KEY, {
      expiresIn: 60 * 60 * 24 * 30,
      algorithm: 'RS256',
    })
    try {
      const userInfo = await getUserInfo(id)
      const rights = await getRightsByRole(role_id)
      userInfo.token = token
      userInfo.rights = rights.split(',').map((i) => parseInt(i))
      ctx.body = successBody(userInfo, '登录成功')
    } catch (e) {
      console.log(e)
    }
  }

  async menus(ctx) {
    const { role_id } = ctx.user
    try {
      let rightsList = await getRightsByRole(role_id)
      let menus = await Promise.all(rightsList.split(',').map((item) => getRightsById(item)))

      let pMenu = []
      async function getPMenu(obj) {
        if (obj.pid === null) return
        const p = await getRightsById(obj.pid)
        if (pMenu.findIndex((item) => item.id === obj.pid) === -1) {
          pMenu.push(p)
        }
        await getPMenu(p)
      }
      await Promise.all(
        menus.map(async (item) => {
          if (item.pid !== null && menus.findIndex((menu) => menu.id === item.pid) === -1) {
            await getPMenu(item)
          }
        })
      )
      menus = [...pMenu, ...menus]
      menus = menus
        .map((item) => {
          const obj = {
            id: item.id,
            label: item.name,
            pid: item.pid,
            level: item.level,
          }
          obj.key = !item.level ? item.path : `/${item.path}`
          return obj
        })
        .filter((item) => item.level < 2)
      menus = listTransTree(menus, 'pid')
      menus.sort((a, b) => a.id - b.id)
      ctx.body = successBody(menus)
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = new Auth()
