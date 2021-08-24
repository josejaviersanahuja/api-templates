/**
 * Handlers for /users route
 *
 */

//Dependencies
var express = require("express");
var router = express.Router();
const { usersModel, tokensModel } = require("../mongoose/models");
const entryChecker = require("../lib/dataEntryChecker");
const helpers = require("../lib/helpers");
const dns = require('dns')
const {tokenValidation} = require('../middlewares/tokenValidation');
const { isValidObjectId } = require("mongoose");

/* GET /users . */
// required data:  req.headers.token && req.query.email
router.get("/", tokenValidation ,async function (req, res, next) {
  const email = entryChecker.notEmptyString(req.query.email)
  if (email && email === req.tokenPlusUser.user.email) {
    const userPayload = {
      userName: req.tokenPlusUser.user.userName,
      email:email
    }
    res.json(userPayload)
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

/* POST /users . */
router.post("/", function (req, res, next) {
  // required data: req.body.userName, req.body.email, req.body.password.
  const userName = entryChecker.notEmptyString(req.body.userName);
  const email = entryChecker.notEmptyString(req.body.email);
  const password = entryChecker.notEmptyString(req.body.password);

  if (userName && email && password) {
    //Check and split the email at char @
    const splitedEmail = email.split('@')
    if (splitedEmail.length > 1) {
      //check if the host name of the email has dns entries
      dns.resolve(splitedEmail[1], function(err, list){
        if (!err && list) {
          //hacemos hash al password
          const hashedPassword = helpers.hash(password);
          //Ahora creamos el userModel
          const userToDB = new usersModel({
            userName: userName,
            email: email,
            hashedPassword: hashedPassword,
            confirmed:false,
            signupDate:Date.now()
          });
          // Lets store the new user
          userToDB
          .save()
          .then(() => {
            helpers.emailSender(email,'',true)
            res.json("New user created.");
          })
          .catch((err) => {
            res.writeHead(400);
            res.write(
              "A user with this email or this userName exist. Please try it with a different userName"
            );
            res.end();
          });
        } else {
          //this probably means, the email is not valid
          res.writeHead(400);
          res.write("Email is not valid as no dns entries found");
          res.end();
        }
      })   
    } else {
      res.writeHead(400);
      res.write("Email is not valid");
      res.end();
    }
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

/* PUT /users . */
// required data:  req.headers.token && req.body.password && req.body.email
router.put("/", tokenValidation ,async function (req, res, next) {
  const email = entryChecker.notEmptyString(req.body.email)
  const password = entryChecker.notEmptyString(req.body.password);
  const userName = entryChecker.notEmptyString(req.body.userName);
  if ((password || userName) && email && email === req.tokenPlusUser.user.email) {
    //initialize the response
    let response1 = ''
    let response2 = ''
    if (password) {
      //now lets hassh the new password
      const hashedPassword = helpers.hash(password);
      //lets update the new user
      response1 = await usersModel.updateOne({ email: req.tokenPlusUser.user.email },{ hashedPassword: hashedPassword });
    }
    if (userName) {
      //lets update the new user
      response2 = await usersModel.updateOne({ email: req.tokenPlusUser.user.email },{ userName: userName });
    }
    // if response ok, 200, otherwise 500
    if ((response1!=='' || response2!=="") && (response1.ok===1 || response2.ok===1)) {
      res.json('user updated')
     } else {
      res.writeHead(500);
      res.write("User couldn´t be updated");
      res.end();
    }
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

/* DELTE /users. */
router.delete("/", tokenValidation ,async function (req, res, next) {
  // required data:  req.headers.token && req.query.email
  const email = entryChecker.notEmptyString(req.query.email)
  if (email && email === req.tokenPlusUser.user.email) {
    // delete all tokens
    await tokensModel.deleteMany({email:email})
    // delete user
    const answer = await usersModel.deleteOne({email:email})
    if (answer.ok ===1 ) {
      res.json('user deleted')
    } else {
      res.sendStatus(500)
    }
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

module.exports = router;
