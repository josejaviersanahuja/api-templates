/**
 * Handlers for /validation route
 *
 */

//Dependencies
var express = require("express");
var router = express.Router();
const global = require("../config");
const { usersModel, tokensModel } = require("../mongoose/models");
const entryChecker = require('../lib/dataEntryChecker')

/* GET /users . */
router.get("/", async function (req, res, next) {
  // required data:  req.headers.token && req.query.email
  const email = entryChecker.notEmptyString(req.query.email);
  const validation = entryChecker.notEmptyString(req.query.validation);
  const token = entryChecker.hasTokenFormat(req.headers.token);
 
  if (email && token && validation === "true") {
    // lets find the user
    try {
      const tokenPlusUser = await tokensModel.findOne({ id: token }).populate('user');
      // is it a valid token?
      if (tokenPlusUser.expires > Date.now() && email === tokenPlusUser.user.email) {
        const answer = await usersModel.updateOne({email:email},{confirmed:true})
        if (answer.ok ===1) {
            const paramsToRender = {
                title: "Email Validated",
                pageclass: "validation",
                description: `Thank you for validating your ${global.appName} account.`,
              };
            res.render("validated", paramsToRender);   
        } else {
            const paramsToRender = {
                title: "Email Not Validated",
                pageclass: "validation",
                description: `An unexpected crash happened connecting to the data base. Please wait a few minutes, log in and try it again.`,
              };
            res.render("validated", paramsToRender);
        }
      } else {
        const paramsToRender = {
            title: "Email not validated",
            pageclass: "validation",
            description: `There was an error, please Log In again in the ${global.appName} log in page and try it again`,
          };
        res.render("validated", paramsToRender);
      }
    } catch (error) {
        const paramsToRender = {
            title: "Email not validated",
            pageclass: "validation",
            description: `There was an error, please Log In again in the ${global.appName} log in page and try it again`,
          };
        res.render("validated", paramsToRender);
    }
  } else {
    const paramsToRender = {
      title: "Email not validated",
      pageclass: "validation",
      description: `There was an error, please Log In again in the ${global.appName} log in page and try it again`,
    };
    res.render("validated", paramsToRender);
  }
});

module.exports = router;