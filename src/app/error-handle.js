const {
  EMAIL_ALREADY_EXIST,
  EMAIL_PASSWORD_ERROR,
  UNAUTHORIZATION,
  UNPERMISSION,
  EXIST_CODE,
  EMAIL_ERROR,
  CODE_IS_INCORRECT,
  MISSING_PARAMETER,
  FORMAT_ERROR,
  EXIST_COLLECT,
  ROLE_EXIST,
} = require('../constants/error-types')

const errorHandle = (err, ctx) => {
  let status, errMessage, code

  switch (err.message) {
    case ROLE_EXIST:
    case EXIST_CODE:
    case EXIST_COLLECT:
    case EMAIL_ALREADY_EXIST:
      status = 409
      code = 2
      break
    case EMAIL_PASSWORD_ERROR:
    case EMAIL_ERROR:
    case CODE_IS_INCORRECT:
    case UNAUTHORIZATION:
      status = 401
      code = 1
      break
    case FORMAT_ERROR:
    case MISSING_PARAMETER:
      status = 400
      code = 2
      break
    case UNPERMISSION:
      status = 403
      code = 2
      break
    default:
      status = 500
      code = 2
  }
  errMessage = err.message || 'Not Found'
  ctx.status = status
  ctx.body = {
    code,
    message: errMessage,
  }
}

module.exports = errorHandle
