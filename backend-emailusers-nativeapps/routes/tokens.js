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
const { tokenValidation } = require("../middlewares/tokenValidation");

/* GET /tokens . RECOVERY ROUTE for forgotten passwords*/
router.get("/", async function (req, res, next) {
  // required data: req.query.email
  const email = entryChecker.notEmptyString(req.query.email);
  if (email) {
    // lets update the user with a new random password
    const newPassword = helpers.createRandomString(6)
    const newHashedPassword = helpers.hash(newPassword)

    // lets update the user
    try {
        const user = await usersModel.findOne({email:email})
        if (user.confirmed) {
            const response = await usersModel.updateOne({email:email}, {hashedPassword: newHashedPassword})
            //si es ok, envia el email
            if (response.ok===1) {
                const emailAnswer = await helpers.emailSender(email, newPassword)
                if (emailAnswer.accepted.length > 0) {
                    res.json('new email sent with a new password')
                } else {
                    res.writeHead(500)
                    res.write("Error sending the email");
                    res.end();
                }
            } else {
                // si no es ok, status 500
                res.statusCode(500)
                res.end()
            }   
        } else {
            res.writeHead(400);
            res.write("Password recovery only available for confirmed users. find your email confirmation a validate it");
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
  // required data: req.body.email, req.body.password.
  const email = entryChecker.notEmptyString(req.body.email);
  const password = entryChecker.notEmptyString(req.body.password);

  if (email && password) {
    //hacemos hash al password
    const hashedPassword = helpers.hash(password);
    //Ahora miramos al usuario
    try {
      const user = await usersModel.findOne({ email: email });

      if (user.hashedPassword === hashedPassword) {
        // lets delete any other token that exists before
        await tokensModel.deleteMany({email:email})

        const tokenToDB = new tokensModel({
          email: email,
          id: helpers.createRandomString(20),
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
        res.write("No users Found with that email or password. 1");
        res.end();
      }
    } catch (error) {
      res.writeHead(400);
      res.write("No users Found with that email or password");
      res.end();
    }
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

/* PUT /tokens . PARA EXTENDER EL TOKEN*/
router.put("/", tokenValidation ,async function (req, res, next) {
  res.statusCode(405)
  res.end()
});

/* DELTE /tokens. LOGOUT */
// required data:  req.headers.token && req.query.email
router.delete("/", tokenValidation ,async function (req, res, next) {
  const email = entryChecker.notEmptyString(req.query.email)
  if (email) {
    if (email === req.tokenPlusUser.user.email ) {
      const answer = await tokensModel.deleteMany({email:email})
      if (answer.ok ===1 ) {
        res.json('token deleted')
      } else {
        res.writeHead(500)
        res.end()
      }
    } else {
      res.writeHead(403);
      res.write("Token or email invalids");
      res.end();
    }
  } else {
    res.writeHead(400);
    res.write("required fields missing or invalids");
    res.end();
  }
});

module.exports = router;
