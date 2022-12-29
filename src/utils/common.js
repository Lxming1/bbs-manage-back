const crypto = require('crypto')

// 加密密码
const md5handle = (password) => {
  const md5 = crypto.createHash('md5')
  const result = md5.update(password).digest('hex')
  return result
}
// 成功且有数据返回格式
const successBody = (data, message) => {
  return {
    code: 0,
    message,
    data,
  }
}
// 成功无数据返回格式
const successMes = (message) => {
  return {
    code: 0,
    message,
  }
}
// 生成6位随机数
const randomFns = () => {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += parseInt(Math.random() * 10)
  }
  return code
}
// 验证邮箱有效性
const verifyEmail = (email) => {
  const regEmail =
    /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/ //验证邮箱正则
  return regEmail.test(email)
}

const getOffset = (pagenum, pagesize) => String((pagenum - 1) * pagesize)

const isMyNaN = (...num) => num.some((item) => isNaN(item))

const listTransTree = (result, pidName, idName = 'id') => {
  const res = []
  const map = result.reduce((pre, item) => {
    pre[item[idName]] = item
    return pre
  }, {})
  for (const item of result) {
    if (item[pidName] === null) {
      res.push(item)
    }
    if (item[pidName] in map) {
      const parent = map[item[pidName]]
      parent.children = parent.children || []
      parent.children.push(item)
    }
  }
  return res
}

module.exports = {
  md5handle,
  successBody,
  successMes,
  randomFns,
  verifyEmail,
  getOffset,
  isMyNaN,
  listTransTree,
}
