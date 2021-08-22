/**
 * Handlers for /tokens route
 *
 */

//Dependencies
var express = require("express");
var router = express.Router();
const { usersModel, tokensModel } = require("../mongoose/models");
const entryChecker = require("../lib/dataEntryChecker");
const helpers = require("../lib/helpers");

/* GET /tokens . RECOVERY ROUTE for forgotten passwords*/
router.get("/", async function (req, res, next) {
  // required data: req.query.phone
  const phone = entryChecker.phoneHasValidFormat(req.query.phone);
  if (phone) {
    // lets update the user with a new random password
    const newPassword = helpers.createRandomString(6)
    const newHashedPassword = helpers.hash(newPassword)

    // lets update the user
    try {
        const user = await usersModel.findOne({phone:phone})
        if (user.confirmed) {
            const response = await usersModel.updateOne({phone:phone}, {hashedPassword: newHashedPassword})
            //si es ok, envia el email
            if (response.ok===1) {
                const smsAnswer = await helpers.sendTwilioSms(phone, newPassword)
                if (smsAnswer.sent) {
                    res.json('new SMS sent with a new password' + smsAnswer)
                } else {
                    res.writeHead(500)
                    res.write("Error sending the SMS");
                    res.end();
                }
            } else {
                // si no es ok, status 500
                res.statusCode(500)
                res.end()
            }   
        } else {
            res.writeHead(400);
            res.write("Password recovery only available for confirmed users. find your SMS confirmation to validate it");
            res.end(); 
        }
    } catch (error) {
        res.writeHead(403);
        res.write("Error getting the user updated");
        res.end();
    }
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

/* POST /tokens . */
router.post("/", async function (req, res, next) {
  // required data: req.body.phone, req.body.password.
  const phone = entryChecker.phoneHasValidFormat(req.body.phone);
  const password = entryChecker.notEmptyString(req.body.password);

  if (phone && password) {
    //hacemos hash al password
    const hashedPassword = helpers.hash(password);
    //Ahora miramos al usuario
    try {
      const user = await usersModel.findOne({ phone: phone });

      if (user.hashedPassword === hashedPassword) {
        const tokenToDB = new tokensModel({
          phone: phone,
          id: helpers.createRandomString(20),
          expires: Date.now() + 1000 * 60 * 60,
          user: user._id,
        });

        tokenToDB
          .save()
          .then((newtoken) => {
            res.json(newtoken);
          })
          .catch((err) => {
            res.writeHead(500);
            res.write("Internal Error");
            res.end();
          });
      } else {
        res.writeHead(400);
        res.write("No users Found with that mobile number or password. 1");
        res.end();
      }
    } catch (error) {
      res.writeHead(400);
      res.write("No users Found with that mobile number or password");
      res.end();
    }
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

/* PUT /tokens . PARA EXTENDER EL TOKEN*/
router.put("/", async function (req, res, next) {
  // required data:  req.headers.token && req.body.password && req.body.phone
  const phone = entryChecker.phoneHasValidFormat(req.body.phone);
  const token = entryChecker.hasTokenFormat(req.headers.token);
  if (phone && token) {
      // verificamos que el phone y el token son validos
      // lets find the user
    try {
        const tokenPlusUser = await tokensModel.findOne({ id: token }).populate('user')
        // is it a valid token?
        if (tokenPlusUser.expires > Date.now() && phone === tokenPlusUser.user.phone ) {
           const answer = await tokensModel.updateOne({id:token}, {expires: Date.now()+1000*60*60})
           if (answer.ok===1) {
               res.json('token extended for 1 more hour')
           } else {
               res.statusCode(500)
               res.end()
           }
        } else {
            res.writeHead(403);
            res.write("Token or mobile number invalids");
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

/* DELTE /tokens. LOGOUT */
router.delete("/", async function (req, res, next) {
  // required data:  req.headers.token && req.query.phone
  const phone = entryChecker.phoneHasValidFormat(req.query.phone)
  const token = entryChecker.hasTokenFormat(req.headers.token);
  if (phone && token) {
    // lets find the user
    try {
      const tokenPlusUser = await tokensModel.findOne({ id: token }).populate('user')
      // is it a valid token?
      if (tokenPlusUser.expires > Date.now() && phone === tokenPlusUser.user.phone ) {
        const answer = await tokensModel.deleteMany({phone:phone})
        if (answer.ok ===1 ) {
          res.json('token deleted')
        } else {
          res.sendStatus(500)
          res.end()
        }
      } else {
        res.writeHead(403);
        res.write("Token or mobile number invalids");
        res.end();
      }
    } catch (error) {
      res.sendStatus(403)
      res.end()
    }
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

module.exports = router;
