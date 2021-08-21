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

/* GET /users . */
router.get("/", async function (req, res, next) {
  // required data:  req.headers.token && req.query.email
  const email = entryChecker.notEmptyString(req.query.email)
  const token = entryChecker.hasTokenFormat(req.headers.token);
  if (email && token) {
    // lets find the user
    try {
      const tokenPlusUser = await tokensModel.findOne({ id: token }).populate('user')
      // is it a valid token?
      if (tokenPlusUser.expires > Date.now() && email === tokenPlusUser.user.email ) {
        const userPayload = {
          userName: tokenPlusUser.user.userName,
          email:email
        }
        res.json(userPayload)
      } else {
        res.writeHead(403);
        res.write("Token or email invalids");
        res.end();
      }
    } catch (error) {
      res.sendStatus(403)
    }
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
            confirmed:false
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
router.put("/", async function (req, res, next) {
  // so far, userName is unique and email aswell, so the only field to update is password

  // required data:  req.headers.token && req.body.password && req.body.email
  const email = entryChecker.notEmptyString(req.body.email)
  const token = entryChecker.hasTokenFormat(req.headers.token);
  const password = entryChecker.notEmptyString(req.body.password);
  if (token && password && email) {
    // lets find the user
    try {
      const tokenPlusUser = await tokensModel.findOne({ id: token }).populate('user')
      // is it a valid token?
      if (tokenPlusUser.expires > Date.now() && email === tokenPlusUser.user.email ) {
          //now lets hassh the new password
        const hashedPassword = helpers.hash(password);
        
        //lets update the new user
        const response = await usersModel.updateOne({ email: tokenPlusUser.user.email },{ hashedPassword: hashedPassword });
        
        // if response ok, 200, otherwise 500
        if (response.ok === 1) {
          res.json('new password updated')
        } else {
          res.writeHead(500);
          res.write("User couldn´t be updated");
          res.end();
        }
      } else {
        res.writeHead(403);
        res.write("Token or email invalids");
        res.end();
      }
    } catch (error) {
      res.writeHead(403);
      res.end();
    }
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

/* DELTE /users. */
router.delete("/",async function (req, res, next) {
  // required data:  req.headers.token && req.query.email
  const email = entryChecker.notEmptyString(req.query.email)
  const token = entryChecker.hasTokenFormat(req.headers.token);
  if (email && token) {
    // lets find the user
    try {
      const tokenPlusUser = await tokensModel.findOne({ id: token }).populate('user')
      // is it a valid token?
      if (tokenPlusUser.expires > Date.now() && email === tokenPlusUser.user.email ) {
        const answer = await usersModel.deleteOne({email:email})
        if (answer.ok ===1 ) {
          res.json('user deleted')
        } else {
          res.sendStatus(500)
        }
      } else {
        res.writeHead(403);
        res.write("Token or email invalids");
        res.end();
      }
    } catch (error) {
      res.sendStatus(403)
    }
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

module.exports = router;
