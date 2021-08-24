/**
 * middleware to validate the token and find the real user for that token
 * 
 */
//Dependencies
const entryChecker = require('../lib/dataEntryChecker')
const {tokensModel} = require('../mongoose/models')

const tokenValidation = async function (req, res, next) {

  const token = entryChecker.hasTokenFormat(req.headers.token);

  if (token) {
    // lets find the user
    try {
      // is it a valid token?
      const tokenPlusUser = await tokensModel.findOne({ id: token }).populate('user')
      if (tokenPlusUser) {
        req.tokenPlusUser = tokenPlusUser
        next() 
      } else {
        res.writeHead(401)
        res.write('Unauthorized Session')
        res.end()
      }
    } catch (error) {
      res.writeHead(401)
      res.write('Unauthorized Session')
      res.end()
    }
  } else {
    res.writeHead(401)
    res.write('Unauthorized user')
    res.end()
  }
}

module.exports = {tokenValidation}