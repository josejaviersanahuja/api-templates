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
  // required data:  req.headers.token && req.query.phone
  const phone = entryChecker.phoneHasValidFormat(req.query.phone)
  const token = entryChecker.hasTokenFormat(req.headers.token);
  if (phone && token) {
    // lets find the user
    try {
      const tokenPlusUser = await tokensModel.findOne({ id: token }).populate('user')
      // is it a valid token?
      if (tokenPlusUser.expires > Date.now() && phone === tokenPlusUser.user.phone ) {
        const userPayload = {
          userName: tokenPlusUser.user.userName,
          phone:phone
        }
        res.json(userPayload)
      } else {
        res.writeHead(403);
        res.write("Token or phone number invalids");
        res.end();
      }
    } catch (error) {
      res.writeHead(403)
      res.end()
    }
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

/* POST /users . */
router.post("/", function (req, res, next) {
  // required data: req.body.userName, req.body.phone, req.body.password.
  const userName = entryChecker.notEmptyString(req.body.userName);
  const phone = entryChecker.phoneHasValidFormat(req.body.phone);
  const password = entryChecker.notEmptyString(req.body.password);

  if (userName && phone && password) {
    const hashedPassword = helpers.hash(password);
    //Ahora creamos el userModel
    const userToDB = new usersModel({
      userName: userName,
      phone: phone,
      hashedPassword: hashedPassword,
      confirmed:false
    });
    // Lets store the new user
    userToDB
    .save()
    .then(() => {
      helpers.sendTwilioSms(phone)
      res.json("New user created.");
    })
    .catch((err) => {
      res.writeHead(400);
      res.write(
        "A user with this phone number exist."
      );
      res.end();
    });   
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

/* PUT /users . */
router.put("/", async function (req, res, next) {
  
  // required data:  req.headers.token && req.body.password && req.body.phone
  const phone = entryChecker.phoneHasValidFormat(req.body.phone)
  const token = entryChecker.hasTokenFormat(req.headers.token);
  const password = entryChecker.notEmptyString(req.body.password);
  const userName = entryChecker.notEmptyString(req.body.userName);
  if (token && phone && (password || userName)) {
    // lets find the user
    try {
      const tokenPlusUser = await tokensModel.findOne({ id: token }).populate('user')
      // is it a valid token?
      if (tokenPlusUser.expires > Date.now() && phone === tokenPlusUser.user.phone ) {
        let answer1 = false
        let answer2 = false
        if(password) {
          //now lets hassh the new password
          const hashedPassword = helpers.hash(password);
                  
          //lets update the new user
          answer1 = await usersModel.updateOne({ phone: tokenPlusUser.user.phone },{ hashedPassword: hashedPassword });
        }
        if(userName) {
          //lets update the new user
          answer2 = await usersModel.updateOne({ phone: tokenPlusUser.user.phone },{ userName: userName });
        }
        // if response ok, 200, otherwise 500
        if (answer1.ok || answer2.ok) {
          res.json('user updated')
        } else {
          res.writeHead(500);
          res.write("User couldn´t be updated");
          res.end();
        }
      } else {
        res.writeHead(403);
        res.write("Token or phone number invalids");
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
  // required data:  req.headers.token && req.query.phone
  const phone = entryChecker.phoneHasValidFormat(req.query.phone)
  const token = entryChecker.hasTokenFormat(req.headers.token);
  if (phone && token) {
    // lets find the user
    try {
      const tokenPlusUser = await tokensModel.findOne({ id: token }).populate('user')
      // is it a valid token?
      if (tokenPlusUser.expires > Date.now() && phone === tokenPlusUser.user.phone ) {
        const answer = await usersModel.deleteOne({phone:phone})
        if (answer.ok ===1 ) {
          res.json('user deleted')
        } else {
          res.writeHead(500)
          res.end()
        }
      } else {
        res.writeHead(403);
        res.write("Token or phone number invalids");
        res.end();
      }
    } catch (error) {
      res.writeHead(403)
      res.end()
    }
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

module.exports = router;
